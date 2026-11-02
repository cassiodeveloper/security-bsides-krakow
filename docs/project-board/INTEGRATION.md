# Project Board integration

## Sources and files

Community repository: https://github.com/Security-BSides-Krakow/hacker-club-projects

Discussion category: Project Ideas (`DIC_kwDOVgnQSc4DKPtG`). Discussion form lives on the community repository's default branch under `.github/DISCUSSION_TEMPLATE/project-ideas.yml`. Its filename matches the category slug, as required by [GitHub discussion forms](https://docs.github.com/en/discussions/managing-discussions-for-your-community/creating-discussion-category-forms).

Project: https://github.com/orgs/Security-BSides-Krakow/projects/1 — only approved tracking Issues belong here. Empty at launch because all six ideas remain Proposed. Board and table views exist. Grouping by Status must be saved through GitHub's UI; the current GraphQL view configuration input exposes visible fields but not grouping.

Website: `/hacker-club/projects/`, linked from the home and Hacker Club navigation and from the Club introduction. Existing CSS, typography, logos, footer and Google Analytics are reused. The new page needs only the shared navigation script and a small vanilla JS renderer.

## Synchronization

Workflow: `.github/workflows/sync-hacker-club-projects.yml`, hourly at minute 17 UTC and on manual dispatch. It runs trusted checked-in code, never proposal code. There is no `pull_request_target` or untrusted event handler.

The website repository owns the workflow and JSON, so its `GITHUB_TOKEN` writes only to its own repository. The community repository is read-only from this workflow. Global permissions are contents:write and pages:write; checkout persistence is disabled. Actions are pinned to immutable commits.

Configure repository secret `PROJECT_BOARD_READ_TOKEN` on `cassiodeveloper/security-bsides-krakow`. Use a dedicated GitHub App installation token or fine-grained PAT belonging to the organization, with organization Projects:read and repository Discussions:read, Issues:read and Metadata:read for hacker-club-projects. Set an expiry and rotate it. The default Actions token cannot read an unrelated organization's Project. Do not use the maintainer's broad CLI OAuth token as a permanent secret. Never paste credentials into chat, JSON, logs or browser JavaScript.

`scripts/export-projects.mjs` queries the public repository Discussions and public Project through GraphQL, paginating both collections. It exports only Issues from the exact public community repository; private and unrelated items and draft notes are excluded. It merges by the canonical Original Discussion URL, keeping the Discussion node ID as the stable public identity. Duplicate approved Issues fail export instead of silently overwriting. An Issue whose Discussion was deleted remains visible with votes unavailable and no voting action.

Data contract: `docs/project-board/schema.json`. Standard category names match labels and Project options. Other categories are preserved, bounded to 100 characters, and discovered by website filters. Proposed and Under Review come from Discussions (the latter requires organizer label `status:under-review`). Approved statuses come from the Project Status field. Unknown legacy values are displayed as Unknown and are filterable; no status is inferred from closed Issues.

Descriptions use the `### Description` form section, capped at 420 characters. Complexity uses Low/Medium/High. Original Discussion under an approved Issue must contain exactly one canonical URL. The Project text field is a convenient secondary reference; the durable Issue body link drives merging.

API failures, rate limiting, invalid resources, inaccessible boards and malformed data fail the run before replacing the snapshot. Temporary writes are atomically renamed after all queries succeed. Last valid data remains available. There is no immediate retry storm: manual dispatch or the next hourly run retries. Unchanged projects produce no commit. A concurrency group serializes exports, and normal Git pushes reject conflicting changes without force.

Because commits from `GITHUB_TOKEN` do not automatically trigger legacy Pages builds, the workflow explicitly requests a [Pages rebuild](https://docs.github.com/en/rest/pages/pages#request-a-github-pages-build) after a changed snapshot. A failed rebuild leaves the prior deployed site intact; investigate the Actions log and retry. Only changed snapshots trigger a rebuild.

## Manual maintenance and release

Community participation and administrator workflow are in the community README. Do not automatically approve based on votes. Use canonical Issue links, one approved Issue per Discussion, and matching Category names. Maintain all six exact statuses: Proposed, Under Review, Planned, In Progress, On Hold, Completed.

For an authenticated local export, set `PROJECT_BOARD_USE_GH=1` in the process environment and run `node scripts/export-projects.mjs`. This reads the existing CLI session in memory; no token file is created.

Before website release:

1. Run `node --test scripts/project-board.test.mjs scripts/project-board-client.test.mjs` and `git diff --check`.
2. Run `node scripts/preview-project-board.mjs` and inspect desktop/mobile, keyboard focus, filtering, sorting and external destinations.
3. Verify the read secret is configured, then commit and push the intended website changes to the verified Pages source `main` in `cassiodeveloper/security-bsides-krakow`.
4. Dispatch the synchronization workflow. Verify its conclusion and the Pages deployment before claiming the release or automatic refresh is live.

Bootstrap source copies live under `community-repository/`. `scripts/publish-community.mjs` is a maintainer-only initial publishing helper, not a scheduled workflow. It skips existing files and Discussion titles; edit existing community files through normal review rather than rerunning to overwrite them. No approved Issues are seeded for proposals.

## Security and performance

The renderer constructs DOM elements and sets textContent; no Markdown or HTML from users is rendered. URLs must match canonical destinations in the official repository. Unsafe, unrelated and malformed links do not generate actions. No browser token, custom voting, backend, database, authentication service or runtime package is required.

The snapshot is fetched once per page. Statistics derive from the loaded snapshot; failed loads leave counts unavailable rather than inventing zeros. Loading, empty dataset, no-match and error messages are accessible through a status region. Shared club focus styles and explicit form labels support keyboard use. All public copy is English.
