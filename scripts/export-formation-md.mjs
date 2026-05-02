/**
 * Exporte une formation complète (modules + leçons + quizzes) en fichier Markdown.
 * Usage: node scripts/export-formation-md.mjs
 * Sortie: ./formation-export.md
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";

const p = new PrismaClient();
const SLUG = process.argv[2] || "technicien-informatique-ia-augmente";

const f = await p.formation.findUnique({
  where: { slug: SLUG },
  include: {
    modules: {
      orderBy: { orderIndex: "asc" },
      include: {
        lessons: { orderBy: { orderIndex: "asc" } },
        quizzes: { include: { questions: { orderBy: { orderIndex: "asc" } } } },
      },
    },
  },
});

if (!f) {
  console.error(`Formation introuvable : ${SLUG}`);
  process.exit(1);
}

const TYPE_LABEL = {
  TEXT: "📖 Théorie",
  EXERCISE: "🔧 Exercice pratique",
  CASE_STUDY: "🧩 Étude de cas",
  VIDEO: "🎥 Vidéo",
};

const lines = [];
lines.push(`# ${f.title}`);
lines.push("");
lines.push(`> **Durée** : ${f.duration}h · **Format** : ${f.format} · **Prix** : ${f.priceHT}€ HT · **Statut** : ${f.status}`);
lines.push("");
lines.push(`## 📝 Description`);
lines.push("");
lines.push(f.description);
lines.push("");
lines.push(`## 🎯 Objectifs pédagogiques`);
lines.push("");
lines.push(f.objectives);
lines.push("");
lines.push(`## 👥 Public cible`);
lines.push("");
lines.push(f.targetAudience);
lines.push("");
lines.push(`### Public NON cible`);
lines.push("");
lines.push(f.nonTargetAudience);
lines.push("");
lines.push(`## 📋 Prérequis`);
lines.push("");
lines.push(f.prerequisites);
lines.push("");
lines.push(`## ⚙️ Modalités`);
lines.push("");
lines.push(`- **Accès** : ${f.accessModalities}`);
lines.push(`- **Délais** : ${f.accessDelay}`);
lines.push(`- **Accessibilité handicap** : ${f.disabilityAccess}`);
lines.push(`- **Méthodes pédagogiques** : ${f.teachingMethods}`);
lines.push(`- **Évaluation** : ${f.evaluationMethods}`);
lines.push("");
lines.push("---");
lines.push("");
lines.push(`# 📚 Programme détaillé`);
lines.push("");

for (const m of f.modules) {
  lines.push(`## Module ${m.orderIndex} — ${m.title}`);
  lines.push("");
  lines.push(`> ⏱️ ${m.duration} min · ${m.lessons.length} leçons · ${m.quizzes.length} quiz`);
  lines.push("");
  lines.push(`*${m.description}*`);
  lines.push("");
  if (m.content) {
    lines.push(m.content);
    lines.push("");
  }
  for (const l of m.lessons) {
    const label = TYPE_LABEL[l.type] || l.type;
    lines.push(`### Leçon ${m.orderIndex}.${l.orderIndex} — ${l.title} ${label}`);
    lines.push("");
    lines.push(l.content || "*(pas de contenu)*");
    lines.push("");
  }
  for (const q of m.quizzes) {
    lines.push(`### 📝 ${q.title}`);
    lines.push("");
    if (q.questions.length === 0) {
      lines.push("*(pas de questions)*");
    } else {
      for (const qu of q.questions) {
        lines.push(`**Q${qu.orderIndex}. ${qu.question}**`);
        if (qu.type === "MCQ" && qu.options) {
          try {
            const opts = JSON.parse(qu.options);
            opts.forEach((o, i) => lines.push(`- ${String.fromCharCode(97 + i)}) ${o}`));
          } catch {
            lines.push(`Options : ${qu.options}`);
          }
        }
        lines.push(`> ✅ Réponse : ${qu.correctAnswer}  _(${qu.points} pt)_`);
        lines.push("");
      }
    }
  }
  lines.push("---");
  lines.push("");
}

const output = lines.join("\n");
const filename = `formation-${f.slug}.md`;
fs.writeFileSync(filename, output, "utf8");
console.log(`✓ ${output.length} chars exportés dans ${filename}`);
console.log(`  Ouvrez-le dans VS Code, Obsidian ou n'importe quel éditeur Markdown.`);

await p.$disconnect();
