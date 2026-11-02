# Security BSides Kraków organization setup

Completed and verified on 2 November 2026.

## Public community structure

- Organization profile: https://github.com/Security-BSides-Krakow
- Public governance repository: https://github.com/Security-BSides-Krakow/.github
- Profile README with the real logo, mission, participation routes and official links.
- Pinned repositories: hacker-club-projects and .github.
- Organization Discussions enabled, reusing hacker-club-projects as its source.
- Default contribution, conduct, security, support, governance and maintainer guides.
- Inherited bug/improvement forms and PR template; live Issue chooser verified in hacker-club-projects.
- No new project approval, contributor invitation, blanket license or repository visibility change.

## Access and authentication

- Required 2FA with secure methods, after verifying there were no members without 2FA, no insecure-method-only members, no outside collaborators and no pending invitations.
- Repository base permission: none. Project base permission: no access; the existing Project remains public.
- Owners control repository creation, deletion/transfer, visibility changes, team creation and Pages creation.
- Private forking disabled; repository administrators cannot install GitHub Apps independently.
- Teams: Organizers (Maintain on both public repos), Project Maintainers (Write on hacker-club-projects), Community Triage (Triage on hacker-club-projects).
- Explicit Project access: Organizers and Project Maintainers can write; Community Triage can read. No new people were invited; the existing owner is the initial team maintainer.

## Repository and automation policy

- Both public repositories have active default-branch rulesets requiring PRs, one approval, CODEOWNER review, stale-review dismissal and resolved conversations.
- Branch deletion, force-push and nonlinear history blocked by a separate ruleset without bypass actors.
- Organization owners have PR-only review bypass for bootstrap/urgent changes. The initial documentation refinement was merged through PR #1 with an explicit explanation that no independent approval was available.
- Squash-only merges and automatic deletion of merged feature branches.
- CODEOWNERS references the verified existing owner, not an unstaffed team.
- Secret scanning, push protection, private vulnerability reporting and Dependabot security updates enabled on both public repositories.
- Dependency graph and Dependabot defaults enabled for new repositories. Dependabot alerts/security fixes enabled on the existing private repository.
- Actions allow GitHub-owned or verified publishers and two exact existing workflow-version exceptions. Workflow tokens default to read-only; Actions cannot approve PRs; all external contributors require workflow approval.
- Public community repositories require immutable Action SHAs. Global SHA enforcement remains off to preserve the existing legacy workflow references.

## Verification

- 34 live API assertions passed; see verification.json.
- Profile and pinned repositories verified logged out in the browser.
- Issue template inheritance and private security-report route verified in the real Issue chooser.
- Project Board synchronization still succeeds after access changes: https://github.com/cassiodeveloper/security-bsides-krakow/actions/runs/41533293248
- Initial refinements PR merged: https://github.com/Security-BSides-Krakow/.github/pull/1
- Operational reports remain local and were not published to the website or the public governance repository.

## Remaining human decisions and plan limits

1. Select a second trusted owner for continuity, and assign agreed responsibilities to future team members. No person was selected or invited without instructions.
2. Migrate and validate the existing mutable workflow references before enabling global SHA enforcement. Current narrowly scoped exceptions preserve existing workflows.
3. Choose licenses per repository/project when appropriate. Existing content was not relicensed.
4. GitHub Free lacks organization-level rulesets and a technical owner-only outside-collaborator invitation policy. Public repo rulesets cover current public repos; the handbook covers onboarding future repos. No non-owner repository Admin access was granted.

The current plan was retained. No paid security product, subscription or service was purchased.
