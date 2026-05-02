import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { COMPANY } from "@/config/company";

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-eleo-gray-800 mb-8">Politique de confidentialité</h1>
        <div className="space-y-6 text-eleo-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Responsable du traitement</h2>
            <p>{COMPANY.name}, {COMPANY.fullAddress}.</p>
            <p>Email : {COMPANY.email}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Données collectées</h2>
            <p>Nous collectons les données suivantes dans le cadre de nos activités de formation :</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Nom, prénom, email, téléphone</li>
              <li>Nom d&apos;entreprise, SIRET</li>
              <li>Objectifs professionnels et niveau</li>
              <li>Mode de financement envisagé</li>
              <li>Données de progression de formation</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Finalité du traitement</h2>
            <p>Les données sont utilisées pour :</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Traiter les demandes de devis</li>
              <li>Gérer les inscriptions et le suivi de formation</li>
              <li>Établir les documents administratifs (conventions, attestations)</li>
              <li>Constituer les dossiers de financement (OPCO, France Travail)</li>
              <li>Assurer le suivi pédagogique</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Base légale</h2>
            <p>Le traitement est basé sur l&apos;exécution contractuelle (formation professionnelle) et le consentement de la personne concernée.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Durée de conservation</h2>
            <p>Les données sont conservées pendant la durée de la relation commerciale, puis pendant la durée légale de conservation des documents de formation (5 ans minimum).</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Vos droits</h2>
            <p>Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression, de portabilité et d&apos;opposition concernant vos données personnelles.</p>
            <p className="mt-2">Pour exercer ces droits, contactez-nous à : <a href={`mailto:${COMPANY.email}`} className="text-eleo-500 hover:text-eleo-600">{COMPANY.email}</a></p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Sécurité</h2>
            <p>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données : mots de passe hashés, accès restreint par rôles, pas de stockage de données sensibles inutiles.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Cookies</h2>
            <p>Ce site utilise uniquement des cookies fonctionnels nécessaires à l&apos;authentification. Aucun cookie de tracking tiers n&apos;est utilisé.</p>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
