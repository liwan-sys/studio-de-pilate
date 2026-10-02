import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../assets/tarifs-launch.js', import.meta.url), 'utf8');
for (const lang of ['fr', 'en']) {
  for (const expired of [false, true]) {
    const removed = [];
    const launch = { hidden: false, style: { setProperty: (...args) => removed.push(args) } };
    const ended = { hidden: true };
    const cta = { dataset: { defaultLabel: 'Default', defaultAriaLabel: 'Default aria' }, removeAttribute: key => removed.push(key), setAttribute() {} };
    const label = { textContent: 'Launch' };
    const node = { textContent: '', setAttribute() {} };
    const offer = {
      dataset: { launchDeadline: expired ? '2026-09-30T23:59:00+02:00' : '2026-10-31T23:59:00+01:00' },
      classList: { add() {} },
      querySelector: selector => selector === '[data-launch-cta]' ? cta : selector === '[data-launch-cta-label]' ? label : node,
      querySelectorAll: selector => selector === '[data-launch-only]' ? [launch] : [ended]
    };
    class Clock extends Date { static now() { return Date.parse('2026-10-02T12:00:00+02:00'); } }
    vm.runInNewContext(source, { document: { documentElement: { lang }, querySelectorAll: () => [offer] }, Date: Clock, window: { setInterval() {}, clearInterval() {} } });
    assert.equal(launch.hidden, expired);
    assert.equal(ended.hidden, !expired);
    if (expired) {
      assert.deepEqual(removed[0], ['display', 'none', 'important']);
      assert.ok(removed.includes('data-amount'));
      assert.equal(label.textContent, 'Default');
    } else assert.equal(removed.length, 0);
  }
}
console.log('Expiry tests passed: FR/EN, active/expired, CSS override and stale price.');
