# security-bsides-krakow

Static source for [bsideskrakow.pl](https://bsideskrakow.pl/), published by GitHub Pages from `main` at `/`. No build dependencies.

## Hacker Club Project Board

- [Community repository and participation guide](https://github.com/Security-BSides-Krakow/hacker-club-projects)
- [Project Ideas and native voting](https://github.com/Security-BSides-Krakow/hacker-club-projects/discussions/categories/project-ideas)
- [Public project progress](https://github.com/orgs/Security-BSides-Krakow/projects/1)
- Website source: `hacker-club/projects/index.html`; local preview: `node scripts/preview-project-board.mjs`, then http://localhost:8765/hacker-club/projects/.
- [Integration and release guide](docs/project-board/INTEGRATION.md), [environment audit](docs/project-board/AUDIT.md), [JSON schema](docs/project-board/schema.json).

Run checks with `node --test scripts/project-board.test.mjs scripts/project-board-client.test.mjs`. The site uses vanilla JavaScript and reads a local public JSON snapshot; no client-side GitHub credentials or API requests.
