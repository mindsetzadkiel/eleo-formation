/**
 * Enrichit les lecons d'une formation via OpenRouter, avec illustrations Pollinations.ai.
 *
 * Usage :
 *   node --env-file=.env.local scripts/ai-enrich-lessons-v2.mjs --slug informatique-seniors-sereine --push
 *   node --env-file=.env.local scripts/ai-enrich-lessons-v2.mjs --slug technicien-informatique-ia-augmente --push --force
 *   node --env-file=.env.local scripts/ai-enrich-lessons-v2.mjs --slug ... --push --only M3
 *
 * Caracteristiques :
 * - Adapte le ton selon le slug (seniors vs technicien)
 * - Demande a l'IA d'inserer des balises [IMAGE: description courte] qui sont converties
 *   en URLs Pollinations.ai (gratuit, illimite, sans cle API)
 * - Genere une image de couverture par lecon (coverImage)
 * - Demande optionnellement un diagramme Mermaid pour les processus
 * - Skip auto les lecons deja enrichies (>1500 chars + au moins une image), sauf --force
 */
import { PrismaClient } from "@prisma/client";

const ARGS = process.argv.slice(2);
const SLUG_IDX = ARGS.indexOf("--slug");
const SLUG = SLUG_IDX >= 0 ? ARGS[SLUG_IDX + 1] : null;
const PUSH = ARGS.includes("--push");
const FORCE = ARGS.includes("--force");
const ONLY_IDX = ARGS.indexOf("--only");
const ONLY_MODULE = ONLY_IDX >= 0 ? ARGS[ONLY_IDX + 1] : null;

if (!SLUG) {
  console.error("Argument requis : --slug <formation-slug>");
  process.exit(1);
}

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_KEY) {
  console.error("OPENROUTER_API_KEY manquante");
  process.exit(1);
}

const PRIMARY = process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
const FALLBACKS = (process.env.OPENROUTER_FALLBACK_MODELS || "")
  .split(",").map((s) => s.trim()).filter(Boolean);
const MODELS = [PRIMARY, ...FALLBACKS];

const prisma = new PrismaClient();

