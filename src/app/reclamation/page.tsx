"use client";

import { useState } from "react";
import { CheckCircle2, Send, MessageSquareWarning } from "lucide-react";

const CATEGORIES = [
  { value: "ORGANISATION", label: "Organisation (horaires, lieux, accueil)" },
  { value: "CONTENU", label: "Contenu pédagogique de la formation" },
  { value: "ACCESSIBILITE", label: "Accessibilité (handicap, locaux, supports)" },
  { value: "FACTURATION", label: "Facturation, devis, OPCO" },
  { value: "AUTRE", label: "Autre" },
];

export default function ReclamationPublicPage() {
  const [form, setForm] = useState({
    reporterName: "",
    reporterEmail: "",
    reporterRole: "APPRENANT",
    category: "ORGANISATION",
    severity: "MOYENNE",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reclamations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSubmitted(true);
      else alert("Erreur lors de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-eleo-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-eleo-gray-200 p-8 max-w-md text-center shadow-sm">
          <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
          <h1 className="text-xl font-bold text-eleo-gray-800 mb-2">Réclamation enregistrée</h1>
          <p className="text-sm text-eleo-gray-600">
            Nous avons bien reçu votre message. Nous nous engageons à vous répondre par écrit sous <strong>15 jours ouvrés</strong> à l'adresse indiquée.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eleo-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-eleo-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquareWarning className="w-7 h-7 text-eleo-500" />
            <h1 className="text-2xl font-bold text-eleo-gray-800">Formuler une réclamation</h1>
          </div>
          <p className="text-sm text-eleo-gray-600 mb-6">
            Eleo Formation s'engage à traiter chaque réclamation. Une réponse écrite vous sera adressée sous <strong>15 jours ouvrés maximum</strong>. Toutes les informations restent confidentielles.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-eleo-gray-600 mb-1">Nom complet *</label>
                <input
                  required
                  value={form.reporterName}
                  onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
                  className="w-full px-3 py-2 border border-eleo-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-eleo-gray-600 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={form.reporterEmail}
                  onChange={(e) => setForm({ ...form, reporterEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-eleo-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-eleo-gray-600 mb-1">Vous êtes</label>
                <select
                  value={form.reporterRole}
                  onChange={(e) => setForm({ ...form, reporterRole: e.target.value })}
                  className="w-full px-3 py-2 border border-eleo-gray-300 rounded-lg text-sm"
                >
                  <option value="APPRENANT">Apprenant / stagiaire</option>
                  <option value="ENTREPRISE">Entreprise cliente</option>
                  <option value="FORMATEUR">Formateur</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-eleo-gray-600 mb-1">Sévérité ressentie</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-eleo-gray-300 rounded-lg text-sm"
                >
                  <option value="FAIBLE">Faible — remarque</option>
                  <option value="MOYENNE">Moyenne — gêne</option>
                  <option value="ELEVEE">Élevée — préjudice</option>
                  <option value="CRITIQUE">Critique — urgence</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-eleo-gray-600 mb-1">Catégorie *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-eleo-gray-300 rounded-lg text-sm"
              >
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-eleo-gray-600 mb-1">Description précise *</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={6}
                placeholder="Décrivez les faits, les dates, les personnes concernées et l'issue souhaitée."
                className="w-full px-3 py-2 border border-eleo-gray-300 rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-eleo-500 hover:bg-eleo-600 text-white font-semibold rounded-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Envoi..." : "Envoyer ma réclamation"}
            </button>
          </form>

          <p className="text-xs text-eleo-gray-500 mt-6 pt-4 border-t border-eleo-gray-200">
            Si vous préférez : email à <a href="mailto:eleo.informatique@gmail.com" className="text-eleo-500 underline">eleo.informatique@gmail.com</a> ou téléphone au <a href="tel:0442290665" className="text-eleo-500 underline">04 42 29 06 65</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
