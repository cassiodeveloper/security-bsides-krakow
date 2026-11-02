# Security policy

## Report privately

For a vulnerability in a BSides Kraków repository or service, use the repository's **Security → Report a vulnerability** option when enabled. Otherwise email **contact@bsideskrakow.pl**, with the subject “Security report — repository or service name”. Do not open a public Issue or Discussion containing exploit details, secrets or personal data.

Include the affected repository/service, a description, the potential impact and minimal reproduction steps. Use synthetic data and redact tokens and personal information. Send only information you are authorized to share. Do not attach malware or large datasets without first agreeing on a safe exchange method.

The contact email is an organizer inbox, not a dedicated encrypted incident channel. Ask for a suitable private channel before sending highly sensitive material. This volunteer community does not promise a response SLA, a bounty, legal safe harbor or permission to test.

## Testing boundaries

Public source code is not permission to attack production, event infrastructure, attendees, third-party systems or the physical Club. Obtain explicit authorization and agree on scope before testing. Stop if an activity could expose data or interrupt service.

## Maintainer response

Confirm scope, reproduce safely, limit access to the report and agree on remediation and disclosure with the reporter where possible. Revoke exposed credentials promptly; deleting a public post does not make a leaked credential safe. Use private advisories for coordination when available. Document a public fix without including private data.

Each code repository should document its supported versions and update process. A repository-specific SECURITY.md may provide more precise reporting and support information. This organization-wide policy does not imply support for every historical release.
