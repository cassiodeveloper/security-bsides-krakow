# Hacker Club library: check-in and check-out

Every book has a unique code (`HCL-001`, `HCL-002`, ...) and a QR code that opens
`https://bsideskrakow.pl/hacker-club/library/?b=HCL-001`.

- Book **in the library**: the scan offers "Borrow this book" (check-out).
- Book **with someone**: the scan offers "Return to the Club" (check-in) or
  "Borrow it myself" (check-out by another person, logged as `transfer`).

The site stays static. State lives in a Google Sheet, exposed by an
Apps Script published as a web app.

## Security and privacy

- Identity: people type their name or Discord handle. There is no login. The
  browser remembers name and PIN in `localStorage`.
- Club PIN: required for every action and to see who has a book. It is posted
  on the shelf, so only people at the Club can make changes. Use 6 or more
  digits. After 20 wrong PINs, everyone is locked out for 10 minutes.
- The public listing (GET) only shows title, author and available/borrowed.
- Typed text is sanitised (control characters, 60 characters max) and
  protected against spreadsheet formula injection.
- `LockService` serialises concurrent scans and the PIN failure counter.
- Change the PIN any time in Script Properties. No redeploy needed.

## Dedicated account and scopes

The web app needs `SpreadsheetApp.openById`, which requires access to **all**
spreadsheets in the account (`spreadsheets.currentonly` and
`getActiveSpreadsheet()` are not available to web apps). That is why the sheet
and the script live in a Google account used only by the Hacker Club, with MFA
and nothing else in it.

[`appsscript.json`](./appsscript.json) pins the OAuth scopes to `spreadsheets`
only. If someone edits the code to use Gmail, Drive or any other service, it
fails until the owner authorises it again.

## Setup (about 10 minutes)

1. In the dedicated account, create a Google Sheet, for example
   "Hacker Club Library".
2. Rename the first tab to `books` with this header in row 1:

   | code | title | author | status | holder | since |
   |------|-------|--------|--------|--------|-------|
   | HCL-001 | Book title 1 | Author | available | | |
   | HCL-002 | Book title 2 | Author | available | | |

3. Create a second tab `events` with the header:
   `timestamp | code | action | person | previous_holder`
4. In the sheet: **Extensions > Apps Script**. Replace the content with
   [`Code.gs`](./Code.gs) and save.
5. **Project Settings (gear)** > tick "Show appsscript.json manifest file in
   editor". Open `appsscript.json` in the editor and paste
   [`appsscript.json`](./appsscript.json).
6. **Project Settings > Script Properties > Add**:
   - `LIBRARY_PIN`: a PIN of 6 or more digits.
   - `SPREADSHEET_ID`: the sheet ID, the part of its URL between `/d/` and `/edit`.
7. In the editor, run `doGet` once with the Run button and accept the
   Spreadsheets permission as the owner. The "Google hasn't verified this app"
   screen is expected here, for the owner only (Advanced > Go to project).
8. **Deploy > New deployment > Type: Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone** (not "Anyone with Google account")

   Copy the URL ending in `/exec`.
9. Open the `/exec` URL in a private window. It must return JSON straight
   away, with no Google screen. If a Google screen appears, the owner
   authorisation (step 7) or the deployment settings (step 8) are wrong.
10. Paste the URL in [`js/hacker-club-library-config.js`](../../js/hacker-club-library-config.js):

    ```js
    window.HCL_LIBRARY_API = 'https://script.google.com/macros/s/.../exec';
    ```

    Also bump the `?v=` on the config `<script>` tags in
    `hacker-club/library/index.html` and `hacker-club/library/labels/index.html`.
    Otherwise cached browsers keep calling the old URL (404 plus a CORS error
    in the console). Commit and push to `main`.
11. Open `https://bsideskrakow.pl/hacker-club/library/labels/`, print the
    labels and stick one in each book. Post the PIN on the shelf.

## Moving to another account

1. In the new account, open the copied sheet > Extensions > Apps Script.
   If the script came along with the copy, check it matches the current
   `Code.gs`; otherwise paste it.
2. Paste `appsscript.json` (setup step 5).
3. Script Properties: `LIBRARY_PIN`, and `SPREADSHEET_ID` with the **new**
   sheet ID. If the properties came along with the copy, the old ID is wrong:
   replace it.
4. Follow setup steps 7 to 10.
5. Run the test script below (wrong PIN, check-out, transfer, check-in).
6. In the old account: archive the old deployment (Deploy > Manage
   deployments > Archive), delete the old sheet (its bound script goes with
   it) and revoke the project's access at
   https://myaccount.google.com/permissions.

## Adding a book

Add a row to `books` with the next code (`HCL-003`) and `status` =
`available`, then print only the new label:
`/hacker-club/library/labels/?codes=HCL-003`.

## Updating the script

After editing `Code.gs`, use **Deploy > Manage deployments > Edit (pencil) >
Version: New version**. This keeps the `/exec` URL unchanged.

## Manual test script

On `/hacker-club/library/?b=HCL-001`, checking the `events` tab after each step:

1. Wrong PIN: an error appears and nothing changes in the sheet.
2. Check-out: "With <name> since …" and a `checkout` row.
3. In a private window, type only the PIN: the holder is shown, nothing changes.
4. Another name, "Borrow it myself": a `transfer` row with the previous holder.
5. "Return to the Club": back to Available and a `checkin` row.

## Metrics

The `events` tab is the full log (`checkout`, `checkin`, `transfer`). Most
borrowed books, average time per person and overdue books can come straight
from a pivot table or formulas in the sheet.

## Tests

```sh
node --test scripts/hacker-club-library.test.mjs
```
