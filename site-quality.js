/* Generated-site quality gate. It validates the artifact before export or delivery. */
(function () {
  const required = ['<!doctype html', '<meta name="viewport"', '<title>', '<meta name="description"', '<style>', 'href="#contact"'];
  const toast = (message) => { const el = document.getElementById('toast'); if (!el) return; el.textContent = message; el.classList.add('show'); window.setTimeout(() => el.classList.remove('show'), 2800); };
  const validate = (html) => {
    const source = String(html || '').toLowerCase();
    const checks = required.map((token) => ({ token, passed: source.includes(token) }));
    const unsafe = /<script\s+src=|javascript:/i.test(String(html || ''));
    const parsed = new DOMParser().parseFromString(String(html || ''), 'text/html');
    const title = parsed.querySelector('title')?.textContent?.trim() || '';
    const description = parsed.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
    const hasEmail = Boolean(parsed.querySelector('a[href^="mailto:"]'));
    const hasPhone = Boolean(parsed.querySelector('a[href^="tel:"]'));
    const hasContactForm = Boolean(parsed.querySelector('[data-contact-form]'));
    const genericTitle = /votre entreprise|entreprise \|/i.test(title);
    const genericDescription = /présence digitale premium pensée/i.test(description);
    const report = {
      passed: checks.every((check) => check.passed) && !unsafe && Boolean(parsed.querySelector('h1')) && hasEmail && hasContactForm && !genericTitle && !genericDescription,
      checks,
      unsafe,
      hasHeading: Boolean(parsed.querySelector('h1')),
      hasContact: Boolean(parsed.querySelector('#contact')),
      hasEmail,
      hasPhone,
      hasContactForm,
      genericTitle,
      genericDescription,
      generatedAt: new Date().toISOString()
    };
    return report;
  };
  const showResult = (report) => {
    const preview = document.getElementById('site-preview');
    if (!preview?.parentNode) return;
    let badge = document.getElementById('site-quality-result');
    if (!badge) { badge = document.createElement('div'); badge.id = 'site-quality-result'; badge.className = 'site-quality-result'; preview.parentNode.insertBefore(badge, preview); }
    badge.dataset.status = report.passed ? 'passed' : 'failed';
    const issues = [!report.hasEmail && 'e-mail', !report.hasContactForm && 'formulaire', report.genericTitle && 'nom de l’entreprise', report.genericDescription && 'description personnalisée'].filter(Boolean);
    badge.textContent = report.passed ? '✓ Contrôle qualité réussi — site prêt à livrer' : `⚠ Contrôle incomplet : ${issues.join(', ') || 'contenu à vérifier'}`;
  };
  window.addEventListener('cpm:site-generated', (event) => {
    const report = validate(event.detail?.html);
    window.CPMGeneratedSite = { ...window.CPMGeneratedSite, quality: report };
    showResult(report);
    if (!report.passed) toast('Le contrôle qualité a détecté un problème dans le site.');
  });
  window.CPMSiteQuality = { validate };
})();
