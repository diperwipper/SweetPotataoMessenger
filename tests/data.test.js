import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, createInitialWorkspace, dateKey, prettyTime, weekFor } from '../src/data.js';

test('local date helpers work across month and year boundaries', () => {
  assert.equal(dateKey(new Date(2026, 11, 31, 23, 30)), '2026-12-31');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
});

test('weeks begin on Monday and contain the selected day', () => {
  const week = weekFor('2026-11-03');
  assert.equal(week.length, 7);
  assert.equal(week[0], '2026-11-02');
  assert.equal(week[6], '2026-11-08');
});

test('the starter workspace uses the local day and contains editable sample data', () => {
  const workspace = createInitialWorkspace(new Date(2026, 10, 3, 10));
  assert.equal(workspace.events[0].date, '2026-11-03');
  assert.ok(workspace.tasks.some((task) => task.done));
  assert.ok(workspace.notes.length > 0);
  assert.equal(prettyTime('14:05'), '2:05 PM');
  assert.equal(prettyTime('00:00'), '12:00 AM');
});

test('overlapping calendar blocks get separate columns without hiding events', async () => {
  const { layoutDayEvents } = await import('../src/data.js');
  const result = layoutDayEvents([
    { id: 'one', start: '09:00', end: '10:00' },
    { id: 'two', start: '09:30', end: '10:30' },
    { id: 'three', start: '10:30', end: '11:00' },
  ]);
  assert.deepEqual(result.map(({ id, column, columns }) => [id, column, columns]), [
    ['one', 0, 2], ['two', 1, 2], ['three', 0, 1],
  ]);
});
