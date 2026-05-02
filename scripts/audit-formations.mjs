import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const formations = await p.formation.findMany({
  include: {
    modules: {
      orderBy: { orderIndex: "asc" },
      include: { lessons: true, quizzes: true },
    },
  },
  orderBy: { createdAt: "asc" },
});

console.log(`=== ${formations.length} FORMATION(S) EN BASE ===\n`);

const check = (v) => {
  if (!v) return "VIDE";
  const len = typeof v === "string" ? v.length : 0;
  if (len === 0) return "VIDE";
  if (len < 100) return `COURT (${len} chars)`;
  return `OK (${len} chars)`;
};

for (let i = 0; i < formations.length; i++) {
  const f = formations[i];
  console.log(`[${i + 1}] ${f.title}`);
  console.log(`    slug              : ${f.slug}`);
  console.log(`    duree             : ${f.duration}h`);
  console.log(`    prix HT           : ${f.priceHT} EUR`);
  console.log(`    format            : ${f.format}`);
  console.log(`    statut            : ${f.status}`);
  console.log(``);
  console.log(`    --- Champs Qualiopi obligatoires ---`);
  console.log(`    description       : ${check(f.description)}`);
  console.log(`    objectifs         : ${check(f.objectives)}`);
  console.log(`    public cible      : ${check(f.targetAudience)}`);
  console.log(`    public NON cible  : ${check(f.nonTargetAudience)}`);
  console.log(`    prerequis         : ${check(f.prerequisites)}`);
  console.log(`    modalites acces   : ${check(f.accessModalities)}`);
  console.log(`    delai acces       : ${check(f.accessDelay)}`);
  console.log(`    accessibilite PSH : ${check(f.disabilityAccess)}`);
  console.log(`    methodes pedago   : ${check(f.teachingMethods)}`);
  console.log(`    evaluation        : ${check(f.evaluationMethods)}`);
  console.log(``);
  console.log(`    --- Modules (${f.modules.length}) ---`);
  for (const m of f.modules) {
    console.log(
      `    M${m.orderIndex}: ${m.title}\n       duree ${m.duration}min | desc ${check(m.description)} | content ${check(m.content)} | lessons ${m.lessons.length} | quizzes ${m.quizzes.length}`,
    );
    for (const l of m.lessons.sort((a, b) => a.orderIndex - b.orderIndex)) {
      console.log(`       - L${l.orderIndex} [${l.type}] ${l.title} (content: ${check(l.content)})`);
    }
    for (const q of m.quizzes) {
      const qs = await p.quizQuestion.count({ where: { quizId: q.id } });
      console.log(`       - Quiz "${q.title}" (${qs} questions)`);
    }
  }
  console.log(``);
}

await p.$disconnect();
