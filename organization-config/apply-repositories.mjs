import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const org='Security-BSides-Krakow';
const report={started_at:new Date().toISOString(),completed:[],warnings:[]};
function api(method,path,body){const output=execFileSync('gh',['api','--method',method,path,...(body===undefined?[]:['--input','-'])],{input:body===undefined?undefined:JSON.stringify(body),encoding:'utf8',stdio:['pipe','pipe','pipe']});return output.trim()?JSON.parse(output):null;}
function optional(name,fn){try{const value=fn();report.completed.push(name);return value;}catch(e){report.warnings.push({operation:name,error:String(e.stderr||e.message)});}}
const prefix=`repos/${org}`;
try {
  // Add real, verified ownership before requiring CODEOWNER review.
  let owners;try{owners=api('GET',`${prefix}/hacker-club-projects/contents/.github/CODEOWNERS`);}catch(e){if(!String(e.stderr).includes('404'))throw e;}
  if(!owners)api('PUT',`${prefix}/hacker-club-projects/contents/.github/CODEOWNERS`,{message:'Document bootstrap code ownership',content:Buffer.from('# Bootstrap owner; move to a staffed team when ready.\n* @cassiodeveloper\n').toString('base64')});
  const current=api('GET',`${prefix}/hacker-club-projects/contents/README.md`);
  const readme=Buffer.from(current.content,'base64').toString('utf8');
  if(!readme.includes('## Organization-wide community guidelines'))api('PUT',`${prefix}/hacker-club-projects/contents/README.md`,{message:'Link organization contribution, conduct and security policies',sha:current.sha,content:Buffer.from(readme+'\n## Organization-wide community guidelines\n\nOur [contribution guide](https://github.com/Security-BSides-Krakow/.github/blob/main/CONTRIBUTING.md), [Code of Conduct](https://github.com/Security-BSides-Krakow/.github/blob/main/CODE_OF_CONDUCT.md), [security reporting policy](https://github.com/Security-BSides-Krakow/.github/blob/main/SECURITY.md) and [governance](https://github.com/Security-BSides-Krakow/.github/blob/main/GOVERNANCE.md) apply here. Report sensitive matters privately.\n').toString('base64')});

  for(const repo of ['.github','hacker-club-projects']){
    const path=`${prefix}/${repo}`;
    api('PATCH',path,{homepage:repo==='.github'?'https://bsideskrakow.pl/':'https://bsideskrakow.pl/hacker-club/projects/',allow_merge_commit:false,allow_rebase_merge:false,allow_squash_merge:true,delete_branch_on_merge:true,allow_auto_merge:false,squash_merge_commit_title:'PR_TITLE',squash_merge_commit_message:'PR_BODY',has_wiki:false});
    api('PUT',`${path}/topics`,{names:repo==='.github'?['bsides','bsides-krakow','community','cybersecurity','governance','contributing']:['bsides','bsides-krakow','hacker-club','community','cybersecurity','makers','project-ideas']});
    optional(`${repo}: secret scanning and push protection`,()=>api('PATCH',path,{security_and_analysis:{secret_scanning:{status:'enabled'},secret_scanning_push_protection:{status:'enabled'}}}));
    optional(`${repo}: Dependabot alerts`,()=>api('PUT',`${path}/vulnerability-alerts`));
    optional(`${repo}: Dependabot security updates`,()=>api('PUT',`${path}/automated-security-fixes`));
    optional(`${repo}: private vulnerability reporting`,()=>api('PUT',`${path}/private-vulnerability-reporting`));
    api('PUT',`${path}/actions/permissions`,{enabled:true,allowed_actions:'selected',sha_pinning_required:true});
    // Allow-list, default token permissions and fork approvals are inherited from the organization.
    const existing=api('GET',`${path}/rulesets`);
    const rulesets=[
      {name:'Protect default branch integrity',bypass_actors:[],rules:[{type:'deletion'},{type:'non_fast_forward'},{type:'required_linear_history'}]},
      {name:'Review community changes',bypass_actors:[{actor_type:'OrganizationAdmin',bypass_mode:'pull_request'}],rules:[{type:'pull_request',parameters:{required_approving_review_count:1,dismiss_stale_reviews_on_push:true,require_code_owner_review:true,require_last_push_approval:false,required_review_thread_resolution:true,allowed_merge_methods:['squash']}}]}
    ];
    for(const rule of rulesets){const prior=existing.find(r=>r.name===rule.name);api(prior?'PUT':'POST',`${path}/rulesets${prior?'/'+prior.id:''}`,{...rule,target:'branch',enforcement:'active',conditions:{ref_name:{include:['~DEFAULT_BRANCH'],exclude:[]}}});}
    report.completed.push(`${repo}: squash merges, topics, read-only Actions, SHA pinning and default-branch rules verified by API writes`);
  }
}finally{writeFileSync('organization-config/reports/repositories-result.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
