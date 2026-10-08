(function (global) {
  const normalize = (value) => String(value || '').trim();
  const safeText = (value, fallback = '') => normalize(value) || fallback;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

  const getPlan = (planId = 'pro') => global.CPMPlans?.get ? global.CPMPlans.get(planId) : { id: 'pro', pages: 8, features: ['Design premium', 'Site responsive', 'Conversion orientée'] };
  const getNiche = (sector) => global.CPMNiches?.resolve ? global.CPMNiches.resolve(sector) : { label: 'Professionnel', palette: { primary: '#1F6FEB', secondary: '#0b1526', accent: '#EAF5FF', surface: '#F5F8FF' }, message: 'Une présence digitale premium.' };

  const nicheStories = {
    restaurant: { label: 'À la carte', title: 'Une table qui donne envie avant même la première bouchée.', intro: 'Découvrez la carte, les produits de saison et l’atmosphère de la maison.', items: [['La carte', 'Des assiettes de saison, précises et généreuses.'], ['Le lieu', 'Une adresse pensée pour se retrouver et prendre son temps.'], ['Réserver', 'Choisissez votre moment, simplement.']] },
    medical: { label: 'Votre parcours', title: 'Un accompagnement clair, avant, pendant et après le rendez-vous.', intro: 'Informations utiles, spécialités et accès au cabinet réunis dans une expérience rassurante.', items: [['Spécialités', 'Des soins expliqués avec des mots clairs.'], ['Le cabinet', 'Un accueil attentif dans un cadre apaisant.'], ['Le rendez-vous', 'Une prise de rendez-vous simple et directe.']] },
    real_estate: { label: 'Sélection du moment', title: 'Des lieux choisis pour ce qu’ils rendent possible.', intro: 'Une présentation éditoriale des biens et un parcours qui facilite la prise de décision.', items: [['Acheter', 'Trouver un lieu qui correspond réellement à votre projet.'], ['Vendre', 'Valoriser chaque détail qui fait la différence.'], ['Estimer', 'Obtenir un premier échange confidentiel.']] },
    beauty: { label: 'La carte des soins', title: 'Un moment pour ralentir, se sentir bien et rayonner.', intro: 'Soins signatures, expertise et réservations réunis dans une expérience délicate.', items: [['Soins visage', 'Des rituels adaptés à votre peau et votre rythme.'], ['Corps & bien-être', 'Une parenthèse pour retrouver son énergie.'], ['Beauté', 'Des gestes précis pour révéler votre singularité.']] },
    automotive: { label: 'L’atelier', title: 'Une expertise mécanique qui vous laisse repartir sereinement.', intro: 'Prestations, conseils et prise en charge expliqués avec transparence.', items: [['Entretien', 'Préserver la fiabilité de votre véhicule.'], ['Diagnostic', 'Comprendre avant de décider.'], ['Réparation', 'Une intervention claire, suivie et documentée.']] },
    hospitality: { label: 'Votre séjour', title: 'Plus qu’une chambre : une parenthèse dont on se souvient.', intro: 'Présentez vos espaces, vos attentions et les expériences autour de votre adresse.', items: [['Les chambres', 'Des espaces pensés pour se sentir bien, tout simplement.'], ['La destination', 'Les bonnes adresses et moments à vivre à proximité.'], ['Disponibilités', 'Préparez votre séjour en quelques instants.']] },
    sport: { label: 'Le programme', title: 'Un lieu, une méthode et l’énergie de progresser ensemble.', intro: 'Cours, coaching et accompagnement : tout ce qui aide à tenir dans la durée.', items: [['Cours', 'Des séances adaptées à chaque niveau.'], ['Coaching', 'Un suivi concret et des objectifs qui vous ressemblent.'], ['Essai', 'Faites le premier pas, sans pression.']] },
    education: { label: 'Les formations', title: 'Apprendre avec méthode. Avancer avec confiance.', intro: 'Des parcours lisibles, des résultats concrets et un accompagnement humain.', items: [['Parcours', 'Choisissez une formation alignée à votre objectif.'], ['Méthode', 'Des contenus clairs, applicables et progressifs.'], ['Admission', 'Toutes les informations pour vous lancer.']] },
    artisan: { label: 'Le savoir-faire', title: 'Des réalisations solides, pensées dans le détail.', intro: 'Projets, méthode et preuves de qualité au cœur d’un parcours rassurant.', items: [['Vos projets', 'Une réponse concrète à votre besoin et à votre lieu.'], ['La méthode', 'Un déroulé clair, du premier échange à la réception.'], ['Demander une étude', 'Partagez votre projet pour obtenir un premier avis.']] },
    legal: { label: 'Domaines d’intervention', title: 'Une expertise rigoureuse, rendue simplement accessible.', intro: 'Vos sujets sont expliqués clairement pour permettre les bonnes décisions.', items: [['Conseil', 'Un premier regard précis sur votre situation.'], ['Accompagnement', 'Une stratégie lisible à chaque étape.'], ['Rendez-vous', 'Échangez en toute confidentialité avec un expert.']] },
    professional: { label: 'Notre accompagnement', title: 'Les bonnes décisions commencent par une conversation claire.', intro: 'Vos domaines d’expertise, votre méthode et votre façon de créer de la valeur.', items: [['Conseil', 'Une lecture précise de votre situation.'], ['Expertise', 'Des recommandations claires et argumentées.'], ['Rendez-vous', 'Un premier échange pour cadrer votre besoin.']] }
  };

  const localizedLabels = (language = 'fr') => {
    const map = {
      fr: { about: 'À propos', expertise: 'Notre expertise', method: 'Notre méthode', trust: 'Ils nous font confiance', faq: 'FAQ', contact: 'Contact', cta: 'Prendre rendez-vous', discover: 'Découvrir' },
      en: { about: 'About', expertise: 'Our expertise', method: 'Our method', trust: 'Testimonials', faq: 'FAQ', contact: 'Contact', cta: 'Book a call', discover: 'Discover' },
      ar: { about: 'معلومات', expertise: 'خبرتنا', method: 'منهجنا', trust: 'آراؤهم', faq: 'الأسئلة', contact: 'تواصل', cta: 'احجز موعدًا', discover: 'اكتشف' },
      es: { about: 'Sobre nosotros', expertise: 'Nuestra experiencia', method: 'Nuestro método', trust: 'Opiniones', faq: 'Preguntas', contact: 'Contacto', cta: 'Reservar una cita', discover: 'Descubrir' }
    };
    return map[String(language).toLowerCase()] || map.fr;
  };

  const buildSiteHtml = (project = {}) => {
    const niche = getNiche(project.sector);
    const plan = getPlan(project.plan);
    const labels = localizedLabels(project.language);
    const primary = niche.palette.primary;
    const secondary = niche.palette.secondary;
    const accent = niche.palette.accent;
    const surface = niche.palette.surface;
    const name = escapeHtml(safeText(project.name, 'Votre entreprise'));
    const city = escapeHtml(safeText(project.city, 'Votre ville'));
    const sector = escapeHtml(safeText(project.sector, 'Votre activité'));
    const description = escapeHtml(safeText(project.description, 'Une présence digitale premium pensée pour rassurer, convaincre et convertir.'));
    const currency = safeText(project.currency, 'EUR');
    const setup = safeText(project.setup, '2900');
    const inArabic = String(project.language || 'fr').toLowerCase() === 'ar';
    const planId = String(plan.id || project.plan || 'pro').toLowerCase();
    const isLanding = planId === 'landing';
    const showAbout = !isLanding;
    const showExpertise = !isLanding;
    const showProcess = ['pro', 'ultimate'].includes(planId);
    const showTestimonials = ['medium', 'basic', 'pro', 'ultimate'].includes(planId);
    const contactEmail = escapeHtml(safeText(project.email, `contact@${String(project.name || 'entreprise').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`));
    const contactPhone = escapeHtml(safeText(project.phone, ''));
    const objective = escapeHtml(safeText(project.goal, niche.cta || labels.cta));

    const statList = [
      ['Premium', 'Design'],
      ['Mobile', 'Optimisé'],
      [String(plan.pages || 8), 'Sections']
    ];

    const story = nicheStories[niche.id] || nicheStories.professional;
    const expertiseCards = story.items.map(([feature, detail]) => `
        <article class="card-feature">
          <span class="mini-tag">${story.label}</span>
          <h3>${escapeHtml(feature)}</h3>
          <p>${escapeHtml(detail)}</p>
        </article>
      `).join('');

    const processSteps = [
      ['1', 'Diagnostic', 'Nous identifions votre activité, votre cible et votre message.'],
      ['2', 'Stratégie', 'Nous définissons le positionnement et les sections qui convertissent.'],
      ['3', 'Design', 'Nous créons une identité claire, premium et cohérente.'],
      ['4', 'Conversion', 'Le site est optimisé pour capter demandes, rendez-vous et contacts.']
    ].map(([num, title, text]) => `
      <div class="step">
        <div class="step-num">${num}</div>
        <h3>${title}</h3>
        <p>${text}</p>
      </div>
    `).join('');

    const testimonials = [
      '“Le site rend immédiatement notre expertise plus crédible. La qualité de contact a fortement augmenté.”',
      '“Le design est propre, premium et beaucoup plus clair. Le site aide réellement à vendre.”',
      '“Il est à la fois élégant et efficace. Le message inspire confiance et la visite est agréable.”'
    ].map((quote) => `<blockquote>“${quote}”</blockquote>`).join('');

    const html = `<!doctype html>
<html lang="${project.language || 'fr'}" dir="${inArabic ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} | ${sector}</title>
  <meta name="description" content="${description}" />
  <style>
    :root {
      --primary: ${primary};
      --secondary: ${secondary};
      --accent: ${accent};
      --surface: ${surface};
      --card: rgba(255,255,255,0.97);
      --muted: #5a6670;
      --line: rgba(17,24,39,0.08);
      --shadow: 0 18px 38px rgba(15,23,42,0.10);
      --shadow-soft: 0 10px 24px rgba(15,23,42,0.06);
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: Inter, "Segoe UI", Arial, sans-serif;
      background: var(--surface);
      color: var(--secondary);
      line-height: 1.6;
    }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }
    .container { max-width: 1180px; margin: 0 auto; padding: 0 20px; }
    header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      padding: 22px 0 74px;
      position: relative;
      overflow: hidden;
    }
    header::before {
      content: "";
      position: absolute;
      inset: -10% -30% auto auto;
      width: 460px;
      height: 460px;
      background: rgba(255,255,255,0.08);
      border-radius: 50%;
      filter: blur(16px);
    }
    .nav {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .brand {
      font-size: 1.2rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 0.95rem;
      opacity: 0.96;
      flex-wrap: wrap;
    }
    .nav-links a {
      opacity: 0.88;
    }
    .hero {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1.25fr 0.75fr;
      gap: 36px;
      padding-top: 46px;
      align-items: center;
    }
    .eyebrow {
      display: inline-block;
      padding: 9px 14px;
      background: rgba(255,255,255,0.10);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 999px;
      letter-spacing: 0.06em;
      font-weight: 700;
      font-size: 0.72rem;
      text-transform: uppercase;
    }
    h1 {
      font-size: clamp(2.7rem, 5vw, 4.3rem);
      line-height: 1.04;
      letter-spacing: -0.05em;
      margin: 16px 0 12px;
    }
    .lead {
      max-width: 670px;
      color: rgba(255,255,255,0.9);
      font-size: 1.08rem;
      line-height: 1.8;
    }
    .hero-actions {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      margin-top: 22px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 15px 22px;
      border-radius: 12px;
      font-weight: 700;
      transition: transform 0.2s ease, opacity 0.2s ease;
      border: 1px solid transparent;
    }
    .btn:hover { transform: translateY(-1px); }
    .btn.primary {
      background: white;
      color: var(--secondary);
      box-shadow: var(--shadow-soft);
    }
    .btn.secondary {
      background: transparent;
      color: white;
      border-color: rgba(255,255,255,0.28);
    }
    .hero-card {
      background: var(--card);
      border-radius: 26px;
      padding: 24px;
      box-shadow: var(--shadow);
      color: var(--secondary);
    }
    .mini-tag {
      display: inline-flex;
      align-items: center;
      background: var(--accent);
      color: var(--secondary);
      border-radius: 999px;
      padding: 7px 10px;
      font-weight: 800;
      font-size: 0.72rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .hero-card h3 {
      margin: 18px 0 8px;
      font-size: 1.7rem;
      line-height: 1.2;
    }
    .hero-card p {
      color: var(--muted);
      margin: 0;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-top: 18px;
    }
    .stat {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 14px 12px;
      text-align: center;
    }
    .stat strong {
      display: block;
      font-size: 1.35rem;
      margin-bottom: 4px;
    }
    .stat span {
      color: var(--muted);
      font-size: 0.82rem;
    }
    section { padding: 82px 0; }
    .section-head {
      max-width: 760px;
      margin-bottom: 28px;
    }
    .section-head h2 {
      margin: 14px 0 0;
      font-size: clamp(2rem, 3vw, 2.9rem);
      line-height: 1.15;
      letter-spacing: -0.04em;
    }
    .section-copy { color: var(--muted); max-width: 650px; margin: 12px 0 0; font-size: 1.05rem; }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 22px;
    }
    .card-feature {
      background: rgba(255,255,255,0.9);
      border: 1px solid var(--line);
      border-radius: 22px;
      padding: 24px;
      box-shadow: var(--shadow-soft);
    }
    .card-feature h3 {
      margin: 14px 0 10px;
      font-size: 1.25rem;
    }
    .card-feature p {
      margin: 0;
      color: var(--muted);
    }
    .process {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 18px;
    }
    .step {
      background: white;
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 22px;
      box-shadow: var(--shadow-soft);
    }
    .step-num {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-weight: 800;
      background: var(--accent);
      color: var(--secondary);
      margin-bottom: 16px;
    }
    .step h3 {
      margin: 0 0 10px;
      font-size: 1.15rem;
    }
    .step p {
      margin: 0;
      color: var(--muted);
    }
    .testimonials {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
    }
    blockquote {
      margin: 0;
      background: white;
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 22px;
      color: var(--secondary);
      box-shadow: var(--shadow-soft);
      font-size: 1.02rem;
      line-height: 1.75;
    }
    .pricing-wrap {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 24px;
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 18px;
      box-shadow: var(--shadow-soft);
    }
    .price-label {
      display: inline-flex;
      align-items: center;
      background: var(--accent);
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
    }
    .pricing-wrap h3 { margin: 12px 0 0; font-size: 1.5rem; }
    .price-value {
      text-align: right;
      font-size: 0.8rem;
      color: var(--muted);
    }
    .price-value strong {
      display: block;
      font-size: clamp(1.8rem, 3vw, 2.5rem);
      color: var(--secondary);
    }
    .cta-panel {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      border-radius: 26px;
      padding: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 18px;
      box-shadow: var(--shadow);
    }
    .cta-panel h2 {
      margin: 12px 0 0;
      font-size: clamp(2rem, 3vw, 2.6rem);
      letter-spacing: -0.04em;
    }
    footer {
      padding: 32px 0 62px;
      color: var(--muted);
    }
    @media (max-width: 960px) {
      .hero, .grid-3, .process, .testimonials { grid-template-columns: 1fr; }
      .cta-panel, .pricing-wrap { flex-direction: column; align-items: flex-start; }
      .nav { flex-direction: column; align-items: flex-start; }
      .nav-links { gap: 10px 16px; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="nav">
        <div class="brand">${name}</div>
        <div class="nav-links">
          ${showAbout ? `<a href="#about">${labels.about}</a>` : ''}
          ${showExpertise ? `<a href="#expertise">${labels.expertise}</a>` : ''}
          ${showProcess ? `<a href="#process">${labels.method}</a>` : ''}
          <a href="#contact">${labels.contact}</a>
        </div>
      </div>
      <div class="hero">
        <div>
          <span class="eyebrow">${niche.label}</span>
          <h1>${name}</h1>
          <p class="lead">${description}</p>
          <div class="hero-actions">
            <a class="btn primary" href="#contact">${labels.cta}</a>
            <a class="btn secondary" href="#expertise">${labels.discover}</a>
          </div>
        </div>
        <div class="hero-card">
          <span class="mini-tag">${niche.message}</span>
          <h3>${sector} • ${city}</h3>
          <p>Une présence digitale pensée pour rassurer, convaincre et faire grandir votre activité.</p>
          <div class="stat-grid">
            ${statList.map(([key, value]) => `<div class="stat"><strong>${key}</strong><span>${value}</span></div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </header>

  <main>
    ${showAbout ? `<section id="about">
      <div class="container">
        <div class="section-head">
          <span class="mini-tag">${labels.about}</span>
          <h2>Une image premium qui impose la confiance.</h2>
        </div>
        <div class="grid-3">
          <article class="card-feature">
            <span class="mini-tag">Positionnement</span>
            <h3>Une présence qui valorise votre expertise.</h3>
            <p>Nous créons une expérience digitale qui donne du poids à votre marque, à votre expertise et à votre différence.</p>
          </article>
          <article class="card-feature">
            <span class="mini-tag">Conversion</span>
            <h3>Des sections pensées pour convertir.</h3>
            <p>Chaque bloc est pensé pour guider le client vers l’action la plus importante : demande, réservation ou prise de contact.</p>
          </article>
          <article class="card-feature">
            <span class="mini-tag">Crédibilité</span>
            <h3>Une image claire, rassurante et premium.</h3>
            <p>Une présence forte aide à rassurer immédiatement, à clarifier le message et à augmenter la confiance.</p>
          </article>
        </div>
      </div>
    </section>` : ''}

    ${showExpertise ? `<section id="expertise">
      <div class="container">
        <div class="section-head">
          <span class="mini-tag">${labels.expertise}</span>
          <h2>${escapeHtml(story.title)}</h2>
          <p class="section-copy">${escapeHtml(story.intro)}</p>
        </div>
        <div class="grid-3">
          ${expertiseCards}
        </div>
      </div>
    </section>` : ''}

    ${showProcess ? `<section id="process">
      <div class="container">
        <div class="section-head">
          <span class="mini-tag">${labels.method}</span>
          <h2>Une méthode simple, claire et orientée résultat.</h2>
        </div>
        <div class="process">${processSteps}</div>
      </div>
    </section>` : ''}

    ${showTestimonials ? `<section>
      <div class="container">
        <div class="section-head">
          <span class="mini-tag">${labels.trust}</span>
          <h2>Une expérience qui inspire confiance.</h2>
        </div>
        <div class="testimonials">${testimonials}</div>
      </div>
    </section>` : ''}

    <section>
      <div class="container">
        <div class="pricing-wrap">
          <div>
            <span class="price-label">${plan.id || 'pro'}</span>
            <h3>Forfait ${plan.id || 'pro'}</h3>
          </div>
          <div class="price-value">
            <span>Investissement conseillé</span>
            <strong>${currency} ${setup}</strong>
          </div>
        </div>
      </div>
    </section>

    <section id="contact">
      <div class="container">
        <div class="cta-panel">
          <div>
            <span class="mini-tag" style="background: rgba(255,255,255,0.14); color: white; border: 1px solid rgba(255,255,255,0.18);">${labels.contact}</span>
            <h2>${objective}</h2>
          </div>
          <a class="btn primary" href="${contactPhone ? `tel:${contactPhone.replace(/[^+0-9]/g, '')}` : `mailto:${contactEmail}`}">${contactPhone || labels.cta}</a>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">© ${new Date().getFullYear()} ${name} — ${sector} • ${city}</div>
  </footer>
</body>
</html>`;

    return html;
  };

  global.CPMSiteBuilder = { buildSiteHtml, getNiche, getPlan };
})(window);
