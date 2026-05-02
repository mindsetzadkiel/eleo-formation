import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { COMPANY, CONDITIONS_ACCUEIL } from "@/config/company";
import {
  ArrowRight,
  Clock,
  MapPin,
  Euro,
  CheckCircle2,
  Users,
  BookOpen,
  Target,
  AlertTriangle,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function FormationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const formation = await prisma.formation.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: { lessons: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });

  if (!formation || formation.status !== "PUBLIEE") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/formations" className="text-sm text-eleo-500 hover:text-eleo-600 mb-6 inline-block">
          &larr; Retour au catalogue
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-eleo-50 text-eleo-600 border border-eleo-200">
              {formation.format}
            </span>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-eleo-gray-100 text-eleo-gray-700">
              {formation.duration}h
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-eleo-gray-800 mb-4">{formation.title}</h1>
          <p className="text-lg text-eleo-gray-700 leading-relaxed">{formation.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-xl bg-white border border-eleo-gray-200 text-center">
            <Clock className="w-6 h-6 text-eleo-500 mx-auto mb-2" />
            <p className="text-sm text-eleo-gray-500">Durée</p>
            <p className="text-lg font-semibold text-eleo-gray-800">{formation.duration}h</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-eleo-gray-200 text-center">
            <Euro className="w-6 h-6 text-eleo-500 mx-auto mb-2" />
            <p className="text-sm text-eleo-gray-500">Tarif</p>
            <p className="text-lg font-semibold text-eleo-gray-800">{formatCurrency(formation.priceHT)} HT</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-eleo-gray-200 text-center">
            <MapPin className="w-6 h-6 text-eleo-500 mx-auto mb-2" />
            <p className="text-sm text-eleo-gray-500">Format</p>
            <p className="text-lg font-semibold text-eleo-gray-800">{formation.format}</p>
          </div>
        </div>

        {/* Objectifs */}
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-eleo-gray-800 mb-4">
            <Target className="w-5 h-5 text-eleo-500" />
            Objectifs pédagogiques
          </h2>
          <div className="space-y-2">
            {formation.objectives.split("\n").filter(Boolean).map((obj, i) => (
              <div key={i} className="flex items-start gap-3 text-eleo-gray-700">
                <CheckCircle2 className="w-5 h-5 text-eleo-500 mt-0.5 flex-shrink-0" />
                <span>{obj.replace(/^[-•]\s*/, "")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Public cible */}
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-eleo-gray-800 mb-4">
            <Users className="w-5 h-5 text-eleo-500" />
            Public cible
          </h2>
          <p className="text-eleo-gray-700">{formation.targetAudience}</p>
        </div>

        {/* Prérequis */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-eleo-gray-800 mb-3">Prérequis</h2>
          <p className="text-eleo-gray-700">{formation.prerequisites}</p>
        </div>

        {/* Programme détaillé */}
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-eleo-gray-800 mb-6">
            <BookOpen className="w-5 h-5 text-eleo-500" />
            Programme détaillé
          </h2>
          <div className="space-y-4">
            {formation.modules.map((module, idx) => (
              <div
                key={module.id}
                className="p-5 rounded-xl bg-white border border-eleo-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-eleo-gray-800">
                    Module {idx + 1} — {module.title}
                  </h3>
                  <span className="text-sm text-eleo-gray-500 whitespace-nowrap ml-4">{module.duration} min</span>
                </div>
                <p className="text-sm text-eleo-gray-500 mb-3">{module.description}</p>
                {module.lessons.length > 0 && (
                  <ul className="space-y-1">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center gap-2 text-sm text-eleo-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-eleo-500" />
                        {lesson.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modalités */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-eleo-gray-800 mb-2">Méthodes pédagogiques</h3>
            <p className="text-sm text-eleo-gray-700">{formation.teachingMethods}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-eleo-gray-800 mb-2">Modalités d&apos;évaluation</h3>
            <p className="text-sm text-eleo-gray-700">{formation.evaluationMethods}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-eleo-gray-800 mb-2">Modalités d&apos;accès</h3>
            <p className="text-sm text-eleo-gray-700">{formation.accessModalities}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-eleo-gray-800 mb-2">Délais d&apos;accès</h3>
            <p className="text-sm text-eleo-gray-700">{formation.accessDelay}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-eleo-gray-800 mb-2">Accessibilité handicap</h3>
            <p className="text-sm text-eleo-gray-700">{formation.disabilityAccess}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-eleo-50 to-white border border-eleo-200 mb-8">
          <h3 className="text-xl font-semibold text-eleo-gray-800 mb-2">Intéressé par cette formation ?</h3>
          <p className="text-eleo-gray-700 mb-4">
            Demandez un devis personnalisé. Financement OPCO, entreprise ou fonds propres.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 px-6 py-3 bg-eleo-500 hover:bg-eleo-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Demander un devis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Conditions */}
        <div className="p-5 rounded-xl bg-white border border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-600 mb-2">Conditions d&apos;accueil</h3>
              <p className="text-sm text-eleo-gray-500 whitespace-pre-line">{CONDITIONS_ACCUEIL}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-eleo-gray-400">
            {COMPANY.name} — {COMPANY.fullAddress} — SIRET : {COMPANY.siret}
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
