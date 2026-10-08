(function() {
  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const token = () => window.CPMAuth?.token?.() || localStorage.getItem('cpm-session-token') || '';
  const headers = (json = false) => ({ ...(json ? {'content-type':'application/json'} : {}), ...(token() ? { authorization:`Bearer ${token()}` } : {}) });
  const toast = (msg) => { const el = document.getElementById('toast'); if(!el) return; el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600); };
  const esc = (v) => String(v || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = (v) => `${Math.round((Number(v) || 0) * 100) / 100}€`;
  const download = (url, name) => {
    const link = document.createElement('a');
    link.href = url; link.download = name; link.target = '_blank'; link.rel = 'noopener';
    document.body.appendChild(link); link.click(); link.remove();
  };

  async function fetchProspects() {
    try {
      const response = await fetch(`${API}/prospects`, { headers: headers() });
      if (!response.ok) throw new Error();
      const data = await response.json();
      return Array.isArray(data.prospects) ? data.prospects : [];
    } catch { return []; }
  }

  async function createQuoteFromProspect(prospectId) {
    const prospects = await fetchProspects();
    const prospect = prospects.find(p => p.id === prospectId);
    if (!prospect) return toast('Prospect introuvable.');

    const quoteData = {
      prospectId: prospect.id,
      prospectName: prospect.name || 'Client',
      prospectEmail: prospect.email || '',
      prospectCity: prospect.city || '',
      sector: prospect.sector || '',
      description: `Site web premium pour ${prospect.name || 'entreprise'}`,
      items: [
        { label: 'Site vitrine premium', quantity: 1, unitPrice: 2900, subtotal: 2900 },
        { label: 'Optimisation conversion', quantity: 1, unitPrice: 0, subtotal: 0 }
      ],
      totalHT: 2900,
      taxRate: 20,
      validityDays: 30,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API}/quotes`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify(quoteData)
      });
      if (!response.ok) throw new Error();
      const result = await response.json();
      toast(`Devis créé pour ${prospect.name}`);
      return result;
    } catch (e) {
      toast('Erreur création devis');
      return null;
    }
  }

  async function fetchQuotes() {
    try {
      const response = await fetch(`${API}/quotes`, { headers: headers() });
      if (!response.ok) throw new Error();
      const data = await response.json();
      return Array.isArray(data.quotes) ? data.quotes : [];
    } catch { return []; }
  }

  function renderQuotesPage() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div class="page quotes-page">
        <div class="headline">
          <div>
            <div class="eyebrow">VENTES</div>
            <h1 class="page-title">Devis & Propositions</h1>
            <p class="page-subtitle">Gérez vos devis, contrats et suivi commercial.</p>
          </div>
          <button type="button" class="primary-btn" data-quotes-refresh>↻ Actualiser</button>
        </div>
        <div id="quotes-list"></div>
      </div>
    `;
    loadAndRender();
  }

  async function loadAndRender() {
    const root = document.getElementById('quotes-list');
    if (!root) return;
    if (!token()) {
      root.innerHTML = '<div class="prospect-empty">Connectez-vous pour voir vos devis.</div>';
      return;
    }

    try {
      const quotes = await fetchQuotes();
      if (!quotes.length) {
        root.innerHTML = '<div class="prospect-empty">Aucun devis pour le moment. Créez-en un depuis un prospect.</div>';
        return;
      }

      root.innerHTML = `<div class="quotes-grid">${quotes.map(quote => `
        <article class="quote-card">
          <div class="quote-header">
            <div>
              <h3>${esc(quote.prospectName || 'Devis')}</h3>
              <p>${esc(quote.sector || 'Secteur')}</p>
            </div>
            <div class="quote-status quote-${quote.status || 'draft'}">${quote.status === 'draft' ? 'Brouillon' : quote.status === 'sent' ? 'Envoyé' : 'Signé'}</div>
          </div>
          <div class="quote-meta">
            <span>Total HT: ${money(quote.totalHT || 2900)}</span>
            <span>Créé: ${new Date(quote.createdAt || Date.now()).toLocaleDateString('fr-FR')}</span>
          </div>
          <div class="quote-actions">
            <button type="button" class="secondary-btn" data-quote-export="${esc(quote.id || '')}">Exporter HTML</button>
            <button type="button" class="secondary-btn" data-quote-delete="${esc(quote.id || '')}">Supprimer</button>
          </div>
        </article>
      `).join('')}</div>`;
    } catch (error) {
      root.innerHTML = '<div class="prospect-empty">Erreur chargement devis.</div>';
    }
  }

  document.addEventListener('click', async (e) => {
    const page = e.target.closest('[data-page="quotes"]');
    if (page) {
      e.preventDefault();
      renderQuotesPage();
      return;
    }

    const refresh = e.target.closest('[data-quotes-refresh]');
    if (refresh) {
      e.preventDefault();
      await loadAndRender();
      return;
    }

    const exportBtn = e.target.closest('[data-quote-export]');
    if (exportBtn) {
      e.preventDefault();
      const id = exportBtn.dataset.quoteExport;
      if (!id || !token()) return toast('Connectez-vous pour exporter le devis.');
      download(`${API}/quotes/${encodeURIComponent(id)}/html?download=1`, `devis-${id}.html`);
      return;
    }

    const deleteBtn = e.target.closest('[data-quote-delete]');
    if (deleteBtn) {
      e.preventDefault();
      const id = deleteBtn.dataset.quoteDelete;
      if (!id || !window.confirm('Supprimer ce devis ? Cette action est définitive.')) return;
      try {
        const response = await fetch(`${API}/quotes/${encodeURIComponent(id)}`, { method: 'DELETE', headers: headers() });
        if (!response.ok) throw new Error();
        toast('Devis supprimé.');
        await loadAndRender();
      } catch { toast('Impossible de supprimer ce devis.'); }
      return;
    }
  });

  window.CPMQuotesManager = { render: renderQuotesPage, fetch: fetchQuotes, createFromProspect: createQuoteFromProspect };
  window.addEventListener('cpm:auth-changed', renderQuotesPage);
  setTimeout(() => { if (document.getElementById('app')) renderQuotesPage(); }, 250);
})();
