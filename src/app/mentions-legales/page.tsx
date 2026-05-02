import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { COMPANY } from "@/config/company";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-eleo-gray-800 mb-8">Mentions légales</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-eleo-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Éditeur du site</h2>
            <p>{COMPANY.name}</p>
            <p>Forme juridique : {COMPANY.legalForm}</p>
            <p>Adresse : {COMPANY.fullAddress}</p>
            <p>Téléphone : {COMPANY.phone}</p>
            <p>Email : {COMPANY.email}</p>
            <p>SIRET : {COMPANY.siret}</p>
            <p>TVA intracommunautaire : {COMPANY.tvaIntra}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Directeur de la publication</h2>
            <p>Lucas — Gérant d&apos;Eleo Informatique</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Hébergement</h2>
            <p>Ce site est hébergé en interne ou chez un prestataire à définir.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Propriété intellectuelle</h2>
            <p>L&apos;ensemble des contenus de ce site (textes, images, programmes de formation) sont la propriété d&apos;{COMPANY.name} et ne peuvent être reproduits sans autorisation écrite.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Activité de formation</h2>
            <p>{COMPANY.brandName} est une activité de formation professionnelle portée par {COMPANY.name}.</p>
            <p>Les formations proposées sont des formations professionnelles courtes, structurées, facturées et finançables.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-eleo-gray-800 mb-2">Données personnelles</h2>
            <p>Consultez notre <a href="/politique-confidentialite" className="text-eleo-500 hover:text-eleo-600">politique de confidentialité</a> pour en savoir plus sur le traitement de vos données personnelles.</p>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
