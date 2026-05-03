/**
 * Enrichit les quizz (5 à 8 questions QCM par quiz) via OpenRouter.
 *
 * Usage :
 *   node --env-file=.env.local scripts/ai-enrich-quizzes.mjs --dry
 *   node --env-file=.env.local scripts/ai-enrich-quizzes.mjs --push
 *   node --env-file=.env.local scripts/ai-enrich-quizzes.mjs --push --only M4
 *
 * Comportement :
 * - Cible les quiz ayant moins de 5 questions
 * - Ajoute des questions QCM (4 options, 1 bonne réponse) en conservant les existantes
 * - Objectif : 6 questions par quiz (configurable via TARGET)
 */
import { PrismaClient } from "@prisma/client";

const ARGS = process.argv.slice(2);
const PUSH = ARGS.includes("--push");
const DRY = !PUSH;
const ONLY_IDX = ARGS.indexOf("--only");
const ONLY_MODULE = ONLY_IDX >= 0 ? ARGS[ONLY_IDX + 1] : null;
const TARGET = 6;

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_KEY) {
  console.error("OPENROUTER_API_KEY manquante dans .env.local");
  process.exit(1);
}

const PRIMARY = process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
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
          "X-Title": "Eleo Formation - Quiz Enrichment",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.6,
          max_tokens: 3000,
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) {
        errors.push(`${model}: HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === "string" && content.trim().length > 50) {
        return { content, model };
      }
      errors.push(`${model}: réponse vide`);
    } catch (e) {
      errors.push(`${model}: ${e.message}`);
    }
  }
  throw new Error("Tous les modèles ont échoué:\n" + errors.join("\n"));
}

function extractJson(text) {
  const trimmed = text.trim();
  // Tolère un ```json ... ``` fence
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : trimmed;
  return JSON.parse(raw);
}

function buildPrompt(module, quiz, existingQuestions, nbToGenerate) {
  const system = `Tu es un concepteur pédagogique Qualiopi. Tu rédiges des questions d'évaluation QCM claires, sans ambiguïté, basées strictement sur le contenu du module.`;

  const lessonsSummary = module.lessons
    .map((l) => `- ${l.title} (${l.type})\n${(l.content || "").substring(0, 800)}`)
    .join("\n\n");

  const existing = existingQuestions.length
    ? `\n## Questions déjà présentes (à NE PAS reproduire)\n${existingQuestions.map((q, i) => `${i + 1}. ${q.question}`).join("\n")}`
    : "";

  const user = `Génère ${nbToGenerate} nouvelles questions QCM pour le quiz suivant.

## Module
- **Titre** : ${module.title}
- **Description** : ${module.description || "-"}

## Quiz
- **Titre** : ${quiz.title}

## Contenu pédagogique du module (source obligatoire des questions)
${lessonsSummary}
${existing}

## Consignes
- ${nbToGenerate} questions QCM, **niveau formation professionnelle adulte**
- Chaque question a exactement **4 options** (A, B, C, D) et **1 seule bonne réponse**
- Questions concrètes, orientées terrain (scénarios techniciens), pas de pure récitation
- Varier les types : reconnaissance, diagnostic, bonne pratique, piège à éviter
- Aucune question ambiguë, les 3 mauvaises options doivent être **plausibles mais clairement fausses**
- Français correct, pas d'anglicismes inutiles

## Format de sortie (JSON STRICT, rien d'autre)
{
  "questions": [
    {
      "question": "texte de la question ?",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "option A",
      "points": 1
    }
  ]
}

correctAnswer doit être **exactement** identique à l'une des 4 options (copie texte).`;

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
      include: {
        lessons: { orderBy: { orderIndex: "asc" } },
        quizzes: {
          include: { questions: { orderBy: { orderIndex: "asc" } } },
        },
      },
    },
  },
});

if (!formation) {
  console.error("Formation introuvable");
  process.exit(1);
}

const jobs = [];
for (const m of formation.modules) {
  if (ONLY_MODULE && `M${m.orderIndex}` !== ONLY_MODULE) continue;
  for (const q of m.quizzes) {
    const missing = TARGET - q.questions.length;
    if (missing > 0) {
      jobs.push({ module: m, quiz: q, missing });
    }
  }
}

console.log(`=== ENRICHISSEMENT DE ${jobs.length} QUIZ ===`);
console.log(`    Modèles : ${MODELS.join(", ")}`);
console.log(`    Cible   : ${TARGET} questions/quiz`);
console.log(`    Mode    : ${PUSH ? "PUSH (écriture en base)" : "DRY-RUN"}`);
console.log("");

let idx = 0;
for (const { module: m, quiz: q, missing } of jobs) {
  idx++;
  console.log(`[${idx}/${jobs.length}] M${m.orderIndex} "${q.title}" — ${q.questions.length} actuelles, +${missing} à créer`);

  try {
    const t0 = Date.now();
    const { content, model } = await callOpenRouter(
      buildPrompt(m, q, q.questions, missing),
    );
    const dt = Date.now() - t0;

    let parsed;
    try {
      parsed = extractJson(content);
    } catch (e) {
      console.error(`    ✗ JSON invalide : ${e.message}`);
      console.error(`    raw: ${content.substring(0, 300)}`);
      continue;
    }

    const newQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
    console.log(`    -> ${model} en ${dt}ms, ${newQuestions.length} questions générées`);

    // Validation
    const valid = newQuestions.filter((nq) =>
      typeof nq.question === "string" &&
      Array.isArray(nq.options) && nq.options.length === 4 &&
      typeof nq.correctAnswer === "string" &&
      nq.options.includes(nq.correctAnswer),
    );
    if (valid.length !== newQuestions.length) {
      console.warn(`    ⚠ ${newQuestions.length - valid.length} question(s) rejetée(s) (format invalide)`);
    }

    for (const [i, nq] of valid.entries()) {
      const preview = nq.question.substring(0, 80);
      console.log(`       + Q${q.questions.length + i + 1}: ${preview}${nq.question.length > 80 ? "…" : ""}`);
    }

    if (PUSH && valid.length > 0) {
      let order = q.questions.length;
      for (const nq of valid) {
        await prisma.quizQuestion.create({
          data: {
            quizId: q.id,
            question: nq.question,
            type: "MCQ",
            options: JSON.stringify(nq.options),
            correctAnswer: nq.correctAnswer,
            points: typeof nq.points === "number" ? nq.points : 1,
            orderIndex: order++,
          },
        });
      }
      console.log(`    ✓ ${valid.length} questions sauvegardées`);
    }

    if (idx < jobs.length) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  } catch (e) {
    console.error(`    ✗ ERREUR: ${e.message}`);
    await new Promise((r) => setTimeout(r, 5000));
  }
}

console.log("\n=== TERMINE ===");
await prisma.$disconnect();
