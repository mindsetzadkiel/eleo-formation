import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Clock, MapPin, Euro } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function FormationsPage() {
  const formations = await prisma.formation.findMany({
    where: { status: "PUBLIEE" },
    include: { modules: { orderBy: { orderIndex: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-eleo-gray-800 mb-4">Catalogue des formations</h1>
          <p className="text-lg text-eleo-gray-500 max-w-2xl">
            Formations professionnelles courtes, structurées, facturées et finançables.
            Maintenance informatique, cybersécurité, IA pratique.
          </p>
        </div>

        {formations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-eleo-gray-500 text-lg">Aucune formation publiée pour le moment.</p>
            <p className="text-eleo-gray-400 mt-2">Revenez bientôt ou contactez-nous pour plus d&apos;informations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formations.map((formation) => (
              <div
                key={formation.id}
                className="rounded-xl border border-eleo-gray-200 bg-white shadow-sm overflow-hidden hover:border-eleo-300 hover:shadow-md transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-eleo-50 text-eleo-600 border border-eleo-200">
                      {formation.format}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-eleo-gray-100 text-eleo-gray-700">
                      {formation.duration}h
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-eleo-gray-800 mb-3">{formation.title}</h2>
                  <p className="text-sm text-eleo-gray-500 mb-4 line-clamp-3">{formation.description}</p>

                  <div className="space-y-2 mb-4 text-sm text-eleo-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-eleo-500" />
                      {formation.duration} heures
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-eleo-500" />
                      {formation.format === "HYBRIDE"
                        ? "En ligne + atelier Aix-en-Provence"
                        : formation.format === "DISTANCE"
                        ? "À distance"
                        : "En présentiel à Aix-en-Provence"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="w-4 h-4 text-eleo-500" />
                      {formatCurrency(formation.priceHT)} HT
                    </div>
                  </div>

                  {formation.modules.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-eleo-gray-400 mb-1">{formation.modules.length} modules</p>
                    </div>
                  )}

                  <Link
                    href={`/formations/${formation.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-eleo-500 hover:text-eleo-600 transition-colors"
                  >
                    Voir le programme complet
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  );
}
