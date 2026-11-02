// Maintainer-only bootstrap. Does not execute community content. Reruns skip existing titles/files.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const repo='Security-BSides-Krakow/hacker-club-projects';
function api(path, body) {
  return JSON.parse(execFileSync('gh',['api',path,...(body?['--method',path.includes('/contents/')?'PUT':'POST','--input','-']:[])],{input:body?JSON.stringify(body):undefined,encoding:'utf8'}));
}
function files(dir) { return readdirSync(dir).flatMap(name=>statSync(`${dir}/${name}`).isDirectory()?files(`${dir}/${name}`):[`${dir}/${name}`]); }
for(const file of files('community-repository')) {
  const path=file.replace('community-repository/','');
  let existing; try {existing=api(`repos/${repo}/contents/${path}`);} catch(error) {if(!String(error.stderr).includes('404')) throw error;}
  if(existing) continue;
  api(`repos/${repo}/contents/${path}`,{message:`Add community ${path}`,content:Buffer.from(readFileSync(file)).toString('base64')});
}
const query=`query($cursor:String){repository(owner:"Security-BSides-Krakow",name:"hacker-club-projects"){discussions(first:100,after:$cursor){nodes{title url} pageInfo{hasNextPage endCursor}}}}`;
const existing=[];let cursor=null;
do {const data=api('graphql',{query,variables:{cursor}});if(data.errors)throw Error(JSON.stringify(data.errors));const page=data.data.repository.discussions;existing.push(...page.nodes);cursor=page.pageInfo.hasNextPage?page.pageInfo.endCursor:null;}while(cursor);
const mutation='mutation($input:CreateDiscussionInput!){createDiscussion(input:$input){discussion{title url}}}';
const proposals=files('community-repository/proposals');
for(const file of [...proposals,'community-repository/WELCOME.md']) {
  const markdown=readFileSync(file,'utf8'); const title=markdown.split('\n')[0].replace(/^# /,'').trim();
  const prior=existing.find(d=>d.title===title);if(prior){console.log(prior.url);continue;}
  const result=api('graphql',{query:mutation,variables:{input:{repositoryId:'R_kgDOVgnQSQ',categoryId:file.endsWith('WELCOME.md')?'DIC_kwDOVgnQSc4DKPtD':'DIC_kwDOVgnQSc4DKPtG',title,body:markdown.split('\n').slice(2).join('\n')}}});
  if(result.errors)throw Error(JSON.stringify(result.errors));console.log(result.data.createDiscussion.discussion.url);
}
