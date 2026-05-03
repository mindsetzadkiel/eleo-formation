/**
 * Enrichit le contenu pédagogique des leçons via OpenRouter.
 *
 * Usage :
 *   node --env-file=.env.local scripts/ai-enrich-lessons.mjs --sample     # 1 leçon seulement, sans écriture en base
 *   node --env-file=.env.local scripts/ai-enrich-lessons.mjs --dry        # toutes les leçons, sans écriture en base
 *   node --env-file=.env.local scripts/ai-enrich-lessons.mjs --push       # toutes les leçons, écrit en base
 *   node --env-file=.env.local scripts/ai-enrich-lessons.mjs --push --only M1  # limiter à un module
 *
 * Protections :
 * - Ne retraite jamais une leçon déjà enrichie (content > 1200 chars)
 * - Rate limit : 3s entre chaque appel OpenRouter
 * - Fallback multi-modèles (via OPENROUTER_FALLBACK_MODELS)
 */
import { PrismaClient } from "@prisma/client";

const ARGS = process.argv.slice(2);
const SAMPLE = ARGS.includes("--sample");
const PUSH = ARGS.includes("--push");
const DRY = ARGS.includes("--dry") || (!SAMPLE && !PUSH);
const ONLY_IDX = ARGS.indexOf("--only");
const ONLY_MODULE = ONLY_IDX >= 0 ? ARGS[ONLY_IDX + 1] : null;

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_KEY) {
  console.error("OPENROUTER_API_KEY manquante dans .env.local");
  process.exit(1);
}

const PRIMARY = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
const FALLBACKS = (process.env.OPENROUTER_FALLBACK_MODELS || "")
  .split(",").map((s) => s.trim()).filter(Boolean);
const MODELS = [PRIMARY, ...FALLBACKS];
const SITE_URL = process.env.OPENROUTER_SITE_URL || "https://formation.eleo-informatique.fr";

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
          "HTTP-Referer": SITE_URL,
          "X-Title": "Eleo Formation - Content Enrichment",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 4000,
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
      errors.push(`${model}: réponse vide ou trop courte`);
    } catch (e) {
      errors.push(`${model}: ${e.message}`);
    }
  }
  throw new Error("Tous les modèles ont échoué:\n" + errors.join("\n"));
}

function buildPrompt(formation, module, lesson) {
  const system = `Tu es un formateur expert en informatique et cybersécurité, concepteur pédagogique Qualiopi certifié.
Tu rédiges du contenu de formation professionnelle pour adultes actifs (techniciens informatique en reconversion ou salariés TPE/PME).
Ton style est clair, concret, orienté pratique terrain, avec des exemples réels du quotidien d'un technicien.
Tu évites le jargon inutile et tu privilégies des explications pas à pas.`;

  const typeLabel = {
    TEXT: "théorique",
    EXERCISE: "exercice pratique",
    CASE_STUDY: "étude de cas",
    VIDEO: "vidéo commentée",
  }[lesson.type] || lesson.type;

  const user = `Rédige le contenu pédagogique détaillé de cette leçon de formation.

## Contexte
- **Formation** : ${formation.title}
- **Durée totale** : ${formation.duration}h
- **Public cible** : ${formation.targetAudience}
- **Objectifs formation** : ${formation.objectives}
- **Module parent** : ${module.title}
- **Description module** : ${module.description}

## Leçon à rédiger
- **Titre** : ${lesson.title}
- **Type** : ${typeLabel}
- **Plan actuel (squelette)** : ${lesson.content}

## Consignes de rédaction
${lesson.type === "EXERCISE" ? `- Structure d'exercice pratique en 4 parties :
  1. **Objectif de l'exercice** (ce que l'apprenant va savoir faire)
  2. **Matériel / prérequis** (outils, fichiers, environnement)
  3. **Étapes détaillées** (5 à 10 étapes numérotées, claires, avec commandes/manipulations précises)
  4. **Critères de réussite** (comment vérifier que c'est fait correctement)` :
lesson.type === "CASE_STUDY" ? `- Structure d'étude de cas en 4 parties :
  1. **Situation de départ** (client fictif mais réaliste, symptômes, contraintes)
  2. **Questions à se poser** (analyse)
  3. **Diagnostic attendu** (raisonnement pas à pas)
  4. **Actions recommandées + explication au client** (procédure + communication)` :
`- Structure théorique en 3-4 parties avec sous-titres markdown :
  1. **Introduction** (contexte, pourquoi c'est important)
  2. **Notions clés** (définitions, concepts)
  3. **En pratique** (exemples concrets du métier de technicien, pièges courants)
  4. **À retenir** (3-5 points à mémoriser)`}

