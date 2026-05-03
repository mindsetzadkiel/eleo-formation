/**
 * Cree la formation "Informatique sereine pour seniors" en base.
 *
 * Usage :
 *   node --env-file=.env.local scripts/seed-formation-seniors.mjs
 *
 * - Idempotent : si la formation existe deja (par slug), elle est mise a jour.
 * - Cree 8 modules + lecons squelette (les contenus seront enrichis par l'IA).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUG = "informatique-seniors-sereine";

const formationData = {
  title: "Informatique sereine pour seniors : reprendre le contrôle de son ordinateur, son smartphone et internet",
  slug: SLUG,
  description: "Une formation bienveillante et progressive pour les 60 ans et plus, sans jargon, qui redonne confiance face à l'ordinateur, au smartphone et à internet. Chaque notion est expliquée pas à pas, avec des exemples du quotidien : photos de famille, démarches administratives, vidéos, communication avec les petits-enfants. Ateliers en très petit groupe (max 6 personnes) à Aix-en-Provence, complétés par des vidéos courtes accessibles à domicile. Un manuel papier en gros caractères est remis à chaque participant.",
  objectives: "À l'issue de la formation, l'apprenant sera capable de : (1) utiliser son ordinateur (PC ou Mac) au quotidien sans appréhension ; (2) maîtriser les bases de son smartphone ou de sa tablette ; (3) naviguer sur internet, faire des recherches et regarder des vidéos ; (4) envoyer et recevoir des emails avec pièces jointes ; (5) reconnaître les arnaques et se protéger ; (6) effectuer ses démarches administratives en ligne (impôts, Ameli, FranceConnect) ; (7) communiquer avec sa famille via WhatsApp, visio et photos partagées ; (8) utiliser un assistant IA simple pour rédiger ou traduire un texte.",
  targetAudience: "Personnes de 60 ans et plus, retraités, débutants complets ou se sentant dépassés par le numérique. Aucun prérequis technique n'est exigé. Ouvert à tous, y compris aux personnes qui n'ont jamais utilisé d'ordinateur ou qui ont peur de \"casser quelque chose\". Public mixte tous niveaux acceptés.",
  nonTargetAudience: "Cette formation n'est PAS adaptée aux personnes déjà à l'aise avec l'informatique courante (recherche autonome sur Google, gestion d'emails, smartphone maîtrisé). Pour ce public, nous proposons d'autres formations plus avancées (cybersécurité, IA pratique, photo numérique).",
  prerequisites: "Aucun prérequis technique. Apporter son propre ordinateur portable, sa tablette ou son smartphone pour pratiquer dans son environnement habituel. Lunettes de lecture si nécessaire (la salle est lumineuse, supports en gros caractères fournis).",
  duration: 24,
  format: "HYBRIDE",
  priceHT: 890,
  accessModalities: "Inscription par téléphone (04 42 29 06 65), email (eleo.informatique@gmail.com) ou via le formulaire de contact du site. Un entretien téléphonique gratuit de 15 minutes est proposé pour identifier le niveau et les attentes. Démarrage possible à dates ouvertes (sessions toutes les 6 semaines à Aix-en-Provence).",
  accessDelay: "Démarrage sous 15 jours minimum après inscription pour permettre l'instruction du dossier de financement (CPF, Pôle emploi, prise en charge personnelle ou par les enfants). Délai allongé jusqu'à 2 mois si financement OPCO ou collectivité.",
  disabilityAccess: "Salle de formation accessible PMR à Aix-en-Provence (rez-de-chaussée, parking adapté). Supports en gros caractères, vidéos sous-titrées, aide auditive disponible (boucle magnétique). Pour tout besoin spécifique (vue, audition, motricité, troubles cognitifs), nous contacter en amont pour adapter le parcours.",
  teachingMethods: "Pédagogie 100% bienveillante, sans note ni jugement. Très petit groupe (max 6 personnes par session) pour un suivi individualisé. Alternance d'apports théoriques courts (15 min max), de démonstrations en direct projetées sur grand écran, et de pratique guidée sur le matériel personnel de l'apprenant. Tutoiement banni, ton respectueux. Manuel papier remis avec captures d'écran annotées et pas-à-pas.",
  evaluationMethods: "Auto-évaluation par défis pratiques à chaque module (envoyer un email avec photo, faire une recherche Google, ouvrir un PDF, etc.). Aucun quiz noté. Une grille de progression individuelle est remise en fin de formation, ainsi qu'une attestation de suivi mentionnant les compétences acquises. Suivi téléphonique gratuit pendant 30 jours après la formation pour répondre aux questions.",
  status: "PUBLIEE",
};

const modules = [
  {
    title: "Apprivoiser son ordinateur sans stress",
    description: "Découverte ou redécouverte de l'ordinateur (PC ou Mac) : allumer, éteindre, utiliser la souris et le clavier sans peur. Comprendre ce qu'on voit à l'écran (le bureau, les icônes, les fenêtres) et où sont rangés ses documents.",
    orderIndex: 1,
    duration: 180,
    content: "Module fondateur : reprendre confiance face à un ordinateur en comprenant son fonctionnement de base et en pratiquant les gestes essentiels.",
    lessons: [
      { title: "Allumer, éteindre et redémarrer son ordinateur en toute sécurité", type: "TEXT" },
      { title: "Apprivoiser la souris et le clavier (ou le pavé tactile)", type: "TEXT" },
      { title: "Comprendre le bureau, les icônes et les fenêtres", type: "TEXT" },
      { title: "Ranger ses documents : dossiers, fichiers et l'explorateur", type: "TEXT" },
      { title: "Premiers défis pratiques : ouvrir, fermer, ranger", type: "EXERCISE" },
    ],
  },
  {
    title: "Smartphone et tablette au quotidien",
    description: "Prendre en main son téléphone intelligent ou sa tablette (Android ou iPhone). Régler l'essentiel (luminosité, sonnerie, taille de texte), utiliser les applications de base et faire des photos qu'on retrouve facilement.",
    orderIndex: 2,
    duration: 180,
    content: "Le smartphone n'est pas qu'un téléphone : c'est aussi un appareil photo, un GPS, un journal et un carnet d'adresses. Apprendre à s'en servir sans se sentir dépassé.",
    lessons: [
      { title: "Les bases du smartphone : appeler, répondre, envoyer un SMS", type: "TEXT" },
      { title: "Régler son téléphone pour son confort (taille des textes, sons, luminosité)", type: "TEXT" },
      { title: "Installer et désinstaller une application en toute sécurité", type: "TEXT" },
      { title: "Faire des photos, les retrouver et les partager", type: "TEXT" },
      { title: "Mes contacts et mon agenda toujours à portée de main", type: "EXERCISE" },
    ],
  },
  {
    title: "Internet sans peur",
    description: "Naviguer sur internet en confiance : utiliser un navigateur, faire une recherche Google qui donne de bons résultats, mettre en favoris ses sites préférés, regarder des vidéos sur YouTube ou Replay.",
    orderIndex: 3,
    duration: 180,
    content: "Internet est un outil formidable quand on sait s'en servir. Apprendre à chercher efficacement, à reconnaître un site fiable et à profiter des contenus.",
    lessons: [
      { title: "Qu'est-ce qu'internet et comment ça marche (en mots simples)", type: "TEXT" },
      { title: "Faire une recherche Google qui donne de bons résultats", type: "TEXT" },
      { title: "Mettre en favoris et retrouver ses sites préférés", type: "TEXT" },
      { title: "Regarder des vidéos : YouTube, Replay TV, journaux en ligne", type: "TEXT" },
      { title: "Reconnaître un site fiable d'un site douteux", type: "TEXT" },
    ],
  },
  {
    title: "L'email : envoyer, recevoir et gérer ses messages",
    description: "Maîtriser sa boîte mail (Gmail, Outlook ou autre) : lire ses messages, répondre, joindre une photo, gérer les spams et organiser sa boîte de réception.",
    orderIndex: 4,
    duration: 180,
    content: "L'email reste l'outil de communication numéro 1 pour les démarches officielles, la famille et les services. Apprendre à s'en servir sereinement.",
    lessons: [
      { title: "Comprendre son adresse email et créer une boîte mail", type: "TEXT" },
      { title: "Envoyer, recevoir et répondre à un email", type: "TEXT" },
      { title: "Joindre une photo, un document, un PDF", type: "TEXT" },
      { title: "Reconnaître un email indésirable (spam) et le traiter", type: "TEXT" },
      { title: "Organiser sa boîte mail : dossiers, archive, suppression", type: "EXERCISE" },
    ],
  },
  {
    title: "Reconnaître les arnaques et se protéger",
    description: "Se protéger des arnaques : faux SAV, faux impôts, faux Ameli, démarchage téléphonique, phishing par SMS. Comprendre les mots de passe et la double sécurité (validation par SMS).",
    orderIndex: 5,
    duration: 180,
    content: "Les seniors sont la cible numéro 1 des escrocs. Reconnaître les pièges fréquents et adopter les bons réflexes pour ne plus jamais se faire avoir.",
    lessons: [
      { title: "Les arnaques les plus fréquentes envers les seniors (et comment les repérer)", type: "TEXT" },
      { title: "Choisir et retenir un bon mot de passe", type: "TEXT" },
      { title: "Comprendre la validation par SMS (double sécurité)", type: "TEXT" },
      { title: "Que faire en cas de doute ou d'arnaque avérée ?", type: "CASE_STUDY" },
      { title: "Atelier : repérer 10 vraies arnaques", type: "EXERCISE" },
    ],
  },
  {
    title: "Mes démarches administratives en ligne",
    description: "Faire ses démarches administratives en ligne : déclaration d'impôts, espace Ameli pour la santé, FranceConnect, ANTS pour le permis et la carte grise. Toujours en sécurité, toujours simplement.",
    orderIndex: 6,
    duration: 180,
    content: "Les administrations exigent de plus en plus de démarches en ligne. Apprendre à se débrouiller pour les opérations courantes, sans dépendre de ses enfants.",
    lessons: [
      { title: "FranceConnect : un seul mot de passe pour toutes les administrations", type: "TEXT" },
      { title: "Mon espace Ameli : remboursements et carte vitale dématérialisée", type: "TEXT" },
      { title: "Impots.gouv : déclarer ses revenus en ligne pas à pas", type: "TEXT" },
      { title: "ANTS : carte grise, permis de conduire et autres démarches", type: "TEXT" },
      { title: "Faire ses démarches sans risque : les bons réflexes de sécurité", type: "CASE_STUDY" },
    ],
  },
  {
    title: "Rester en contact avec sa famille",
    description: "Garder le lien avec ses enfants et petits-enfants : WhatsApp pour les messages et photos, FaceTime ou Zoom pour les visios, partage d'albums photos en ligne.",
    orderIndex: 7,
    duration: 180,
    content: "Les outils numériques rapprochent les familles éloignées. Apprendre à les utiliser sereinement pour ne plus jamais se sentir isolé.",
    lessons: [
      { title: "WhatsApp : messages, photos et appels gratuits avec la famille", type: "TEXT" },
      { title: "Faire une visio (FaceTime, Zoom, WhatsApp vidéo)", type: "TEXT" },
      { title: "Partager des photos avec ses petits-enfants (album partagé)", type: "TEXT" },
      { title: "Découvrir les groupes de messagerie familiaux", type: "EXERCISE" },
    ],
  },
  {
    title: "L'IA comme assistant simple au quotidien",
    description: "Découvrir les assistants IA (ChatGPT, Le Chat, Gemini) comme un copain numérique : reformuler une lettre, traduire un mot, expliquer un terme, donner une recette. Sans peur et sans illusions.",
    orderIndex: 8,
    duration: 180,
    content: "L'IA n'est pas réservée aux jeunes ni aux ingénieurs. Apprendre à s'en servir comme un assistant patient pour les petits problèmes du quotidien.",
    lessons: [
      { title: "Qu'est-ce qu'une IA et à quoi ça sert dans la vraie vie ?", type: "TEXT" },
      { title: "Demander à l'IA de reformuler une lettre, un email", type: "EXERCISE" },
      { title: "Traduire un mot, expliquer un terme inconnu", type: "EXERCISE" },
      { title: "Limites et précautions : ce que l'IA ne sait pas faire", type: "TEXT" },
      { title: "Atelier : 5 vrais problèmes du quotidien résolus avec l'IA", type: "CASE_STUDY" },
    ],
  },
];

// --- Execution ---
console.log("=== SEED FORMATION SENIORS ===");

const existing = await prisma.formation.findUnique({ where: { slug: SLUG } });

let formation;
if (existing) {
  console.log(`Formation existante trouvee (${existing.id}), mise a jour...`);
  formation = await prisma.formation.update({
    where: { id: existing.id },
    data: formationData,
  });
} else {
  formation = await prisma.formation.create({ data: formationData });
  console.log(`Formation creee : ${formation.id}`);
}

// Modules + lecons : on supprime les modules existants pour repartir propre
if (existing) {
  await prisma.module.deleteMany({ where: { formationId: formation.id } });
  console.log("Modules existants supprimes");
}

let totalLessons = 0;
for (const m of modules) {
  const created = await prisma.module.create({
    data: {
      formationId: formation.id,
      title: m.title,
      description: m.description,
      orderIndex: m.orderIndex,
      duration: m.duration,
      content: m.content,
      lessons: {
        create: m.lessons.map((l, idx) => ({
          title: l.title,
          type: l.type,
          orderIndex: idx + 1,
          content: `[À enrichir] ${l.title}`,
        })),
      },
      quizzes: {
        create: {
          title: `Auto-évaluation — ${m.title}`,
        },
      },
    },
    include: { lessons: true },
  });
  totalLessons += created.lessons.length;
  console.log(`M${m.orderIndex} ${m.title} -> ${created.lessons.length} lecons`);
}

console.log(`\n=== TERMINE ===`);
console.log(`Formation : ${formation.title}`);
console.log(`Slug : ${formation.slug}`);
console.log(`Modules : ${modules.length}`);
console.log(`Lecons : ${totalLessons}`);
console.log(`Quiz : ${modules.length}`);

await prisma.$disconnect();
