/**
 * Seed Qualiopi : reglement interieur par defaut + questions positionnement.
 * Idempotent : skip si deja en base.
 *
 * Usage : node --env-file=.env.local scripts/seed-qualiopi.mjs
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ─── REGLEMENT INTERIEUR ─────────────────────────────────────────
const REGLEMENT_DEFAULT = `# Règlement intérieur des stagiaires — Eleo Formation

## Article 1 — Objet et champ d'application

Conformément aux articles L.6352-3 et suivants du Code du travail, le présent règlement intérieur s'applique à toute personne participant à une action de formation organisée par **Eleo Informatique** (Eleo Formation), organisme de formation enregistré sous le numéro de déclaration d'activité [NDA en cours d'attribution] auprès de la DREETS Provence-Alpes-Côte d'Azur.

Le règlement définit les règles d'hygiène et de sécurité, les mesures disciplinaires applicables aux stagiaires, ainsi que les droits et obligations de chaque participant.

## Article 2 — Hygiène et sécurité

Chaque stagiaire est tenu de respecter les consignes générales d'hygiène et de sécurité, notamment :

- Respecter les règles d'accès aux locaux et les horaires de la session.
- Ne pas fumer, vapoter ou consommer d'alcool ou de stupéfiants dans les locaux.
- Signaler immédiatement tout incident, blessure ou anomalie au formateur.
- En cas d'incendie, suivre les consignes d'évacuation affichées dans la salle.
- Conserver son environnement de travail propre et rangé.

## Article 3 — Discipline générale

Il est rappelé que tout stagiaire doit :

- Respecter les horaires de formation, signer les feuilles d'émargement à chaque demi-journée.
- Adopter une attitude respectueuse envers le formateur, les autres stagiaires et le matériel.
- Ne pas utiliser son téléphone à des fins non pédagogiques pendant les cours (mode silencieux exigé).
- Ne pas enregistrer, photographier ou diffuser le contenu de la formation sans autorisation écrite préalable.
- Ne pas introduire d'objets dangereux ni d'animaux dans les locaux.

## Article 4 — Sanctions

Tout manquement caractérisé du stagiaire à ces obligations peut donner lieu à l'une des sanctions suivantes, prononcées par le directeur de l'organisme de formation :

- Avertissement écrit.
- Blâme.
- Exclusion temporaire de la formation pour une durée maximale de 5 jours.
- Exclusion définitive de la formation.

Aucune sanction ne peut être prononcée sans que le stagiaire ait été informé au préalable des griefs retenus contre lui et qu'il ait pu présenter sa défense.

## Article 5 — Garanties disciplinaires

En application des articles R.6352-3 à R.6352-8 du Code du travail :

- Le stagiaire est convoqué par lettre recommandée ou remise contre décharge avec un délai minimum de 5 jours francs.
- L'entretien comporte un exposé des motifs et permet au stagiaire de s'expliquer, éventuellement assisté.
- La sanction ne peut intervenir moins d'1 jour franc et plus de 15 jours après l'entretien.
- La décision motivée est notifiée par lettre recommandée.

## Article 6 — Représentation des stagiaires

Pour les sessions de formation collectives d'une durée totale supérieure à 500 heures, des délégués stagiaires sont élus pour la durée de la session. Pour les sessions plus courtes, cette représentation n'est pas obligatoire (réf. art. R.6352-9 et suivants).

## Article 7 — Réclamations et recours

Toute réclamation peut être formulée auprès du responsable d'Eleo Formation par email à **eleo.informatique@gmail.com** ou par téléphone au **04 42 29 06 65**. Une réponse écrite sera apportée sous 15 jours ouvrés.

En cas de litige non résolu, le stagiaire peut saisir le médiateur de la consommation ou les juridictions compétentes.

## Article 8 — Accessibilité et adaptation au handicap

Eleo Formation s'engage à prendre toute mesure raisonnable pour adapter ses formations aux personnes en situation de handicap. Tout besoin spécifique doit être signalé à l'inscription pour permettre la mise en place d'aménagements adaptés (matériel, durée, support, accompagnement).

Référent handicap : **Eleo Informatique**, joignable au **04 42 29 06 65** ou par email à **eleo.informatique@gmail.com**.

## Article 9 — Données personnelles

Les données personnelles collectées dans le cadre de la formation sont traitées conformément au RGPD. Elles ne sont utilisées que pour la gestion administrative de la formation et la délivrance des attestations. Le stagiaire peut exercer ses droits d'accès, de rectification et de suppression auprès du responsable d'Eleo Formation.

## Article 10 — Acceptation du règlement

Le présent règlement est remis à chaque stagiaire en début de formation. La participation à la formation vaut acceptation tacite du présent règlement.

---

**Date d'application** : à compter de la version active.
**Eleo Informatique** — 49 Avenue Henri Malacrida, 13100 Aix-en-Provence — SIRET 87773553000017
`;

const existingReglement = await prisma.regulationDocument.findFirst({ where: { active: true } });
if (existingReglement) {
  console.log(`Reglement existant v${existingReglement.version}, skip`);
} else {
  const r = await prisma.regulationDocument.create({
    data: {
      version: "1.0",
      title: "Règlement intérieur des stagiaires",
      content: REGLEMENT_DEFAULT,
      active: true,
    },
  });
  console.log(`Reglement cree v${r.version}`);
}

// ─── QUESTIONS POSITIONNEMENT ──────────────────────────────────
const POSITIONING_QUESTIONS = [
  { orderIndex: 1, question: "Quel est votre niveau actuel d'aisance avec l'informatique en général ?", type: "SCALE_1_5" },
  { orderIndex: 2, question: "Quel système d'exploitation utilisez-vous principalement ? (Windows, macOS, Linux, autre)", type: "OPEN" },
  { orderIndex: 3, question: "Avez-vous déjà suivi une formation informatique auparavant ?", type: "YES_NO" },
  { orderIndex: 4, question: "Quels sont vos principaux objectifs pour cette formation ?", type: "OPEN" },
  { orderIndex: 5, question: "Quelles sont les difficultés ou questions concrètes que vous souhaitez résoudre ?", type: "OPEN" },
  { orderIndex: 6, question: "Êtes-vous à l'aise avec la lecture sur écran et la navigation web ?", type: "SCALE_1_5" },
  { orderIndex: 7, question: "Avez-vous des besoins spécifiques d'accessibilité (vue, audition, motricité, etc.) ?", type: "OPEN" },
  { orderIndex: 8, question: "Combien de temps par semaine pouvez-vous consacrer à la formation entre les sessions ?", type: "OPEN" },
  { orderIndex: 9, question: "Disposez-vous d'un matériel informatique récent (PC, Mac, smartphone) ?", type: "YES_NO" },
  { orderIndex: 10, question: "Comment avez-vous connu Eleo Formation ?", type: "OPEN" },
];

const existingQ = await prisma.positioningQuestion.count({ where: { formationId: null } });
if (existingQ > 0) {
  console.log(`${existingQ} questions positionnement existantes (generiques), skip`);
} else {
  for (const q of POSITIONING_QUESTIONS) {
    await prisma.positioningQuestion.create({
      data: { ...q, formationId: null, required: q.orderIndex <= 5 },
    });
  }
  console.log(`${POSITIONING_QUESTIONS.length} questions positionnement creees`);
}

await prisma.$disconnect();
console.log("=== TERMINE ===");
