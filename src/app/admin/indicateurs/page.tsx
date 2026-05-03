import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Users, Star, ThumbsUp, CheckCircle2, AlertCircle, Award } from "lucide-react";

export default async function IndicateursPage() {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) redirect("/login");

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [
    totalLearners,
    totalEnrollments,
    completedEnrollments,
    totalSessions,
    totalQuizAttempts,
    passedQuiz,
    satisfactionResponses,
    complaints,
    openComplaints,
    formations,
  ] = await Promise.all([
    prisma.learner.count(),
    prisma.enrollment.count({ where: { enrolledAt: { gte: yearStart } } }),
    prisma.enrollment.count({ where: { status: "TERMINE", enrolledAt: { gte: yearStart } } }),
    prisma.session.count({ where: { status: "TERMINEE", startDate: { gte: yearStart } } }),
    prisma.quizAttempt.count({ where: { completedAt: { gte: yearStart, not: null } } }),
    prisma.quizAttempt.count({ where: { passed: true, completedAt: { gte: yearStart, not: null } } }),
    prisma.satisfactionResponse.findMany({ where: { submittedAt: { gte: yearStart } } }),
    prisma.complaint.count({ where: { createdAt: { gte: yearStart } } }),
    prisma.complaint.count({ where: { status: { in: ["OUVERT", "EN_TRAITEMENT"] } } }),
    prisma.formation.count({ where: { status: "PUBLIEE" } }),
  ]);

  const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
  const successRate = totalQuizAttempts > 0 ? Math.round((passedQuiz / totalQuizAttempts) * 100) : 0;
  const avgRating = satisfactionResponses.length > 0
    ? (satisfactionResponses.reduce((acc, r) => acc + (r.rating || 0), 0) / satisfactionResponses.filter((r) => r.rating != null).length).toFixed(1)
    : "—";
  const recommendRate = satisfactionResponses.length > 0
    ? Math.round((satisfactionResponses.filter((r) => r.recommend).length / satisfactionResponses.length) * 100)
    : 0;
  const chaudResponses = satisfactionResponses.filter((r) => r.type === "CHAUD").length;
  const froidResponses = satisfactionResponses.filter((r) => r.type === "FROID").length;

  const indicators = [
    { label: "Apprenants formés (cumul)", value: totalLearners.toString(), icon: Users, color: "text-cyan-400", critere: "—" },
    { label: "Inscriptions cette année", value: totalEnrollments.toString(), icon: TrendingUp, color: "text-emerald-400", critere: "C7-I32" },
    { label: "Sessions terminées", value: totalSessions.toString(), icon: CheckCircle2, color: "text-blue-400", critere: "—" },
    { label: "Taux de complétion", value: `${completionRate}%`, icon: CheckCircle2, color: "text-emerald-400", critere: "C7-I32", target: ">= 80%" },
    { label: "Taux de réussite quiz", value: `${successRate}%`, icon: Award, color: "text-purple-400", critere: "C7-I32", target: ">= 70%" },
    { label: "Note de satisfaction moyenne", value: `${avgRating}/5`, icon: Star, color: "text-amber-400", critere: "C7-I31", target: ">= 4.0" },
    { label: "Taux de recommandation", value: `${recommendRate}%`, icon: ThumbsUp, color: "text-emerald-400", critere: "C7-I31", target: ">= 80%" },
    { label: "Réclamations ouvertes", value: openComplaints.toString(), icon: AlertCircle, color: openComplaints > 0 ? "text-rose-400" : "text-slate-400", critere: "C7-I30", target: "0 non traitées" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-cyan-400" />
          Indicateurs de résultats {now.getFullYear()}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Tableau de bord pour Qualiopi (Critère 7 indicateurs 30, 31, 32). À publier sur le site et à présenter en audit.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((ind) => {
          const Icon = ind.icon;
          return (
            <div key={ind.label} className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <div className="flex items-start justify-between mb-2">
                <Icon className={`w-6 h-6 ${ind.color}`} />
                <span className="text-[10px] font-mono text-slate-500">{ind.critere}</span>
              </div>
              <div className="text-2xl font-bold text-slate-100">{ind.value}</div>
              <div className="text-xs text-slate-400 mt-1">{ind.label}</div>
              {ind.target && (
                <div className="text-[10px] text-slate-500 mt-1">Objectif : {ind.target}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Satisfaction — recueil
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between text-slate-300">
              <span>Évaluations à chaud</span>
              <span className="font-mono">{chaudResponses}</span>
            </li>
            <li className="flex justify-between text-slate-300">
              <span>Évaluations à froid (3-6 mois)</span>
              <span className="font-mono">{froidResponses}</span>
            </li>
            <li className="flex justify-between text-slate-300">
              <span>Total répondants</span>
              <span className="font-mono">{satisfactionResponses.length}</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Réclamations cette année
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between text-slate-300">
              <span>Total reçues</span>
              <span className="font-mono">{complaints}</span>
            </li>
            <li className="flex justify-between text-slate-300">
              <span>Encore ouvertes</span>
              <span className={`font-mono ${openComplaints > 0 ? "text-rose-400" : "text-emerald-400"}`}>{openComplaints}</span>
            </li>
          </ul>
          <Link href="/admin/reclamations" className="text-xs text-cyan-400 hover:underline mt-3 inline-block">
            Voir le registre →
          </Link>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Snapshot Qualiopi</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">{formations}</div>
            <div className="text-xs text-slate-400">Formations publiées</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{totalSessions}</div>
            <div className="text-xs text-slate-400">Sessions {now.getFullYear()}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{totalLearners}</div>
            <div className="text-xs text-slate-400">Apprenants formés</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{avgRating}/5</div>
            <div className="text-xs text-slate-400">Satisfaction moyenne</div>
          </div>
        </div>
      </div>
    </div>
  );
}
