import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileSpreadsheet, Calendar, Download } from "lucide-react";

export default async function BPFPage() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear];

  const stats = await Promise.all(
    years.map(async (year) => {
      const start = new Date(year, 0, 1);
      const end = new Date(year + 1, 0, 1);

      const enrollments = await prisma.enrollment.findMany({
        where: { enrolledAt: { gte: start, lt: end } },
        include: { session: { include: { formation: true } } },
      });

      const sessions = await prisma.session.count({ where: { startDate: { gte: start, lt: end } } });
      const totalLearners = new Set(enrollments.map((e) => e.learnerId)).size;
      const totalStagiairesH = enrollments.reduce((acc, e) => acc + e.session.formation.duration, 0);

      const entry = await prisma.bPFEntry.findUnique({ where: { year } });

      return { year, sessions, totalLearners, totalStagiairesH, entry };
    }),
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
          BPF — Bilan Pédagogique et Financier
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Déclaration annuelle obligatoire avant le <strong>30 avril N+1</strong> sur{" "}
          <a href="https://www.monactiviteformation.emploi.gouv.fr/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">monactiviteformation.emploi.gouv.fr</a>.
        </p>
      </header>

      <div className="bg-amber-950/40 border border-amber-800 rounded-xl p-4 text-sm text-amber-200">
        <strong>Rappel :</strong> Le BPF est un Cerfa 10443 obligatoire, à remplir en ligne sur la plateforme officielle. Cette page agrège les données chiffrées calculables depuis l'app pour faciliter votre déclaration. <strong>Les chiffres financiers (CA, financements) doivent être saisis manuellement</strong> à partir de votre comptabilité.
      </div>

      <div className="space-y-4">
        {stats.map((s) => (
          <div key={s.year} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Année {s.year}
              </h2>
              {s.entry?.declared && (
                <span className="text-xs px-2 py-1 bg-emerald-900/40 text-emerald-300 rounded">DÉCLARÉ</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-800 rounded p-3">
                <div className="text-xs text-slate-400">Sessions</div>
                <div className="text-2xl font-bold text-slate-100">{s.sessions}</div>
              </div>
              <div className="bg-slate-800 rounded p-3">
                <div className="text-xs text-slate-400">Apprenants distincts</div>
                <div className="text-2xl font-bold text-slate-100">{s.totalLearners}</div>
              </div>
              <div className="bg-slate-800 rounded p-3">
                <div className="text-xs text-slate-400">Heures stagiaires</div>
                <div className="text-2xl font-bold text-slate-100">{s.totalStagiairesH}</div>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p><strong>Heures stagiaires</strong> = somme des durées de formation × nombre d'apprenants inscrits dans l'année.</p>
              <p>À reporter dans <strong>Section A — Activité du dispensateur de formation</strong> du BPF.</p>
            </div>

            <div className="flex gap-2 mt-4">
              <Link
                href={`/api/bpf/${s.year}/csv`}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-sm"
              >
                <Download className="w-4 h-4" />
                Export CSV (synthèse {s.year})
              </Link>
              <a
                href="https://www.monactiviteformation.emploi.gouv.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm"
              >
                Déclarer sur la plateforme officielle →
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Sections du BPF (Cerfa 10443)</h3>
        <ul className="space-y-1.5 text-xs text-slate-400">
          <li>• <strong>Section A</strong> : Identité de l'organisme et activité (sessions, apprenants, heures stagiaires)</li>
          <li>• <strong>Section B</strong> : Données économiques et financières (CA, financements par catégorie)</li>
          <li>• <strong>Section C</strong> : Caractéristiques des formations (publics, formats)</li>
          <li>• <strong>Section D</strong> : Personnel formateur (interne, externe, vacataires)</li>
          <li>• <strong>Section E</strong> : Sous-traitance (le cas échéant)</li>
        </ul>
      </div>
    </div>
  );
}
