import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../docs/hacker-club-library/Code.gs', import.meta.url), 'utf8');
const sandbox = { module: { exports: {} } };
vm.runInNewContext(source, sandbox);
const { cleanName, safeCell, transition, publicBook } = sandbox.module.exports;

const available = { status: 'available', holder: '' };
const withAna = { status: 'borrowed', holder: 'Ana' };

test('available book: scan checks it out to the scanner', () => {
  assert.deepEqual({ ...transition(available, 'checkout', 'Ana') }, { ok: true, status: 'borrowed', holder: 'Ana', previousHolder: '' });
});
test('borrowed book: scan can return it to the Club', () => {
  assert.deepEqual({ ...transition(withAna, 'checkin', 'Ana') }, { ok: true, status: 'available', holder: '', previousHolder: 'Ana' });
});
test('borrowed book: another person can check it out (transfer)', () => {
  const next = transition(withAna, 'checkout', 'Bob');
  assert.equal(next.ok, true);
  assert.equal(next.holder, 'Bob');
  assert.equal(next.previousHolder, 'Ana');
});
test('invalid moves are refused', () => {
  assert.equal(transition(available, 'checkin', 'Ana').ok, false);
  assert.equal(transition(withAna, 'checkout', ' ana ').ok, false);
  assert.equal(transition(available, 'checkout', '   ').ok, false);
  assert.equal(transition(available, 'delete', 'Ana').ok, false);
});
test('names are cleaned and spreadsheet formulas are neutralised', () => {
  assert.equal(cleanName('  Ana\n\tKowalska '), 'Ana Kowalska');
  assert.equal(cleanName('x'.repeat(100)).length, 60);
  assert.equal(safeCell('=HYPERLINK("http://evil")'), '\'=HYPERLINK("http://evil")');
  assert.equal(safeCell('@ana'), "'@ana");
  assert.equal(safeCell('Ana'), 'Ana');
});
test('public inventory never exposes the holder', () => {
  const book = publicBook({ code: 'HCL-001', title: 'T', author: 'A', status: 'borrowed', holder: 'Ana', since: 'x' });
  assert.deepEqual({ ...book }, { code: 'HCL-001', title: 'T', author: 'A', status: 'borrowed' });
});
