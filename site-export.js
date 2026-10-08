/* Export and inspect the generated production artifact. */
(function () {
  const toast = (message) => { const el = document.getElementById('toast'); if (!el) return; el.textContent = message; el.classList.add('show'); window.setTimeout(() => el.classList.remove('show'), 2600); };
  const slug = (value) => String(value || 'site').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'site';
  const download = (filename, content, type) => { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 500); };
  const current = () => window.CPMGeneratedSite || null;
  function addControls() {
    const preview = document.getElementById('site-preview');
    if (!preview || document.getElementById('site-export-controls')) return;
    const controls = document.createElement('div');
    controls.id = 'site-export-controls';
    controls.className = 'site-export-controls';
    controls.innerHTML = '<button type="button" class="secondary-btn" data-export-site> Télécharger le site HTML</button><button type="button" class="secondary-btn" data-open-site> Ouvrir dans un nouvel onglet</button>';
    preview.parentNode?.insertBefore(controls, preview);
  }
  function exportSite() {
    const generated = current();
    if (!generated?.html) return toast('Générez d’abord un site.');
    const quality = window.CPMSiteQuality?.validate?.(generated.html);
    if (quality && !quality.passed) return toast('Export bloqué : complétez les éléments signalés par le contrôle qualité.');
    download(`${slug(generated.project?.name)}.html`, generated.html, 'text/html;charset=utf-8');
    toast('Site HTML téléchargé.');
  }
  function openSite() {
    const generated = current();
    if (!generated?.html) return toast('Générez d’abord un site.');
    const quality = window.CPMSiteQuality?.validate?.(generated.html);
    if (quality && !quality.passed) return toast('Complétez le brief avant de livrer ce site.');
    const url = URL.createObjectURL(new Blob([generated.html], { type: 'text/html' }));
    window.open(url, '_blank', 'noopener');
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
  document.addEventListener('cpm:site-generated', addControls);
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-export-site]')) { event.preventDefault(); exportSite(); }
    if (event.target.closest('[data-open-site]')) { event.preventDefault(); openSite(); }
  });
  const observer = new MutationObserver(addControls);
  observer.observe(document.body, { childList: true, subtree: true });
})();
