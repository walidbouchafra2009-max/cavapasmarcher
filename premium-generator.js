/* Premium generator bridge. The legacy generator still owns the form; this layer replaces only the generated artifact. */
(function () {
  const $ = (id) => document.getElementById(id);
  const fields = ['gen-name', 'gen-sector', 'gen-country', 'gen-city', 'gen-plan', 'gen-language', 'gen-description'];
  const enhanceBrief = () => {
    const plan = $('gen-plan');
    if (plan && !plan.querySelector('option[value="landing"]')) {
      plan.insertAdjacentHTML('afterbegin', '<option value="landing">Landing page</option><option value="medium">Medium</option>');
    }
    const description = $('gen-description');
    if (!description || $('brief-offer')) return;
    description.closest('.field')?.insertAdjacentHTML('beforebegin', `
      <div class="field"><label>Offre phare</label><input id="brief-offer" placeholder="Ex. réservation, devis, consultation"></div>
      <div class="field"><label>Clientèle cible</label><input id="brief-audience" placeholder="Ex. familles, propriétaires, entreprises"></div>
      <div class="field"><label>Téléphone de contact</label><input id="brief-phone" type="tel" placeholder="Ex. +33 6 00 00 00 00"></div>
      <div class="field"><label>Email de contact</label><input id="brief-email" type="email" placeholder="Ex. bonjour@entreprise.fr"></div>
      <div class="field"><label>Adresse / zone exacte</label><input id="brief-address" placeholder="Ex. 12 rue des Fleurs, Lyon"></div>`);
  };
  const read = () => ({
    name: $('gen-name')?.value?.trim() || '',
    sector: $('gen-sector')?.value?.trim() || '',
    country: $('gen-country')?.value || 'FR',
    city: $('gen-city')?.value?.trim() || '',
    plan: $('gen-plan')?.value || 'pro',
    language: $('gen-language')?.value || 'fr',
    languages: [...document.querySelectorAll('#language-checks input:checked')].map((input) => input.value),
    description: $('gen-description')?.value?.trim() || '',
    goal: $('brief-goal')?.value || $('gen-goal')?.value || 'Obtenir plus de demandes de contact',
    offer: $('brief-offer')?.value?.trim() || '',
    audience: $('brief-audience')?.value?.trim() || '',
    phone: $('brief-phone')?.value?.trim() || '',
    email: $('brief-email')?.value?.trim() || '',
    address: $('brief-address')?.value?.trim() || '',
    color: document.querySelector('.color-choice.selected')?.dataset?.color || 'auto'
  });
  const formatPrice = (value, currency) => {
    try { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value); }
    catch { return `${Math.round(value || 0)} ${currency || 'EUR'}`; }
  };
  const pricingFor = (data) => window.CPMPricing?.getCountryPricing(data.country, data.sector, data.plan) || window.CPMCountries?.pricing?.(data.country, data.sector, data.plan) || null;
  const updatePrice = () => {
    enhanceBrief();
    const target = $('price-card'); if (!target) return;
    const data = read(); const pricing = pricingFor(data); if (!pricing) return;
    target.innerHTML = `<div><small>Prix conseillé local</small><strong>${formatPrice(pricing.setup, pricing.currency)}</strong><span>${formatPrice(pricing.monthly, pricing.currency)} / mois</span></div>`;
  };
  const generatePremium = () => {
    enhanceBrief();
    const data = read();
    if (!data.name || !data.sector) { window.alert('Ajoutez le nom et le secteur de l’entreprise.'); return false; }
    const pricing = pricingFor(data) || { currency: 'EUR', setup: 0, monthly: 0 };
    const builder = window.CPMSiteBuilder?.buildSiteHtml;
    if (typeof builder !== 'function') { window.alert('Le moteur premium n’est pas chargé.'); return false; }
    const html = builder({ ...data, currency: pricing.currency, setup: pricing.setup, monthly: pricing.monthly });
    const preview = $('site-preview');
    if (preview) preview.srcdoc = html;
    window.CPMGeneratedSite = { html, project: { ...data, pricing } };
    window.dispatchEvent(new CustomEvent('cpm:site-generated', { detail: window.CPMGeneratedSite }));
    return true;
  };
  document.addEventListener('input', (event) => { if (fields.includes(event.target.id)) updatePrice(); });
  document.addEventListener('change', (event) => { if (fields.includes(event.target.id)) updatePrice(); });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('#generate-site');
    if (!button) return;
    window.setTimeout(() => { if (document.getElementById('site-preview')) generatePremium(); }, 0);
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="new-site"]')) window.setTimeout(() => { enhanceBrief(); updatePrice(); }, 80);
  });
  window.CPMPremiumGenerator = { read, generate: generatePremium, updatePrice, enhanceBrief };
})();
