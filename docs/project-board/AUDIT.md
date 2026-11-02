# Environment audit — 2 November 2026

- Existing site: buildless static HTML, vanilla CSS/JS; no package manager or backend.
- Hacker Club uses dark #111 surfaces, pink #ed6977 accents, Plus Jakarta Sans and Consolas, shared club cards, responsive grids, logo and navigation.
- Reuse /css/hacker-club.css, /css/site-navigation.css, /js/site-navigation.js and real /images/hacker-club-logo.webp.
- Origin: cassiodeveloper/security-bsides-krakow. CNAME: bsideskrakow.pl.
- Verified Pages API: legacy build from main at /. No deployment workflow existed.
- Verified authenticated cassiodeveloper is an active organization admin. Organization had no repositories, including private ones.
- Created official public hacker-club-projects repository and enabled Discussions. Native Ideas category exists; rename to Project Ideas requires UI.
- CLI authentication works with approved network access. Current OAuth scopes lack project/read:project; organization Projects cannot yet be inventoried or created.
- After the user refreshed OAuth permissions, Project #1 was created, made public and linked to the community repository. Six exact Status options, Category, Priority and Original Discussion fields were configured, with Board and Table views.
- The user renamed Ideas to Project Ideas. All six proposals and the welcome introduction were published as Discussions. The structured submission form was verified in the browser after removing an empty default title that prevented GitHub from rendering it.
- Public logged-out browser verification shows the Board's six Status columns. The API reports no explicit groupByFields override; GitHub uses Status by default for this Board.
- Synchronization runs in the website repository and reads the community repository; no cross-repository write token is needed. A dedicated organization Project read credential is required in a website repository secret.
- No project data or statistics will be fabricated. Initial proposals must be published before export.
