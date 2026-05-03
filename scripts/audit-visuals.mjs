import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const formations = await prisma.formation.findMany({
  include: {
    modules: {
      orderBy: { orderIndex: "asc" },
      include: { lessons: { orderBy: { orderIndex: "asc" } } },
    },
  },
});

for (const f of formations) {
  const lessons = f.modules.flatMap((m) => m.lessons);
  const enriched = lessons.filter((l) => l.content.length > 1500).length;
  const withCover = lessons.filter((l) => l.coverImage).length;
  const withInlineImg = lessons.filter((l) => /!\[.*\]\(http/.test(l.content)).length;
  const totalImgs = lessons.reduce((acc, l) => acc + (l.content.match(/!\[.*\]\(http/g) || []).length, 0);
  console.log(`\n=== ${f.title.substring(0, 60)} ===`);
  console.log(`  slug          : ${f.slug}`);
  console.log(`  modules       : ${f.modules.length}`);
  console.log(`  lecons        : ${lessons.length}`);
  console.log(`  enrichies >1500c : ${enriched}`);
  console.log(`  avec cover image : ${withCover}`);
  console.log(`  avec img inline  : ${withInlineImg}`);
  console.log(`  total images inline : ${totalImgs}`);
  // lecons a probleme
  const short = lessons.filter((l) => l.content.length < 1500);
  const noImg = lessons.filter((l) => l.content.length > 1500 && !/!\[.*\]\(http/.test(l.content));
  if (short.length) {
    console.log(`  ⚠ lecons courtes (<1500c) :`);
    for (const l of short) console.log(`     - ${l.title} (${l.content.length}c)`);
  }
  if (noImg.length) {
    console.log(`  ⚠ lecons sans image inline :`);
    for (const l of noImg) console.log(`     - ${l.title}`);
  }
}

await prisma.$disconnect();