- Longueur : **entre 4000 et 5000 caractères** (contenu détaillé et substantiel, pas de remplissage)
- Format : **markdown** (titres ##, sous-titres ###, listes -, **gras** pour les termes importants, \`code\` pour commandes/fichiers)
- Ton : direct, tutoyer possible, exemples français (clients PME, logiciels français, etc.)
- Inclure **au moins 3-4 exemples concrets et diversifiés** du terrain
- Inclure **des commandes, raccourcis, captures texte ou noms de logiciels précis** que le technicien utilisera vraiment
- Inclure **des pièges courants** (section dédiée) avec exemples réels
- Inclure **un mini-récap "À retenir"** avec 5-7 points clés
- Ne pas reprendre le titre de la leçon en début de texte
- Ne pas mettre de "avertissement IA" ni de signature
- Densité : chaque paragraphe doit apporter une information utile, pas de généralités

Rends uniquement le contenu markdown de la leçon, rien d'autre.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

// Main
const formation = await prisma.formation.findFirst({
  where: { slug: "technicien-informatique-ia-augmente" },
  include: {
    modules: {
      orderBy: { orderIndex: "asc" },
      include: { lessons: { orderBy: { orderIndex: "asc" } } },
    },
  },
});

if (!formation) {
  console.error("Formation introuvable");
  process.exit(1);
}

// Collecte des leçons à traiter
const allLessons = [];
for (const m of formation.modules) {
  for (const l of m.lessons) {
    allLessons.push({ formation, module: m, lesson: l });
  }
}

let toProcess = allLessons;
if (ONLY_MODULE) {
  const modIdx = parseInt(ONLY_MODULE.replace("M", ""), 10);
  toProcess = toProcess.filter((x) => x.module.orderIndex === modIdx);
}
if (SAMPLE) {
  toProcess = toProcess.slice(0, 1);
}
// Skip lessons déjà enrichies (sauf --sample)
if (!SAMPLE) {
  toProcess = toProcess.filter(
    (x) => !x.lesson.content || x.lesson.content.length < 1200,
  );
}

console.log(`=== ENRICHISSEMENT DE ${toProcess.length} LECON(S) ===`);
console.log(`    Modèles : ${MODELS.join(", ")}`);
console.log(`    Mode    : ${SAMPLE ? "SAMPLE" : PUSH ? "PUSH (ecriture en base)" : "DRY-RUN"}`);
console.log("");

let idx = 0;
for (const { formation: f, module: m, lesson: l } of toProcess) {
  idx++;
  console.log(`[${idx}/${toProcess.length}] M${m.orderIndex}.L${l.orderIndex} "${l.title}" (${l.content?.length || 0} chars)`);

  try {
    const t0 = Date.now();
    const { content, model } = await callOpenRouter(buildPrompt(f, m, l));
    const dt = Date.now() - t0;
    const trimmed = content.trim();

    console.log(`    -> ${model} en ${dt}ms, ${trimmed.length} chars`);
    console.log(`    preview: ${trimmed.substring(0, 180).replace(/\n/g, " ⏎ ")}...`);

    if (PUSH) {
      await prisma.lesson.update({
        where: { id: l.id },
        data: { content: trimmed },
      });
      console.log(`    ✓ sauvegarde en base`);
    } else if (SAMPLE) {
      console.log("\n=== CONTENU COMPLET (SAMPLE) ===\n");
      console.log(trimmed);
      console.log("\n=== FIN SAMPLE ===\n");
    }

    // Rate limit : 3s entre appels (sauf si dernier)
    if (idx < toProcess.length) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  } catch (e) {
    console.error(`    ✗ ERREUR: ${e.message}`);
    // On continue avec la suivante au lieu de tout arrêter
    await new Promise((r) => setTimeout(r, 5000));
  }
}

console.log("\n=== TERMINE ===");
await prisma.$disconnect();
