import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SatisfactionForm } from "./form";

interface PageProps {
  params: Promise<{ slug: string; type: string }>;
}

const QUESTIONS_CHAUD = [
  { id: "expectations", label: "La formation a-t-elle répondu à vos attentes ?" },
  { id: "level", label: "Le contenu était-il adapté à votre niveau ?" },
  { id: "trainer", label: "Le formateur était-il compétent et pédagogue ?" },
  { id: "supports", label: "Les supports pédagogiques étaient-ils adaptés ?" },
  { id: "logistics", label: "L'organisation logistique était-elle satisfaisante ?" },
  { id: "duration", label: "La durée était-elle adaptée au programme ?" },
];

const QUESTIONS_FROID = [
  { id: "applied", label: "Avez-vous pu appliquer concrètement les connaissances acquises ?" },
  { id: "impact", label: "La formation a-t-elle eu un impact sur votre pratique professionnelle ?" },
  { id: "useful_modules", label: "Les modules suivis vous ont-ils été utiles dans la durée ?" },
  { id: "remember", label: "Vous souvenez-vous facilement des notions clés ?" },
  { id: "would_redo", label: "Referiez-vous cette formation aujourd'hui en ayant le choix ?" },
];

export default async function SatisfactionPage({ params }: PageProps) {
  const { slug, type } = await params;
  const typeUpper = type.toUpperCase();
  if (typeUpper !== "CHAUD" && typeUpper !== "FROID") notFound();

  const formation = await prisma.formation.findUnique({ where: { slug } });
  if (!formation) notFound();

  const questions = typeUpper === "CHAUD" ? QUESTIONS_CHAUD : QUESTIONS_FROID;
  const typeLabel = typeUpper === "CHAUD" ? "à chaud" : "à froid (3-6 mois après)";

  return (
    <div className="min-h-screen bg-eleo-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-eleo-gray-200 p-6 sm:p-8 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-eleo-500 mb-2">Évaluation {typeLabel}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-eleo-gray-800 mb-2">Votre satisfaction</h1>
          <p className="text-eleo-gray-600 text-sm mb-6">
            Vous venez de suivre <strong>{formation.title}</strong>. Vos retours nous permettent d'améliorer en continu nos formations. Cela ne prend que 2 minutes.
          </p>
          <SatisfactionForm
            formationId={formation.id}
            type={typeUpper}
            questions={questions}
          />
        </div>
      </div>
    </div>
  );
}
