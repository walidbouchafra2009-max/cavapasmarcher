(function () {
  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const token = () => window.CPMAuth?.token?.() || window.CPM_API_TOKEN || localStorage.getItem('cpm-session-token') || '';
  const headers = (json = false) => ({ ...(json ? {'content-type':'application/json'} : {}), ...(token() ? { authorization:`Bearer ${token()}` } : {}) });
  const toast = (message) => { const el = document.getElementById('toast'); if (!el) return; el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600); };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const money = (value) => `${Math.round((Number(value) || 0) * 100) / 100}€`;

  async function fetchQuotes() {
    try {
      const response = await fetch(`${API}/quotes`, { headers: headers() });
      if (!response.ok) throw new Error();
      const data = await response.json();
      return Array.isArray(data.quotes) ? data.quotes : [];
    } catch {
      return [];
    }
  }

  async function createQuote(input) {
    const response = await fetch(`${API}/quotes`, {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify(input)
    });
    if (!response.ok) throw new Error('création échouée');
    return response.json();
  }

  async function deleteQuote(id) {
    const response = await fetch(`${API}/quotes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: headers()
    });
    if (!response.ok) throw new Error();
  }

  function renderQuotesPage() {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = `
      <div class="page quotes-page">
        <div class="headline">
          <div>
            <div class="eyebrow">FACTURATION</div>
            <h1 class="page-title">Devis & offres</h1>
            <p class="page-subtitle">Générez des devis professionnels et suivez vos offres commerciales.</p>
          </div>
          <button type="button" class="primary-btn" data-quote-new>+ Créer un devis</button>
        </div>
        <form class="quote-form" id="quote-form" style="display:none;">
          <div class="form-section">
            <strong>Créer un devis</strong>
            <span class="small-muted">Remplissez les informations pour générer un devis professionnel.</span>
          </div>
          <input name="projectId" placeholder="Projet ou prospect" required />
          <input name="description" placeholder="Description du service" required />
          <textarea name="notes" placeholder="Notes additionnelles"></textarea>
          <div class="quote-items" id="quote-items"></div>
          <button type="button" class="secondary-btn" data-add-item>+ Ajouter une ligne</button>
          <div class="quote-totals">
            <input type="number" name="totalHT" placeholder="Total HT" step="0.01" required />
            <select name="taxRate"><option value="20">TVA 20%</option><option value="10">TVA 10%</option><option value="5.5">TVA 5.5%</option></select>
          </div>
          <div class="quote-actions">
            <button type="submit" class="primary-btn">Créer le devis</button>
            <button type="button" class="secondary-btn" data-quote-cancel>Annuler</button>
          </div>
        </form>
        <div id="quotes-list" class="quotes-grid"></div>
      </div>
    `;
    loadQuotes();
  }

  async function loadQuotes() {
    const root = document.getElementById('quotes-list');
    if (!root) return;
    if (!token()) {
      root.innerHTML = '<div class="quote-empty">Connectez-vous pour voir et créer des devis.</div>';
      return;
    }
    try {
      const quotes = await fetchQuotes();
      if (!quotes.length) {
        root.innerHTML = '<div class="quote-empty">Aucun devis. Créez-en un pour commencer.</div>';
        return;
      }
      root.innerHTML = `<div class="quotes-table"><table><thead><tr><th>DEVIS</th><th>PROJET</th><th>MONTANT</th><th>STATUT</th><th>DATE</th><th></th></tr></thead><tbody>${quotes
        .map(
          (quote) =>
            `<tr><td><strong>${escapeHtml(quote.number)}</strong></td><td>${escapeHtml(quote.description)}</td><td><strong>${money(quote.totalTTC)}</strong></td><td><span class="badge ${quote.status}">${escapeHtml(quote.status)}</span></td><td>${new Date(quote.createdAt).toLocaleDateString('fr-FR')}</td><td><button class="secondary-btn small" data-quote-view="${escapeHtml(quote.id)}">Voir</button> <button class="secondary-btn small" data-quote-delete="${escapeHtml(quote.id)}">Supp</button></td></tr>`
        )
        .join('')}</tbody></table></div>`;
    } catch {
      root.innerHTML = '<div class="quote-empty">Impossible de charger les devis.</div>';
    }
  }

  async function saveQuote(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const items = [];
      document.querySelectorAll('[data-item-index]').forEach((el) => {
        items.push({
          label: el.querySelector('[name$="-label"]')?.value || '',
          quantity: Number(el.querySelector('[name$="-qty"]')?.value || 1),
          unitPrice: Number(el.querySelector('[name$="-price"]')?.value || 0)
        });
      });
      const totalHT = Number(data.totalHT || 0);
      const taxRate = Number(data.taxRate || 20);
      const taxAmount = Math.round((totalHT * taxRate) / 100 * 100) / 100;
      await createQuote({
        projectId: String(data.projectId).trim(),
        description: String(data.description).trim(),
        items,
        totalHT,
        taxRate,
        totalTTC: totalHT + taxAmount,
        notes: String(data.notes).trim()
      });
      form.reset();
      form.style.display = 'none';
      await loadQuotes();
      toast('Devis créé.');
    } catch {
      toast('Erreur lors de la création du devis.');
    }
  }

  async function deleteQuoteHandler(id) {
    if (!window.confirm('Supprimer ce devis ?')) return;
    try {
      await deleteQuote(id);
      await loadQuotes();
      toast('Devis supprimé.');
    } catch {
      toast('Suppression impossible.');
    }
  }

  async function viewQuote(id) {
    window.open(`${API}/quotes/${encodeURIComponent(id)}/html`, '_blank');
  }

  document.addEventListener('click', async (event) => {
    const quotesPage = event.target.closest('[data-page="quotes"]');
    if (quotesPage) {
      event.preventDefault();
      renderQuotesPage();
      return;
    }

    const newBtn = event.target.closest('[data-quote-new]');
    if (newBtn) {
      event.preventDefault();
      document.getElementById('quote-form').style.display = 'grid';
      return;
    }

    const cancelBtn = event.target.closest('[data-quote-cancel]');
    if (cancelBtn) {
      event.preventDefault();
      document.getElementById('quote-form').style.display = 'none';
      return;
    }

    const deleteBtn = event.target.closest('[data-quote-delete]');
    if (deleteBtn) {
      event.preventDefault();
      await deleteQuoteHandler(deleteBtn.dataset.quoteDelete);
      return;
    }

    const viewBtn = event.target.closest('[data-quote-view]');
    if (viewBtn) {
      event.preventDefault();
      await viewQuote(viewBtn.dataset.quoteView);
    }
  });

  document.addEventListener('submit', async (event) => {
    if (event.target.matches('#quote-form')) {
      event.preventDefault();
      await saveQuote(event.target);
    }
  });

  window.CPMQuotesManager = { render: renderQuotesPage, fetch: fetchQuotes };
  window.addEventListener('cpm:auth-changed', renderQuotesPage);
  window.addEventListener('DOMContentLoaded', renderQuotesPage);
  setTimeout(() => { if (document.getElementById('app')) renderQuotesPage(); }, 250);
})();
