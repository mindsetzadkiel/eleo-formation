import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Target = "lesson" | "quiz" | "qualiopi" | "opco" | "email";

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: {
    target: Target;
    targetId?: string;
    content: string;
    extra?: Record<string, string>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { target, targetId, content, extra } = body;
  if (!target || !content || content.trim().length < 20) {
    return NextResponse.json({ error: "Cible et contenu requis" }, { status: 400 });
  }

  try {
    switch (target) {
      case "lesson": {
        if (!targetId) throw new Error("Leçon non sélectionnée");
        const updated = await prisma.lesson.update({
          where: { id: targetId },
          data: { content: content.trim() },
        });
        return NextResponse.json({
          ok: true,
          message: `Leçon "${updated.title}" mise à jour (${content.length} caractères).`,
        });
      }

      case "quiz": {
        if (!targetId) throw new Error("Quiz non sélectionné");
        // Le contenu doit être un JSON {questions:[{question,options[4],correctAnswer,points?}]}
        let parsed: { questions?: unknown };
        try {
          const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
          parsed = JSON.parse(fenced ? fenced[1] : content);
        } catch {
          throw new Error("Le contenu doit être un JSON {questions:[...]} valide. Demande à l'IA de générer au format JSON.");
        }
        const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
        if (questions.length === 0) throw new Error("Aucune question valide trouvée dans le JSON.");

        const valid = questions.filter((q): q is { question: string; options: string[]; correctAnswer: string; points?: number } => {
          if (!q || typeof q !== "object") return false;
          const obj = q as Record<string, unknown>;
          return typeof obj.question === "string"
            && Array.isArray(obj.options) && obj.options.length === 4 && obj.options.every((o) => typeof o === "string")
            && typeof obj.correctAnswer === "string"
            && (obj.options as string[]).includes(obj.correctAnswer as string);
        });
        if (valid.length === 0) throw new Error("Format de questions invalide (4 options + correctAnswer dans les options requis).");

        const existing = await prisma.quizQuestion.count({ where: { quizId: targetId } });
        let order = existing;
        for (const q of valid) {
          await prisma.quizQuestion.create({
            data: {
              quizId: targetId,
              question: q.question,
              type: "MCQ",
              options: JSON.stringify(q.options),
              correctAnswer: q.correctAnswer,
              points: typeof q.points === "number" ? q.points : 1,
              orderIndex: order++,
            },
          });
        }
        return NextResponse.json({
          ok: true,
          message: `${valid.length} question(s) ajoutée(s) au quiz.`,
        });
      }

      case "qualiopi": {
        if (!targetId) throw new Error("Indicateur Qualiopi non sélectionné");
        const newStatus = extra?.status;
        const updated = await prisma.qualiopiItem.update({
          where: { id: targetId },
          data: {
            comments: content.trim(),
            ...(newStatus ? { status: newStatus } : {}),
            lastUpdated: new Date(),
          },
        });
        return NextResponse.json({
          ok: true,
          message: `Plan d'action publié sur "${updated.label}".`,
        });
      }

      case "opco": {
        if (!targetId) throw new Error("Document OPCO non sélectionné");
        const updated = await prisma.oPCODocument.update({
          where: { id: targetId },
          data: {
            remarks: content.trim(),
            status: "GENERE",
            generatedAt: new Date(),
          },
        });
        return NextResponse.json({
          ok: true,
          message: `Template publié sur le document OPCO ${updated.type}.`,
        });
      }

      case "email": {
        const name = (extra?.name || "").trim();
        const subject = (extra?.subject || "").trim();
        let slug = (extra?.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
        if (!name) throw new Error("Nom du modèle requis");
        if (!subject) throw new Error("Objet requis");
        if (!slug) slug = name.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");

        // Si targetId → update existant, sinon création (en gérant collisions de slug)
        if (targetId) {
          const updated = await prisma.emailTemplate.update({
            where: { id: targetId },
            data: { name, subject, body: content.trim() },
          });
          return NextResponse.json({
            ok: true,
            message: `Modèle email "${updated.name}" mis à jour.`,
          });
        }
        // Eviter collision de slug
        let unique = slug;
        let i = 1;
        while (await prisma.emailTemplate.findUnique({ where: { slug: unique } })) {
          i++;
          unique = `${slug}-${i}`;
        }
        const created = await prisma.emailTemplate.create({
          data: { slug: unique, name, subject, body: content.trim() },
        });
        return NextResponse.json({
          ok: true,
          message: `Modèle email "${created.name}" créé (slug: ${created.slug}).`,
        });
      }

      default:
        return NextResponse.json({ error: "Cible inconnue" }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur publication";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
