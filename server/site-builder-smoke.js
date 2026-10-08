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
const landing = build({ name: 'Studio One', sector: 'restaurant', plan: 'landing', language: 'fr', goal: 'Réserver votre table', phone: '+33 6 00 00 00 00' });
const medium = build({ name: 'Studio Two', sector: 'restaurant', plan: 'medium', language: 'fr' });
const contactable = build({ name: 'Atelier Link', sector: 'artisan', plan: 'pro', language: 'fr', email: 'bonjour@example.fr', phone: '+33 7 11 22 33 44', address: '10 rue des Arts, Lyon' });

assert.match(restaurant, /La carte/);
assert.match(clinic, /Spécialités/);
assert.match(artisan, /Vos projets/);
assert.match(restaurant, /Bistrot &lt;Atlas&gt;/);
assert.doesNotMatch(restaurant, /Bistrot <Atlas>/);
assert.match(restaurant, /@media \(max-width: 960px\)/);
assert.match(landing, /Réserver votre table/);
assert.match(landing, /tel:\+33600000000/);
assert.doesNotMatch(landing, /id="expertise"/);
assert.doesNotMatch(landing, /id="process"/);
assert.match(medium, /id="expertise"/);
assert.doesNotMatch(medium, /id="process"/);
assert.match(contactable, /mailto:bonjour@example.fr/);
assert.match(contactable, /tel:\+33711223344/);
assert.match(contactable, /data-contact-form/);
assert.match(contactable, /google\.com\/maps\/search/);
assert.match(contactable, /application\/ld\+json/);
assert.match(contactable, /"@type":"HomeAndConstructionBusiness"/);
assert.match(contactable, /property="og:title"/);
assert.match(contactable, /name="robots" content="index, follow"/);
console.log('Site builder smoke tests passed');
