(function() {
  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const token = () => window.CPMAuth?.token?.() || localStorage.getItem('cpm-session-token') || '';
  const headers = (json = false) => ({ ...(json ? {'content-type':'application/json'} : {}), ...(token() ? { authorization:`Bearer ${token()}` } : {}) });
  const escapeHtml = (v) => String(v || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = (v) => `${Math.round((Number(v) || 0) * 100) / 100}€`;

  async function generateProposalHTML(prospectData = {}) {
    const today = new Date();
    const proposalNum = `PROP-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    const prospectName = escapeHtml(prospectData.name || 'Prospect');
    const prospectSector = escapeHtml(prospectData.sector || 'secteur');
    const prospectCity = escapeHtml(prospectData.city || 'ville');
    const prospectScore = prospectData.score || 0;

    const recommendationLevel = prospectScore >= 80 ? 'Très haute opportunité' : prospectScore >= 70 ? 'Bonne opportunité' : prospectScore >= 60 ? 'Opportunité modérée' : 'À qualifier';
    const recommendationColor = prospectScore >= 80 ? '#28a745' : prospectScore >= 70 ? '#17a2b8' : '#ffc107';

    return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Proposition ${prospectName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 900px; margin: 20px auto; background: white; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #007bff; }
    .header-info { text-align: right; font-size: 13px; }
    .header-info p { margin: 2px 0; }
    h1 { margin: 20px 0 0; color: #007bff; font-size: 28px; }
    .subtitle { color: #666; font-size: 14px; margin-top: 4px; }
    .prospect-card { background: #f0f8ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .prospect-card h3 { margin-top: 0; color: #007bff; }
    .prospect-meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 10px; font-size: 13px; }
    .meta-item { }
    .meta-label { font-weight: bold; color: #007bff; }
    .score-badge { display: inline-block; background: ${recommendationColor}; color: white; padding: 6px 12px; border-radius: 999px; font-weight: bold; font-size: 12px; margin-top: 8px; }
    .section { margin: 30px 0; }
    .section-title { font-size: 18px; font-weight: bold; color: #007bff; margin-bottom: 15px; border-bottom: 2px solid #007bff; padding-bottom: 8px; }
    .recommendation { background: #f0f8ff; padding: 15px; border-radius: 4px; }
    .recommendation p { margin: 8px 0; }
    .opportunity-list { list-style: none; margin: 15px 0; }
    .opportunity-list li { padding: 10px; margin: 5px 0; background: #f9f9f9; border-left: 3px solid #007bff; }
    .opportunity-list strong { color: #007bff; }
    .pricing-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .pricing-table thead { background: #f0f0f0; }
    .pricing-table th, .pricing-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .pricing-table th { font-weight: bold; color: #007bff; }
    .next-steps { background: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; border-radius: 4px; }
    .next-steps h3 { color: #28a745; margin-top: 0; }
    .next-steps ol { margin-left: 20px; }
    .next-steps li { margin: 8px 0; }
    .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; padding-top: 30px; border-top: 1px solid #ddd; text-align: center; }
    .signature-box p { margin-top: 60px; font-weight: bold; }
    footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #999; }
    @media print { body { background: white; } .container { box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div><div class="logo">CavaPasMarcher</div></div>
      <div class="header-info">
        <p><strong>Proposition N°</strong> ${proposalNum}</p>
        <p><strong>Date:</strong> ${today.toLocaleDateString('fr-FR')}</p>
      </div>
    </header>

    <div>
      <h1>Proposition Commerciale</h1>
      <p class="subtitle">Opportunité de développement web pour ${prospectName}</p>
    </div>

    <div class="prospect-card">
      <h3>${prospectName}</h3>
      <div class="prospect-meta">
        <div class="meta-item"><span class="meta-label">Secteur:</span> ${prospectSector}</div>
        <div class="meta-item"><span class="meta-label">Localisation:</span> ${prospectCity}</div>
        <div class="meta-item"><span class="meta-label">Score:</span> ${prospectScore}/100</div>
      </div>
      <div class="score-badge">${recommendationLevel}</div>
    </div>

    <div class="section">
      <div class="section-title">1. Diagnostic & Opportunité</div>
      <div class="recommendation">
        <p><strong>Analyse:</strong> Ce prospect présente une opportunité de développement web avec un score de ${prospectScore}/100.</p>
        <p><strong>Potentiel:</strong> ${recommendationLevel}. Une présence digitale premium pourrait améliorer significativement la visibilité et les conversions.</p>
        <p><strong>Recommandation:</strong> ${prospectScore >= 75 ? 'Contacter rapidement. Ce prospect est hautement qualifié.' : prospectScore >= 60 ? 'Contacter pour qualification supplémentaire.' : 'Évaluer les besoins avant proposition.'}</p>
      </div>
    </div>

    <div class="section">
      <div class="section-title">2. Opportunités Identifiées</div>
      <ul class="opportunity-list">
        <li><strong>Présence digitale:</strong> Amélioration de la visibilité online et du référencement local.</li>
        <li><strong>Design & UX:</strong> Une image premium pour rassurer et convertir les visiteurs.</li>
        <li><strong>Conversion:</strong> Optimisation pour capturer demandes, réservations et bons contacts.</li>
        <li><strong>Crédibilité:</strong> Un site professionnel renforce la confiance des clients potentiels.</li>
      </ul>
    </div>

    <div class="section">
      <div class="section-title">3. Offre Proposée</div>
      <table class="pricing-table">
        <thead>
          <tr>
            <th>Forfait</th>
            <th>Description</th>
            <th style="text-align: right;">Prix HT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Premium</strong></td>
            <td>Site premium, 8+ sections, design adapté au secteur, optimisation conversion</td>
            <td style="text-align: right;"><strong>2 900€</strong></td>
          </tr>
          <tr>
            <td><strong>Expert</strong></td>
            <td>Site expert, 12+ sections, contenu riche, blog intégré, SEO avancé</td>
            <td style="text-align: right;"><strong>4 900€</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">4. Modalités</div>
      <div class="recommendation">
        <p><strong>Délais:</strong> 3 à 4 semaines pour livraison après signature.</p>
        <p><strong>Acompte:</strong> 30% à la signature, solde à la livraison.</p>
        <p><strong>Support:</strong> 1 mois de support et correction gratuits après livraison.</p>
        <p><strong>Garant:</strong> Site optimisé mobile, performance, sécurité incluse.</p>
      </div>
    </div>

    <div class="next-steps">
      <h3>Prochaines Étapes</h3>
      <ol>
        <li>Validation de cette proposition par vos soins.</li>
        <li>Signature du contrat et versement de l'acompte.</li>
        <li>Réunion de lancement et collecte du contenu.</li>
        <li>Création et livraison du site.</li>
        <li>Support et optimisation post-livraison.</li>
      </ol>
    </div>

    <div class="signature-section">
      <div class="signature-box">
        <p>Signature du prestataire</p>
      </div>
      <div class="signature-box">
        <p>Signature du prospect</p>
      </div>
    </div>

    <footer>
      <p>Cette proposition est valable 30 jours à compter de sa date d'émission.</p>
      <p>Document généré automatiquement par CavaPasMarcher.</p>
    </footer>
  </div>
</body>
</html>`;
  }

  window.CPMProposalGenerator = { generateProposalHTML };
})();
