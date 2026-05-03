import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

console.log("=== CRITERES QUALIOPI ===\n");
const criteres = await p.qualiopiCriterion.findMany({
  orderBy: { number: "asc" },
  include: { items: { orderBy: { label: "asc" } } },
});

console.log(`${criteres.length} critères\n`);
for (const c of criteres) {
  console.log(`Critère ${c.number} : ${c.title}`);
  console.log(`  description : ${(c.description || "").substring(0, 100)}...`);
  console.log(`  indicateurs : ${c.items.length}`);
  for (const i of c.items) {
    console.log(`    - ${i.label} [${i.status}]`);
  }
  console.log("");
}

console.log("\n=== INDICATEURS QUALIOPI ORPHELINS ===");
const orphans = await p.qualiopiItem.findMany({
  where: { criterionId: { equals: "" } },
});
console.log(`${orphans.length} orphelins\n`);

console.log("\n=== DOCUMENTS OPCO ===\n");
const docs = await p.oPCODocument.findMany({
  include: { formation: true, company: true },
  orderBy: { createdAt: "asc" },
});

console.log(`${docs.length} documents OPCO\n`);
for (const d of docs) {
  console.log(`[${d.type}] ${d.formation?.title || "?"} / ${d.company?.name || "(pas d'entreprise)"}`);
  console.log(`   statut : ${d.status} | fichier : ${d.filePath || "(aucun)"}`);
}

await p.$disconnect();
