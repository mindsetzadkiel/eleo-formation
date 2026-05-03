/**
 * Compresse les images de public/lesson-images en JPEG (qualite 80, max 1024px largeur).
 *
 * Usage : node scripts/compress-images.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "lesson-images");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".jpg") || f.endsWith(".png"));

console.log(`=== COMPRESSION ${files.length} images ===`);

let beforeTotal = 0, afterTotal = 0, processed = 0;

for (const f of files) {
  const fp = path.join(DIR, f);
  const before = fs.statSync(fp).size;
  beforeTotal += before;
  try {
    const buf = await sharp(fp)
      .resize({ width: 1024, withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toBuffer();
    if (buf.length < before) {
      fs.writeFileSync(fp, buf);
      afterTotal += buf.length;
    } else {
      afterTotal += before;
    }
    processed++;
    if (processed % 20 === 0) {
      console.log(`  ${processed}/${files.length} - ratio ${Math.round(afterTotal / beforeTotal * 100)}%`);
    }
  } catch (e) {
    console.error(`  ERREUR ${f} : ${e.message}`);
    afterTotal += before;
  }
}

console.log(`\n=== TERMINE ===`);
console.log(`Avant : ${(beforeTotal / 1024 / 1024).toFixed(1)} Mo`);
console.log(`Apres : ${(afterTotal / 1024 / 1024).toFixed(1)} Mo`);
console.log(`Gain  : ${Math.round((1 - afterTotal / beforeTotal) * 100)}%`);
