/**
 * Génère le contenu des documents OPCO via OpenRouter.
 * Chaque document A_GENERER reçoit un template markdown professionnel,
 * stocké dans le champ `remarks`.
 *
 * Usage :
 *   node --env-file=.env.local scripts/ai-generate-opco-docs.mjs --sample
 *   node --env-file=.env.local scripts/ai-generate-opco-docs.mjs --push
 */
import { PrismaClient } from "@prisma/client";

const ARGS = process.argv.slice(2);
const SAMPLE = ARGS.includes("--sample");
const PUSH = ARGS.includes("--push");

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_KEY) {
  console.error("OPENROUTER_API_KEY manquante");
  process.exit(1);
}

const MODELS = [
  process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free",
  ...(process.env.OPENROUTER_FALLBACK_MODELS || "")
    .split(",").map((s) => s.trim()).filter(Boolean),
];

const prisma = new PrismaClient();

async function callOpenRouter(messages) {
  const errors = [];
  for (const model of MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://formation.eleo-informatique.fr",
          "X-Title": "Eleo Formation - OPCO Templates",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.5,
          max_tokens: 3500,
        }),
      });
      if (!res.ok) {
        errors.push(`${model}: HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === "string" && content.trim().length > 300) {
        return { content, model };
      }
      errors.push(`${model}: réponse vide/courte`);
    } catch (e) {
      errors.push(`${model}: ${e.message}`);
    }
  }
  throw new Error("Tous les modèles ont échoué:\n" + errors.join("\n"));
}

const TYPE_SPECS = {
  DEVIS: {
    label: "Devis de formation",
    specs: `Format : **devis professionnel** avec tableau des prestations, total HT/TVA 20%/TTC, conditions de paiement, durée de validité, mentions légales OPCO.
Inclure :
- En-tête avec coordonnées Eleo + client
- Référence devis (placeholder [DEVIS-YYYY-NNN])
- Tableau : désignation / quantité / unité / PU HT / total HT
- Sous-totaux HT, TVA 20%, TTC
- Conditions : 30% acompte signature, solde fin de formation, validité 30 jours
- Mentions : exonération TVA si applicable (art 261-4-4° CGI), agrément Qualiopi [numéro à venir]
- Bon pour accord à retourner signé`,
  },
  PROGRAMME: {
    label: "Programme pédagogique détaillé",
    specs: `Format : **programme officiel de formation** conforme aux exigences Qualiopi indicateur 5.
Inclure :
- Intitulé exact de la formation
- Public visé + prérequis
- Objectifs pédagogiques opérationnels (au format "À l'issue, le stagiaire sera capable de...")
- Contenu détaillé module par module (reprendre depuis la base)
- Durée totale + répartition présentiel/distanciel
- Méthodes pédagogiques (alternance théorie/pratique, études de cas, exercices)
- Moyens techniques (plateforme LMS, atelier équipé à Aix-en-Provence)
- Modalités d'évaluation (quiz, étude de cas finale, attestation)
- Accessibilité PSH (contact référent handicap)
- Tarif HT + modalités de financement possibles (OPCO, fonds propres)`,
  },
  CONVENTION: {
    label: "Convention de formation professionnelle",
    specs: `Format : **convention bipartite** entre Eleo Informatique (organisme) et l'entreprise cliente (ou tripartite avec OPCO).
Articles obligatoires selon Code du travail (art. L.6353-1 et L.6353-2) :
- Article 1 : Objet (intitulé formation, public, objectifs)
- Article 2 : Durée et lieu (dates, horaires, format hybride)
- Article 3 : Tarif et modalités de paiement
- Article 4 : Obligations de l'organisme (qualité, attestation, programme)
- Article 5 : Obligations du bénéficiaire (assiduité, émargement)
- Article 6 : Modalités d'évaluation
- Article 7 : Dédit, désistement, annulation
- Article 8 : Litiges, droit applicable
- Signatures : organisme, client, stagiaire le cas échéant
- Références légales : numéro DA, SIRET, adresse Eleo`,
  },
  CONVOCATION: {
    label: "Convocation stagiaire",
    specs: `Format : **courrier de convocation officiel** envoyé 10+ jours avant début formation.
Inclure :
- En-tête Eleo + coordonnées
- Date du courrier
- Civilité + nom/prénom stagiaire
- Objet : Convocation à la formation [titre]
- Corps :
  - Confirmation inscription + intitulé
  - Dates, horaires (journée ou demi-journée), lieu (adresse atelier ou URL visioconférence)
  - Matériel à apporter (PC portable, chargeur, identifiants accès plateforme)
  - Modalités : émargement obligatoire, règlement intérieur joint
  - Lien accès plateforme LMS avec identifiants provisoires
  - Contact référent pédagogique Eleo (téléphone + email)
  - Contact référent handicap (si aménagements nécessaires)
- Formule de politesse + signature formateur
- Pièces jointes : programme, règlement intérieur, livret d'accueil`,
  },
  EMARGEMENT: {
    label: "Feuille d'émargement",
    specs: `Format : **grille d'émargement quotidienne** (tableau) pour chaque demi-journée.
Structure :
- En-tête : intitulé formation, formateur, date, lieu
- Tableau par demi-journée (matin/après-midi) :
  - Colonnes : Nom / Prénom / Signature matin / Signature après-midi
  - 8 lignes stagiaires minimum + 1 ligne formateur
- Mention "Émargement électronique accepté (plateforme LMS Eleo)"
- Total heures réalisées / prévues
- Cachet + signature formateur en bas
- Pour distanciel : préciser "Connexions horodatées via LMS Eleo"`,
  },
  CERTIFICAT: {
    label: "Certificat de réalisation",
    specs: `Format : **certificat officiel** conforme à l'article D.6353-1 du Code du travail (obligatoire post-2019).
Mentions obligatoires :
- Titre "CERTIFICAT DE RÉALISATION D'ACTIONS DE FORMATION"
- Nom + prénom bénéficiaire
- Intitulé exact de l'action de formation
- Objectifs
- Période de réalisation : du [date] au [date]
- Durée : [N] heures en présentiel + [N] heures en distanciel = [N] heures totales
- Nature de l'action : "action de formation" (art. L.6313-1)
- Attestation : "certifie que le bénéficiaire a bien suivi l'action de formation dans son intégralité"
- Date et lieu d'établissement
- Nom + fonction + signature responsable Eleo
- Cachet organisme + numéro déclaration activité`,
  },
  ATTESTATION: {
    label: "Attestation de fin de formation avec acquis",
    specs: `Format : **attestation d'acquis** complémentaire au certificat de réalisation.
Mentions :
- Titre "ATTESTATION DE FIN DE FORMATION"
- Identité du bénéficiaire
- Formation suivie, durée, dates
- Tableau des objectifs + niveau d'acquisition évalué (Acquis / Partiellement acquis / Non acquis)
- Résultats d'évaluation : scores quiz, étude de cas finale, appréciation formateur
- Compétences développées (formulation "être capable de...")
- Recommandations pour la suite (prochaines formations, pratique terrain)
- Signature formateur + cachet Eleo
- Date d'émission`,
  },
  SATISFACTION: {
    label: "Questionnaire de satisfaction à froid",
    specs: `Format : **questionnaire anonyme** à remplir en fin de formation (J+0 à J+7).
Structure (15-20 questions) :
**Section 1 : Organisation**
- Qualité de l'accueil, clarté des informations avant formation
- Adéquation horaires/durée
- Qualité du lieu / plateforme distancielle
**Section 2 : Contenu pédagogique**
- Atteinte des objectifs annoncés
- Pertinence du programme vs attentes
- Équilibre théorie/pratique
- Qualité des supports
**Section 3 : Formateur**
- Maîtrise du sujet, capacité d'explication
- Disponibilité, écoute, dynamisme
**Section 4 : Résultats**
- Niveau de satisfaction global (/10)
- Ce qui a été le plus utile
- Ce qui pourrait être amélioré
- Recommanderiez-vous la formation ?
- Commentaire libre
Toutes les questions en échelle de Likert 1-5 + zones texte libre.`,
  },
  EVAL_CHAUD: {
    label: "Évaluation à chaud (fin de session)",
    specs: `Format : **évaluation des acquis** en fin de dernière demi-journée, 15-20 min.
Différent de la satisfaction : mesure réellement ce qui a été appris.
Structure :
- Rappel objectifs pédagogiques
- QCM : 10-15 questions techniques couvrant les modules clés
- 1 étude de cas pratique (ex : "Un client arrive avec PC lent + erreur X, décris ta démarche de diagnostic")
- Grille d'autoévaluation : pour chaque compétence, niveau de maîtrise perçu (novice / intermédiaire / autonome)
- Barème : /20 avec note minimale de 12 pour validation
- Formateur renseigne : résultat quiz, résultat étude de cas, note formateur observationnelle, validation finale O/N`,
  },
  EVAL_FROID: {
    label: "Évaluation à froid (3 à 6 mois)",
    specs: `Format : **enquête de transfert en situation professionnelle**, envoyée par email 3 à 6 mois après formation.
Objectif Qualiopi indicateur 32 : mesurer l'impact réel et identifier besoins complémentaires.
Structure (10-15 questions) :
- Depuis la formation, as-tu mis en pratique les compétences acquises ? (Oui toujours / Oui parfois / Rarement / Jamais)
- Si oui, lesquelles en priorité ?
- Si non, quels freins (manque matériel, manque soutien hiérarchique, contexte changé...) ?
- Sur une échelle 1-10, à quel point la formation t'a été utile pour tes missions ?
- Qu'aurais-tu voulu voir en plus ?
- Aurais-tu besoin d'une formation complémentaire ? Sur quel thème ?
- Aurais-tu recommandé Eleo Formation à un collègue ?
- Commentaire libre
Inclure : rappel formation suivie + dates, contact référent Eleo, promesse d'anonymisation.`,
  },
  FACTURE: {
    label: "Facture de formation",
    specs: `Format : **facture conforme** art. 289 CGI + mentions obligatoires formation.
Inclure :
- Numéro facture séquentiel
- Date émission
- Coordonnées Eleo + SIRET + numéro DA + TVA intracommunautaire
- Coordonnées client + SIRET
- Désignation : intitulé formation + période réalisation
- Détail : durée en heures × tarif horaire HT
- Total HT + TVA 20% + TTC (ou mention "TVA non applicable" si exonération art 261-4-4° CGI)
- Modalités paiement : virement, RIB, échéance
- Mention "Attestation d'assiduité et certificat de réalisation joints"
- Destinataire facturation (entreprise, OPCO, stagiaire...)`,
  },
};

