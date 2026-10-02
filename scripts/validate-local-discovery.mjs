import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const text = (html) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const files = ['yoga-saint-ouen.html', 'pilates-reformer-saint-ouen.html', 'en/sessions.html'];

for (const file of files) {
  const html = fs.readFileSync(new URL(file, root), 'utf8');
  const visible = [...html.matchAll(/<details>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/details>/g)]
    .map((match) => ({ name: text(match[1]), answer: text(match[2]) }));
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  const faqs = schemas.filter((schema) => schema['@type'] === 'FAQPage');
  assert.equal(faqs.length, 1, `${file}: one FAQ schema expected`);
  assert.equal(visible.length, file.startsWith('pilates-') ? 7 : 6, `${file}: missing visible answers`);
  assert.deepEqual(faqs[0].mainEntity.map((item) => ({ name: item.name, answer: item.acceptedAnswer.text })), visible, `${file}: schema must match visible copy`);
  const locale = file.startsWith('en/') ? '/en' : '';
  for (const route of ['/tarifs', '/studio', '/contact']) {
    assert.ok(html.includes(`href="${locale}${route}"`), `${file}: missing ${route}`);
  }
  assert.ok(visible.some((item) => item.answer.includes('93400 Saint-Ouen-sur-Seine')), `${file}: missing precise location`);
  assert.ok(!visible.some((item) => /\d[\d,.]*\s*(?:€|euros)/i.test(item.answer)), `${file}: do not duplicate changing prices in FAQ`);
}
console.log('LOCAL DISCOVERY OK: FR/EN, 19 visible answers, matching structured data, pricing/planning/contact links.');
