(function (global) {
  const nicheCatalog = {
    restaurant: {
      id: 'restaurant',
      label: 'Restaurant',
      palette: { primary: '#C95C2B', secondary: '#2B1B17', accent: '#F4E5D2', surface: '#FFF8F4' },
      message: 'Une cuisine qui raconte une histoire.',
      sections: ['hero', 'about', 'menu', 'proof', 'booking', 'contact'],
      cta: 'Réserver une table'
    },
    medical: {
      id: 'medical',
      label: 'Santé / Clinique',
      palette: { primary: '#0F6E77', secondary: '#0B2230', accent: '#EAF6F7', surface: '#F4FBFC' },
      message: 'Confiance, expertise et accompagnement.',
      sections: ['hero', 'services', 'about', 'proof', 'faq', 'contact'],
      cta: 'Prendre rendez-vous'
    },
    real_estate: {
      id: 'real_estate',
      label: 'Immobilier',
      palette: { primary: '#1C5E96', secondary: '#0F172A', accent: '#EAF2FF', surface: '#F7FAFF' },
      message: 'Des biens qui racontent la bonne décision.',
      sections: ['hero', 'properties', 'about', 'process', 'proof', 'contact'],
      cta: 'Demander une visite'
    },
    beauty: {
      id: 'beauty',
      label: 'Beauté / Spa',
      palette: { primary: '#B55E96', secondary: '#2C1A2E', accent: '#FDEBF7', surface: '#FFF7FB' },
      message: 'Une expérience qui transforme le quotidien.',
      sections: ['hero', 'services', 'about', 'portfolio', 'proof', 'contact'],
      cta: 'Réserver un soin'
    },
    automotive: {
      id: 'automotive',
      label: 'Automobile',
      palette: { primary: '#1E3A5F', secondary: '#111827', accent: '#E8F1FF', surface: '#F6F9FF' },
      message: 'Confiance, expertise et performance.',
      sections: ['hero', 'services', 'about', 'proof', 'faq', 'contact'],
      cta: 'Demander un devis'
    },
    hospitality: {
      id: 'hospitality',
      label: 'Hébergement',
      palette: { primary: '#C28A3A', secondary: '#1F1D1A', accent: '#F8F1DF', surface: '#FFFDF8' },
      message: 'Un accueil qui marque les voyageurs.',
      sections: ['hero', 'rooms', 'about', 'proof', 'contact'],
      cta: 'Réserver maintenant'
    },
    professional: {
      id: 'professional',
      label: 'Cabinet / Pro',
      palette: { primary: '#2F5D5A', secondary: '#10211F', accent: '#EDF5F3', surface: '#F5FAF9' },
      message: 'Crédibilité et expertise au service de vos clients.',
      sections: ['hero', 'services', 'about', 'proof', 'faq', 'contact'],
      cta: 'Prendre rendez-vous'
    },
    sport: {
      id: 'sport',
      label: 'Sport / Fitness',
      palette: { primary: '#2E7D32', secondary: '#122616', accent: '#EAFBEA', surface: '#F4FFF4' },
      message: 'Un cadre qui motive et transforme les habitudes.',
      sections: ['hero', 'programs', 'about', 'proof', 'contact'],
      cta: 'Essayer maintenant'
    },
    education: {
      id: 'education',
      label: 'Formation',
      palette: { primary: '#5E5BDE', secondary: '#1A1A2F', accent: '#EFEFFF', surface: '#F7F7FF' },
      message: 'Un apprentissage clair, motivant et orienté résultats.',
      sections: ['hero', 'programs', 'about', 'proof', 'faq', 'contact'],
      cta: 'Découvrir les formations'
    },
    artisan: {
      id: 'artisan',
      label: 'Artisanat / Habitat',
      palette: { primary: '#A45D28', secondary: '#261B14', accent: '#F8EEE5', surface: '#FFF9F5' },
      message: 'Le savoir-faire qui transforme vos projets.',
      sections: ['hero', 'services', 'projects', 'process', 'proof', 'contact'],
      cta: 'Demander une étude'
    },
    legal: {
      id: 'legal',
      label: 'Juridique / Conseil',
      palette: { primary: '#354E75', secondary: '#111B2B', accent: '#EEF2F8', surface: '#F8FAFD' },
      message: 'Une expertise rigoureuse, expliquée clairement.',
      sections: ['hero', 'expertise', 'method', 'proof', 'faq', 'contact'],
      cta: 'Prendre rendez-vous'
    }
  };

  const resolveNiche = (sector = '') => {
    const normalized = String(sector).toLowerCase();
    if (/(restaurant|bistro|pizzeria|traiteur|cafe|brasserie|café)/.test(normalized)) return nicheCatalog.restaurant;
    if (/(avocat|notaire|jurid|fiscal|comptable|expert-comptable|assurance)/.test(normalized)) return nicheCatalog.legal;
    if (/(architecte|artisan|plombier|électricien|electricien|menuisier|rénovation|renovation|maçon|macon|couvreur|paysagiste)/.test(normalized)) return nicheCatalog.artisan;
    if (/(dent|clinique|medical|sant|med|vétérinaire|veterinaire|chirurgie|consultation|kiné|kine|ostéo|osteo)/.test(normalized)) return nicheCatalog.medical;
    if (/(immobilier|maison|vente|terrain|bien|real estate|property)/.test(normalized)) return nicheCatalog.real_estate;
    if (/(beauté|spa|coiffure|esthétique|beauty|salon|massage)/.test(normalized)) return nicheCatalog.beauty;
    if (/(garage|auto|automobile|voiture|mécanique|mechanic)/.test(normalized)) return nicheCatalog.automotive;
    if (/(hotel|hôtel|résidence|residence|auberge|hospitality)/.test(normalized)) return nicheCatalog.hospitality;
    if (/(avocat|jurid|cabinet|consulting|expert|finance|comptab)/.test(normalized)) return nicheCatalog.professional;
    if (/(sport|fitness|gym|coach|yoga|crossfit)/.test(normalized)) return nicheCatalog.sport;
    if (/(formation|academy|cours|éducation|education|coaching)/.test(normalized)) return nicheCatalog.education;
    return nicheCatalog.professional;
  };

  global.CPMNiches = {
    catalog: nicheCatalog,
    list: () => Object.values(nicheCatalog),
    resolve: resolveNiche
  };
})(window);
