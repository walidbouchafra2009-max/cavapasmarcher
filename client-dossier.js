(function () {
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function buildDossierHTML(prospect = {}) {
    const score = Number(prospect.score || prospect.analysis?.score || 0);
    const analysis = prospect.analysis || {};
    const name = prospect.name || 'Client';
    const sector = prospect.sector || 'Secteur';
    const city = prospect.city || 'Ville';
    const website = prospect.website || 'Non renseigné';
    const email = prospect.email || 'Non renseigné';
    const phone = prospect.phone || 'Non renseigné';
    const notes = prospect.notes || 'Aucune note ajoutée.';
    const date = new Date().toLocaleDateString('fr-FR');

    return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dossier client — ${escapeHtml(name)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      background: #f5f7fb;
      color: #1f2937;
      line-height: 1.6;
    }
    .container {
      max-width: 1000px;
      margin: 32px auto;
      background: white;
      border-radius: 18px;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
      padding: 40px;
    }
    h1, h2, h3 { color: #0f172a; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .brand {
      font-size: 26px;
      font-weight: 800;
      color: #1d4ed8;
    }
    .meta {
      text-align: right;
      font-size: 14px;
      color: #475569;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin: 24px 0;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 18px;
    }
    .label {
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .score {
      display: inline-block;
      background: ${score >= 80 ? '#16a34a' : score >= 60 ? '#0ea5e9' : '#f59e0b'};
      color: white;
      padding: 8px 12px;
      border-radius: 999px;
      font-weight: 700;
      margin-top: 8px;
    }
    .section {
      margin-top: 32px;
    }
    ul {
      margin: 10px 0 0 18px;
      padding: 0;
    }
    li { margin-bottom: 8px; }
    .footer {
      margin-top: 36px;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      color: #64748b;
      text-align: center;
      font-size: 12px;
    }
    @media (max-width: 700px) {
      .grid { grid-template-columns: 1fr; }
      .header { flex-direction: column; gap: 12px; }
      .container { padding: 24px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="brand">CavaPasMarcher</div>
        <h1>Dossier client</h1>
      </div>
      <div class="meta">
        <p><strong>Client:</strong> ${escapeHtml(name)}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Statut:</strong> ${score >= 80 ? 'Très fort potentiel' : score >= 60 ? 'Bon potentiel' : 'À qualifier'}</p>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="label">Identité</div>
        <p><strong>Entreprise:</strong> ${escapeHtml(name)}</p>
        <p><strong>Secteur:</strong> ${escapeHtml(sector)}</p>
        <p><strong>Ville:</strong> ${escapeHtml(city)}</p>
      </div>
      <div class="card">
        <div class="label">Coordonnées</div>
        <p><strong>Site:</strong> ${escapeHtml(website)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Téléphone:</strong> ${escapeHtml(phone)}</p>
      </div>
    </div>

    <div class="card">
      <div class="label">Score commercial</div>
      <div class="score">${score}/100</div>
      <p style="margin-top: 12px;">Le client est classé comme : ${score >= 80 ? 'très fort potentiel de vente' : score >= 60 ? 'potentiel commercial intéressant' : 'à qualifier davantage avant prise de contact'}</p>
    </div>

    <div class="section">
      <h2>Analyse du site</h2>
      <ul>
        <li><strong>URL:</strong> ${escapeHtml(analysis.url || website)}</li>
        <li><strong>Responsive:</strong> ${analysis.responsive ? 'Oui' : 'Non'}</li>
        <li><strong>Présence de contact:</strong> ${analysis.hasContact ? 'Oui' : 'Non'}</li>
        <li><strong>Score technique:</strong> ${Math.round(Number(analysis.score || score) || 0)}/100</li>
      </ul>
    </div>

    <div class="section">
      <h2>Notes commerciale</h2>
      <p>${escapeHtml(notes)}</p>
    </div>

    <div class="section">
      <h2>Documents associés</h2>
      <ul>
        <li>Proposition commerciale</li>
        <li>Devis</li>
        <li>Contrat de prestation</li>
        <li>Archive du dossier local</li>
      </ul>
    </div>

    <div class="footer">
      Document généré automatiquement par CavaPasMarcher — ${date}
    </div>
  </div>
</body>
</html>`;
  }

  window.CPMClientDossier = { buildDossierHTML };
})();
