import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/config/company";
import { CheckCircle2, Star, Users, ThumbsUp, Award, Shield, BookOpen } from "lucide-react";

export const metadata = {
  title: `Qualité & indicateurs — ${COMPANY.brandName}`,
  description: "Engagement qualité, indicateurs de résultats et démarche d'amélioration continue d'Eleo Formation.",
};

export default async function QualitePage() {
  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const [
    totalLearners,
    totalEnrollments,
    completedEnrollments,
    satisfactionResponses,
    complaints,
    resolvedComplaints,
  ] = await Promise.all([
    prisma.learner.count(),
    prisma.enrollment.count({ where: { enrolledAt: { gte: yearStart } } }),
    prisma.enrollment.count({ where: { status: "TERMINE", enrolledAt: { gte: yearStart } } }),
    prisma.satisfactionResponse.findMany({ where: { submittedAt: { gte: yearStart } } }),
    prisma.complaint.count({ where: { createdAt: { gte: yearStart } } }),
    prisma.complaint.count({ where: { status: { in: ["RESOLU", "CLOS"] }, createdAt: { gte: yearStart } } }),
  ]);

  const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : null;
  const ratedResponses = satisfactionResponses.filter((r) => r.rating != null);
  const avgRating = ratedResponses.length > 0
    ? (ratedResponses.reduce((acc, r) => acc + (r.rating || 0), 0) / ratedResponses.length).toFixed(1)
    : null;
  const recommendRate = satisfactionResponses.length > 0
    ? Math.round((satisfactionResponses.filter((r) => r.recommend).length / satisfactionResponses.length) * 100)
    : null;
  const complaintTreatmentRate = complaints > 0 ? Math.round((resolvedComplaints / complaints) * 100) : 100;

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-eleo-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-wider text-eleo-500 mb-2">Engagement qualité</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-eleo-gray-800 mb-4">Notre démarche qualité</h1>
          <p className="text-eleo-gray-600 text-lg max-w-3xl">
            Eleo Formation s'engage dans une démarche d'amélioration continue. Voici nos indicateurs de résultats publiés en toute transparence, conformément aux exigences du Référentiel National Qualité (Qualiopi).
          </p>
        </header>

        {/* Bandeau Qualiopi en cours / certif (à activer après audit) */}
        <div className="bg-gradient-to-r from-eleo-50 to-white border border-eleo-200 rounded-xl p-5 mb-8 flex items-start gap-4">
          <Shield className="w-10 h-10 text-eleo-500 flex-shrink-0" />
          <div>
            <h2 className="font-bold text-eleo-gray-800 mb-1">Certification qualité</h2>
            <p className="text-sm text-eleo-gray-600">
              Eleo Formation prépare actuellement sa certification <strong>Qualiopi</strong> pour les actions de formation. L'organisme est déclaré auprès de la DREETS Provence-Alpes-Côte d'Azur sous le numéro de déclaration d'activité [NDA en cours].
            </p>
          </div>
        </div>

        {/* Indicateurs résultats */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-eleo-gray-800 mb-2">Indicateurs de résultats {year}</h2>
          <p className="text-sm text-eleo-gray-500 mb-6">
            Données mises à jour en continu — Critère 7 du Référentiel National Qualité (indicateurs 30, 31, 32).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Indicator
              icon={Users}
              value={totalLearners}
              label="Apprenants formés"
              sublabel="Cumul depuis le démarrage"
              color="text-cyan-600 bg-cyan-50"
            />
            <Indicator
              icon={CheckCircle2}
              value={completionRate != null ? `${completionRate}%` : "—"}
              label="Taux de complétion"
              sublabel={`${completedEnrollments}/${totalEnrollments} inscriptions ${year}`}
              color="text-emerald-600 bg-emerald-50"
              empty={totalEnrollments === 0}
            />
            <Indicator
              icon={Star}
              value={avgRating ? `${avgRating}/5` : "—"}
              label="Note de satisfaction"
              sublabel={`${satisfactionResponses.length} évaluations recueillies`}
              color="text-amber-600 bg-amber-50"
              empty={satisfactionResponses.length === 0}
            />
            <Indicator
              icon={ThumbsUp}
              value={recommendRate != null ? `${recommendRate}%` : "—"}
              label="Recommanderaient la formation"
              sublabel="Stagiaires interrogés"
              color="text-emerald-600 bg-emerald-50"
              empty={satisfactionResponses.length === 0}
            />
            <Indicator
              icon={Award}
              value={`${complaintTreatmentRate}%`}
              label="Réclamations traitées"
              sublabel={`${resolvedComplaints}/${complaints} en ${year}`}
              color="text-purple-600 bg-purple-50"
            />
            <Indicator
              icon={BookOpen}
              value={totalEnrollments}
              label="Inscriptions"
              sublabel={`Année ${year}`}
              color="text-blue-600 bg-blue-50"
            />
          </div>

          {(satisfactionResponses.length === 0 || totalEnrollments === 0) && (
            <p className="mt-4 text-xs text-eleo-gray-500 italic">
              * Indicateurs en construction — l'organisme accueille ses premiers stagiaires. Les valeurs définitives seront publiées dès consolidation.
            </p>
          )}
        </section>

        {/* Engagements */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-eleo-gray-800 mb-4">Nos engagements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Information transparente", text: "Programme détaillé, prix HT, durées, modalités d'accès, accessibilité handicap : tout est public sur chaque fiche formation." },
              { title: "Adaptation à chaque apprenant", text: "Questionnaire de positionnement préalable obligatoire pour adapter le parcours au niveau et aux objectifs." },
              { title: "Suivi individuel rigoureux", text: "Une fiche de suivi est tenue pour chaque apprenant : leçons réalisées, quiz validés, notes du formateur." },
              { title: "Recueil systématique des avis", text: "Évaluations à chaud en fin de session et à froid (3-6 mois) pour mesurer l'impact réel sur la pratique professionnelle." },
              { title: "Traitement des réclamations", text: "Toute réclamation reçoit une réponse écrite sous 15 jours ouvrés. Procédure formalisée et registre tenu à jour." },
              { title: "Petit groupe = qualité", text: "Maximum 6 à 8 apprenants par session. Chacun bénéficie d'un suivi personnalisé et d'aménagements adaptés." },
            ].map((e) => (
              <div key={e.title} className="bg-white rounded-xl border border-eleo-gray-200 p-5">
                <h3 className="font-semibold text-eleo-gray-800 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  {e.title}
                </h3>
                <p className="text-sm text-eleo-gray-600">{e.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Réclamations */}
        <section className="bg-white rounded-2xl border border-eleo-gray-200 p-6">
          <h2 className="text-xl font-bold text-eleo-gray-800 mb-2">Une remarque, une réclamation ?</h2>
          <p className="text-sm text-eleo-gray-600 mb-4">
            Vous pouvez nous contacter directement par téléphone, par email ou via notre formulaire dédié. Nous nous engageons à vous répondre par écrit sous 15 jours ouvrés.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/reclamation"
              className="inline-flex items-center gap-2 px-4 py-2 bg-eleo-500 hover:bg-eleo-600 text-white font-semibold rounded-lg text-sm"
            >
              Formulaire de réclamation
            </a>
            <a
              href={`mailto:${COMPANY.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-eleo-gray-300 hover:bg-eleo-gray-50 text-eleo-gray-700 font-semibold rounded-lg text-sm"
            >
              {COMPANY.email}
            </a>
            <a
              href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-eleo-gray-300 hover:bg-eleo-gray-50 text-eleo-gray-700 font-semibold rounded-lg text-sm"
            >
              {COMPANY.phone}
            </a>
          </div>
        </section>

        {/* Référent handicap */}
        <section className="mt-6 bg-eleo-50 rounded-2xl border border-eleo-200 p-6">
          <h2 className="text-lg font-bold text-eleo-gray-800 mb-2">Accessibilité aux personnes en situation de handicap</h2>
          <p className="text-sm text-eleo-gray-700">
            Eleo Formation s'engage à rendre ses formations accessibles. Salle PMR, supports en gros caractères sur demande, vidéos sous-titrées, aménagements possibles selon vos besoins.
          </p>
          <p className="text-sm text-eleo-gray-700 mt-2">
            <strong>Référent handicap :</strong> {COMPANY.name} — {COMPANY.phone} — {COMPANY.email}
          </p>
        </section>
      </div>
    </div>
  );
}

function Indicator({
  icon: Icon,
  value,
  label,
  sublabel,
  color,
  empty,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  sublabel: string;
  color: string;
  empty?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-eleo-gray-200 p-5">
      <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-3xl font-bold text-eleo-gray-800 mb-1">
        {empty ? "—" : value}
      </div>
      <div className="text-sm font-semibold text-eleo-gray-700">{label}</div>
      <div className="text-xs text-eleo-gray-500 mt-1">{sublabel}</div>
    </div>
  );
}
