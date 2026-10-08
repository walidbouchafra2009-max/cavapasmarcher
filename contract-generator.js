(function() {
  const API = window.CPM_API_URL || 'http://localhost:8787/api';
  const token = () => window.CPMAuth?.token?.() || localStorage.getItem('cpm-session-token') || '';
  const headers = (json = false) => ({ ...(json ? {'content-type':'application/json'} : {}), ...(token() ? { authorization:`Bearer ${token()}` } : {}) });
  const toast = (msg) => { const el = document.getElementById('toast'); if(!el) return; el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600); };
  const escapeHtml = (v) => String(v || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = (v) => `${Math.round((Number(v) || 0) * 100) / 100}€`;

  async function generateContractHTML(quoteId, clientName, clientCity) {
    try {
      const response = await fetch(`${API}/quotes/${encodeURIComponent(quoteId)}`, { headers: headers() });
      if(!response.ok) throw new Error();
      const quote = await response.json();
      
      const today = new Date();
      const validUntil = new Date(today.getTime() + ((quote.validityDays || 30) * 24 * 60 * 60 * 1000));
      const contractDate = today.toLocaleDateString('fr-FR');
      const contractNum = `CTR-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;

      const itemsHtml = (quote.items || [])
        .map(item => `<tr><td>${escapeHtml(item.label || '')}</td><td style="text-align:center;">${item.quantity || 1}</td><td style="text-align:right;">${money(item.unitPrice || 0)}</td><td style="text-align:right; font-weight:bold;">${money(item.subtotal || 0)}</td></tr>`)
        .join('');

      const taxAmount = Math.round(((quote.totalHT || 0) * (quote.taxRate || 20)) / 100 * 100) / 100;
      const finalTotal = (quote.totalHT || 0) + taxAmount;

      return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contrat ${contractNum}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 900px; margin: 20px auto; background: white; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #007bff; }
    .header-info { text-align: right; font-size: 13px; }
    .header-info p { margin: 2px 0; }
    h1 { margin: 20px 0; color: #007bff; font-size: 28px; }
    .contract-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 13px; }
    .meta-section { }
    .meta-label { font-weight: bold; color: #007bff; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; padding: 15px; background: #f9f9f9; border-left: 4px solid #007bff; }
    .party h3 { margin-top: 0; color: #007bff; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    thead { background: #f0f0f0; }
    th { padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #007bff; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:hover { background: #f9f9f9; }
    .terms-section { margin-top: 30px; padding: 15px; background: #f9f9f9; border-left: 4px solid #007bff; }
    .terms-section h3 { margin-top: 0; color: #007bff; }
    .terms-section ol { margin-left: 20px; }
    .terms-section li { margin: 8px 0; }
    .totals { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 30px; }
    .totals-right { text-align: right; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-label { font-weight: bold; }
    .total-amount { font-weight: bold; }
    .total-ht { border-bottom: 1px solid #ddd; }
    .total-ttc { font-size: 18px; color: #007bff; border-top: 2px solid #007bff; padding-top: 10px; }
    .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; padding-top: 30px; border-top: 1px solid #ddd; }
    .signature-box { text-align: center; }
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
        <p><strong>Contrat N°</strong> ${contractNum}</p>
        <p><strong>Date:</strong> ${contractDate}</p>
        <p><strong>Valable jusqu'au:</strong> ${validUntil.toLocaleDateString('fr-FR')}</p>
      </div>
    </header>

    <h1>CONTRAT DE PRESTATION</h1>

    <div class="parties">
      <div class="party">
        <h3>Prestataire</h3>
        <p><strong>CavaPasMarcher</strong></p>
        <p>Studio Web Premium</p>
        <p>France</p>
      </div>
      <div class="party">
        <h3>Client</h3>
        <p><strong>${escapeHtml(clientName || 'À compléter')}</strong></p>
        <p>${escapeHtml(clientCity || 'À compléter')}</p>
      </div>
    </div>

    <div class="contract-meta">
      <div class="meta-section">
        <p class="meta-label">Objet du contrat:</p>
        <p>${escapeHtml(quote.description || 'Création de site web premium')}</p>
      </div>
      <div class="meta-section">
        <p class="meta-label">Montant total TTC:</p>
        <p style="font-size: 18px; font-weight: bold; color: #007bff;">${money(finalTotal)}</p>
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
          <span class="total-amount">${money(quote.totalHT || 0)}</span>
        </div>
        <div class="total-row">
          <span class="total-label">TVA (${quote.taxRate || 20}%):</span>
          <span class="total-amount">${money(taxAmount)}</span>
        </div>
        <div class="total-row total-ttc">
          <span class="total-label">Total TTC:</span>
          <span class="total-amount">${money(finalTotal)}</span>
        </div>
      </div>
    </div>

    <div class="terms-section">
      <h3>Conditions du contrat</h3>
      <ol>
        <li>Le devis est valable ${quote.validityDays || 30} jours à compter de sa date d'émission.</li>
        <li>Un acompte de 30% est demandé à la signature du contrat.</li>
        <li>Le solde de 70% est dû à la livraison du site.</li>
        <li>Les délais de livraison seront convenus d'un commun accord.</li>
        <li>Les modifications demandées après la signature entraîneront une facture supplémentaire.</li>
        <li>Le contrat est soumis aux lois français. Tout litige sera soumis à la juridiction compétente.</li>
      </ol>
    </div>

    <div class="signature-section">
      <div class="signature-box">
        <p>Signature du prestataire</p>
      </div>
      <div class="signature-box">
        <p>Signature du client</p>
      </div>
    </div>

    <footer>
      <p>Ce contrat constitue un engagement légal entre le prestataire et le client.</p>
      <p>Document généré automatiquement par CavaPasMarcher.</p>
    </footer>
  </div>
</body>
</html>`;
    } catch (e) {
      console.error('Erreur génération contrat:', e);
      throw e;
    }
  }

  window.CPMContractGenerator = { generateContractHTML };
})();
