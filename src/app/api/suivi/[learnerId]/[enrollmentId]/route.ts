import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLearnerProgressPDF } from "@/lib/pdf-generator";

/**
 * Genere la fiche de suivi PDF d'un apprenant pour une inscription donnee.
 * Couvre Qualiopi Critere 3 indicateur 8 (suivi de la progression).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ learnerId: string; enrollmentId: string }> },
) {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { learnerId, enrollmentId } = await params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      session: {
        include: {
          formation: {
            include: {
              modules: {
                orderBy: { orderIndex: "asc" },
                include: { lessons: { orderBy: { orderIndex: "asc" } }, quizzes: true },
              },
            },
          },
        },
      },
      learner: { include: { user: true } },
    },
  });

  if (!enrollment || enrollment.learnerId !== learnerId) {
    return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });
  }

  const completions = await prisma.lessonCompletion.findMany({ where: { learnerId } });
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { learnerId },
    include: { quiz: { include: { module: true } } },
    orderBy: { completedAt: "desc" },
  });

  const formation = enrollment.session.formation;
  const totalLessons = formation.modules.reduce((a, m) => a + m.lessons.length, 0);
  const completedLessons = formation.modules.reduce(
    (a, m) => a + m.lessons.filter((l) => completions.some((c) => c.lessonId === l.id)).length,
    0,
  );
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const modules = formation.modules.map((m) => {
    const moduleQuizAttempts = quizAttempts.filter((qa) => qa.quiz.moduleId === m.id);
    const bestQuizScore = moduleQuizAttempts.length > 0
      ? Math.max(...moduleQuizAttempts.map((q) => (q.score != null && q.maxScore ? (q.score / q.maxScore) * 100 : 0)))
      : null;
    return {
      title: m.title,
      orderIndex: m.orderIndex,
      completed: m.lessons.filter((l) => completions.some((c) => c.lessonId === l.id)).length,
      total: m.lessons.length,
      bestQuizScore,
      lessons: m.lessons.map((l) => {
        const c = completions.find((c) => c.lessonId === l.id);
        return {
          title: l.title,
          completed: !!c,
          completedAt: c ? new Date(c.completedAt).toLocaleDateString("fr-FR") : null,
        };
      }),
    };
  });

  const quizAttemptsForPdf = quizAttempts
    .filter((qa) => formation.modules.some((m) => m.id === qa.quiz.moduleId))
    .slice(0, 30)
    .map((qa) => ({
      title: qa.quiz.title,
      module: qa.quiz.module.title,
      scorePct: qa.score != null && qa.maxScore ? Math.round((qa.score / qa.maxScore) * 100) : null,
      passed: !!qa.passed,
      date: qa.completedAt ? new Date(qa.completedAt).toLocaleDateString("fr-FR") : "—",
    }));

  const pdfBytes = await generateLearnerProgressPDF({
    learnerName: `${enrollment.learner.user.firstName} ${enrollment.learner.user.lastName}`,
    learnerEmail: enrollment.learner.user.email,
    formationTitle: formation.title,
    startDate: enrollment.session.startDate.toLocaleDateString("fr-FR"),
    endDate: enrollment.session.endDate.toLocaleDateString("fr-FR"),
    duration: formation.duration,
    completedLessons,
    totalLessons,
    progressPercent,
    modules,
    quizAttempts: quizAttemptsForPdf,
    date: new Date().toLocaleDateString("fr-FR"),
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="suivi-${enrollment.learner.user.lastName}-${Date.now()}.pdf"`,
    },
  });
}
