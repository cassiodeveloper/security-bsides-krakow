import{execFileSync}from'node:child_process';
import{readFileSync,readdirSync,statSync,writeFileSync}from'node:fs';
const repo='Security-BSides-Krakow/.github',branch='codex/community-policy-refinements';
function api(method,path,body){const out=execFileSync('gh',['api','--method',method,path,...(body===undefined?[]:['--input','-'])],{input:body===undefined?undefined:JSON.stringify(body),encoding:'utf8'});return out.trim()?JSON.parse(out):null;}
function files(dir){return readdirSync(dir).flatMap(n=>statSync(`${dir}/${n}`).isDirectory()?files(`${dir}/${n}`):[`${dir}/${n}`]);}
const ref=api('GET',`repos/${repo}/git/ref/heads/main`);
const commit=api('GET',`repos/${repo}/git/commits/${ref.object.sha}`);
const tree=api('POST',`repos/${repo}/git/trees`,{base_tree:commit.tree.sha,tree:[...files('organization-config/public').map(f=>({path:f.replace('organization-config/public/',''),mode:'100644',type:'blob',content:readFileSync(f,'utf8')})),...['bug-report.yml','improvement.yml','config.yml'].map(f=>({path:`ISSUE_TEMPLATE/${f}`,mode:'100644',type:'blob',sha:null}))]});
const next=api('POST',`repos/${repo}/git/commits`,{message:'Refine inherited issue templates and document GitHub Free policy limits',tree:tree.sha,parents:[ref.object.sha]});
api('POST',`repos/${repo}/git/refs`,{ref:`refs/heads/${branch}`,sha:next.sha});
const pr=api('POST',`repos/${repo}/pulls`,{title:'Correct inherited templates and clarify community access policies',head:branch,base:'main',body:'Place default Issue forms in `.github/ISSUE_TEMPLATE/` so other organization repositories inherit them. Clarify the Free-plan limitation on outside-collaborator invitation restrictions and avoid publishing private repository details.\n\nValidation: compared default-community-file placement with GitHub documentation; verified live organization settings and repository rules through the API.\n\nBootstrap administration: the organization currently has one owner and no additional reviewers. The owner PR-only bypass is used for this initial documentation correction; no independent approval is claimed. Normal contributions follow the review policy.'});
writeFileSync('organization-config/reports/refinements-pr.json',JSON.stringify({url:pr.html_url,number:pr.number,head:next.sha},null,2));
console.log(pr.html_url);