function buildPrompt(doc, spec) {
  const system = `Tu es un expert en administration d'organisme de formation, spécialiste des exigences OPCO (Constructys, AKTO, OPCO EP, Afdas...) et Qualiopi.
Tu rédiges des documents professionnels, juridiquement conformes, prêts à l'emploi pour une TPE.
Style : français administratif correct, concis, sans remplissage. Utilise des placeholders entre crochets [CHAMP À REMPLIR] pour les données spécifiques.`;

  const user = `Génère le template markdown complet d'un **${spec.label}** pour Eleo Formation.

## Contexte organisme
- **Raison sociale** : Eleo Informatique
- **Dirigeant** : [PRÉNOM NOM]
- **Adresse** : 49 Avenue Henri Malacrida, 13100 Aix-en-Provence
- **SIRET** : [SIRET]
- **Numéro déclaration d'activité** : [NDA à obtenir]
- **Qualiopi** : [en cours]
- **Email** : eleo.informatique@gmail.com
- **Téléphone** : 04 42 29 06 65
- **Site** : https://formation.eleo-informatique.fr

## Contexte formation
- **Formation** : ${doc.formation?.title || "[TITRE]"}
- **Durée** : ${doc.formation?.duration || "[N]"}h
- **Tarif** : ${doc.formation?.priceHT || "[N]"}€ HT
- **Format** : ${doc.formation?.format || "[FORMAT]"}

## Contexte client (optionnel)
${doc.company?.name ? `- **Entreprise** : ${doc.company.name}
- **SIRET** : ${doc.company.siret || "[SIRET]"}
${doc.company.contactName ? `- **Contact** : ${doc.company.contactName}` : ""}` : "- *(pas de client associé — générer un template générique)*"}

## Instructions spécifiques pour ce document
${spec.specs}

## Règles générales
- Format markdown (pas de HTML)
- Utilise des \`[PLACEHOLDERS]\` en majuscules pour tout ce qui doit être personnalisé
- Structure claire avec titres ## et ###
- Inclure toutes les mentions légales pertinentes
- Style français administratif pro (vouvoiement)
- Longueur : 1500-3500 caractères selon type de document

Rends UNIQUEMENT le contenu markdown du document, rien d'autre.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

// Main
const docs = await prisma.oPCODocument.findMany({
  where: { remarks: null },
  include: { formation: true, company: true },
  orderBy: { createdAt: "asc" },
});

let toProcess = docs;
if (SAMPLE) {
  toProcess = toProcess.slice(0, 1);
}

console.log(`=== GENERATION DE ${toProcess.length} DOCUMENT(S) OPCO ===`);
console.log(`    Mode : ${SAMPLE ? "SAMPLE" : PUSH ? "PUSH" : "DRY-RUN"}`);
console.log("");

let idx = 0;
for (const doc of toProcess) {
  idx++;
  const spec = TYPE_SPECS[doc.type];
  if (!spec) {
    console.log(`[${idx}/${toProcess.length}] ${doc.type} - SKIP (type non supporte)`);
    continue;
  }
  console.log(`[${idx}/${toProcess.length}] ${doc.type} (${spec.label})`);

  try {
    const t0 = Date.now();
    const { content, model } = await callOpenRouter(buildPrompt(doc, spec));
    const dt = Date.now() - t0;
    const trimmed = content.trim();

    console.log(`    -> ${model} en ${dt}ms, ${trimmed.length} chars`);

    if (PUSH) {
      await prisma.oPCODocument.update({
        where: { id: doc.id },
        data: {
          remarks: trimmed,
          status: "GENERE",
          generatedAt: new Date(),
        },
      });
      console.log(`    ✓ sauvegarde (statut: GENERE)`);
    } else if (SAMPLE) {
      console.log("\n=== CONTENU (SAMPLE) ===\n");
      console.log(trimmed);
      console.log("\n=== FIN ===\n");
    }

    if (idx < toProcess.length) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  } catch (e) {
    console.error(`    ✗ ERREUR: ${e.message}`);
    await new Promise((r) => setTimeout(r, 5000));
  }
}

console.log("\n=== TERMINE ===");
await prisma.$disconnect();
