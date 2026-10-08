(function (global) {
  const planCatalog = {
    landing: {
      id: 'landing',
      label: 'Landing page',
      labelFr: 'Landing page',
      setupBase: 1900,
      monthlyBase: 99,
      pages: 1,
      features: ['Une page de conversion sur mesure', 'Message, offre et appel à l’action', 'Version mobile', 'SEO technique essentiel']
    },
    medium: {
      id: 'medium',
      label: 'Medium',
      labelFr: 'Medium',
      setupBase: 3900,
      monthlyBase: 179,
      pages: 5,
      features: ['Site vitrine structuré', 'Parcours métier adapté', 'Preuves et contact', 'SEO local de base']
    },
    basic: {
      id: 'basic',
      label: 'Basic',
      labelFr: 'Basic',
      setupBase: 2900,
      monthlyBase: 149,
      pages: 5,
      features: ['Site vitrine 5 sections', 'Palette métier adaptée', 'Responsive mobile', 'SEO de base']
    },
    pro: {
      id: 'pro',
      label: 'Pro',
      labelFr: 'Pro',
      setupBase: 6900,
      monthlyBase: 290,
      pages: 8,
      features: ['Site premium', 'Pages services + preuve sociale', 'FAQ + stratégie conversion', 'SEO avancé']
    },
    ultimate: {
      id: 'ultimate',
      label: 'Ultimate',
      labelFr: 'Ultime',
      setupBase: 18900,
      monthlyBase: 690,
      pages: 12,
      features: ['Design premium sur mesure', 'Pages stratégiques', 'Contenu high-conversion', 'Support prioritaire']
    }
  };

  const labels = {
    fr: { basic: 'Basic', pro: 'Pro', ultimate: 'Ultime' },
    en: { basic: 'Basic', pro: 'Pro', ultimate: 'Ultimate' },
    ar: { basic: 'أساسي', pro: 'احترافي', ultimate: 'نهائي' },
    es: { basic: 'Básico', pro: 'Pro', ultimate: 'Ultimate' },
    de: { basic: 'Basic', pro: 'Pro', ultimate: 'Ultimate' }
  };

  const getPlan = (planId) => planCatalog[String(planId || 'basic').toLowerCase()] || planCatalog.basic;

  global.CPMPlans = {
    catalog: planCatalog,
    list: () => Object.values(planCatalog),
    get: getPlan,
    labels
  };
})(window);
