(function () {
  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const token = () => window.CPMAuth?.token?.() || window.CPM_API_TOKEN || localStorage.getItem('cpm-session-token') || '';
  const headers = (json = false) => ({ ...(json ? {'content-type':'application/json'} : {}), ...(token() ? { authorization:`Bearer ${token()}` } : {}) });
  const toast = (message) => { const el = document.getElementById('toast'); if (!el) return; el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600); };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
  const statusLabel = (status = 'new') => ({ new:'Nouveau', analyzed:'Analysé', contacted:'Contacté', interested:'Intéressé', quoting:'Devis', won:'Gagné', lost:'Perdu' }[status] || 'Nouveau');

  async function fetchProspects() {
    try {
      const response = await fetch(`${API}/prospects`, { headers: headers() });
      if (!response.ok) throw new Error('forbidden');
      const data = await response.json();
      return Array.isArray(data.prospects) ? data.prospects : [];
    } catch {
      return [];
    }
  }

  async function analyzeWebsite(url) {
    if (!url) return null;
    const response = await fetch(`${API}/prospects/analyze`, {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify({ url })
    });
    if (!response.ok) throw new Error('analysis failed');
    return response.json();
  }

  function openDocumentFromHtml(html, filename) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  }

  function buildProposalFromProspect(prospect) {
    const score = Number(prospect.score || prospect.analysis?.score || 0);
    return {
      name: prospect.name || 'Prospect',
      sector: prospect.sector || 'Secteur',
      city: prospect.city || 'Ville',
      score
    };
  }

  async function generateProposal(prospectId) {
    const prospects = await fetchProspects();
    const target = prospects.find((p) => p.id === prospectId);
    if (!target) return toast('Prospect introuvable.');
    if (!window.CPMProposalGenerator?.generateProposalHTML) {
      return toast('Le générateur de proposition est introuvable.');
    }
    const payload = buildProposalFromProspect(target);
    const html = await window.CPMProposalGenerator.generateProposalHTML(payload);
    openDocumentFromHtml(html, `proposition-${(target.name || 'prospect').replace(/\s+/g, '-').toLowerCase()}.html`);
    toast('Proposition générée et ouverte.');
  }

  async function generateContract(prospectId) {
    const prospects = await fetchProspects();
    const target = prospects.find((p) => p.id === prospectId);
    if (!target) return toast('Prospect introuvable.');
    if (!window.CPMContractGenerator?.generateContractHTML) {
      return toast('Le générateur de contrat est introuvable.');
    }
    const html = await window.CPMContractGenerator.generateContractHTML('draft-contract', target.name || 'Client', target.city || 'Ville');
    if (html) {
      openDocumentFromHtml(html, `contrat-${(target.name || 'client').replace(/\s+/g, '-').toLowerCase()}.html`);
      toast('Contrat généré et ouvert.');
    }
  }

  async function generateQuote(prospectId) {
    if (!window.CPMQuotesManager?.createFromProspect) {
      return toast('Le gestionnaire de devis est introuvable.');
    }
    const quote = await window.CPMQuotesManager.createFromProspect(prospectId);
    if (quote) {
      toast('Devis créé avec succès.');
      await loadAndRender();
    }
  }

  function renderProspectsPage() {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = `
      <div class="page prospects-page">
        <div class="headline">
          <div>
            <div class="eyebrow">PROSPECTION</div>
            <h1 class="page-title">Prospects & qualification</h1>
            <p class="page-subtitle">Scannez, qualifiez et rendez vos opportunités commerciales exploitables.</p>
          </div>
          <button type="button" class="primary-btn" data-prospect-refresh>↻ Actualiser</button>
        </div>
        <form class="prospect-form" id="prospect-form">
          <div class="prospects-toolbar">
            <strong>Ajouter un prospect</strong>
            <span class="small-muted">L'analyse de site se fait automatiquement si une URL est fournie.</span>
          </div>
          <div class="prospect-form-grid">
            <input name="name" placeholder="Nom de l'entreprise" required />
            <input name="sector" placeholder="Secteur" required />
            <input name="country" placeholder="Pays" value="FR" />
            <input name="city" placeholder="Ville" />
            <input name="website" placeholder="Site web" />
            <input name="email" type="email" placeholder="Email" />
            <input name="phone" placeholder="Téléphone" />
            <input name="source" placeholder="Source" value="manuel" />
          </div>
          <textarea name="notes" placeholder="Notes, contexte, besoin, angle commercial..."></textarea>
          <div class="prospect-actions">
            <button type="submit" class="primary-btn">Enregistrer le prospect</button>
          </div>
        </form>
        <div id="prospects-list"></div>
      </div>
    `;
    loadAndRender();
  }

  async function loadAndRender() {
    const root = document.getElementById('prospects-list');
    if (!root) return;
    if (!token()) {
      root.innerHTML = '<div class="prospect-empty">Connectez-vous pour voir et analyser vos prospects.</div>';
      return;
    }

    try {
      const prospects = await fetchProspects();
      if (!prospects.length) {
        root.innerHTML = '<div class="prospect-empty">Aucun prospect pour le moment. Ajoutez-en un pour lancer la qualification.</div>';
        return;
      }

      root.innerHTML = `<div class="prospects-grid">${prospects.map((prospect) => {
        const analysis = prospect.analysis || {};
        const score = Number(prospect.score || 0);
        const badgeClass = score >= 70 ? 'analysis' : score >= 35 ? 'new' : 'new';
        const analysisBlock = analysis?.url ? `
          <div class="prospect-analysis">
            <strong>Analyse:</strong> ${escapeHtml(analysis.url)}<br>
            <strong>Score:</strong> ${Math.round(analysis.score || 0)} / 100<br>
            <strong>Responsive:</strong> ${analysis.responsive ? 'Oui' : 'Non'} · <strong>Contact:</strong> ${analysis.hasContact ? 'Oui' : 'Non'}
          </div>
        ` : '<div class="prospect-analysis"><strong>Analyse:</strong> aucune analyse pour l'instant.</div>';

        return `
          <article class="prospect-card">
            <div class="prospect-card-header">
              <div>
                <h3>${escapeHtml(prospect.name || 'Entreprise')}</h3>
                <p>${escapeHtml(prospect.sector || 'Secteur non renseigné')}</p>
              </div>
              <div class="prospect-score">${score}</div>
            </div>
            <span class="prospect-badge ${badgeClass}">${statusLabel(prospect.status)}</span>
            <div class="prospect-meta">
              <span>${escapeHtml(prospect.country || 'FR')}</span>
              <span>${escapeHtml(prospect.city || 'Ville non renseignée')}</span>
              <span>${escapeHtml(prospect.source || 'manuel')}</span>
            </div>
            ${analysisBlock}
            <div class="prospect-meta">
              ${prospect.website ? `<span>Site: ${escapeHtml(prospect.website)}</span>` : '<span>Sans site</span>'}
              ${prospect.email ? `<span>Email: ${escapeHtml(prospect.email)}</span>` : ''}
            </div>
            <p>${escapeHtml(prospect.notes || 'Aucune note pour le moment.')}</p>
            <div class="prospect-actions">
              <button type="button" class="secondary-btn" data-prospect-analyze="${escapeHtml(prospect.id || '')}">Analyser</button>
              <button type="button" class="secondary-btn" data-prospect-quote="${escapeHtml(prospect.id || '')}">Devis</button>
              <button type="button" class="secondary-btn" data-prospect-proposal="${escapeHtml(prospect.id || '')}">Proposition</button>
              <button type="button" class="secondary-btn" data-prospect-contract="${escapeHtml(prospect.id || '')}">Contrat</button>
              <button type="button" class="secondary-btn" data-prospect-delete="${escapeHtml(prospect.id || '')}">Supprimer</button>
            </div>
          </article>
        `;
      }).join('')}</div>`;
    } catch (error) {
      root.innerHTML = '<div class="prospect-empty">Impossible de charger les prospects. Vérifiez votre session ou l'API locale.</div>';
    }
  }

  async function createProspect(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      name: String(data.name || '').trim(),
      sector: String(data.sector || '').trim(),
      country: String(data.country || 'FR').trim() || 'FR',
      city: String(data.city || '').trim(),
      website: String(data.website || '').trim(),
      email: String(data.email || '').trim(),
      phone: String(data.phone || '').trim(),
      source: String(data.source || 'manuel').trim(),
      notes: String(data.notes || '').trim(),
      tags: []
    };
    if (!payload.name || !payload.sector) return toast('Le nom et le secteur sont obligatoires.');

    try {
      const response = await fetch(`${API}/prospects`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error();
      if (payload.website) {
        const analysis = await analyzeWebsite(payload.website);
        if (analysis) toast(`Prospect enregistré. Analyse: ${Math.round(analysis.score || 0)}/100.`);
      }
      form.reset();
      await loadAndRender();
      toast('Prospect enregistré.');
    } catch {
      toast('Échec de l'enregistrement du prospect.');
    }
  }

  async function deleteProspect(id) {
    if (!id || !window.confirm('Supprimer ce prospect ?')) return;
    try {
      const response = await fetch(`${API}/prospects/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: headers()
      });
      if (!response.ok) throw new Error();
      await loadAndRender();
      toast('Prospect supprimé.');
    } catch {
      toast('Suppression impossible.');
    }
  }

  async function analyzeProspect(id) {
    const prospects = await fetchProspects();
    const target = prospects.find((prospect) => prospect.id === id);
    if (!target || !target.website) {
      toast('Ajoutez un site web avant d'analyser ce prospect.');
      return;
    }
    try {
      const result = await analyzeWebsite(target.website);
      const response = await fetch(`${API}/prospects/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: headers(true),
        body: JSON.stringify({
          status: result.score >= 60 ? 'analyzed' : 'new',
          analysis: result,
          score: result.score || 0
        })
      });
      if (!response.ok) throw new Error();
      await loadAndRender();
      toast(`Analyse terminée : ${Math.round(result.score || 0)}/100.`);
    } catch {
      toast('L'analyse du site a échoué.');
    }
  }

  document.addEventListener('click', async (event) => {
    const prospectsPage = event.target.closest('[data-page="prospects"]');
    if (prospectsPage) {
      event.preventDefault();
      renderProspectsPage();
      return;
    }

    const refresh = event.target.closest('[data-prospect-refresh]');
    if (refresh) {
      event.preventDefault();
      await loadAndRender();
      return;
    }

    const analyzeButton = event.target.closest('[data-prospect-analyze]');
    if (analyzeButton) {
      event.preventDefault();
      await analyzeProspect(analyzeButton.dataset.prospectAnalyze);
      return;
    }

    const quoteButton = event.target.closest('[data-prospect-quote]');
    if (quoteButton) {
      event.preventDefault();
      await generateQuote(quoteButton.dataset.prospectQuote);
      return;
    }

    const proposalButton = event.target.closest('[data-prospect-proposal]');
    if (proposalButton) {
      event.preventDefault();
      await generateProposal(proposalButton.dataset.prospectProposal);
      return;
    }

    const contractButton = event.target.closest('[data-prospect-contract]');
    if (contractButton) {
      event.preventDefault();
      await generateContract(contractButton.dataset.prospectContract);
      return;
    }

    const deleteButton = event.target.closest('[data-prospect-delete]');
    if (deleteButton) {
      event.preventDefault();
      await deleteProspect(deleteButton.dataset.prospectDelete);
    }
  });

  document.addEventListener('submit', async (event) => {
    if (event.target.matches('#prospect-form')) {
      event.preventDefault();
      await createProspect(event.target);
    }
  });

  window.CPMProspectsManager = { render: renderProspectsPage, analyze: analyzeProspect, fetch: fetchProspects, generateProposal, generateContract, generateQuote };
  window.addEventListener('cpm:auth-changed', renderProspectsPage);
  window.addEventListener('DOMContentLoaded', renderProspectsPage);
  setTimeout(() => { if (document.getElementById('app')) renderProspectsPage(); }, 250);
})();
