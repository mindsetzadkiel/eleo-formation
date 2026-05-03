/**
 * Remplace les URLs Pollinations directes par des URLs proxy Vercel dans toutes les lecons.
 *
 * Usage :
 *   node --env-file=.env.local scripts/rewrite-image-urls.mjs
 *
 * Transforme : https://image.pollinations.ai/prompt/...
 * En       : /api/image-proxy?url=<encoded>
 *
 * Ces URLs relatives seront servies par l'app Next.js deployee sur Vercel,
 * qui cache les images sur son CDN (pas de rate-limit pour les visiteurs finaux).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const POLLINATIONS_REGEX = /https:\/\/image\.pollinations\.ai\/[^\s)"]+/g;

function toProxy(url) {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

const lessons = await prisma.lesson.findMany({
  select: { id: true, content: true, coverImage: true },
});

let updated = 0;
let totalReplaced = 0;

for (const l of lessons) {
  let changed = false;
  let newContent = l.content;
  let newCover = l.coverImage;

  const contentMatches = l.content.match(POLLINATIONS_REGEX) || [];
  if (contentMatches.length > 0) {
    newContent = l.content.replace(POLLINATIONS_REGEX, toProxy);
    totalReplaced += contentMatches.length;
    changed = true;
  }

  if (l.coverImage && l.coverImage.includes("pollinations")) {
    newCover = toProxy(l.coverImage);
    totalReplaced++;
    changed = true;
  }

  if (changed) {
    await prisma.lesson.update({
      where: { id: l.id },
      data: { content: newContent, coverImage: newCover },
    });
    updated++;
  }
}

console.log(`=== REWRITE ===`);
console.log(`Lecons mises a jour : ${updated}/${lessons.length}`);
console.log(`URLs remplacees    : ${totalReplaced}`);

await prisma.$disconnect();
