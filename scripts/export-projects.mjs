import { readFile, writeFile, rename } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const config = JSON.parse(await readFile(new URL('./project-board-config.json', import.meta.url)));
const base = `https://github.com/${config.owner}/${config.repository}`;
export function publicUrl(value, kind) {
  if (typeof value !== 'string') return null;
  if (kind === 'project') return /^https:\/\/github\.com\/orgs\/Security-BSides-Krakow\/projects\/[1-9][0-9]*(?:\/views\/[1-9][0-9]*)?$/.test(value) ? value : null;
  const prefix = `${base}/${kind}/`;
  return value.startsWith(prefix) && /^[1-9][0-9]*$/.test(value.slice(prefix.length)) ? value : null;
}
export function section(body, heading) {
  return (body || '').split(new RegExp(`^### ${heading}\\s*$`, 'mi'))[1]?.split(/^### /m)[0].trim() || '';
}
function text(value, limit) { return String(value || '').replace(/[\u0000-\u001f]/g, ' ').slice(0, limit); }
export function normalize(discussions, items = [], projectUrl = null) {
  const result = new Map();
  for (const d of discussions) {
    if (!publicUrl(d.url, 'discussions') || !d.id || !Number.isFinite(Date.parse(d.updatedAt))) throw Error('Invalid public discussion');
    const category = text(section(d.body, 'Category'), 100) || 'Other';
    result.set(d.url, { id: d.id, title: text(d.title, 200), description: text(section(d.body, 'Description') || d.body, 420), category,
      status: d.labels?.nodes.some(label => label.name === 'status:under-review') ? 'Under Review' : 'Proposed', kind: 'idea', votes: Number.isInteger(d.upvoteCount) && d.upvoteCount >= 0 ? d.upvoteCount : null,
      complexity: ['Low','Medium','High'].includes(section(d.body, 'Complexity')) ? section(d.body, 'Complexity') : null,
      maintainer: null, discussion_url: d.url, issue_url: null, project_url: null, updated_at: d.updatedAt });
  }
  const usedIssues = new Set();
  for (const item of items) {
    const issue = item.content;
    if (!issue || issue.__typename !== 'Issue' || issue.repository?.isPrivate || issue.repository?.nameWithOwner !== `${config.owner}/${config.repository}`) continue;
    if (!publicUrl(issue.url, 'issues') || usedIssues.has(issue.url)) throw Error('Invalid or duplicate project issue');
    usedIssues.add(issue.url);
    const ref = section(issue.body, 'Original Discussion');
    if (!publicUrl(ref, 'discussions')) throw Error('Approved issue needs a canonical Original Discussion URL');
    const prior = result.get(ref);
    if (prior?.issue_url) throw Error('Multiple issues for one discussion');
    const status = item.status?.name;
    result.set(ref, { ...(prior || {}), id: prior?.id || issue.id, title: text(issue.title, 200), description: text(section(issue.body, 'Description') || prior?.description || issue.body, 420),
      category: text(item.category?.name || prior?.category || 'Other', 100), status: config.statuses.includes(status) ? status : 'Unknown', kind: 'project',
      votes: prior?.votes ?? null, complexity: prior?.complexity ?? null, maintainer: issue.assignees.nodes.map(a => a.login).join(', ') || null,
      discussion_url: prior ? ref : null, issue_url: issue.url, project_url: publicUrl(projectUrl, 'project'),
      updated_at: new Date(Math.max(Date.parse(issue.updatedAt), Date.parse(item.updatedAt), Date.parse(prior?.updated_at) || 0)).toISOString() });
  }
  return [...result.values()].sort((a,b) => a.id.localeCompare(b.id));
}
async function query(query, variables) {
  if (process.env.PROJECT_BOARD_USE_GH === '1') {
    return JSON.parse(execFileSync('gh', ['api','graphql','--input','-'], {input:JSON.stringify({query,variables}), encoding:'utf8'})).data;
  }
  const token = process.env.PROJECT_BOARD_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) throw Error('Missing server-side GitHub credential');
  const response = await fetch('https://api.github.com/graphql', {method:'POST', headers:{Authorization:`Bearer ${token}`, 'Content-Type':'application/json'}, body:JSON.stringify({query,variables}), signal:AbortSignal.timeout(30000)});
  const body = await response.json();
  if (!response.ok || body.errors) throw Error(`GitHub export failed (${response.status}); previous dataset retained`);
  return body.data;
}
async function pages(load) {
  const nodes = []; let cursor = null;
  do { const connection = await load(cursor); nodes.push(...connection.nodes); cursor = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null; } while (cursor);
  return nodes;
}
export async function main() {
  const discussions = await pages(async cursor => {
    const data = await query(`query($cursor:String){repository(owner:"${config.owner}",name:"${config.repository}"){isPrivate discussions(first:100,after:$cursor,categoryId:"${config.category_id}"){nodes{id title body url updatedAt upvoteCount labels(first:100){nodes{name}}} pageInfo{hasNextPage endCursor}}}}`, {cursor});
    if (!data.repository || data.repository.isPrivate) throw Error('Source must be public');
    return data.repository.discussions;
  });
  let items = [], projectUrl = null;
  if (config.project_number) items = await pages(async cursor => {
    const data = await query(`query($cursor:String){organization(login:"${config.owner}"){projectV2(number:${config.project_number}){public url items(first:100,after:$cursor){nodes{updatedAt status:fieldValueByName(name:"Status"){... on ProjectV2ItemFieldSingleSelectValue{name}} category:fieldValueByName(name:"Category"){... on ProjectV2ItemFieldSingleSelectValue{name}} content{__typename ... on Issue{id title body url updatedAt repository{isPrivate nameWithOwner} assignees(first:20){nodes{login}}}}} pageInfo{hasNextPage endCursor}}}}}`, {cursor});
    const project = data.organization?.projectV2;
    if (!project?.public) throw Error('Board must be public');
    projectUrl = project.url; return project.items;
  });
  const projects = normalize(discussions, items, projectUrl);
  const path = new URL('../assets/data/hacker-club-projects.json', import.meta.url);
  let previous; try { previous = JSON.parse(await readFile(path)); } catch {}
  if (previous && JSON.stringify(previous.projects) === JSON.stringify(projects) && previous.project_url === projectUrl) return;
  const output = {schema_version:1, generated_at:new Date().toISOString(), source_url:base, submit_url:`${base}/discussions/new?category=project-ideas`, project_url:projectUrl, projects};
  await writeFile(new URL(`${path.href}.tmp`), JSON.stringify(output,null,2)+'\n');
  await rename(new URL(`${path.href}.tmp`), path);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
