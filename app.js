/* CavaPasMarcher — application shell. Every dashboard number comes from saved data. */
(function () {
  const app = () => document.getElementById('app');
  const api = () => window.CPM_API_URL || 'http://localhost:8787/api';
  const token = () => window.CPMAuth?.token?.() || localStorage.getItem('cpm-session-token') || '';
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[character]));
  const money = (value, currency = 'EUR') => { try { return new Intl.NumberFormat('fr-FR', { style:'currency', currency, maximumFractionDigits:0 }).format(Number(value) || 0); } catch { return `${Math.round(Number(value) || 0)} ${currency}`; } };
  const request = async (path) => {
    const response = await fetch(`${api()}${path}`, { headers: token() ? { authorization:`Bearer ${token()}` } : {} });
    if (!response.ok) throw new Error(`API ${response.status}`);
    return response.json();
  };
  const dateLabel = () => new Intl.DateTimeFormat('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(new Date());

  function setActive(page) { document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.page === page)); }
  function emptyDashboard() { return `<div class="page"><div class="headline"><div><div class="eyebrow">${esc(dateLabel())}</div><h1 class="page-title">Bienvenue dans CavaPasMarcher</h1><p class="page-subtitle">Connectez-vous, puis créez votre premier prospect ou votre premier site.</p></div><button class="primary-btn" data-page="sites">Créer un site</button></div><section class="panel"><h2 class="panel-title">Une agence, des données réelles.</h2><p class="page-subtitle">Les indicateurs apparaîtront ici lorsque vous aurez des prospects, des devis et des projets enregistrés.</p></section></div>`; }

  async function renderOverview() {
    setActive('overview'); const root = app(); if (!root) return;
    if (!token()) { root.innerHTML = emptyDashboard(); return; }
    root.innerHTML = `<div class="page"><div class="headline"><div><div class="eyebrow">${esc(dateLabel())}</div><h1 class="page-title">Tableau de bord</h1><p class="page-subtitle">Chargement des données de votre agence…</p></div></div></div>`;
    try {
      const [projectData, prospectData, quoteData] = await Promise.all([request('/projects'), request('/prospects'), request('/quotes')]);
      const projects = Array.isArray(projectData.projects) ? projectData.projects : [];
      const prospects = Array.isArray(prospectData.prospects) ? prospectData.prospects : [];
      const quotes = Array.isArray(quoteData.quotes) ? quoteData.quotes : [];
      const averageScore = prospects.length ? Math.round(prospects.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / prospects.length) : 0;
      const waitingQuotes = quotes.filter((item) => !['signed', 'accepted', 'rejected'].includes(String(item.status || '').toLowerCase()));
      const pipeline = waitingQuotes.reduce((sum, item) => sum + (Number(item.totalTTC) || 0), 0);
      const priority = [...prospects].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0)).slice(0, 5);
      root.innerHTML = `<div class="page"><div class="headline"><div><div class="eyebrow">${esc(dateLabel())}</div><h1 class="page-title">Tableau de bord</h1><p class="page-subtitle">Vos chiffres viennent de vos données sauvegardées.</p></div><button class="primary-btn" data-page="prospects">+ Nouveau prospect</button></div><div class="cards"><div class="card metric"><span class="metric-label">Prospects</span><div class="metric-value">${prospects.length}</div><span class="metric-change">Enregistrés dans votre espace</span></div><div class="card metric"><span class="metric-label">Score moyen</span><div class="metric-value">${averageScore}<span style="font-size:14px;color:#9aa69d">/100</span></div><span class="metric-change">Opportunités qualifiées</span></div><div class="card metric"><span class="metric-label">Devis ouverts</span><div class="metric-value">${waitingQuotes.length}</div><span class="metric-change">À suivre ou relancer</span></div><div class="card metric"><span class="metric-label">Pipeline TTC</span><div class="metric-value">${money(pipeline)}</div><span class="metric-change">Valeur des devis ouverts</span></div></div><div class="grid-2"><section class="panel"><div class="panel-head"><h2 class="panel-title">Production</h2><button class="link" data-page="sites">Voir les sites →</button></div><p class="page-subtitle">${projects.length ? `${projects.length} projet${projects.length > 1 ? 's' : ''} enregistré${projects.length > 1 ? 's' : ''}.` : 'Aucun projet enregistré pour le moment.'}</p></section><section class="panel"><div class="panel-head"><h2 class="panel-title">À traiter en priorité</h2><button class="link" data-page="prospects">Voir les prospects →</button></div><div class="priority-list">${priority.length ? priority.map((item) => `<div class="priority"><div class="priority-icon">✦</div><div class="priority-info"><strong>${esc(item.name)}</strong><small>${esc(item.sector || 'Secteur non renseigné')} · ${esc(item.city || item.country || '—')}</small></div><span class="score">${Math.round(Number(item.score) || 0)}</span></div>`).join('') : '<p class="page-subtitle">Ajoutez un prospect pour commencer.</p>'}</div></section></div></div>`;
    } catch { root.innerHTML = emptyDashboard().replace('Connectez-vous, puis', 'Le serveur local est indisponible. Démarrez-le, puis'); }
  }

  function renderLibrary() {
    setActive('library'); const niches = window.CPMNiches?.list?.() || [];
    app().innerHTML = `<div class="page"><div class="headline"><div><div class="eyebrow">BIBLIOTHÈQUE</div><h1 class="page-title">Univers métiers</h1><p class="page-subtitle">Des bases éditoriales adaptées à une activité, puis personnalisées avec le brief client.</p></div><button class="primary-btn" data-page="sites">Créer un site</button></div><div class="site-grid">${niches.map((niche) => `<article class="panel site-card"><div class="site-thumb" style="background:${esc(niche.palette?.primary || '#315f83')}"><small>${esc(niche.label).toUpperCase()}</small><br><strong>${esc(niche.message)}</strong></div><div class="site-body"><strong>${esc(niche.sections?.length || 0)} blocs métier</strong><small>Structure et parcours dédiés</small></div></article>`).join('')}</div></div>`;
  }

  function route(page) {
    if (page === 'overview') return renderOverview();
    if (page === 'prospects') { setActive(page); return window.CPMProspectsManager?.render?.(); }
    if (page === 'quotes') { setActive(page); return window.CPMQuotesManager?.render?.(); }
    if (page === 'sites') { setActive(page); return window.CPMSavedProjects?.render?.(); }
    if (page === 'library') return renderLibrary();
    if (page === 'settings') { setActive(page); app().innerHTML = `<div class="page"><div class="headline"><div><div class="eyebrow">ESPACE</div><h1 class="page-title">Réglages</h1><p class="page-subtitle">Les réglages détaillés arriveront après la consolidation du parcours de production.</p></div></div></div>`; }
  }

  document.addEventListener('click', (event) => { const page = event.target.closest('[data-page]')?.dataset.page; if (!page) return; event.preventDefault(); event.stopImmediatePropagation(); route(page); }, true);
  window.CPMApp = { route, renderOverview };
  window.addEventListener('cpm:auth-changed', renderOverview);
  document.addEventListener('DOMContentLoaded', renderOverview);
  if (document.readyState !== 'loading') renderOverview();
})();
