/**
 * BSides Kraków Hacker Club library: check-in / check-out backend.
 *
 * Google Apps Script bound to a Google Sheet with two tabs:
 *   books  : code | title | author | status | holder | since
 *   events : timestamp | code | action | person | previous_holder
 *
 * Script properties: LIBRARY_PIN (shared club PIN, posted on the shelf) and
 * SPREADSHEET_ID (the Sheet's ID from its URL).
 * Setup steps: docs/hacker-club-library/README.md
 */

var CODE_PATTERN = /^HCL-\d{3}$/;
var MAX_NAME = 60;
var MAX_PIN_FAILURES = 20;          // across all clients
var PIN_LOCKOUT_SECONDS = 600;      // 10 minutes

// ---------- pure logic (unit tested in scripts/hacker-club-library.test.mjs) ----------

function cleanName(value) {
  if (typeof value !== 'string') return '';
  var name = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (name.length > MAX_NAME) name = name.slice(0, MAX_NAME).trim();
  return name;
}

/** Prevent spreadsheet formula injection when writing user text to cells. */
function safeCell(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function sameName(a, b) {
  return cleanName(a).toLowerCase() === cleanName(b).toLowerCase();
}

/**
 * Decide the next book state for an action.
 * book: { status: 'available' | 'borrowed', holder: string }
 * Returns { ok: true, status, holder, previousHolder } or { ok: false, error }.
 */
function transition(book, action, name) {
  var person = cleanName(name);
  if (!person) return { ok: false, error: 'Please enter your name or Discord handle.' };
  var borrowed = book.status === 'borrowed';
  if (action === 'checkout') {
    if (borrowed && sameName(book.holder, person)) return { ok: false, error: 'This book is already checked out to you.' };
    return { ok: true, status: 'borrowed', holder: person, previousHolder: borrowed ? book.holder : '' };
  }
  if (action === 'checkin') {
    if (!borrowed) return { ok: false, error: 'This book is already in the library.' };
    return { ok: true, status: 'available', holder: '', previousHolder: book.holder };
  }
  return { ok: false, error: 'Unknown action.' };
}

function publicBook(book) {
  return { code: book.code, title: book.title, author: book.author, status: book.status === 'borrowed' ? 'borrowed' : 'available' };
}

// ---------- Apps Script runtime ----------

function json(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

// Web apps cannot rely on the active (container) spreadsheet, so open it by ID.
function spreadsheet() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Set the SPREADSHEET_ID script property.');
  return SpreadsheetApp.openById(id);
}
function booksSheet() { return spreadsheet().getSheetByName('books'); }
function eventsSheet() { return spreadsheet().getSheetByName('events'); }

function readBooks() {
  var rows = booksSheet().getDataRange().getValues().slice(1);
  var books = [];
  rows.forEach(function (row, index) {
    var code = String(row[0] || '').trim();
    if (!CODE_PATTERN.test(code)) return;
    books.push({
      row: index + 2, code: code, title: String(row[1] || ''), author: String(row[2] || ''),
      status: String(row[3] || '').trim() === 'borrowed' ? 'borrowed' : 'available',
      holder: String(row[4] || ''), since: row[5] instanceof Date ? row[5].toISOString() : String(row[5] || '')
    });
  });
  return books;
}

function checkPin(pin) {
  var cache = CacheService.getScriptCache();
  var failures = Number(cache.get('pin_failures') || 0);
  if (failures >= MAX_PIN_FAILURES) return { ok: false, error: 'Too many wrong PIN attempts. Try again in a few minutes.' };
  var expected = PropertiesService.getScriptProperties().getProperty('LIBRARY_PIN');
  if (!expected) return { ok: false, error: 'Library is not configured yet.' };
  if (typeof pin === 'string' && pin === expected) return { ok: true };
  cache.put('pin_failures', String(failures + 1), PIN_LOCKOUT_SECONDS);
  return { ok: false, error: 'Wrong club PIN. It is posted on the library shelf.' };
}

/** GET ?action=list : public inventory, never includes who holds a book. */
function doGet() {
  return json({ ok: true, books: readBooks().map(publicBook) });
}

/**
 * POST (Content-Type text/plain, JSON body):
 *   { action: 'lookup',   code, pin }        -> book with holder
 *   { action: 'checkout', code, pin, name }
 *   { action: 'checkin',  code, pin, name }
 */
function doPost(e) {
  var request;
  try { request = JSON.parse(e.postData.contents); } catch (_) { return json({ ok: false, error: 'Invalid request.' }); }
  var code = String(request.code || '').trim().toUpperCase();
  if (!CODE_PATTERN.test(code)) return json({ ok: false, error: 'Unknown book code.' });
  // Lock first so the PIN failure counter and book updates are serialised.
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json({ ok: false, error: 'Library is busy. Please try again.' });
  try {
    var pin = checkPin(request.pin);
    if (!pin.ok) return json(pin);
    var book = readBooks().filter(function (b) { return b.code === code; })[0];
    if (!book) return json({ ok: false, error: 'Unknown book code.' });
    var view = function (b) { var out = publicBook(b); out.holder = b.holder; out.since = b.since; return out; };
    if (request.action === 'lookup') return json({ ok: true, book: view(book) });

    var next = transition(book, request.action, request.name);
    if (!next.ok) return json({ ok: false, error: next.error, book: view(book) });

    var now = new Date();
    var person = cleanName(request.name);
    booksSheet().getRange(book.row, 4, 1, 3).setValues([[next.status, safeCell(next.holder), next.holder ? now : '']]);
    var logged = request.action === 'checkout' && next.previousHolder ? 'transfer' : request.action;
    eventsSheet().appendRow([now, code, logged, safeCell(person), safeCell(next.previousHolder)]);
    book.status = next.status; book.holder = next.holder; book.since = next.holder ? now.toISOString() : '';
    return json({ ok: true, action: logged, book: view(book) });
  } finally {
    lock.releaseLock();
  }
}

if (typeof module !== 'undefined') module.exports = { cleanName: cleanName, safeCell: safeCell, transition: transition, publicBook: publicBook };
