import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { COMPANY } from "@/config/company";
import {
  Monitor,
  Shield,
  Cpu,
  Bot,
  Wrench,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock,
  Euro,
} from "lucide-react";

const features = [
  {
    icon: Monitor,
    title: "Maintenance PC/Mac",
    description: "Diagnostic, nettoyage, remplacement SSD/RAM, sauvegarde, optimisation système.",
  },
  {
    icon: Shield,
    title: "Cybersécurité de base",
    description: "Phishing, mots de passe, MFA, ransomwares, bonnes pratiques pour TPE/PME.",
  },
  {
    icon: Bot,
    title: "IA pratique",
    description: "Utiliser l'IA pour analyser un symptôme, rédiger un rapport, créer une procédure.",
  },
  {
    icon: Wrench,
    title: "Atelier présentiel",
    description: "Démontage, remplacement composants, diagnostic réel sur cas clients anonymisés.",
  },
];

const advantages = [
  "Formation hybride : 80 % en ligne, 20 % en atelier à Aix-en-Provence",
  "Formateur expert terrain, pas un théoricien",
  "Financement OPCO possible selon éligibilité",
  "Paiement en fonds propres accepté",
  "Formation contractualisée et facturée",
  "Attestation de fin de formation",
  "Compatible préparation Qualiopi",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-eleo-50 via-white to-eleo-50 border-b border-eleo-gray-200">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #0170B9 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-eleo-50 border border-eleo-200 text-eleo-600 text-sm mb-6">
              <MapPin className="w-4 h-4" />
              Aix-en-Provence
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-eleo-gray-800 leading-tight tracking-tight">
              Formations professionnelles{" "}
              <span className="text-eleo-500">informatique, cybersécurité et IA</span>
            </h1>
            <p className="mt-6 text-lg text-eleo-gray-600 leading-relaxed max-w-2xl">
              {COMPANY.brandName} propose des formations hybrides courtes, concrètes et finançables.
              Maintenance PC/Mac, cybersécurité de base, IA pratique pour techniciens.
              Par un expert terrain, pas un théoricien.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/formations"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-eleo-500 hover:bg-eleo-600 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Voir les formations
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/devis"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-eleo-orange-500 hover:bg-eleo-orange-600 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Demander un devis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-eleo-gray-800">Nos domaines de formation</h2>
            <p className="mt-3 text-eleo-gray-500">
              Des compétences concrètes, directement applicables en entreprise
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl bg-white border border-eleo-gray-200 hover:border-eleo-300 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-eleo-50 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-eleo-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-eleo-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-eleo-gray-500">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Formation principale */}
      <section className="bg-eleo-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-eleo-orange-50 border border-eleo-orange-200 text-eleo-orange-600 text-sm mb-4 font-medium">
                <Cpu className="w-4 h-4" />
                Formation phare
              </div>
              <h2 className="text-3xl font-bold text-eleo-gray-800 mb-4">
                Technicien informatique IA-augmenté
              </h2>
              <p className="text-eleo-gray-600 mb-6 leading-relaxed">
                Diagnostic, maintenance PC/Mac et cybersécurité de base.
                Une formation hybride complète pour devenir autonome sur le terrain,
                avec des outils IA en support.
              </p>
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-eleo-gray-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-eleo-500" />
                  35h ou 70h
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-eleo-500" />
                  Hybride : en ligne + atelier
                </div>
                <div className="flex items-center gap-1.5">
                  <Euro className="w-4 h-4 text-eleo-500" />
                  Finançable OPCO
                </div>
              </div>
              <Link
                href="/formations/technicien-informatique-ia-augmente"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-eleo-500 hover:bg-eleo-600 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Voir le programme complet
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {advantages.map((item) => (
                <div key={item} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-eleo-gray-200">
                  <CheckCircle2 className="w-5 h-5 text-eleo-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-eleo-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Financement */}
      <section className="bg-white py-16 sm:py-20 border-t border-eleo-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-eleo-gray-800 mb-4">Modes de financement acceptés</h2>
          <p className="text-eleo-gray-500 mb-10 max-w-2xl mx-auto">
            Toutes nos formations sont contractualisées et facturées.
            Plusieurs modes de financement sont possibles.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Entreprise", desc: "Facture directe à l'entreprise" },
              { title: "OPCO", desc: "Prise en charge par votre OPCO" },
              { title: "France Travail", desc: "Si financé et contractualisé" },
              { title: "Fonds propres", desc: "Paiement personnel accepté" },
            ].map((mode) => (
              <div key={mode.title} className="p-5 rounded-xl bg-eleo-gray-50 border border-eleo-gray-200 hover:border-eleo-300 transition-colors">
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-eleo-50 flex items-center justify-center">
                  <Euro className="w-6 h-6 text-eleo-500" />
                </div>
                <h3 className="font-semibold text-eleo-gray-800 mb-1">{mode.title}</h3>
                <p className="text-sm text-eleo-gray-500">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-eleo-600 via-eleo-500 to-eleo-orange-500" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à monter en compétence ?
          </h2>
          <p className="text-white/90 mb-8">
            Demandez un devis personnalisé. Nous répondons sous 48 heures.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-eleo-50 text-eleo-600 font-semibold rounded-lg transition-colors text-lg shadow-lg"
          >
            Demander un devis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
