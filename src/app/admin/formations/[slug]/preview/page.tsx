import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LessonMarkdown } from "@/components/lesson-markdown";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  FileText,
  Wrench,
  HelpCircle,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const TYPE_META: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  TEXT: { icon: FileText, label: "Théorie", color: "text-sky-600 bg-sky-50 border-sky-200" },
  EXERCISE: { icon: Wrench, label: "Exercice pratique", color: "text-orange-600 bg-orange-50 border-orange-200" },
  CASE_STUDY: { icon: GraduationCap, label: "Étude de cas", color: "text-purple-600 bg-purple-50 border-purple-200" },
  VIDEO: { icon: BookOpen, label: "Vidéo", color: "text-rose-600 bg-rose-50 border-rose-200" },
};

export default async function FormationPreviewPage({ params }: PageProps) {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    redirect("/login");
  }

  const { slug } = await params;
  const formation = await prisma.formation.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: { orderBy: { orderIndex: "asc" } },
          quizzes: {
            include: { questions: { orderBy: { orderIndex: "asc" } } },
          },
        },
      },
    },
  });

  if (!formation) notFound();

  // Stats
  const totalLessons = formation.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalQuestions = formation.modules.reduce(
    (acc, m) => acc + m.quizzes.reduce((a, q) => a + q.questions.length, 0),
    0,
  );
  const enrichedLessons = formation.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.content && l.content.length > 1200).length,
    0,
  );

  return (
    <div className="min-h-screen bg-eleo-gray-50">
      <div className="bg-white border-b border-eleo-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link
            href="/admin/formations"
            className="flex items-center gap-2 text-sm text-eleo-gray-600 hover:text-eleo-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour admin formations
          </Link>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-eleo-gray-100 text-eleo-gray-700">
              {enrichedLessons}/{totalLessons} leçons enrichies
            </span>
            <span className="px-2 py-1 rounded bg-eleo-gray-100 text-eleo-gray-700">
              {totalQuestions} questions quiz
            </span>
            <span
              className={`px-2 py-1 rounded font-medium ${
                formation.status === "PUBLIEE"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {formation.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête formation */}
        <div className="mb-10">
          <p className="text-sm text-eleo-gray-500 mb-1">Prévisualisation apprenant</p>
          <h1 className="text-3xl font-bold text-eleo-gray-800 mb-3">{formation.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-eleo-gray-600 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formation.duration}h
            </span>
            <span>·</span>
            <span>{formation.format}</span>
            <span>·</span>
            <span>{formation.priceHT}€ HT</span>
          </div>
          <p className="text-eleo-gray-700 leading-relaxed">{formation.description}</p>
        </div>

        {/* Modules + leçons */}
        <div className="space-y-10">
          {formation.modules.map((module) => (
            <section
              key={module.id}
              className="bg-white rounded-xl border border-eleo-gray-200 overflow-hidden"
            >
              <header className="px-6 py-5 bg-gradient-to-r from-eleo-50 to-white border-b border-eleo-gray-200">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-xl font-bold text-eleo-gray-800">
                    Module {module.orderIndex} — {module.title}
                  </h2>
                  <span className="text-xs px-2 py-1 rounded bg-white border border-eleo-gray-200 text-eleo-gray-600 whitespace-nowrap">
                    {module.duration} min
                  </span>
                </div>
                <p className="text-sm text-eleo-gray-600">{module.description}</p>
              </header>

              <div className="divide-y divide-eleo-gray-100">
                {module.lessons.map((lesson) => {
                  const meta = TYPE_META[lesson.type] || TYPE_META.TEXT;
                  const Icon = meta.icon;
                  const isEnriched = lesson.content && lesson.content.length > 1200;
                  return (
                    <article key={lesson.id} className="px-6 py-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${meta.color} whitespace-nowrap`}>
                          <Icon className="w-3.5 h-3.5" />
                          {meta.label}
                        </span>
                        <h3 className="text-base font-semibold text-eleo-gray-800 flex-1">
                          Leçon {module.orderIndex}.{lesson.orderIndex} — {lesson.title}
                        </h3>
                        {isEnriched ? (
                          <span className="text-xs text-green-600 flex items-center gap-1 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {lesson.content.length} chars
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 whitespace-nowrap">
                            squelette ({lesson.content?.length || 0} chars)
                          </span>
                        )}
                      </div>
                      {lesson.coverImage && (
                        <div className="mb-3 -mx-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={lesson.coverImage}
                            alt={lesson.title}
                            loading="lazy"
                            className="w-full h-48 sm:h-64 object-cover rounded-lg border border-eleo-gray-200"
                          />
                        </div>
                      )}
                      {lesson.content ? (
                        <div className="bg-eleo-gray-50 rounded-lg p-5 border border-eleo-gray-100">
                          <LessonMarkdown content={lesson.content} />
                        </div>
                      ) : (
                        <p className="text-sm text-eleo-gray-400 italic">(pas de contenu)</p>
                      )}
                    </article>
                  );
                })}

                {/* Quizzes */}
                {module.quizzes.map((quiz) => (
                  <div key={quiz.id} className="px-6 py-5 bg-eleo-50/30">
                    <h3 className="text-base font-semibold text-eleo-gray-800 mb-3 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-eleo-500" />
                      {quiz.title}
                    </h3>
                    {quiz.questions.length === 0 ? (
                      <p className="text-sm text-eleo-gray-400 italic">(aucune question)</p>
                    ) : (
                      <ol className="space-y-4">
                        {quiz.questions.map((q) => {
                          let options: string[] | null = null;
                          if (q.type === "MCQ" && q.options) {
                            try {
                              options = JSON.parse(q.options);
                            } catch {
                              options = null;
                            }
                          }
                          return (
                            <li key={q.id} className="bg-white rounded-lg p-4 border border-eleo-gray-200">
                              <p className="font-medium text-eleo-gray-800 mb-2">
                                Q{q.orderIndex}. {q.question}
                              </p>
                              {options && (
                                <ul className="space-y-1 mb-2">
                                  {options.map((opt, i) => {
                                    const letter = String.fromCharCode(97 + i);
                                    const isCorrect = q.correctAnswer === letter || q.correctAnswer === opt;
                                    return (
                                      <li
                                        key={i}
                                        className={`text-sm px-2 py-1 rounded ${
                                          isCorrect ? "bg-green-50 text-green-700 font-medium" : "text-eleo-gray-600"
                                        }`}
                                      >
                                        {letter}) {opt} {isCorrect && "✓"}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                              <p className="text-xs text-eleo-gray-500">
                                ✅ Réponse : <span className="font-mono">{q.correctAnswer}</span> · {q.points} pt
                              </p>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
