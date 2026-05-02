import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { COMPANY, CONDITIONS_ACCUEIL, REFUSAL_MESSAGE_LONG } from "@/config/company";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default function ConditionsAccueilPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-eleo-gray-800 mb-8">Conditions d&apos;accueil</h1>

        <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 mb-10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-700 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-amber-700 mb-3">Information importante</h2>
              <p className="text-eleo-gray-700 whitespace-pre-line leading-relaxed">{CONDITIONS_ACCUEIL}</p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-semibold text-eleo-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Demandes acceptées
          </h2>
          <div className="space-y-2">
            {[
              "Entreprises souhaitant former un salarié",
              "Salariés de TPE/PME",
              "Dirigeants de petites entreprises",
              "Indépendants finançant leur montée en compétence",
              "Techniciens informatiques débutants déjà en poste",
              "Formations financées par OPCO",
              "Formations financées par France Travail (si contractualisées et financées)",
              "Professionnels payant en fonds propres",
              "Professionnels en reconversion avec budget personnel",
              "Particuliers sérieux prêts à payer la formation",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-eleo-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-semibold text-eleo-gray-800 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-eleo-500" />
            Demandes non traitées
          </h2>
          <div className="space-y-2">
            {[
              "Demandes d'apprentissage",
              "Demandes d'alternance",
              "Demandes de stage",
              "Demandes d'immersion gratuite",
              "Demandes de PMSMP gratuite",
              "Candidatures spontanées non financées",
              "Candidatures d'emploi chez Eleo",
              "Demandes de formation gratuite \"sur le tas\"",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <XCircle className="w-4 h-4 text-eleo-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-eleo-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-eleo-gray-50 border border-eleo-gray-200">
          <h3 className="text-lg font-semibold text-eleo-gray-800 mb-3">Modèle de réponse type</h3>
          <p className="text-sm text-eleo-gray-600 whitespace-pre-line">{REFUSAL_MESSAGE_LONG}</p>
          <p className="text-sm text-eleo-gray-500 mt-4">Cordialement,<br />{COMPANY.name}</p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
