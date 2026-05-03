import Link from "next/link";
import { COMPANY } from "@/config/company";
import { Monitor, Phone, Mail, MapPin } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-eleo-gray-700 text-white relative">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-eleo-500 via-eleo-500 to-eleo-orange-500" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-6 h-6 text-eleo-300" />
              <span className="text-lg font-bold text-white">{COMPANY.brandName}</span>
            </div>
            <p className="text-sm text-eleo-gray-200 mb-4">
              Formations professionnelles en informatique, cybersécurité et IA pratique.
              Par {COMPANY.name}, expert terrain à Aix-en-Provence.
            </p>
            <div className="space-y-2 text-sm text-eleo-gray-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-eleo-300" />
                {COMPANY.fullAddress}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-eleo-300" />
                {COMPANY.phone}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-eleo-300" />
                {COMPANY.email}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/formations" className="text-eleo-gray-200 hover:text-eleo-300 transition-colors">Catalogue des formations</Link></li>
              <li><Link href="/devis" className="text-eleo-gray-200 hover:text-eleo-300 transition-colors">Demande de devis</Link></li>
              <li><Link href="/contact" className="text-eleo-gray-200 hover:text-eleo-300 transition-colors">Contact</Link></li>
              <li><Link href="/conditions-accueil" className="text-eleo-gray-200 hover:text-eleo-300 transition-colors">Conditions d&apos;accueil</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Qualité & légal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/qualite" className="text-eleo-gray-200 hover:text-eleo-300 transition-colors">Indicateurs qualité</Link></li>
              <li><Link href="/reclamation" className="text-eleo-gray-200 hover:text-eleo-300 transition-colors">Faire une réclamation</Link></li>
              <li><Link href="/mentions-legales" className="text-eleo-gray-200 hover:text-eleo-300 transition-colors">Mentions légales</Link></li>
              <li><Link href="/politique-confidentialite" className="text-eleo-gray-200 hover:text-eleo-300 transition-colors">Politique de confidentialité</Link></li>
            </ul>
            <div className="mt-4 text-xs text-eleo-gray-300">
              <p>SIRET : {COMPANY.siret}</p>
              <p>TVA : {COMPANY.tvaIntra}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-eleo-gray-600 text-center text-xs text-eleo-gray-300">
          <p>&copy; {new Date().getFullYear()} {COMPANY.name}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
