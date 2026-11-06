import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const org = 'Security-BSides-Krakow';
const { values: options } = parseArgs({ options: {
  name: { type: 'string' }, description: { type: 'string' },
  license: { type: 'string' }, apply: { type: 'boolean' },
  resume: { type: 'boolean' }, help: { type: 'boolean' },
} });

if (options.help) {
  console.log('Usage: node organization-config/provision-repository.mjs --name NAME --description DESCRIPTION --license GITHUB_LICENSE_KEY [--apply [--resume]]');
  process.exit(0);
}

const { name, description, license } = options;
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name ?? '') || name.length > 100 || !description?.trim() || description.length > 350 || !/^[a-z0-9-]+$/.test(license ?? '')) {
  throw Error('Provide a lowercase repository name, a description of up to 350 characters and an explicit GitHub license key.');
}
if (options.resume && !options.apply) throw Error('--resume requires --apply.');

const path = `repos/${org}/${name}`;
const repoUrl = `https://github.com/${org}/${name}`;
const settings = {
  allow_merge_commit: false, allow_rebase_merge: false, allow_squash_merge: true,
  delete_branch_on_merge: true, has_wiki: false,
};
const review = {
  required_approving_review_count: 1, dismiss_stale_reviews_on_push: true,
  require_code_owner_review: true, require_last_push_approval: false,
  required_review_thread_resolution: true, allowed_merge_methods: ['squash'],
};
const rulesets = [
  { name: 'Protect default branch integrity', bypass_actors: [], rules: [
    { type: 'deletion' }, { type: 'non_fast_forward' }, { type: 'required_linear_history' },
  ] },
  { name: 'Review community changes', bypass_actors: [{ actor_type: 'OrganizationAdmin', bypass_mode: 'pull_request' }],
    rules: [{ type: 'pull_request', parameters: review }] },
].map(rule => ({ ...rule, target: 'branch', enforcement: 'active',
  conditions: { ref_name: { include: ['~DEFAULT_BRANCH'], exclude: [] } },
}));

if (!options.apply) {
  console.log(JSON.stringify({ mode: 'preview', repository: repoUrl, visibility: 'public', description, license, settings, rulesets,
    security: ['Secret scanning', 'Push protection', 'Dependabot', 'Private vulnerability reporting', 'Actions SHA pinning'],
  }, null, 2));
  process.exit(0);
}

function api(method, endpoint, body) {
  const output = execFileSync('gh', ['api', '--hostname', 'github.com', '--method', method, endpoint, ...(body ? ['--input', '-'] : [])], {
    input: body ? JSON.stringify(body) : undefined, encoding: 'utf8',
  });
  return output.trim() ? JSON.parse(output) : null;
}

function hasCodeowners() {
  return ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS'].some(file => {
    try { return api('GET', `${path}/contents/${file}`).type === 'file'; }
    catch (error) { if (String(error.stderr).includes('404')) return false; throw error; }
  });
}

const actor = api('GET', 'user').login;
const membership = api('GET', `user/memberships/orgs/${org}`);
if (membership.state !== 'active' || membership.role !== 'admin') throw Error('Run as an active organization owner.');
api('GET', `licenses/${license}`);

try {
  const repo = options.resume ? api('GET', path) : api('POST', `orgs/${org}/repos`, {
    name, description, private: false, auto_init: true, license_template: license, ...settings,
  });
  if (repo.private || repo.archived || repo.fork || repo.full_name !== `${org}/${name}`) throw Error('Expected an active, public repository owned by BSides Kraków.');
  const contents = api('GET', `${path}/contents`);
  const files = contents.map(file => file.name);
  if (!files.includes('README.md') || api('GET', `${path}/license`).license?.key !== license) {
    throw Error('Check the initial README and license before continuing.');
  }
  if (!hasCodeowners()) {
    api('PUT', `${path}/contents/.github/CODEOWNERS`, {
      message: 'Set initial code ownership', content: Buffer.from(`* @${actor}\n`).toString('base64'),
    });
  }
  api('PATCH', path, { ...settings, security_and_analysis: {
    secret_scanning: { status: 'enabled' }, secret_scanning_push_protection: { status: 'enabled' },
  } });
  const existing = api('GET', `${path}/rulesets?includes_parents=false`);
  for (const rule of rulesets) {
    const prior = existing.find(candidate => candidate.name === rule.name);
    if (!prior) api('POST', `${path}/rulesets`, rule);
  }
  const security = [
    ['vulnerability-alerts', 'Dependabot alerts'], ['automated-security-fixes', 'Dependabot security updates'],
    ['private-vulnerability-reporting', 'Private vulnerability reporting'],
  ];
  for (const [endpoint] of security) api('PUT', `${path}/${endpoint}`);
  api('PUT', `${path}/actions/permissions`, { enabled: true, allowed_actions: 'selected', sha_pinning_required: true });

  const actual = api('GET', path);
  const active = api('GET', `${path}/rules/branches/${encodeURIComponent(actual.default_branch)}`);
  const activeReview = active.find(rule => rule.type === 'pull_request')?.parameters;
  const protection = api('GET', `${path}/rulesets?includes_parents=false`);
  const integrity = protection.find(rule => rule.name === rulesets[0].name);
  const reviewRule = protection.find(rule => rule.name === rulesets[1].name);
  const integrityDetails = integrity && api('GET', `${path}/rulesets/${integrity.id}`);
  const reviewDetails = reviewRule && api('GET', `${path}/rulesets/${reviewRule.id}`);
  const verified = Object.entries(settings).every(([key, value]) => actual[key] === value)
    && ['deletion', 'non_fast_forward', 'required_linear_history'].every(type => active.some(rule => rule.type === type))
    && activeReview?.required_approving_review_count >= 1 && activeReview.require_code_owner_review
    && activeReview.dismiss_stale_reviews_on_push && activeReview.required_review_thread_resolution
    && integrityDetails?.bypass_actors?.length === 0
    && reviewDetails?.bypass_actors?.length === 1
    && reviewDetails.bypass_actors[0].actor_type === 'OrganizationAdmin'
    && reviewDetails.bypass_actors[0].bypass_mode === 'pull_request'
    && ['secret_scanning', 'secret_scanning_push_protection', 'dependabot_security_updates'].every(key => actual.security_and_analysis?.[key]?.status === 'enabled')
    && api('GET', `${path}/actions/permissions`).sha_pinning_required
    && api('GET', `${path}/private-vulnerability-reporting`).enabled;
  if (!verified) throw Error('The repository did not pass policy verification. Review its settings before granting access.');
  api('GET', `${path}/vulnerability-alerts`);
  const ownershipErrors = api('GET', `${path}/codeowners/errors`).errors;
  if (ownershipErrors.length || !hasCodeowners()) throw Error('Check CODEOWNERS before granting access.');
  console.log(`Repository verified: ${repoUrl}`);
} catch (error) {
  console.error(`Provisioning incomplete. Check ${repoUrl}. If this run created the repository, retry with the same arguments plus --resume.`);
  process.exitCode = 1;
  console.error(error.message);
}
