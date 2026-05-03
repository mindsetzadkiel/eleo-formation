/**
 * Regenere toutes les images des lecons via Gemini 2.5 Flash Image Preview.
 *
 * Usage :
 *   node --env-file=.env.local scripts/gen-images-gemini.mjs          # DRY
 *   node --env-file=.env.local scripts/gen-images-gemini.mjs --push   # genere + sauvegarde + update DB
 *   node --env-file=.env.local scripts/gen-images-gemini.mjs --push --only M1  # un module
 *
 * Pre-requis :
 *   GEMINI_API_KEY dans .env.local
 *
 * - Parse les URLs Pollinations (ou /api/image-proxy?url=...) dans lesson.content et coverImage
 * - Extrait le prompt d'origine (parametre ?prompt=... ou chemin /prompt/...)
 * - Appelle Gemini pour generer l'image
 * - Sauvegarde en public/lesson-images/<hash>.jpg
 * - Remplace les URLs dans la base par /lesson-images/<hash>.jpg
 * - Idempotent : skip les images deja telechargees (meme hash)
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ARGS = process.argv.slice(2);
const PUSH = ARGS.includes("--push");
const ONLY_IDX = ARGS.indexOf("--only");
const ONLY_MODULE = ONLY_IDX >= 0 ? ARGS[ONLY_IDX + 1] : null;

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY manquante dans .env.local");
  process.exit(1);
}

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const PUBLIC_DIR = path.join(process.cwd(), "public", "lesson-images");
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const prisma = new PrismaClient();

// ------- Regex & helpers -------
// Match soit URL Pollinations directe soit proxy /api/image-proxy?url=...
const POLLINATIONS_DIRECT = /https:\/\/image\.pollinations\.ai\/prompt\/([^?\s)"]+)(\?[^\s)"]+)?/g;
const PROXY_PATTERN = /\/api\/image-proxy\?url=([^\s)"]+)/g;

function extractPromptFromPollinations(pollinationsUrl) {
  // URL: https://image.pollinations.ai/prompt/<encoded>?...
  const m = pollinationsUrl.match(/\/prompt\/([^?]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

function extractPromptFromUrl(urlOrProxy) {
  if (urlOrProxy.startsWith("/api/image-proxy?url=")) {
    const encoded = urlOrProxy.substring("/api/image-proxy?url=".length);
    try {
      const inner = decodeURIComponent(encoded);
      return extractPromptFromPollinations(inner);
    } catch {
      return null;
    }
  }
  if (urlOrProxy.includes("pollinations.ai")) {
    return extractPromptFromPollinations(urlOrProxy);
  }
  return null;
}

function hashPrompt(prompt) {
  return crypto.createHash("md5").update(prompt).digest("hex").substring(0, 16);
}

function localPath(prompt) {
  return `/lesson-images/${hashPrompt(prompt)}.jpg`;
}

function diskPath(prompt) {
  return path.join(PUBLIC_DIR, `${hashPrompt(prompt)}.jpg`);
}

// ------- Gemini image generation -------
async function generateImage(prompt, maxAttempts = 6) {
  let delay = 8000;
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }],
          }],
          generationConfig: {
            responseModalities: ["IMAGE"],
          },
        }),
        signal: AbortSignal.timeout(90000),
      });

      if (res.status === 429 || res.status === 503) {
        console.log(`    ${res.status} (attempt ${i}/${maxAttempts}), attente ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(delay * 2, 60000);
        continue;
      }
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status} : ${errText.substring(0, 200)}`);
      }

      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p) => p.inlineData?.data);
      if (!imagePart) {
        throw new Error(`Pas d'image dans la reponse : ${JSON.stringify(data).substring(0, 300)}`);
      }
      return Buffer.from(imagePart.inlineData.data, "base64");
    } catch (e) {
      if (i >= maxAttempts) throw e;
      console.log(`    Erreur attempt ${i}: ${e.message}, retry...`);
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error("Echec apres tous les retries");
}

// ------- Main -------
const lessons = await prisma.lesson.findMany({
  select: { id: true, title: true, content: true, coverImage: true, module: { select: { orderIndex: true, formation: { select: { slug: true } } } } },
});

// Collecte toutes les URLs → prompts uniques
const promptMap = new Map(); // prompt -> {url, count}
for (const l of lessons) {
  if (ONLY_MODULE && `M${l.module.orderIndex}` !== ONLY_MODULE) continue;

  const urls = [];
  if (l.coverImage) urls.push(l.coverImage);
  const contentMatches = [...l.content.matchAll(PROXY_PATTERN), ...l.content.matchAll(POLLINATIONS_DIRECT)];
  for (const m of contentMatches) urls.push(m[0]);

  for (const url of urls) {
    const prompt = extractPromptFromUrl(url);
    if (!prompt) continue;
    const entry = promptMap.get(prompt) || { count: 0 };
    entry.count++;
    promptMap.set(prompt, entry);
  }
}

const prompts = [...promptMap.keys()];
console.log("=== GENERATION GEMINI IMAGES ===");
console.log(`Lecons       : ${lessons.length}`);
console.log(`Prompts uniques : ${prompts.length}`);
console.log(`Mode         : ${PUSH ? "GENERATE + UPDATE DB" : "DRY-RUN"}`);
console.log(`Modele       : ${MODEL}`);
console.log("");

if (!PUSH) {
  console.log("DRY-RUN : ajoute --push pour lancer la generation.");
  console.log("\nExemples de prompts :");
  for (const p of prompts.slice(0, 5)) console.log(`  - ${p.substring(0, 100)}`);
  await prisma.$disconnect();
  process.exit(0);
}

// Generation en batch
let generated = 0, cached = 0, failed = 0;
const failures = [];

for (let i = 0; i < prompts.length; i++) {
  const prompt = prompts[i];
  const disk = diskPath(prompt);

  if (fs.existsSync(disk) && fs.statSync(disk).size > 2000) {
    cached++;
    continue;
  }

  const short = prompt.substring(0, 80);
  console.log(`[${i + 1}/${prompts.length}] ${short}...`);

  try {
    const t0 = Date.now();
    const buf = await generateImage(prompt);
    const dt = Date.now() - t0;
    fs.writeFileSync(disk, buf);
    generated++;
    console.log(`    OK ${buf.length} bytes en ${dt}ms`);
    // Paid tier : 1s entre chaque (parallelisation legere)
    await new Promise((r) => setTimeout(r, 1000));
  } catch (e) {
    failed++;
    failures.push({ prompt: short, error: e.message });
    console.error(`    FAIL : ${e.message.substring(0, 150)}`);
    await new Promise((r) => setTimeout(r, 3000));
  }
}

console.log(`\n=== GENERATION TERMINEE ===`);
console.log(`Generees   : ${generated}`);
console.log(`En cache   : ${cached}`);
console.log(`Echecs     : ${failed}`);

// ------- Update DB : replace URLs ------
console.log(`\n=== UPDATE DB ===`);
let updatedLessons = 0;

function rewriteContent(text) {
  let newText = text;
  // Proxy URLs
  newText = newText.replace(PROXY_PATTERN, (match, encoded) => {
    try {
      const inner = decodeURIComponent(encoded);
      const prompt = extractPromptFromPollinations(inner);
      if (prompt && fs.existsSync(diskPath(prompt))) {
        return localPath(prompt);
      }
    } catch { /* */ }
    return match;
  });
  // Direct Pollinations URLs
  newText = newText.replace(POLLINATIONS_DIRECT, (match) => {
    const prompt = extractPromptFromPollinations(match);
    if (prompt && fs.existsSync(diskPath(prompt))) {
      return localPath(prompt);
    }
    return match;
  });
  return newText;
}

for (const l of lessons) {
  if (ONLY_MODULE && `M${l.module.orderIndex}` !== ONLY_MODULE) continue;

  const newContent = rewriteContent(l.content);
  let newCover = l.coverImage;
  if (newCover) {
    const prompt = extractPromptFromUrl(newCover);
    if (prompt && fs.existsSync(diskPath(prompt))) {
      newCover = localPath(prompt);
    }
  }

  if (newContent !== l.content || newCover !== l.coverImage) {
    await prisma.lesson.update({
      where: { id: l.id },
      data: { content: newContent, coverImage: newCover },
    });
    updatedLessons++;
  }
}

console.log(`Lecons mises a jour : ${updatedLessons}`);

if (failures.length > 0) {
  console.log(`\n⚠ ${failures.length} prompts ont echoue (relance le script pour retry) :`);
  for (const f of failures.slice(0, 5)) {
    console.log(`  - ${f.prompt}... : ${f.error.substring(0, 120)}`);
  }
}

await prisma.$disconnect();
