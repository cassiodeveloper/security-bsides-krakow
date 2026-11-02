# Maintainer handbook

## New repositories

Before creating a repository, agree on its purpose, maintainer, visibility and appropriate license. Prefer lower-case descriptive names with hyphens; avoid duplicate projects. Add a description, README, relevant topics, contribution and security instructions, and a license explicitly chosen for the material. Public by default is a community preference, not permission to publish private data.

The public `.github` repository supplies fallback CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT, Issue and pull request templates. A repository can override these files. CODEOWNERS is not inherited: add it in each repository and reference only people or visible teams that actually have write access. Review and update owners when responsibilities change.

Configure the default branch as main. Public repositories use a repository-level main ruleset requiring pull requests, one approval, resolved conversations, stale-approval dismissal and linear history, and blocking branch deletion and force pushes. Only organization owners have an explicit PR-only bypass for bootstrap or urgent work; record its reason in the PR. With a single owner, routine independent review needs another trusted maintainer. Do not invent an approval or add an unconsenting reviewer to satisfy the policy.

Use squash merges and automatically delete merged feature branches. Add required CI checks only after the relevant checks exist and are reliable. Never configure a nonexistent required status check: it blocks every merge. GitHub Free does not provide organization-wide rulesets or equivalent private-repository protections; audit public repository rulesets individually and revisit the plan only if needed.

## GitHub Actions and dependencies

Default Actions tokens are read-only and cannot approve pull requests. Request additional permissions per job only where necessary. Require approval for workflows from external contributors. Review workflow changes before approving a fork run; never execute untrusted contribution code with deployment secrets or in privileged pull_request_target jobs.

Prefer GitHub-owned or verified publisher Actions and pin actions to immutable commit SHAs. Restrict additional Actions by reviewed allow-list entries. Existing workflows retain narrowly scoped version exceptions until maintainers migrate and validate them; global SHA enforcement must not be enabled while those workflows still use mutable tags. Public community repositories require SHA pinning.

Keep deployment and synchronization credentials in repository secrets with the minimum scope, an owner and an expiry. Prefer GitHub App installation tokens for automation; do not store personal CLI credentials as permanent secrets. Review and rotate tokens, and revoke unused integrations.

Use Dependabot alerts/security updates where supported. For repositories with manifests, add ecosystem-specific update configuration as part of their maintenance. Enable available secret scanning and push protection on public repositories. A blocked secret must be removed and, if exposed, revoked; do not routinely bypass protection.

## Operation and review

- Keep Issues actionable and link decisions to their Discussions. Label beginner-friendly tasks honestly; do not promise mentoring that is unavailable.
- Review safety, costs and maintenance capacity before approving experiments. Explicit testing authorization is required for security labs.
- Review access and integrations quarterly, and immediately after a role change or incident.
- Keep a second trusted owner for continuity once the current owner has selected one. Require 2FA and encourage phishing-resistant authenticators and secure recovery codes.
- Keep public documentation free of private member information, private repository details, secrets and incident records.
- For inactive projects, explain status, preserve useful results and archive when appropriate.

Organizers maintain these policies through reviewed pull requests. Policies are a baseline; repository-specific needs should be documented rather than silently bypassed.
