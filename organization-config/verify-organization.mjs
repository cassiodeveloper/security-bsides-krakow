import{execFileSync}from'node:child_process';
import{writeFileSync}from'node:fs';
import assert from'node:assert/strict';
const org='Security-BSides-Krakow',checks=[];
function get(path){return JSON.parse(execFileSync('gh',['api',path],{encoding:'utf8'}));}
function check(name,condition){assert.ok(condition,name);checks.push(name);}
const state=get(`orgs/${org}`);
writeFileSync('organization-config/reports/organization-final.json',JSON.stringify(state,null,2));
check('2FA required',state.two_factor_requirement_enabled);
check('No implicit repository access',state.default_repository_permission==='none');
for(const key of ['members_can_create_repositories','members_can_delete_repositories','members_can_change_repo_visibility','members_can_create_teams','members_can_create_pages','members_can_fork_private_repositories'])check(key+' disabled',state[key]===false);
for(const key of ['dependency_graph_enabled_for_new_repositories','dependabot_alerts_enabled_for_new_repositories','dependabot_security_updates_enabled_for_new_repositories'])check(key,state[key]===true);
const workflow=get(`orgs/${org}/actions/permissions/workflow`);
check('Read-only workflow tokens',workflow.default_workflow_permissions==='read');
check('Actions cannot approve PRs',workflow.can_approve_pull_request_reviews===false);
check('All external contributors require workflow approval',get(`orgs/${org}/actions/permissions/fork-pr-contributor-approval`).approval_policy==='all_external_contributors');
for(const repo of ['.github','hacker-club-projects']){
 const path=`repos/${org}/${repo}`,data=get(path);
 check(repo+' remains public',data.private===false);
 check(repo+' squash-only merge',data.allow_squash_merge&&!data.allow_rebase_merge&&!data.allow_merge_commit);
 check(repo+' merged branches deleted',data.delete_branch_on_merge);
 check(repo+' secret scanning',data.security_and_analysis.secret_scanning.status==='enabled');
 check(repo+' secret push protection',data.security_and_analysis.secret_scanning_push_protection.status==='enabled');
 check(repo+' Actions require immutable SHAs',get(`${path}/actions/permissions`).sha_pinning_required===true);
 check(repo+' private reporting available',get(`${path}/private-vulnerability-reporting`).enabled);
 const rulesets=get(`${path}/rulesets`);
 const integrity=get(`${path}/rulesets/${rulesets.find(r=>r.name==='Protect default branch integrity').id}`);
 const review=get(`${path}/rulesets/${rulesets.find(r=>r.name==='Review community changes').id}`);
 check(repo+' branch integrity active without bypass',integrity.enforcement==='active'&&integrity.bypass_actors.length===0&&['deletion','non_fast_forward','required_linear_history'].every(t=>integrity.rules.some(r=>r.type===t)));
 const pr=review.rules.find(r=>r.type==='pull_request').parameters;
 check(repo+' review and conversations required',review.enforcement==='active'&&pr.required_approving_review_count===1&&pr.require_code_owner_review&&pr.dismiss_stale_reviews_on_push&&pr.required_review_thread_resolution);
 check(repo+' owner bypass limited to PRs',review.bypass_actors.length===1&&review.bypass_actors[0].actor_type==='OrganizationAdmin'&&review.bypass_actors[0].bypass_mode==='pull_request');
}
const result={verified_at:new Date().toISOString(),passed:checks.length,checks,limitations:['One owner: a second trusted owner must be selected by the current owner.','Organization-wide rulesets and a technical owner-only outside-invitation restriction are unavailable on Free.','Existing workflow versions remain scoped allow-list exceptions; global SHA enforcement is deferred until migration.','No blanket repository license was assigned.']};
writeFileSync('organization-config/reports/verification.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({passed:checks.length,verified_at:result.verified_at}));
