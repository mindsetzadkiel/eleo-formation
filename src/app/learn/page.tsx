import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Monitor,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LogOut,
  CheckCircle2,
  Circle,
  Clock,
  Star,
  ArrowRight,
  Calendar,
} from "lucide-react";

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
      completions: { orderBy: { completedAt: "desc" } },
      quizAttempts: { include: { quiz: { include: { module: true } } }, orderBy: { completedAt: "desc" } },
      documents: true,
      submissions: true,
    },
  });

  if (!learner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white rounded-2xl shadow-sm p-8 border border-slate-200 max-w-md">
          <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Espace apprenant</h1>
          <p className="text-slate-500 mb-4">Votre profil apprenant n&apos;est pas encore configuré.</p>
          <p className="text-sm text-slate-400">Contactez Eleo Formation au 04 42 29 06 65.</p>
          <form action="/api/auth/logout" method="POST" className="mt-4">
            <button type="submit" className="text-sm text-cyan-600 hover:text-cyan-500">Déconnexion</button>
          </form>
        </div>
      </div>
    );
  }

  const totalLessons = learner.enrollments.reduce(
    (acc, e) => acc + e.session.formation.modules.reduce((a, m) => a + m.lessons.length, 0),
    0,
  );
  const completedLessons = learner.completions.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const lastActivity = learner.completions[0]?.completedAt || learner.quizAttempts[0]?.completedAt;
  const passedQuizzes = learner.quizAttempts.filter((q) => q.passed).length;
  const avgQuizScore = learner.quizAttempts.filter((q) => q.score != null).length > 0
    ? Math.round(
        (learner.quizAttempts.filter((q) => q.score != null).reduce((acc, q) => acc + (q.score! / (q.maxScore || 1)) * 100, 0) /
          learner.quizAttempts.filter((q) => q.score != null).length) * 10,
      ) / 10
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Monitor className="w-6 h-6 text-cyan-400" />
              <span className="text-lg font-bold text-white">Eleo Formation</span>
              <span className="text-sm text-slate-400 ml-2 hidden sm:inline">Espace apprenant</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300 hidden sm:inline">{user.firstName} {user.lastName}</span>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="p-2 text-slate-400 hover:text-white">
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Bonjour {user.firstName} !</h1>
          <p className="text-slate-500 mt-1">
            {lastActivity
              ? `Dernière activité : ${new Date(lastActivity).toLocaleDateString("fr-FR")}`
              : "Bienvenue dans votre espace personnel."}
          </p>
        </div>

        {/* Progression globale */}
        <section className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold">Progression globale</h2>
                <p className="text-sm text-cyan-50 mt-1">
                  {completedLessons}/{totalLessons} leçons · {passedQuizzes}/{learner.quizAttempts.length} quiz validés
                  {avgQuizScore != null && ` · ${avgQuizScore}% moyenne quiz`}
                </p>
              </div>
              <div className="text-5xl font-bold">{progressPercent}%</div>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 border-t border-slate-100">
            <Stat icon={CheckCircle2} value={completedLessons} label="Leçons terminées" color="text-emerald-600" />
            <Stat icon={ClipboardCheck} value={learner.quizAttempts.length} label="Quiz passés" color="text-cyan-600" />
            <Stat icon={FileText} value={learner.documents.length} label="Documents" color="text-purple-600" />
            <Stat icon={GraduationCap} value={learner.submissions.length} label="Travaux rendus" color="text-amber-600" />
          </div>
        </section>

        {/* Mes formations */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-600" />
            Mes formations
          </h2>

          {learner.enrollments.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-slate-500">Aucune formation inscrite pour le moment.</p>
              <p className="text-sm text-slate-400 mt-2">Contactez Eleo Formation pour vous inscrire.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {learner.enrollments.map((enrollment) => {
                const formation = enrollment.session.formation;
                const formationLessons = formation.modules.reduce((a, m) => a + m.lessons.length, 0);
                const formationCompleted = formation.modules.reduce(
                  (a, m) => a + m.lessons.filter((l) => learner.completions.some((c) => c.lessonId === l.id)).length,
                  0,
                );
                const formationProgress = formationLessons > 0 ? Math.round((formationCompleted / formationLessons) * 100) : 0;

                // Trouve la prochaine leçon non terminée
                let nextLesson: { id: string; title: string; moduleTitle: string } | null = null;
                outer: for (const m of formation.modules) {
                  for (const l of m.lessons) {
                    if (!learner.completions.some((c) => c.lessonId === l.id)) {
                      nextLesson = { id: l.id, title: l.title, moduleTitle: m.title };
                      break outer;
                    }
                  }
                }

                return (
                  <div key={enrollment.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{formation.title}</h3>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formation.duration}h</span>
                            <span>{formation.format}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              du {new Date(enrollment.session.startDate).toLocaleDateString("fr-FR")} au {new Date(enrollment.session.endDate).toLocaleDateString("fr-FR")}
                            </span>
                            <StatusBadge status={enrollment.status} />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-cyan-600">{formationProgress}%</div>
                          <div className="text-xs text-slate-400">{formationCompleted}/{formationLessons}</div>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" style={{ width: `${formationProgress}%` }} />
                      </div>

                      {nextLesson && (
                        <Link
                          href={`/learn/lesson/${nextLesson.id}`}
                          className="mt-4 flex items-center justify-between bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg p-3 transition"
                        >
                          <div>
                            <p className="text-xs text-cyan-700 font-medium uppercase tracking-wide">Continuer</p>
                            <p className="text-sm font-semibold text-cyan-900 mt-0.5">{nextLesson.title}</p>
                            <p className="text-xs text-cyan-600">{nextLesson.moduleTitle}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-cyan-700" />
                        </Link>
                      )}
                    </div>

                    {/* Détail modules */}
                    <details className="border-t border-slate-100">
                      <summary className="px-5 py-3 cursor-pointer text-sm text-slate-600 hover:bg-slate-50 list-none flex items-center justify-between">
                        <span>Voir le détail des {formation.modules.length} modules</span>
                        <span className="text-xs text-slate-400">▼</span>
                      </summary>
                      <div className="px-5 py-3 space-y-3 bg-slate-50/50">
                        {formation.modules.map((module) => {
                          const moduleLessons = module.lessons.length;
                          const moduleCompleted = module.lessons.filter((l) =>
                            learner.completions.some((c) => c.lessonId === l.id),
                          ).length;
                          const moduleQuizAttempts = learner.quizAttempts.filter((qa) => qa.quiz.moduleId === module.id);
                          const bestQuizScore = moduleQuizAttempts.length > 0
                            ? Math.max(...moduleQuizAttempts.map((q) => q.score != null && q.maxScore ? (q.score / q.maxScore) * 100 : 0))
                            : null;

                          return (
                            <div key={module.id} className="bg-white rounded-lg border border-slate-200 p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-slate-800">
                                    Module {module.orderIndex} — {module.title}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {moduleCompleted}/{moduleLessons} leçons
                                    {bestQuizScore != null && ` · meilleur quiz : ${Math.round(bestQuizScore)}%`}
                                  </p>
                                </div>
                                {moduleCompleted === moduleLessons && moduleLessons > 0 ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-300" />
                                )}
                              </div>

                              <ul className="space-y-1 mt-2">
                                {module.lessons.map((lesson) => {
                                  const completion = learner.completions.find((c) => c.lessonId === lesson.id);
                                  return (
                                    <li key={lesson.id} className="flex items-center gap-2 text-xs">
                                      {completion ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                      ) : (
                                        <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                                      )}
                                      <span className={completion ? "text-slate-700" : "text-slate-500"}>
                                        {lesson.title}
                                      </span>
                                      {completion && (
                                        <span className="text-slate-400 ml-auto">
                                          {new Date(completion.completedAt).toLocaleDateString("fr-FR")}
                                        </span>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </details>

                    <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-2">
                      <Link
                        href={`/positionnement/${formation.slug}`}
                        className="text-xs text-slate-600 hover:text-cyan-600 underline"
                      >
                        Questionnaire de positionnement
                      </Link>
                      <span className="text-slate-300">·</span>
                      <Link
                        href={`/satisfaction/${formation.slug}/chaud`}
                        className="text-xs text-slate-600 hover:text-cyan-600 underline"
                      >
                        Évaluation à chaud
                      </Link>
                      <span className="text-slate-300">·</span>
                      <Link
                        href={`/satisfaction/${formation.slug}/froid`}
                        className="text-xs text-slate-600 hover:text-cyan-600 underline"
                      >
                        Évaluation à froid (3-6 mois)
                      </Link>
                      <span className="text-slate-300">·</span>
                      <Link href="/reclamation" className="text-xs text-slate-600 hover:text-cyan-600 underline">
                        Faire une réclamation
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quiz récents */}
        {learner.quizAttempts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Évaluations récentes
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {learner.quizAttempts.slice(0, 8).map((qa) => {
                  const pct = qa.score != null && qa.maxScore ? Math.round((qa.score / qa.maxScore) * 100) : null;
                  return (
                    <li key={qa.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-800">{qa.quiz.title}</p>
                        <p className="text-xs text-slate-500">{qa.quiz.module.title}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${qa.passed ? "text-emerald-600" : pct != null ? "text-amber-600" : "text-slate-400"}`}>
                          {pct != null ? `${pct}%` : "—"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {qa.completedAt ? new Date(qa.completedAt).toLocaleDateString("fr-FR") : "en cours"}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ icon: Icon, value, label, color }: { icon: React.ComponentType<{ className?: string }>; value: number; label: string; color: string }) {
  return (
    <div className="px-4 py-4 text-center">
      <Icon className={`w-6 h-6 ${color} mx-auto mb-1`} />
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    INSCRIT: { label: "Inscrit", color: "bg-blue-100 text-blue-700" },
    EN_COURS: { label: "En cours", color: "bg-cyan-100 text-cyan-700" },
    TERMINE: { label: "Terminée", color: "bg-emerald-100 text-emerald-700" },
    ABANDONNE: { label: "Abandonnée", color: "bg-rose-100 text-rose-700" },
  };
  const m = map[status] || { label: status, color: "bg-slate-100 text-slate-600" };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${m.color}`}>{m.label}</span>;
}
