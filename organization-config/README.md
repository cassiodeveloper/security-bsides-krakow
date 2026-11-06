# Organization configuration working files

`public/` is the reviewed source for the organization's public `.github` repository.
`reports/` contains local operational audit state and execution results; do not publish it to the website or a public repository.

Organization: https://github.com/Security-BSides-Krakow

## Provision a new public repository

After approving the project and agreeing on a maintainer and license, run this from the workspace root with Node.js:

```powershell
node organization-config/provision-repository.mjs --name project-name --description "Short project description" --license mit
```

Replace `mit` with the agreed GitHub license key. The command previews the plan locally. When ready, repeat it with `--apply` using a GitHub CLI session authenticated as a BSides Kraków organization owner.

The script initializes a README, the selected license and CODEOWNERS for the authenticated owner. It applies and checks the public repository baseline, including PR review, branch integrity, squash merges, secret scanning, push protection, Dependabot, private vulnerability reporting and Actions SHA pinning. Once it reports success, update the README with the project scope and grant only the team permissions the project needs.

If provisioning stops after creation, inspect the repository and repeat the same command with `--apply --resume` to finish it. Review any pre-existing rules or ownership settings flagged by verification. The script targets public repositories in this organization. GitHub Free requires a separate decision for private repositories because the public branch rules cannot be enforced there on that plan.

No credentials are stored here. Current scope: organization profile, community defaults, least-privilege membership, role-based teams, Actions policy, public repository protections and available security features. A second owner must be selected by the current owner, not inferred from community contacts.
