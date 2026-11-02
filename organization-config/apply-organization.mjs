import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
const org='Security-BSides-Krakow';
const report={started_at:new Date().toISOString(),completed:[],warnings:[]};
function api(method,path,body) {
  const result=execFileSync('gh',['api','--method',method,path,...(body===undefined?[]:['--input','-'])],{input:body===undefined?undefined:JSON.stringify(body),encoding:'utf8',stdio:['pipe','pipe','pipe']});
  return result.trim()?JSON.parse(result):null;
}
function optional(name,fn){try{const value=fn();report.completed.push(name);return value;}catch(error){report.warnings.push({operation:name,error:String(error.stderr||error.message)});}}
function files(dir){return readdirSync(dir).flatMap(name=>statSync(`${dir}/${name}`).isDirectory()?files(`${dir}/${name}`):[`${dir}/${name}`]);}
try {
  const before=api('GET',`orgs/${org}`);
  writeFileSync('organization-config/reports/organization-before.json',JSON.stringify(before,null,2));
  const disabled=api('GET',`orgs/${org}/members?filter=2fa_disabled`);
  const outside=api('GET',`orgs/${org}/outside_collaborators`);
  const invitations=api('GET',`orgs/${org}/invitations`);
  if(disabled.length||outside.length||invitations.length)throw Error('Review membership before enforcing 2FA');

  // Publish a single tree after seeding an empty repository. Only public/ is uploaded.
  let readme;
  try{readme=api('GET',`repos/${org}/.github/contents/README.md`);}catch(error){if(!String(error.stderr).includes('404'))throw error;}
  if(!readme)api('PUT',`repos/${org}/.github/contents/README.md`,{message:'Initialize community guidelines',content:Buffer.from(readFileSync('organization-config/public/README.md')).toString('base64')});
  const ref=api('GET',`repos/${org}/.github/git/ref/heads/main`);
  const commit=api('GET',`repos/${org}/.github/git/commits/${ref.object.sha}`);
  const tree=api('POST',`repos/${org}/.github/git/trees`,{base_tree:commit.tree.sha,tree:files('organization-config/public').map(file=>({path:file.replace('organization-config/public/',''),mode:'100644',type:'blob',content:readFileSync(file,'utf8')}))});
  if(tree.sha!==commit.tree.sha){const next=api('POST',`repos/${org}/.github/git/commits`,{message:'Publish organization profile and community governance',tree:tree.sha,parents:[ref.object.sha]});api('PATCH',`repos/${org}/.github/git/refs/heads/main`,{sha:next.sha,force:false});}
  report.completed.push('Public profile, community health files and maintainer handbook published');

  api('PATCH',`orgs/${org}`,{description:'Kraków cybersecurity community. Learn. Hack. Build. Connect. Community projects, workshops and open-source collaboration.',location:'Kraków, Poland',blog:'https://bsideskrakow.pl/',default_repository_permission:'none',default_repository_branch:'main',members_can_create_repositories:false,members_can_create_public_repositories:false,members_can_create_private_repositories:false,members_can_create_pages:false,members_can_create_public_pages:false,members_can_create_private_pages:false,members_can_fork_private_repositories:false,members_can_delete_repositories:false,members_can_change_repo_visibility:false,members_can_invite_outside_collaborators:false,members_can_create_teams:false,members_can_delete_issues:false,deploy_keys_enabled_for_repositories:false,two_factor_requirement_enabled:true,dependency_graph_enabled_for_new_repositories:true,dependabot_alerts_enabled_for_new_repositories:true,dependabot_security_updates_enabled_for_new_repositories:true});
  report.completed.push('Organization profile and least-privilege membership defaults updated');

  const teams=api('GET',`orgs/${org}/teams?per_page=100`);
  for(const [name,description,permission,repos] of [
    ['Organizers','Day-to-day community repository stewardship; owners manage organization security and account access.','maintain',['.github','hacker-club-projects']],
    ['Project Maintainers','Maintainers responsible for approved Hacker Club projects, documentation and code review.','push',['hacker-club-projects']],
    ['Community Triage','Help newcomers, organize issues and keep public project conversations useful.','triage',['hacker-club-projects']]
  ]) {
    const team=teams.find(t=>t.name===name)||api('POST',`orgs/${org}/teams`,{name,description,privacy:'closed',notification_setting:'notifications_enabled'});
    for(const repo of repos)api('PUT',`orgs/${org}/teams/${team.slug}/repos/${org}/${repo}`,{permission});
    report.completed.push(`Role team ${team.name}: explicit public repository permissions`);
  }

  // Preserve only the two existing version references used by the private demo.
  api('PUT',`orgs/${org}/actions/permissions`,{enabled_repositories:'all',allowed_actions:'selected',sha_pinning_required:false});
  api('PUT',`orgs/${org}/actions/permissions/selected-actions`,{github_owned_allowed:true,verified_allowed:true,patterns_allowed:['pozil/auto-assign-issue@v1','anishathalye/proof-html@v1.1.0']});
  api('PUT',`orgs/${org}/actions/permissions/workflow`,{default_workflow_permissions:'read',can_approve_pull_request_reviews:false});
  api('PUT',`orgs/${org}/actions/permissions/fork-pr-contributor-approval`,{approval_policy:'all_external_contributors'});
  report.completed.push('Actions allow-list, read-only workflow tokens and external-contributor approval configured');

  const after=api('GET',`orgs/${org}`);
  writeFileSync('organization-config/reports/organization-after.json',JSON.stringify(after,null,2));
  for(const [key,expected] of Object.entries({default_repository_permission:'none',members_can_delete_repositories:false,members_can_change_repo_visibility:false,members_can_invite_outside_collaborators:false,members_can_create_repositories:false,members_can_create_teams:false,two_factor_requirement_enabled:true}))if(after[key]!==expected)report.warnings.push({operation:key,error:`Expected ${expected}; actual ${after[key]}`});
} finally {writeFileSync('organization-config/reports/apply-result.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}