// ---------- Pollinations ----------
function pollinationsUrl(description, opts = {}) {
  const { width = 1024, height = 576, seed } = opts;
  const cleaned = description.trim().replace(/\s+/g, " ").substring(0, 200);
  const encoded = encodeURIComponent(cleaned);
  const seedPart = seed != null ? `&seed=${seed}` : "";
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&nologo=true${seedPart}`;
}

// hash deterministe simple pour un seed stable par titre
function seedFromString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 100000;
}

// Replace [IMAGE: description] dans le markdown par ![description](url Pollinations)
function injectImages(markdown, lessonTitle) {
  const seedBase = seedFromString(lessonTitle);
  let imgIdx = 0;
  return markdown.replace(/\[IMAGE\s*:\s*([^\]]+)\]/gi, (_, desc) => {
    imgIdx++;
    const url = pollinationsUrl(desc, { seed: seedBase + imgIdx });
    return `![${desc.trim()}](${url})`;
  });
}

// ---------- OpenRouter ----------
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
          "X-Title": "Eleo Formation - Lesson Enrichment v2",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 4500,
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
      errors.push(`${model}: reponse vide`);
    } catch (e) {
      errors.push(`${model}: ${e.message}`);
    }
  }
  throw new Error("Tous les modeles ont echoue:\n" + errors.join("\n"));
}

// ---------- Prompts ----------
function buildPromptSeniors(formation, module, lesson) {
  const system = `Tu es un formateur expert spécialisé dans la transmission numérique aux seniors.
Tu rédiges des contenus pédagogiques pour des personnes de 60 ans et plus, totalement débutantes ou réticentes face à l'informatique.
Ton style est :
- TRES bienveillant, sans jargon, jamais condescendant
- Tu utilises le vouvoiement (jamais le tutoiement)
- Tu rassures, tu déculpabilises, tu utilises des analogies du monde "non numérique" (un email = une lettre, un dossier = un classeur, etc.)
- Tu détailles chaque geste : "cliquez avec le bouton de gauche de la souris", pas "cliquez"
- Tu anticipes les peurs ("vous ne casserez rien, promis")`;

  const typeLabel = {
    TEXT: "leçon théorique illustrée",
    EXERCISE: "exercice pratique guidé pas à pas",
    CASE_STUDY: "étude de cas concrète",
  }[lesson.type] || lesson.type;

  const user = `Rédige le contenu pédagogique de cette leçon de formation pour seniors débutants.

## Contexte
- **Formation** : ${formation.title}
- **Public** : ${formation.targetAudience}
- **Module parent** : ${module.title}
- **Description du module** : ${module.description}

## Leçon à rédiger
- **Titre** : ${lesson.title}
- **Type** : ${typeLabel}

## Consignes spécifiques seniors
- Longueur : **entre 3500 et 4500 caractères** (ni trop long, ni trop court)
- Format : **markdown** (## titres, ### sous-titres, listes, **gras** pour les mots importants)
- Ton : vouvoiement, bienveillant, rassurant. Banni : "facile", "il suffit de", "c'est simple"
- Structure :
  1. **En quelques mots** (2-3 phrases qui posent le sujet rassurément, avec une analogie du quotidien)
  2. **Ce que vous allez apprendre** (3-5 points concrets)
  3. **Pas à pas** : chaque action décomposée. Sur Windows ET sur Mac/iPhone si pertinent.
  4. **Les pièges à éviter** (3-4 erreurs fréquentes des débutants, pas de jargon)
  5. **À retenir** (5 points en gros)
  6. **Petit défi pour pratiquer** (1 mini-exercice à faire seul à la maison)

## Visuels obligatoires (TRES IMPORTANT)
Tu DOIS insérer **3 balises image** dans le contenu, sous cette forme exacte :

\`[IMAGE: description courte de l'image souhaitée, en anglais, style "friendly illustration of senior person using a computer, warm colors, simple, reassuring, photorealistic"]\`

Ces balises seront automatiquement converties en images. Choisis des descriptions :
- **Image 1** : illustration d'introduction (un senior souriant qui utilise l'objet/concept de la leçon)
- **Image 2** : illustration d'un geste précis du pas-à-pas
- **Image 3** : illustration d'un piège ou d'une réussite

Place les balises [IMAGE: ...] aux endroits naturels du texte (après l'intro, dans le pas-à-pas, dans les pièges).

## Diagramme Mermaid (si pertinent)
Si la leçon décrit un processus en plusieurs étapes (envoyer un email, faire une recherche, etc.), inclure UN bloc Mermaid simple :
\`\`\`mermaid
flowchart TD
    A[Étape 1] --> B[Étape 2]
    B --> C[Étape 3]
\`\`\`

## Format de sortie
Rends UNIQUEMENT le contenu markdown de la leçon. Ne reprends pas le titre de la leçon (il est déjà affiché). Pas de signature, pas d'avertissement IA.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

function buildPromptTechnicien(formation, module, lesson) {
  const system = `Tu es un formateur expert en informatique et cybersécurité, concepteur pédagogique Qualiopi certifié.
Tu rédiges du contenu de formation professionnelle pour adultes actifs (techniciens informatique en reconversion ou salariés TPE/PME).
Ton style est clair, concret, orienté pratique terrain.`;

  const typeLabel = {
    TEXT: "théorique",
    EXERCISE: "exercice pratique",
    CASE_STUDY: "étude de cas",
  }[lesson.type] || lesson.type;

  const user = `Rédige le contenu pédagogique détaillé de cette leçon de formation.

## Contexte
- **Formation** : ${formation.title}
- **Public** : ${formation.targetAudience}
- **Module parent** : ${module.title}

## Leçon à rédiger
- **Titre** : ${lesson.title}
- **Type** : ${typeLabel}

## Consignes
- Longueur : **entre 4000 et 5000 caractères**
- Format : **markdown** (titres ##, sous-titres ###, listes, **gras**, \`code\` pour commandes)
- Structure : Introduction, Notions clés, En pratique (exemples concrets), Pièges courants, À retenir
- Inclure 3-4 exemples concrets terrain et des commandes/raccourcis précis

## Visuels obligatoires
Tu DOIS insérer **2 balises image** dans le contenu :

\`[IMAGE: description en anglais, style "professional technical illustration, clean, modern, blue and cyan tones"]\`

- Image 1 : illustration de la notion principale
- Image 2 : illustration d'un cas pratique ou piège

## Diagramme Mermaid (si pertinent)
Si la leçon décrit un processus (diagnostic, démarche), inclure UN bloc Mermaid en flowchart.

Rends UNIQUEMENT le markdown. Pas de titre, pas de signature.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

function buildPrompt(formation, module, lesson) {
  if (formation.slug === "informatique-seniors-sereine") {
    return buildPromptSeniors(formation, module, lesson);
  }
  return buildPromptTechnicien(formation, module, lesson);
}

// ---------- Main ----------
const formation = await prisma.formation.findUnique({
  where: { slug: SLUG },
  include: {
    modules: {
      orderBy: { orderIndex: "asc" },
      include: { lessons: { orderBy: { orderIndex: "asc" } } },
    },
  },
});

if (!formation) {
  console.error(`Formation introuvable : ${SLUG}`);
  process.exit(1);
}

const allLessons = [];
for (const m of formation.modules) {
  if (ONLY_MODULE && `M${m.orderIndex}` !== ONLY_MODULE) continue;
  for (const l of m.lessons) {
    allLessons.push({ module: m, lesson: l });
  }
}

let toProcess = allLessons;
if (!FORCE) {
  toProcess = toProcess.filter(({ lesson }) => {
    if (!lesson.content || lesson.content.length < 1500) return true;
    // Si pas d'image dans le contenu, on retraite
    if (!/!\[.*\]\(http/.test(lesson.content)) return true;
    return false;
  });
}

console.log(`=== ENRICHISSEMENT v2 (avec visuels) ===`);
console.log(`    Formation : ${formation.title}`);
console.log(`    Modeles   : ${MODELS.join(", ")}`);
console.log(`    Lecons    : ${toProcess.length}`);
console.log(`    Mode      : ${PUSH ? "PUSH" : "DRY-RUN"}`);
console.log("");

let idx = 0;
for (const { module: m, lesson: l } of toProcess) {
  idx++;
  console.log(`[${idx}/${toProcess.length}] M${m.orderIndex}.L${l.orderIndex} "${l.title}" (${l.content?.length || 0} chars)`);

  try {
    const t0 = Date.now();
    const { content, model } = await callOpenRouter(buildPrompt(formation, m, l));
    const dt = Date.now() - t0;

    // Injection des images Pollinations
    const finalContent = injectImages(content.trim(), l.title);
    const imgCount = (finalContent.match(/!\[.*\]\(http/g) || []).length;

    console.log(`    -> ${model} en ${dt}ms, ${finalContent.length} chars, ${imgCount} image(s)`);

    // Cover image (deterministe)
    const coverDesc = formation.slug === "informatique-seniors-sereine"
      ? `friendly warm illustration of senior person learning computers, ${l.title}, photorealistic, soft lighting, reassuring`
      : `professional technical illustration, ${l.title}, modern, blue cyan tones, clean`;
    const coverUrl = pollinationsUrl(coverDesc, {
      width: 1280,
      height: 720,
      seed: seedFromString(l.title + "_cover"),
    });

    if (PUSH) {
      await prisma.lesson.update({
        where: { id: l.id },
        data: {
          content: finalContent,
          coverImage: coverUrl,
        },
      });
      console.log(`    sauvegarde + cover image`);
    } else {
      console.log(`    cover preview : ${coverUrl.substring(0, 100)}...`);
    }

    if (idx < toProcess.length) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  } catch (e) {
    console.error(`    ERREUR: ${e.message}`);
    await new Promise((r) => setTimeout(r, 5000));
  }
}

console.log("\n=== TERMINE ===");
await prisma.$disconnect();
