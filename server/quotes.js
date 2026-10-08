import { randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const quotesFile = process.env.CPM_QUOTES_FILE || join(root, 'data', 'quotes.json');
const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
const money = (value) => Math.round((Number(value) || 0) * 100) / 100;
const quoteItems = (items) => Array.isArray(items) ? items.slice(0, 100).map((item) => {
  const quantity = Math.max(1, Math.min(10000, Number(item.quantity) || 1));
  const unitPrice = Math.max(0, money(item.unitPrice));
  return { label: String(item.label || '').trim().slice(0, 240), quantity, unitPrice, subtotal: money(quantity * unitPrice) };
}) : [];
const totalsFor = (items, taxRate) => {
  const totalHT = money(items.reduce((sum, item) => sum + item.subtotal, 0));
  const safeTaxRate = Math.max(0, Math.min(100, Number(taxRate) || 0));
  return { totalHT, taxRate: safeTaxRate, totalTTC: money(totalHT * (1 + safeTaxRate / 100)) };
};

async function load() {
  try {
    const value = JSON.parse(await readFile(quotesFile, 'utf8'));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

async function save(value) {
  await mkdir(dirname(quotesFile), { recursive: true });
  await writeFile(quotesFile, JSON.stringify(value, null, 2));
}

export async function getQuotes(userId) {
  const quotes = await load();
  return quotes.filter((q) => q.ownerId === userId);
}

export async function createQuote(userId, input) {
  const projectId = String(input.projectId || input.prospectId || '').trim();
  const description = String(input.description || '').trim();
  if (!projectId || !description) throw new Error('projectId and description are required');

  const quote = {
    id: randomUUID(),
    ownerId: userId,
    projectId,
    prospectName: String(input.prospectName || '').trim().slice(0, 160),
    prospectEmail: String(input.prospectEmail || '').trim().slice(0, 240),
    prospectCity: String(input.prospectCity || '').trim().slice(0, 160),
    sector: String(input.sector || '').trim().slice(0, 160),
    number: `DEVIS-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
    description,
    items: quoteItems(input.items),
    ...totalsFor(quoteItems(input.items), input.taxRate ?? 20),
    currency: String(input.currency || 'EUR'),
    validityDays: Number(input.validityDays || 30),
    status: 'draft',
    notes: String(input.notes || '').trim(),
    terms: String(input.terms || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!quote.terms) {
    quote.terms =
      '1. Le devis est valable ' +
      quote.validityDays +
      ' jours.\n2. Un acompte de 30% est demandé à la signature.\n3. Le solde est dû à la livraison.';
  }

  const quotes = await load();
  quotes.push(quote);
  await save(quotes);
  return quote;
}

export async function updateQuote(userId, quoteId, input) {
  const quotes = await load();
  const index = quotes.findIndex((q) => q.id === quoteId && q.ownerId === userId);
  if (index < 0) throw new Error('quote not found');

  const quote = quotes[index];
  quote.description = String(input.description || quote.description).trim();
  quote.prospectName = String(input.prospectName ?? quote.prospectName ?? '').trim().slice(0, 160);
  quote.prospectEmail = String(input.prospectEmail ?? quote.prospectEmail ?? '').trim().slice(0, 240);
  quote.prospectCity = String(input.prospectCity ?? quote.prospectCity ?? '').trim().slice(0, 160);
  quote.sector = String(input.sector ?? quote.sector ?? '').trim().slice(0, 160);
  quote.items = Array.isArray(input.items) ? quoteItems(input.items) : quote.items;
  Object.assign(quote, totalsFor(quote.items, input.taxRate ?? quote.taxRate));
  quote.status = String(input.status || quote.status);
  quote.notes = String(input.notes || quote.notes).trim();
  quote.terms = String(input.terms || quote.terms).trim();
  quote.validityDays = Number(input.validityDays || quote.validityDays);
  quote.updatedAt = new Date().toISOString();

  quotes[index] = quote;
  await save(quotes);
  return quote;
}

export async function deleteQuote(userId, quoteId) {
  let quotes = await load();
  quotes = quotes.filter((q) => !(q.id === quoteId && q.ownerId === userId));
  await save(quotes);
}

export async function getQuoteHTML(quote = {}) {
  const itemsHtml = (quote.items || [])
    .map(
      (item) =>
          `<tr><td>${escapeHtml(item.label)}</td><td style="text-align:center;">${money(item.quantity || 1)}</td><td style="text-align:right;">${money(item.unitPrice)}€</td><td style="text-align:right; font-weight:bold;">${money(item.subtotal)}€</td></tr>`
    )
    .join('');

  const taxAmount = Math.round(((quote.totalHT || 0) * (quote.taxRate || 20)) / 100 * 100) / 100;
  const finalTotal = (quote.totalHT || 0) + taxAmount;

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Devis ${quote.number || 'DEVIS'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 900px; margin: 20px auto; background: white; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #007bff; }
    .header-info { text-align: right; }
    .header-info p { margin: 2px 0; font-size: 12px; }
    h1 { margin: 20px 0; color: #007bff; font-size: 28px; }
    .quote-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 13px; }
    .meta-section { }
    .meta-label { font-weight: bold; color: #007bff; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    thead { background: #f0f0f0; }
    th { padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #007bff; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:hover { background: #f9f9f9; }
    .totals { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 30px; }
    .totals-right { text-align: right; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-label { font-weight: bold; }
    .total-amount { font-weight: bold; }
    .total-ht { border-bottom: 1px solid #ddd; }
    .total-ttc { font-size: 18px; color: #007bff; border-top: 2px solid #007bff; padding-top: 10px; }
    .notes { margin-top: 30px; padding: 15px; background: #f9f9f9; border-left: 4px solid #007bff; }
    .notes-title { font-weight: bold; margin-bottom: 8px; }
    .terms { margin-top: 20px; font-size: 11px; line-height: 1.8; color: #666; }
    .terms-title { font-weight: bold; margin-bottom: 8px; }
    footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #999; }
    @media print { body { background: white; } .container { box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div><div class="logo">CavaPasMarcher</div></div>
      <div class="header-info">
        <p><strong>Devis N°</strong> ${escapeHtml(quote.number || 'DEVIS')}</p>
        <p><strong>Date:</strong> ${new Date(quote.createdAt || Date.now()).toLocaleDateString('fr-FR')}</p>
        <p><strong>Valable jusqu'au:</strong> ${new Date(Date.now() + ((quote.validityDays || 30) * 24 * 60 * 60 * 1000)).toLocaleDateString('fr-FR')}</p>
      </div>
    </header>

    <h1>Devis</h1>

    <div class="quote-meta">
      <div class="meta-section">
        <p class="meta-label">De:</p>
        <p>CavaPasMarcher</p>
        <p>Studio Web Premium</p>
      </div>
      <div class="meta-section">
        <p class="meta-label">Description:</p>
        <p>${escapeHtml(quote.description || 'Service web')}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Prestation</th>
          <th style="text-align: center; width: 80px;">Quantité</th>
          <th style="text-align: right; width: 100px;">Prix unitaire</th>
          <th style="text-align: right; width: 100px;">Sous-total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals">
      <div></div>
      <div class="totals-right">
        <div class="total-row total-ht">
          <span class="total-label">Total HT:</span>
          <span class="total-amount">${Math.round((quote.totalHT || 0) * 100) / 100}€</span>
        </div>
        <div class="total-row">
          <span class="total-label">TVA (${quote.taxRate || 20}%):</span>
          <span class="total-amount">${Math.round(taxAmount * 100) / 100}€</span>
        </div>
        <div class="total-row total-ttc">
          <span class="total-label">Total TTC:</span>
          <span class="total-amount">${Math.round(finalTotal * 100) / 100}€</span>
        </div>
      </div>
    </div>

    ${quote.notes ? `<div class="notes"><p class="notes-title">Notes:</p><p>${escapeHtml(quote.notes).replace(/\n/g, '<br>')}</p></div>` : ''}

    <div class="terms">
      <p class="terms-title">Conditions:</p>
      <p>${escapeHtml(quote.terms).replace(/\n/g, '<br>')}</p>
    </div>

    <footer>
      <p>Ce devis est valable ${quote.validityDays || 30} jours à compter de sa date d'émission.</p>
      <p>Pour toute question, veuillez nous contacter.</p>
    </footer>
  </div>
</body>
</html>`;
}
