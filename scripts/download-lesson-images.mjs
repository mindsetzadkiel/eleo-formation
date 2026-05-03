/**
 * Telecharge toutes les images Pollinations des lecons et remplace les URLs par des chemins locaux.
 *
 * Usage :
 *   node --env-file=.env.local scripts/download-lesson-images.mjs
 *   node --env-file=.env.local scripts/download-lesson-images.mjs --dry
 *
 * - Parcourt toutes les lecons (toutes formations)
 * - Trouve les URLs image.pollinations.ai dans content et coverImage
 * - Telecharge chaque image vers public/lesson-images/<hash>.jpg
 * - Remplace les URLs par /lesson-images/<hash>.jpg en base
 * - Retry automatique sur 429 avec backoff exponentiel
 * - Skip les images deja telechargees (resume possible)
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DRY = process.argv.includes("--dry");
const PUBLIC_DIR = path.join(process.cwd(), "public", "lesson-images");
const URL_REGEX = /https:\/\/image\.pollinations\.ai\/[^\s)"]+/g;

if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const prisma = new PrismaClient();

function hashUrl(url) {
  return crypto.createHash("md5").update(url).digest("hex").substring(0, 16);
}

function localPath(url) {
  return `/lesson-images/${hashUrl(url)}.jpg`;
}

function diskPath(url) {
  return path.join(PUBLIC_DIR, `${hashUrl(url)}.jpg`);
}

async function downloadWithRetry(url, maxAttempts = 6) {
  let delay = 3000;
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "EleoFormation/1.0" },
        signal: AbortSignal.timeout(60000),
      });
      if (res.status === 429) {
        console.log(`    429 (attempt ${i}/${maxAttempts}), attente ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(delay * 2, 60000);
        continue;
      }
      if (!res.ok) {
        console.warn(`    HTTP ${res.status}, attempt ${i}`);
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) {
        console.warn(`    Buffer trop petit (${buf.length}b), retry`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return buf;
    } catch (e) {
      console.warn(`    Erreur ${e.message}, attempt ${i}`);
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error(`Echec apres ${maxAttempts} tentatives : ${url}`);
}

// --- Collecte toutes les URLs uniques ---
const lessons = await prisma.lesson.findMany({
  select: { id: true, title: true, content: true, coverImage: true },
});

const urlSet = new Set();
for (const l of lessons) {
  if (l.coverImage && l.coverImage.includes("pollinations")) {
    urlSet.add(l.coverImage);
  }
  const matches = l.content.match(URL_REGEX);
  if (matches) {
    for (const u of matches) urlSet.add(u);
  }
}

const allUrls = [...urlSet];
console.log(`=== TELECHARGEMENT IMAGES POLLINATIONS ===`);
console.log(`Lecons    : ${lessons.length}`);
console.log(`URLs uniques : ${allUrls.length}`);
console.log(`Dossier   : ${PUBLIC_DIR}`);
console.log(`Mode      : ${DRY ? "DRY-RUN" : "DOWNLOAD + UPDATE DB"}`);
console.log("");

// --- Download ---
let downloaded = 0;
let cached = 0;
let failed = 0;
const failures = [];

for (let i = 0; i < allUrls.length; i++) {
  const url = allUrls[i];
  const disk = diskPath(url);
  if (fs.existsSync(disk) && fs.statSync(disk).size > 1000) {
    cached++;
    continue;
  }
  console.log(`[${i + 1}/${allUrls.length}] ${url.substring(0, 80)}...`);
  if (DRY) continue;
  try {
    const buf = await downloadWithRetry(url);
    fs.writeFileSync(disk, buf);
    downloaded++;
    console.log(`    OK ${buf.length} bytes -> ${path.basename(disk)}`);
    // Rate limit friendly : 2s entre chaque
    await new Promise((r) => setTimeout(r, 2000));
  } catch (e) {
    failed++;
    failures.push({ url, error: e.message });
    console.error(`    FAIL : ${e.message}`);
  }
}

console.log(`\n=== DOWNLOAD ===`);
console.log(`Telecharges : ${downloaded}`);
console.log(`Deja en cache : ${cached}`);
console.log(`Echecs      : ${failed}`);

if (DRY) {
  await prisma.$disconnect();
  process.exit(0);
}

// --- Update DB : remplace URLs Pollinations par chemins locaux ---
console.log(`\n=== UPDATE DB ===`);
let updatedLessons = 0;
for (const l of lessons) {
  let newContent = l.content;
  let newCover = l.coverImage;
  let changed = false;

  if (newCover && newCover.includes("pollinations")) {
    const disk = diskPath(newCover);
    if (fs.existsSync(disk) && fs.statSync(disk).size > 1000) {
      newCover = localPath(l.coverImage);
      changed = true;
    }
  }

  newContent = newContent.replace(URL_REGEX, (url) => {
    const disk = diskPath(url);
    if (fs.existsSync(disk) && fs.statSync(disk).size > 1000) {
      changed = true;
      return localPath(url);
    }
    return url;
  });

  if (changed) {
    await prisma.lesson.update({
      where: { id: l.id },
      data: { content: newContent, coverImage: newCover },
    });
    updatedLessons++;
  }
}
console.log(`Lecons mises a jour : ${updatedLessons}`);

if (failures.length) {
  console.log(`\n⚠ URLs non telechargeables (a relancer) :`);
  for (const f of failures.slice(0, 10)) {
    console.log(`  - ${f.url.substring(0, 100)}`);
    console.log(`    ${f.error}`);
  }
  if (failures.length > 10) console.log(`  ... et ${failures.length - 10} autres`);
}

await prisma.$disconnect();
console.log("\n=== TERMINE ===");
