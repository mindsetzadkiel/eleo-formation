import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PositioningForm } from "./form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PositioningFormPage({ params }: PageProps) {
  const { slug } = await params;
  const formation = await prisma.formation.findUnique({ where: { slug } });
  if (!formation) notFound();

  const questions = await prisma.positioningQuestion.findMany({
    where: { OR: [{ formationId: formation.id }, { formationId: null }] },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <div className="min-h-screen bg-eleo-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-eleo-gray-200 p-6 sm:p-8 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-eleo-500 mb-2">Avant de démarrer</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-eleo-gray-800 mb-2">Questionnaire de positionnement</h1>
          <p className="text-eleo-gray-600 mb-6 text-sm">
            Avant le début de la formation <strong>{formation.title}</strong>, ce questionnaire nous aide à adapter le parcours à votre niveau et à vos besoins. Aucune mauvaise réponse, prenez le temps qu'il vous faut.
          </p>

          <PositioningForm
            formationId={formation.id}
            questions={questions.map((q) => ({
              id: q.id,
              orderIndex: q.orderIndex,
              question: q.question,
              type: q.type,
              required: q.required,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
