# Space status

Edit `hacker-club/status.json` and commit/push to publish on GitHub Pages.
The initial status is closed. The site checks the JSON every minute, bypassing the browser cache.

## Open during the day

```json
{
  "open": true,
  "updatedAt": "2026-11-02T09:00:00+01:00",
  "openFrom": null,
  "validUntil": null
}
```

The confirmation is only valid on the same day in Europe/Warsaw, Monday to Friday,
from 09:00 until 18:00. There is no automatic opening at 09:00.
Use `validUntil` to close earlier than 18:00.

## Exceptional evening opening

```json
{
  "open": true,
  "updatedAt": "2026-11-02T17:00:00+01:00",
  "openFrom": "2026-11-02T18:00:00+01:00",
  "validUntil": "2026-11-03T01:00:00+01:00"
}
```

Both limits are required for an exception. The window starts at `openFrom`,
inclusive, and ends at `validUntil`, exclusive. `updatedAt` must be earlier than
or equal to the start of the window. Saturday and Sunday are always closed, even
during an explicit window. Use +01:00 in winter and +02:00 in summer, or UTC
timestamps ending in Z.

## Close

Set `open` to `false`. Update `updatedAt` and clear the optional limits.
Invalid JSON, a failed read or an expired confirmation all result in closed.
The time-based closing is recalculated every second on open pages.

The indicator only appears on `/hacker-club/` and its subpages.
There is an extra highlight on `/hacker-club/index.html` and `/hacker-club/space/index.html`.
Serve the site over HTTP to test locally; opening it via file:// blocks the fetch.

## Discord notifications

Create a webhook in the channel that should receive the alerts. On GitHub, in
Settings → Secrets and variables → Actions, save the URL as a repository secret
named `HACKER_CLUB_DISCORD_WEBHOOK_URL`.

The workflow sends a message when a push to `main` confirms an opening, updates
the confirmation or marks the space as closed. The automatic time-based closing
happens on the site and does not send a message.
