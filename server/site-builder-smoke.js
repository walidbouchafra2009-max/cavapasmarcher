import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const context = vm.createContext({ window: {}, console });
for (const path of ['data/plans.js', 'data/niches.js', 'services/site-builder.js']) {
  vm.runInContext(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'), context, { filename: path });
}

const build = context.window.CPMSiteBuilder.buildSiteHtml;
const restaurant = build({ name: 'Bistrot <Atlas>', sector: 'restaurant', city: 'Lyon', plan: 'pro', language: 'fr' });
const clinic = build({ name: 'Cabinet Santé', sector: 'clinique dentaire', city: 'Paris', plan: 'basic', language: 'fr' });
const artisan = build({ name: 'Atelier Durand', sector: 'menuisier', city: 'Nantes', plan: 'ultimate', language: 'fr' });

assert.match(restaurant, /La carte/);
assert.match(clinic, /Spécialités/);
assert.match(artisan, /Vos projets/);
assert.match(restaurant, /Bistrot &lt;Atlas&gt;/);
assert.doesNotMatch(restaurant, /Bistrot <Atlas>/);
assert.match(restaurant, /@media \(max-width: 960px\)/);
console.log('Site builder smoke tests passed');
