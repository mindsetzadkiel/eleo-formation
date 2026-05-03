/**
 * Enrichit les indicateurs Qualiopi via OpenRouter :
 * - Génère un plan d'action détaillé
 * - Liste les preuves documentaires à fournir
 * - Propose les bonnes pratiques Eleo
 * - Stocke dans le champ `comments`
 * - Passe le statut à EN_COURS si A_FAIRE
 *
 * Usage :
 *   node --env-file=.env.local scripts/ai-enrich-qualiopi.mjs --sample
 *   node --env-file=.env.local scripts/ai-enrich-qualiopi.mjs --push
 *   node --env-file=.env.local scripts/ai-enrich-qualiopi.mjs --push --only 1   # critère 1 seulement
 */
import { PrismaClient } from "@prisma/client";

const ARGS = process.argv.slice(2);
const SAMPLE = ARGS.includes("--sample");
const PUSH = ARGS.includes("--push");
const ONLY_IDX = ARGS.indexOf("--only");
const ONLY_CRIT = ONLY_IDX >= 0 ? parseInt(ARGS[ONLY_IDX + 1], 10) : null;

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
          "X-Title": "Eleo Formation - Qualiopi Enrichment",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.6,
          max_tokens: 2500,
        }),
      });
      if (!res.ok) {
        errors.push(`${model}: HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === "string" && content.trim().length > 200) {
        return { content, model };
      }
      errors.push(`${model}: réponse vide/courte`);
    } catch (e) {
      errors.push(`${model}: ${e.message}`);
    }
  }
  throw new Error("Tous les modèles ont échoué:\n" + errors.join("\n"));
}

function buildPrompt(critere, indicateur) {
  const system = `Tu es un expert Qualiopi auditeur senior, spécialiste de l'accompagnement des TPE/PME organismes de formation.
Tu rédiges des plans d'action concrets, actionnables, adaptés à une micro-structure comme Eleo Informatique (1 formateur, 5-8 apprenants par session, formations courtes hybrides informatique/cybersécurité).
Tu cites toujours les preuves documentaires précises attendues par l'auditeur Qualiopi.`;

  const user = `Rédige le plan d'action Qualiopi pour cet indicateur, au format markdown structuré.

## Contexte organisme
- **Nom** : Eleo Informatique
- **Type** : organisme de formation TPE (micro-entreprise)
- **Formations** : hybride (distanciel + atelier présentiel à Aix-en-Provence)
- **Cible** : techniciens informatiques en reconversion, salariés TPE/PME
- **Effectifs** : 1 formateur-dirigeant, 5-8 apprenants / session
- **Financement** : OPCO, fonds propres, France Travail (pas d'alternance ni stage)

## Critère Qualiopi ${critere.number} : ${critere.title}
${critere.description}

## Indicateur à traiter
**${indicateur.label}**
${indicateur.description ? `Description : ${indicateur.description}` : ""}

## Consignes
Rédige un plan d'action en **4 sections markdown** :

### 1. Attendu Qualiopi
(2-4 lignes : ce que l'auditeur va vérifier concrètement sur cet indicateur)

### 2. Plan d'action pour Eleo
(5-8 actions numérotées, précises, réalisables pour une TPE. Ex: "Créer un fichier \`programme-v1.pdf\` publié sur formation.eleo-informatique.fr/formations")

### 3. Preuves documentaires à conserver
(liste à puces des documents/fichiers à produire et ranger, avec noms de fichiers suggérés)

### 4. Bonnes pratiques / pièges courants
(3-5 points : ce qui fait tomber l'audit sinon, exemples spécifiques TPE)

Longueur totale : **1500-2200 caractères**. Style direct, concret, zéro blabla.
Rends UNIQUEMENT le markdown, pas d'intro ni de conclusion.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

// Main
const criteres = await prisma.qualiopiCriterion.findMany({
  orderBy: { number: "asc" },
  include: { items: { orderBy: { label: "asc" } } },
});

const allItems = [];
for (const c of criteres) {
  for (const i of c.items) {
    allItems.push({ critere: c, indicateur: i });
  }
}

let toProcess = allItems;
if (ONLY_CRIT) {
  toProcess = toProcess.filter((x) => x.critere.number === ONLY_CRIT);
}
if (SAMPLE) {
  toProcess = toProcess.slice(0, 1);
}
if (!SAMPLE) {
  // Skip items déjà enrichis (comments > 500 chars)
  toProcess = toProcess.filter((x) => !x.indicateur.comments || x.indicateur.comments.length < 500);
}

console.log(`=== ENRICHISSEMENT DE ${toProcess.length} INDICATEUR(S) QUALIOPI ===`);
console.log(`    Mode : ${SAMPLE ? "SAMPLE" : PUSH ? "PUSH" : "DRY-RUN"}`);
console.log("");

let idx = 0;
for (const { critere: c, indicateur: i } of toProcess) {
  idx++;
  console.log(`[${idx}/${toProcess.length}] Crit.${c.number} "${i.label}" (statut: ${i.status})`);

  try {
    const t0 = Date.now();
    const { content, model } = await callOpenRouter(buildPrompt(c, i));
    const dt = Date.now() - t0;
    const trimmed = content.trim();

    console.log(`    -> ${model} en ${dt}ms, ${trimmed.length} chars`);

    if (PUSH) {
      await prisma.qualiopiItem.update({
        where: { id: i.id },
        data: {
          comments: trimmed,
          status: i.status === "A_FAIRE" ? "EN_COURS" : i.status,
          lastUpdated: new Date(),
        },
      });
      console.log(`    ✓ sauvegarde (statut: ${i.status === "A_FAIRE" ? "EN_COURS" : i.status})`);
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
