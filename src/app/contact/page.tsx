import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { COMPANY, CONDITIONS_ACCUEIL } from "@/config/company";
import { Phone, Mail, MapPin, Clock, AlertTriangle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-eleo-gray-800 mb-4">Contact</h1>
        <p className="text-eleo-gray-500 mb-10">
          Pour toute demande de formation professionnelle, contactez-nous par email ou téléphone.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-white shadow-sm border border-eleo-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="w-5 h-5 text-eleo-500" />
                <h3 className="font-semibold text-eleo-gray-800">Téléphone</h3>
              </div>
              <p className="text-eleo-gray-700">{COMPANY.phone}</p>
              <p className="text-eleo-gray-700">{COMPANY.mobile}</p>
            </div>

            <div className="p-5 rounded-xl bg-white shadow-sm border border-eleo-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-eleo-500" />
                <h3 className="font-semibold text-eleo-gray-800">Email</h3>
              </div>
              <a href={`mailto:${COMPANY.email}`} className="text-eleo-500 hover:text-eleo-600">
                {COMPANY.email}
              </a>
            </div>

            <div className="p-5 rounded-xl bg-white shadow-sm border border-eleo-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-eleo-500" />
                <h3 className="font-semibold text-eleo-gray-800">Adresse</h3>
              </div>
              <p className="text-eleo-gray-700">{COMPANY.name}</p>
              <p className="text-eleo-gray-700">{COMPANY.address}</p>
              <p className="text-eleo-gray-700">{COMPANY.postalCode} {COMPANY.city}</p>
            </div>

            <div className="p-5 rounded-xl bg-white shadow-sm border border-eleo-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-eleo-500" />
                <h3 className="font-semibold text-eleo-gray-800">Horaires</h3>
              </div>
              <p className="text-eleo-gray-700">Lundi au vendredi : 9h — 18h</p>
              <p className="text-sm text-eleo-gray-500 mt-1">Ateliers sur rendez-vous uniquement</p>
            </div>
          </div>

          <div>
            <div className="p-5 rounded-xl bg-white shadow-sm border border-eleo-gray-200 mb-6">
              <h3 className="font-semibold text-eleo-gray-800 mb-3">Informations entreprise</h3>
              <div className="space-y-2 text-sm text-eleo-gray-700">
                <p><span className="text-eleo-gray-500">Raison sociale :</span> {COMPANY.name}</p>
                <p><span className="text-eleo-gray-500">Forme juridique :</span> {COMPANY.legalForm}</p>
                <p><span className="text-eleo-gray-500">SIRET :</span> {COMPANY.siret}</p>
                <p><span className="text-eleo-gray-500">TVA intracommunautaire :</span> {COMPANY.tvaIntra}</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-700 mb-2">Conditions d&apos;accueil</h3>
                  <p className="text-sm text-eleo-gray-500 whitespace-pre-line">{CONDITIONS_ACCUEIL}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
