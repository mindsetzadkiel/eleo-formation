import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
const prisma = new PrismaClient();
const slug = process.argv[2] || "informatique-seniors-sereine";
const f = await prisma.formation.findUnique({
  where: { slug },
  include: { modules: { orderBy: { orderIndex: "asc" }, include: { lessons: { orderBy: { orderIndex: "asc" } } } } },
});
const l = f.modules[0].lessons[0];
console.log("=== LESSON 1 ===");
console.log("Title:", l.title);
console.log("Cover:", l.coverImage);
console.log("Content length:", l.content.length);
console.log("---");
fs.writeFileSync("lesson-preview.md", l.content);
console.log("Contenu sauvegarde dans lesson-preview.md");
await prisma.$disconnect();
