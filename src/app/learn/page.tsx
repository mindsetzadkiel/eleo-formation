import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Monitor, BookOpen, ClipboardCheck, FileText, GraduationCap, LogOut } from "lucide-react";

export default async function LearnPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const learner = await prisma.learner.findUnique({
    where: { userId: user.id },
    include: {
      enrollments: {
        include: {
          session: {
            include: {
              formation: {
                include: {
                  modules: {
                    orderBy: { orderIndex: "asc" },
                    include: {
                      lessons: { orderBy: { orderIndex: "asc" } },
                      quizzes: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      completions: true,
      quizAttempts: true,
      documents: true,
      submissions: true,
    },
  });

  if (!learner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Espace apprenant</h1>
          <p className="text-slate-500 mb-4">Votre profil apprenant n&apos;est pas encore configuré.</p>
          <p className="text-sm text-slate-400">Contactez l&apos;administrateur Eleo Formation.</p>
          <form action="/api/auth/logout" method="POST" className="mt-4">
            <button type="submit" className="text-sm text-cyan-600 hover:text-cyan-500">Déconnexion</button>
          </form>
        </div>
      </div>
    );
  }

  const totalLessons = learner.enrollments.reduce(
    (acc, e) => acc + e.session.formation.modules.reduce((a, m) => a + m.lessons.length, 0),
    0
  );
  const completedLessons = learner.completions.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Monitor className="w-6 h-6 text-cyan-400" />
              <span className="text-lg font-bold text-white">Eleo Formation</span>
              <span className="text-sm text-slate-400 ml-2">Espace apprenant</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">{user.firstName} {user.lastName}</span>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="p-2 text-slate-400 hover:text-white">
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Bonjour, {user.firstName}
          </h1>
          <p className="text-slate-500">Voici votre espace de formation.</p>
        </div>

        {/* Progress */}
        <div className="mb-8 p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900 dark:text-white">Progression globale</h2>
            <span className="text-2xl font-bold text-cyan-600">{progressPercent}%</span>
          </div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mt-2">
            {completedLessons} / {totalLessons} leçons terminées — {learner.quizAttempts.length} quiz passés
          </p>
        </div>

        {/* Enrollments */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-600" />
            Mes formations
          </h2>
          {learner.enrollments.length === 0 ? (
            <p className="text-slate-500">Aucune formation inscrite pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {learner.enrollments.map((enrollment) => {
                const formation = enrollment.session.formation;
                const formationLessons = formation.modules.reduce((a, m) => a + m.lessons.length, 0);
                const formationCompleted = formation.modules.reduce(
                  (a, m) => a + m.lessons.filter((l) => learner.completions.some((c) => c.lessonId === l.id)).length,
                  0
                );
                const formationProgress = formationLessons > 0 ? Math.round((formationCompleted / formationLessons) * 100) : 0;

                return (
                  <div key={enrollment.id} className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{formation.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{formation.duration}h — {formation.format}</p>
                      </div>
                      <span className="text-lg font-bold text-cyan-600">{formationProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${formationProgress}%` }} />
                    </div>
                    <div className="space-y-2">
                      {formation.modules.map((module) => {
                        const moduleLessons = module.lessons.length;
                        const moduleCompleted = module.lessons.filter((l) =>
                          learner.completions.some((c) => c.lessonId === l.id)
                        ).length;
                        return (
                          <div key={module.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${moduleCompleted === moduleLessons && moduleLessons > 0 ? "bg-emerald-500" : "bg-slate-300"}`} />
                              <span className="text-sm text-slate-700 dark:text-slate-300">{module.title}</span>
                            </div>
                            <span className="text-xs text-slate-500">{moduleCompleted}/{moduleLessons}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <ClipboardCheck className="w-8 h-8 text-cyan-600 mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Quiz</h3>
            <p className="text-sm text-slate-500">{learner.quizAttempts.length} quiz passés</p>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <FileText className="w-8 h-8 text-cyan-600 mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Documents</h3>
            <p className="text-sm text-slate-500">{learner.documents.length} documents</p>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <GraduationCap className="w-8 h-8 text-cyan-600 mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Travaux</h3>
            <p className="text-sm text-slate-500">{learner.submissions.length} soumissions</p>
          </div>
        </div>
      </main>
    </div>
  );
}
