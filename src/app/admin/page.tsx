import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/ui/stats-card";
import { Badge } from "@/components/ui/badge";
import { PROSPECT_STATUSES, FUNDING_MODES } from "@/config/company";
import { formatDateTime } from "@/lib/utils";
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  CalendarDays,
  FileText,
  ClipboardCheck,
  Euro,
  Building2,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [
    totalProspects,
    validProspects,
    refusedProspects,
    fondsPropres,
    entreprise,
    opco,
    franceTravail,
    formations,
    activeSessions,
    learners,
    opcoDocsPending,
    qualiopiPending,
    companies,
  ] = await Promise.all([
    prisma.prospect.count(),
    prisma.prospect.count({ where: { autoRefused: false } }),
    prisma.prospect.count({ where: { autoRefused: true } }),
    prisma.prospect.count({ where: { status: "PROSPECT_FONDS_PROPRES" } }),
    prisma.prospect.count({ where: { status: "PROSPECT_ENTREPRISE" } }),
    prisma.prospect.count({ where: { status: "PROSPECT_OPCO" } }),
    prisma.prospect.count({ where: { status: "PROSPECT_FRANCE_TRAVAIL" } }),
    prisma.formation.count({ where: { status: "PUBLIEE" } }),
    prisma.session.count({ where: { status: { in: ["OUVERTE", "COMPLETE"] } } }),
    prisma.learner.count(),
    prisma.oPCODocument.count({ where: { status: { not: "VALIDE" } } }),
    prisma.qualiopiItem.count({ where: { status: { in: ["A_FAIRE", "EN_COURS"] } } }),
    prisma.company.count(),
  ]);

  const recentProspects = await prisma.prospect.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Tableau de bord
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bienvenue, {user.firstName}. Vue d&apos;ensemble de l&apos;activité Eleo Formation.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Prospects total" value={totalProspects} icon={<Users className="w-6 h-6" />} />
        <StatsCard title="Prospects valides" value={validProspects} icon={<UserCheck className="w-6 h-6" />} />
        <StatsCard title="Refus automatiques" value={refusedProspects} icon={<UserX className="w-6 h-6" />} />
        <StatsCard title="Formations actives" value={formations} icon={<GraduationCap className="w-6 h-6" />} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Sessions ouvertes" value={activeSessions} icon={<CalendarDays className="w-6 h-6" />} />
        <StatsCard title="Apprenants" value={learners} icon={<Users className="w-6 h-6" />} />
        <StatsCard title="Entreprises" value={companies} icon={<Building2 className="w-6 h-6" />} />
        <StatsCard title="Docs OPCO en attente" value={opcoDocsPending} icon={<FileText className="w-6 h-6" />} />
      </div>

      {/* Prospects by type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Fonds propres" value={fondsPropres} icon={<Euro className="w-6 h-6" />} />
        <StatsCard title="Entreprise payeur" value={entreprise} icon={<Building2 className="w-6 h-6" />} />
        <StatsCard title="OPCO" value={opco} icon={<Briefcase className="w-6 h-6" />} />
        <StatsCard title="France Travail" value={franceTravail} icon={<Briefcase className="w-6 h-6" />} />
      </div>

      {/* Alerts */}
      {(qualiopiPending > 0 || opcoDocsPending > 0) && (
        <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/10 dark:border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-amber-700 dark:text-amber-400">Alertes administratives</h3>
          </div>
          <ul className="text-sm text-amber-600 dark:text-amber-300 space-y-1">
            {qualiopiPending > 0 && (
              <li>
                <Link href="/admin/qualiopi" className="hover:underline">
                  {qualiopiPending} critère(s) Qualiopi à compléter
                </Link>
              </li>
            )}
            {opcoDocsPending > 0 && (
              <li>
                <Link href="/admin/opco" className="hover:underline">
                  {opcoDocsPending} document(s) OPCO en attente
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Recent prospects */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Derniers prospects</h2>
          <Link href="/admin/crm" className="text-sm text-cyan-600 hover:text-cyan-500">
            Voir tout &rarr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Nom</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Email</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Financement</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Statut</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentProspects.map((prospect) => (
                <tr key={prospect.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">
                    {prospect.firstName} {prospect.lastName}
                  </td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{prospect.email}</td>
                  <td className="px-6 py-3">
                    <span className="text-slate-600 dark:text-slate-300">
                      {FUNDING_MODES[prospect.fundingMode as keyof typeof FUNDING_MODES] || prospect.fundingMode}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={prospect.autoRefused ? "danger" : "success"}>
                      {PROSPECT_STATUSES[prospect.status as keyof typeof PROSPECT_STATUSES] || prospect.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(prospect.createdAt)}</td>
                </tr>
              ))}
              {recentProspects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Aucun prospect pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
