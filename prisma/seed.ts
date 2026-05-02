import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

async function main() {
  console.log("Seeding database...");

  // ─── ADMIN USER ─────────────────────────────────────────────
  const adminHash = await bcrypt.hash("ChangeMe123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@eleo.local" },
    update: {},
    create: {
      email: "admin@eleo.local",
      passwordHash: adminHash,
      firstName: "Lucas",
      lastName: "Admin",
      role: "ADMIN",
      phone: "06 10 67 46 52",
    },
  });
  console.log("Admin user created:", admin.email);

  // ─── FORMATEUR USER ─────────────────────────────────────────
  const formateurHash = await bcrypt.hash("Formateur2026!", 12);
  const formateur = await prisma.user.upsert({
    where: { email: "formateur@eleo.local" },
    update: {},
    create: {
      email: "formateur@eleo.local",
      passwordHash: formateurHash,
      firstName: "Lucas",
      lastName: "Formateur",
      role: "FORMATEUR",
      phone: "04 42 29 06 65",
    },
  });
  console.log("Formateur user created:", formateur.email);

  // ─── APPRENANT USER ────────────────────────────────────────
  const apprenantHash = await bcrypt.hash("Apprenant2026!", 12);
  const apprenantUser = await prisma.user.upsert({
    where: { email: "apprenant@demo.local" },
    update: {},
    create: {
      email: "apprenant@demo.local",
      passwordHash: apprenantHash,
      firstName: "Jean",
      lastName: "Dupont",
      role: "APPRENANT",
      phone: "06 00 00 00 00",
    },
  });

  // ─── COMPANY ────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { id: "company-demo-1" },
    update: {},
    create: {
      id: "company-demo-1",
      name: "TechPro Solutions",
      siret: "12345678900012",
      address: "15 Rue de la République, 13100 Aix-en-Provence",
      contactName: "Marie Martin",
      contactEmail: "marie.martin@techpro.fr",
      contactPhone: "04 42 00 00 00",
      opcoName: "OPCO Atlas",
      notes: "Entreprise cliente depuis 2025. 3 salariés à former.",
    },
  });
  console.log("Company created:", company.name);

  // ─── LEARNER PROFILE ────────────────────────────────────────
  const learner = await prisma.learner.upsert({
    where: { userId: apprenantUser.id },
    update: {},
    create: {
      userId: apprenantUser.id,
      companyId: company.id,
      funding: "OPCO",
      currentLevel: "DEBUTANT",
      specialNeeds: null,
    },
  });
  console.log("Learner profile created:", apprenantUser.email);

  // ─── FORMATION PRINCIPALE ──────────────────────────────────
  const formation = await prisma.formation.upsert({
    where: { slug: "technicien-informatique-ia-augmente" },
    update: {},
    create: {
      title: "Technicien informatique IA-augmenté : diagnostic, maintenance PC/Mac et cybersécurité de base",
      slug: "technicien-informatique-ia-augmente",
      description: "Formation hybride complète pour devenir technicien informatique autonome, avec des outils IA en support. Diagnostic de pannes, maintenance PC et Mac, cybersécurité de base pour TPE/PME, et utilisation pratique de l'IA pour le travail technique quotidien. 80 % en ligne, 20 % en atelier à Aix-en-Provence.",
      objectives: "- Maîtriser la méthode de diagnostic informatique structuré\n- Réaliser la maintenance préventive et curative sur PC et Mac\n- Appliquer les bonnes pratiques de cybersécurité en TPE/PME\n- Utiliser l'IA comme outil d'aide au diagnostic et à la rédaction\n- Réaliser un diagnostic réel en atelier sur des cas concrets\n- Rédiger un rapport de diagnostic clair et professionnel",
      targetAudience: "Salariés de TPE/PME, dirigeants de petites entreprises, indépendants, techniciens informatiques débutants déjà en poste, secrétaires ou assistants polyvalents devant gérer les problèmes informatiques simples, professionnels en reconversion avec budget personnel.",
      nonTargetAudience: "Apprentis, alternants, stagiaires, personnes cherchant une immersion gratuite, candidats spontanés non financés, personnes cherchant un emploi chez Eleo.",
      prerequisites: "Connaissances de base en informatique (utilisation quotidienne d'un PC ou Mac). Aucune compétence technique avancée requise.",
      duration: 35,
      format: "HYBRIDE",
      priceHT: 1750,
      accessModalities: "Sur inscription après validation du dossier. Demande de devis sur le site ou par contact direct.",
      accessDelay: "Inscription possible jusqu'à 15 jours avant le début de la session, sous réserve de places disponibles.",
      disabilityAccess: "Formation accessible aux personnes en situation de handicap. Nous contacter pour adapter les modalités pédagogiques.",
      teachingMethods: "Modules en ligne (vidéo, texte, exercices), quiz interactifs, études de cas, atelier pratique en présentiel à Aix-en-Provence, cas clients anonymisés, utilisation d'outils IA.",
      evaluationMethods: "Quiz de validation par module, étude de cas finale, rapport de diagnostic, évaluation pratique en atelier, soutenance ou correction formateur.",
      status: "PUBLIEE",
    },
  });
  console.log("Formation created:", formation.title);

  // ─── MODULES ────────────────────────────────────────────────
  const modulesData = [
    {
      title: "Fondamentaux du diagnostic informatique",
      description: "Comprendre les symptômes, distinguer les types de pannes, méthode d'interrogatoire client, check-list diagnostic.",
      orderIndex: 1,
      duration: 240,
      content: "Ce module couvre les bases du diagnostic informatique : identification des symptômes, distinction entre pannes matérielles, logicielles, système et réseau. Vous apprendrez la méthode d'interrogatoire client et utiliserez une check-list de diagnostic structurée.",
      lessons: [
        { title: "Comprendre les symptômes informatiques", content: "Identification et classification des symptômes courants : lenteurs, écrans bleus, plantages, bruits anormaux, messages d'erreur.", orderIndex: 1, type: "TEXT" },
        { title: "Distinguer panne matérielle, logicielle, système et réseau", content: "Méthodologie pour identifier rapidement l'origine d'un problème et orienter le diagnostic.", orderIndex: 2, type: "TEXT" },
        { title: "Méthode d'interrogatoire client", content: "Les bonnes questions à poser au client pour recueillir les informations essentielles au diagnostic.", orderIndex: 3, type: "TEXT" },
        { title: "Check-list diagnostic", content: "Utilisation d'une check-list structurée pour ne rien oublier lors d'un diagnostic.", orderIndex: 4, type: "EXERCISE" },
      ],
      quiz: {
        title: "Quiz — Fondamentaux du diagnostic",
        questions: [
          { question: "Quelle est la première étape d'un diagnostic informatique ?", type: "MCQ", options: JSON.stringify(["Remplacer le disque dur", "Interroger le client sur les symptômes", "Réinstaller le système", "Vérifier la connexion internet"]), correctAnswer: "Interroger le client sur les symptômes", orderIndex: 1 },
          { question: "Un écran bleu (BSOD) indique généralement quel type de problème ?", type: "MCQ", options: JSON.stringify(["Problème réseau", "Problème logiciel ou matériel grave", "Manque de stockage", "Virus"]), correctAnswer: "Problème logiciel ou matériel grave", orderIndex: 2 },
        ],
      },
    },
    {
      title: "Maintenance PC",
      description: "Lenteurs, stockage, RAM, température, alimentation, disque SSD/HDD, nettoyage logiciel, sauvegarde.",
      orderIndex: 2,
      duration: 300,
      content: "Ce module couvre la maintenance préventive et curative des PC : diagnostic des lenteurs, gestion du stockage, RAM, températures, alimentation, remplacement de disques, nettoyage logiciel et stratégies de sauvegarde.",
      lessons: [
        { title: "Diagnostic et résolution des lenteurs", content: "Identifier les causes de lenteur : processus, démarrage, RAM insuffisante, disque plein ou défaillant.", orderIndex: 1, type: "TEXT" },
        { title: "Stockage : HDD vs SSD, migration", content: "Comprendre les différences entre HDD et SSD. Procédure de clonage et migration.", orderIndex: 2, type: "TEXT" },
        { title: "RAM : diagnostic et remplacement", content: "Vérifier la RAM, identifier un problème, procédure de remplacement.", orderIndex: 3, type: "TEXT" },
        { title: "Température et alimentation", content: "Surveiller les températures, nettoyer les ventilateurs, vérifier l'alimentation.", orderIndex: 4, type: "TEXT" },
        { title: "Nettoyage logiciel et sauvegarde", content: "Outils de nettoyage, désinstallation propre, stratégie de sauvegarde 3-2-1.", orderIndex: 5, type: "EXERCISE" },
      ],
      quiz: {
        title: "Quiz — Maintenance PC",
        questions: [
          { question: "Quel est l'avantage principal d'un SSD par rapport à un HDD ?", type: "MCQ", options: JSON.stringify(["Plus grande capacité", "Vitesse de lecture/écriture", "Moins cher", "Plus silencieux uniquement"]), correctAnswer: "Vitesse de lecture/écriture", orderIndex: 1 },
          { question: "La règle de sauvegarde 3-2-1 signifie :", type: "MCQ", options: JSON.stringify(["3 fichiers, 2 dossiers, 1 disque", "3 copies, 2 supports différents, 1 copie hors site", "3 jours, 2 semaines, 1 mois", "3 utilisateurs, 2 mots de passe, 1 admin"]), correctAnswer: "3 copies, 2 supports différents, 1 copie hors site", orderIndex: 2 },
        ],
      },
    },
    {
      title: "Maintenance Mac",
      description: "Bases macOS, stockage, sauvegarde Time Machine, lenteurs, précautions spécifiques.",
      orderIndex: 3,
      duration: 180,
      content: "Ce module couvre les spécificités de la maintenance Mac : interface macOS, gestion du stockage, Time Machine, résolution des lenteurs et précautions spécifiques à l'écosystème Apple.",
      lessons: [
        { title: "Bases macOS pour technicien", content: "Navigation dans macOS, utilitaires système, Terminal basique.", orderIndex: 1, type: "TEXT" },
        { title: "Gestion du stockage Mac", content: "Optimiser le stockage, purger les fichiers inutiles, gérer iCloud.", orderIndex: 2, type: "TEXT" },
        { title: "Time Machine et sauvegarde", content: "Configurer et vérifier Time Machine, restauration de fichiers.", orderIndex: 3, type: "TEXT" },
        { title: "Lenteurs et précautions Mac", content: "Diagnostic des lenteurs macOS, réinitialisation SMC/NVRAM, précautions de manipulation.", orderIndex: 4, type: "TEXT" },
      ],
      quiz: {
        title: "Quiz — Maintenance Mac",
        questions: [
          { question: "Quel outil natif de macOS permet la sauvegarde automatique ?", type: "MCQ", options: JSON.stringify(["iCloud", "Time Machine", "Disk Utility", "Finder"]), correctAnswer: "Time Machine", orderIndex: 1 },
        ],
      },
    },
    {
      title: "Cybersécurité de base pour TPE",
      description: "Phishing, mots de passe, MFA, sauvegardes, mises à jour, ransomwares, bonnes pratiques client.",
      orderIndex: 4,
      duration: 240,
      content: "Ce module couvre les fondamentaux de la cybersécurité pour les TPE/PME : reconnaître le phishing, gérer les mots de passe, activer la MFA, se protéger des ransomwares, et transmettre les bonnes pratiques aux clients.",
      lessons: [
        { title: "Reconnaître le phishing", content: "Identifier les emails frauduleux, les liens suspects, les pièces jointes dangereuses.", orderIndex: 1, type: "TEXT" },
        { title: "Mots de passe et MFA", content: "Créer des mots de passe forts, utiliser un gestionnaire, activer l'authentification multi-facteurs.", orderIndex: 2, type: "TEXT" },
        { title: "Mises à jour et sauvegardes", content: "Importance des mises à jour système et logicielles. Stratégie de sauvegarde.", orderIndex: 3, type: "TEXT" },
        { title: "Ransomwares et bonnes pratiques", content: "Comprendre les ransomwares, comment s'en protéger, réagir en cas d'attaque.", orderIndex: 4, type: "TEXT" },
        { title: "Former le client aux bonnes pratiques", content: "Comment sensibiliser un client non-technique aux enjeux de cybersécurité.", orderIndex: 5, type: "CASE_STUDY" },
      ],
      quiz: {
        title: "Quiz — Cybersécurité",
        questions: [
          { question: "Quel est le principal risque du phishing ?", type: "MCQ", options: JSON.stringify(["Perte de données", "Vol d'identifiants", "Surchauffe du processeur", "Lenteur du réseau"]), correctAnswer: "Vol d'identifiants", orderIndex: 1 },
          { question: "MFA signifie :", type: "MCQ", options: JSON.stringify(["Multi-Factor Authentication", "Maximum File Access", "Main Firewall Activation", "Managed Format Application"]), correctAnswer: "Multi-Factor Authentication", orderIndex: 2 },
        ],
      },
    },
    {
      title: "IA pratique pour technicien informatique",
      description: "Utiliser l'IA pour analyser un symptôme, rédiger un rapport, créer une procédure, limites et vérification humaine.",
      orderIndex: 5,
      duration: 240,
      content: "Ce module couvre l'utilisation pratique de l'IA pour le travail de technicien : analyser un symptôme avec l'IA, rédiger un rapport client, créer une procédure, générer une check-list, et comprendre les limites de l'IA.",
      lessons: [
        { title: "Utiliser l'IA pour analyser un symptôme", content: "Formuler un prompt efficace pour obtenir des pistes de diagnostic.", orderIndex: 1, type: "TEXT" },
        { title: "Rédiger un rapport client avec l'IA", content: "Utiliser l'IA pour structurer et rédiger un rapport de diagnostic clair.", orderIndex: 2, type: "EXERCISE" },
        { title: "Créer une procédure avec l'IA", content: "Générer des procédures techniques étape par étape.", orderIndex: 3, type: "EXERCISE" },
        { title: "Expliquer une panne simplement", content: "Utiliser l'IA pour reformuler un diagnostic technique en langage accessible.", orderIndex: 4, type: "EXERCISE" },
        { title: "Limites de l'IA et vérification humaine", content: "Comprendre quand l'IA peut se tromper. Toujours vérifier avant d'agir.", orderIndex: 5, type: "TEXT" },
      ],
      quiz: {
        title: "Quiz — IA pratique",
        questions: [
          { question: "Pourquoi faut-il toujours vérifier les réponses de l'IA ?", type: "MCQ", options: JSON.stringify(["L'IA est toujours juste", "L'IA peut halluciner ou se tromper", "L'IA ne comprend pas le français", "Ce n'est pas nécessaire"]), correctAnswer: "L'IA peut halluciner ou se tromper", orderIndex: 1 },
        ],
      },
    },
    {
      title: "Atelier pratique Eleo",
      description: "Démontage simple, remplacement SSD/RAM, nettoyage, diagnostic réel, cas clients anonymisés, procédure de restitution.",
      orderIndex: 6,
      duration: 420,
      content: "Atelier présentiel à l'atelier Eleo à Aix-en-Provence. Démontage et remontage de PC, remplacement de composants (SSD, RAM), nettoyage physique, diagnostic sur des cas réels anonymisés, procédure de restitution au client.",
      lessons: [
        { title: "Démontage et remontage simple", content: "Procédure de démontage sécurisé d'un PC tour et portable.", orderIndex: 1, type: "EXERCISE" },
        { title: "Remplacement SSD et RAM", content: "Remplacement pratique de composants avec les bons gestes.", orderIndex: 2, type: "EXERCISE" },
        { title: "Nettoyage physique", content: "Nettoyage interne avec bombe à air, remplacement pâte thermique.", orderIndex: 3, type: "EXERCISE" },
        { title: "Diagnostic réel sur cas clients", content: "Diagnostic complet sur des machines réelles avec cas anonymisés.", orderIndex: 4, type: "CASE_STUDY" },
        { title: "Procédure de restitution", content: "Préparer la machine pour la restitution au client : tests, documentation.", orderIndex: 5, type: "EXERCISE" },
      ],
      quiz: null,
    },
    {
      title: "Évaluation finale",
      description: "Quiz final, étude de cas, rapport de diagnostic, soutenance ou correction formateur, attestation.",
      orderIndex: 7,
      duration: 180,
      content: "Module d'évaluation finale : quiz récapitulatif, étude de cas complète, rédaction d'un rapport de diagnostic, soutenance ou correction par le formateur. Délivrance de l'attestation de fin de formation.",
      lessons: [
        { title: "Quiz récapitulatif", content: "Quiz couvrant l'ensemble des modules de la formation.", orderIndex: 1, type: "EXERCISE" },
        { title: "Étude de cas finale", content: "Cas complet à résoudre : diagnostic, plan d'action, chiffrage, communication client.", orderIndex: 2, type: "CASE_STUDY" },
        { title: "Rapport de diagnostic", content: "Rédaction d'un rapport de diagnostic professionnel complet.", orderIndex: 3, type: "EXERCISE" },
        { title: "Soutenance et attestation", content: "Présentation du travail au formateur. Délivrance de l'attestation.", orderIndex: 4, type: "TEXT" },
      ],
      quiz: {
        title: "Évaluation finale",
        questions: [
          { question: "Citez les 4 types de pannes informatiques principaux.", type: "OPEN", options: null, correctAnswer: "Matérielle, logicielle, système, réseau", orderIndex: 1 },
          { question: "Quel est le premier réflexe face à un ransomware ?", type: "MCQ", options: JSON.stringify(["Payer la rançon", "Déconnecter la machine du réseau", "Éteindre et rallumer", "Ignorer le message"]), correctAnswer: "Déconnecter la machine du réseau", orderIndex: 2 },
        ],
      },
    },
  ];

  for (const moduleData of modulesData) {
    const module = await prisma.module.create({
      data: {
        formationId: formation.id,
        title: moduleData.title,
        description: moduleData.description,
        orderIndex: moduleData.orderIndex,
        content: moduleData.content,
        duration: moduleData.duration,
      },
    });

    for (const lessonData of moduleData.lessons) {
      await prisma.lesson.create({
        data: {
          moduleId: module.id,
          title: lessonData.title,
          content: lessonData.content,
          orderIndex: lessonData.orderIndex,
          type: lessonData.type,
        },
      });
    }

    if (moduleData.quiz) {
      const quiz = await prisma.quiz.create({
        data: {
          moduleId: module.id,
          title: moduleData.quiz.title,
        },
      });

      for (const q of moduleData.quiz.questions) {
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            question: q.question,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            orderIndex: q.orderIndex,
          },
        });
      }
    }
  }
  console.log("Modules, lessons and quizzes created");

  // ─── SESSION ────────────────────────────────────────────────
  const session = await prisma.session.create({
    data: {
      formationId: formation.id,
      trainerId: formateur.id,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-10-15"),
      maxPlaces: 6,
      format: "HYBRIDE",
      location: "Atelier Eleo — 49 Avenue Henri Malacrida, 13100 Aix-en-Provence",
      status: "OUVERTE",
    },
  });

  await prisma.enrollment.create({
    data: {
      sessionId: session.id,
      learnerId: learner.id,
      status: "INSCRIT",
    },
  });
  console.log("Session created with enrollment");

  // ─── OPCO DOCUMENTS ────────────────────────────────────────
  const opcoDocTypes = ["DEVIS", "PROGRAMME", "CONVENTION", "CONVOCATION", "EMARGEMENT", "CERTIFICAT", "ATTESTATION", "SATISFACTION", "EVAL_CHAUD", "EVAL_FROID"];
  for (const type of opcoDocTypes) {
    await prisma.oPCODocument.create({
      data: {
        formationId: formation.id,
        companyId: company.id,
        type,
        status: type === "PROGRAMME" ? "GENERE" : "A_GENERER",
      },
    });
  }
  console.log("OPCO documents created");

  // ─── PROSPECTS ──────────────────────────────────────────────
  const prospectsData = [
    { firstName: "Pierre", lastName: "Lambert", email: "pierre.lambert@entreprise.fr", fundingMode: "ENTREPRISE", status: "PROSPECT_ENTREPRISE", autoRefused: false, companyName: "Lambert & Fils", source: "SITE" },
    { firstName: "Sophie", lastName: "Bernard", email: "sophie.bernard@gmail.com", fundingMode: "FONDS_PROPRES", status: "PROSPECT_FONDS_PROPRES", autoRefused: false, message: "Je suis indépendante et souhaite me former en maintenance informatique.", source: "SITE" },
    { firstName: "Marc", lastName: "Durand", email: "marc.durand@opcoatlas.fr", fundingMode: "OPCO", status: "PROSPECT_OPCO", autoRefused: false, companyName: "Durand SARL", source: "OPCO" },
    { firstName: "Julie", lastName: "Moreau", email: "julie.moreau@francetravail.fr", fundingMode: "FRANCE_TRAVAIL", status: "PROSPECT_FRANCE_TRAVAIL", autoRefused: false, source: "FRANCE_TRAVAIL" },
    { firstName: "Antoine", lastName: "Petit", email: "antoine.petit@gmail.com", fundingMode: "NE_SAIT_PAS", status: "NOUVEAU", autoRefused: false, message: "Je voudrais en savoir plus sur vos formations.", source: "SITE" },
    { firstName: "Emma", lastName: "Roux", email: "emma.roux@gmail.com", fundingMode: "STAGE_ALTERNANCE", status: "REFUS_ALTERNANCE", autoRefused: true, refusalReason: "Demande de stage/alternance/apprentissage — refus automatique", source: "SITE" },
    { firstName: "Thomas", lastName: "Simon", email: "thomas.simon@gmail.com", fundingMode: "IMMERSION_GRATUITE", status: "REFUS_IMMERSION", autoRefused: true, refusalReason: "Demande d'immersion gratuite/PMSMP — refus automatique", source: "SITE" },
    { firstName: "Léa", lastName: "Garcia", email: "lea.garcia@gmail.com", fundingMode: "CANDIDATURE_EMPLOI", status: "REFUS_CANDIDATURE", autoRefused: true, refusalReason: "Candidature emploi — refus automatique", source: "SITE" },
  ];

  for (const p of prospectsData) {
    await prisma.prospect.create({
      data: {
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        fundingMode: p.fundingMode,
        status: p.status,
        autoRefused: p.autoRefused,
        refusalReason: p.refusalReason || null,
        companyName: p.companyName || null,
        message: p.message || null,
        source: p.source,
        formationId: formation.id,
      },
    });
  }
  console.log("Prospects created (5 valid, 3 refused)");

  // ─── QUALIOPI CRITERIA ─────────────────────────────────────
  const qualiopiData = [
    {
      number: 1,
      title: "Information du public",
      description: "Les conditions d'information du public sur les prestations proposées, les délais pour y accéder et les résultats obtenus.",
      items: [
        { label: "Programme de formation publié", description: "Le programme détaillé est accessible sur le site web" },
        { label: "Objectifs pédagogiques définis", description: "Les objectifs sont clairs, mesurables et communiqués" },
        { label: "Tarifs affichés", description: "Les tarifs HT sont visibles et à jour" },
        { label: "Délais d'accès communiqués", description: "Les délais d'inscription et de démarrage sont indiqués" },
        { label: "Modalités d'évaluation précisées", description: "Les méthodes d'évaluation sont décrites" },
        { label: "Accessibilité handicap mentionnée", description: "Les conditions d'accueil des personnes handicapées sont précisées" },
      ],
    },
    {
      number: 2,
      title: "Identification des objectifs et adaptation",
      description: "L'identification précise des objectifs des prestations proposées et l'adaptation de ces prestations aux publics bénéficiaires.",
      items: [
        { label: "Fiche de recueil des besoins", description: "Un document de recueil des besoins est utilisé pour chaque apprenant" },
        { label: "Positionnement initial", description: "Le niveau de départ de l'apprenant est évalué" },
        { label: "Objectifs individualisés", description: "Les objectifs sont adaptés au profil de chaque apprenant" },
      ],
    },
    {
      number: 3,
      title: "Adaptation des prestations et accompagnement",
      description: "L'adaptation aux publics bénéficiaires des prestations et des modalités d'accueil, d'accompagnement, de suivi et d'évaluation.",
      items: [
        { label: "Suivi de progression", description: "La progression de chaque apprenant est suivie et documentée" },
        { label: "Feuilles d'émargement", description: "Les présences sont tracées pour chaque session" },
        { label: "Relances apprenants", description: "Un système de relance est en place pour les apprenants en difficulté" },
        { label: "Accompagnement individualisé", description: "Un accompagnement adapté est proposé si besoin" },
      ],
    },
    {
      number: 4,
      title: "Moyens pédagogiques, techniques et encadrement",
      description: "L'adéquation des moyens pédagogiques, techniques et d'encadrement aux prestations mises en œuvre.",
      items: [
        { label: "Supports pédagogiques", description: "Les supports (cours, exercices, vidéos) sont à jour et adaptés" },
        { label: "CV formateur disponible", description: "Le CV et les qualifications du formateur sont documentés" },
        { label: "Atelier équipé", description: "L'atelier dispose du matériel nécessaire pour les travaux pratiques" },
        { label: "Outils numériques adaptés", description: "La plateforme LMS et les outils sont fonctionnels" },
      ],
    },
    {
      number: 5,
      title: "Qualification des formateurs",
      description: "La qualification et le développement des connaissances et compétences des personnels chargés de mettre en œuvre les prestations.",
      items: [
        { label: "CV et expériences documentés", description: "Le parcours du formateur est documenté et à jour" },
        { label: "Veille technique", description: "Le formateur maintient ses compétences à jour" },
        { label: "Formations suivies", description: "Les formations continues du formateur sont tracées" },
      ],
    },
    {
      number: 6,
      title: "Veille et amélioration",
      description: "L'inscription et l'investissement du prestataire dans son environnement professionnel.",
      items: [
        { label: "Veille réglementaire", description: "Suivi des évolutions réglementaires de la formation professionnelle" },
        { label: "Veille métier", description: "Suivi des évolutions technologiques du secteur informatique" },
        { label: "Veille handicap", description: "Suivi des bonnes pratiques d'accessibilité" },
        { label: "Mise à jour des contenus", description: "Les contenus de formation sont régulièrement actualisés" },
      ],
    },
    {
      number: 7,
      title: "Satisfaction et amélioration continue",
      description: "Le recueil et la prise en compte des appréciations et des réclamations formulées par les parties prenantes.",
      items: [
        { label: "Questionnaires de satisfaction", description: "Des questionnaires sont distribués et analysés" },
        { label: "Traitement des réclamations", description: "Un processus de traitement des réclamations est en place" },
        { label: "Plan d'amélioration", description: "Un plan d'amélioration continue est documenté" },
        { label: "Indicateurs de résultats", description: "Des indicateurs de satisfaction et de réussite sont suivis" },
      ],
    },
  ];

  for (const criterion of qualiopiData) {
    const c = await prisma.qualiopiCriterion.create({
      data: {
        number: criterion.number,
        title: criterion.title,
        description: criterion.description,
      },
    });

    for (const item of criterion.items) {
      await prisma.qualiopiItem.create({
        data: {
          criterionId: c.id,
          label: item.label,
          description: item.description,
          status: criterion.number === 1 ? "FAIT" : "A_FAIRE",
        },
      });
    }
  }
  console.log("Qualiopi criteria created (7 criteria, items seeded)");

  // ─── EMAIL TEMPLATES ────────────────────────────────────────
  await prisma.emailTemplate.upsert({
    where: { slug: "refus-alternance" },
    update: {},
    create: {
      slug: "refus-alternance",
      name: "Refus apprentissage / alternance / stage",
      subject: "Réponse à votre demande d'accueil chez Eleo Informatique",
      body: "Bonjour,\n\nMerci pour votre message.\n\nEleo Informatique ne recrute actuellement ni apprenti, ni alternant, ni stagiaire, et n'accueille plus de personnes en immersion ou formation gratuite.\n\nL'entreprise accompagne déjà un apprenti, ce qui mobilise notre capacité de formation interne.\n\nNous ne traitons désormais que les demandes de formation professionnelle financée, contractualisée ou payée en fonds propres.\n\nNous vous souhaitons une bonne continuation dans vos recherches.\n\nCordialement,\nEleo Informatique",
    },
  });

  await prisma.emailTemplate.upsert({
    where: { slug: "reponse-fonds-propres" },
    update: {},
    create: {
      slug: "reponse-fonds-propres",
      name: "Réponse client fonds propres",
      subject: "Votre demande de formation Eleo Formation",
      body: "Bonjour,\n\nMerci pour votre demande.\n\nEleo Formation peut accepter les demandes financées directement en fonds propres, à condition qu'elles concernent une formation professionnelle structurée, contractualisée et facturée.\n\nNous pouvons donc vous transmettre un programme, un devis et les conditions d'inscription.\n\nMerci de nous préciser :\n- la formation souhaitée ;\n- votre objectif professionnel ;\n- votre niveau actuel ;\n- le format souhaité : en ligne, atelier à Aix-en-Provence, ou hybride ;\n- votre délai idéal de démarrage.\n\nCordialement,\nEleo Informatique",
    },
  });
  console.log("Email templates created");

  console.log("\n✅ Seed completed successfully!");
  console.log("\nComptes de démonstration :");
  console.log("  Admin     : admin@eleo.local / ChangeMe123!");
  console.log("  Formateur : formateur@eleo.local / Formateur2026!");
  console.log("  Apprenant : apprenant@demo.local / Apprenant2026!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
