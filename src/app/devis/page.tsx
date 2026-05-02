"use client";

import { useState } from "react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { COMPANY, FUNDING_MODES, REFUSAL_MESSAGE, REFUSED_FUNDING_MODES } from "@/config/company";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Send } from "lucide-react";

const fundingOptions = Object.entries(FUNDING_MODES).map(([value, label]) => ({
  value,
  label,
}));

const formatOptions = [
  { value: "DISTANCE", label: "À distance (en ligne)" },
  { value: "PRESENTIEL", label: "En présentiel à Aix-en-Provence" },
  { value: "HYBRIDE", label: "Hybride (en ligne + atelier)" },
];

const levelOptions = [
  { value: "DEBUTANT", label: "Débutant" },
  { value: "INTERMEDIAIRE", label: "Intermédiaire" },
  { value: "AVANCE", label: "Avancé" },
];

export default function DevisPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    companySiret: "",
    professionalGoal: "",
    formationTitle: "",
    currentLevel: "",
    preferredFormat: "",
    idealDelay: "",
    message: "",
    fundingMode: "",
  });

  const [status, setStatus] = useState<"idle" | "refused" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isRefused = (REFUSED_FUNDING_MODES as readonly string[]).includes(formData.fundingMode);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "fundingMode") {
      if ((REFUSED_FUNDING_MODES as readonly string[]).includes(value)) {
        setStatus("refused");
      } else {
        setStatus("idle");
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      const data = await res.json();
      if (data.autoRefused) {
        setStatus("refused");
      } else {
        setStatus("success");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-eleo-gray-800 mb-4">Demande envoyée</h1>
          <p className="text-eleo-gray-700 mb-2">
            Votre demande de devis a bien été reçue. Nous vous répondons sous 48 heures.
          </p>
          <p className="text-sm text-eleo-gray-500">
            {COMPANY.name} — {COMPANY.email} — {COMPANY.phone}
          </p>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-eleo-gray-800 mb-4">Demande de devis</h1>
        <p className="text-eleo-gray-500 mb-8">
          Remplissez le formulaire ci-dessous pour recevoir un devis personnalisé.
          Toutes nos formations sont contractualisées et facturées.
        </p>

        {status === "refused" && (
          <div className="mb-8 p-5 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-700 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-amber-700 mb-2">Information importante</h3>
                <p className="text-sm text-eleo-gray-700">{REFUSAL_MESSAGE}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nom *"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Dupont"
            />
            <Input
              label="Prénom *"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Jean"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email *"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="jean.dupont@entreprise.fr"
            />
            <Input
              label="Téléphone"
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="06 00 00 00 00"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Entreprise"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Nom de l'entreprise"
            />
            <Input
              label="SIRET (si entreprise)"
              id="companySiret"
              name="companySiret"
              value={formData.companySiret}
              onChange={handleChange}
              placeholder="123 456 789 00012"
            />
          </div>

          <Input
            label="Formation souhaitée"
            id="formationTitle"
            name="formationTitle"
            value={formData.formationTitle}
            onChange={handleChange}
            placeholder="Ex : Technicien informatique IA-augmenté"
          />

          <Textarea
            label="Objectif professionnel"
            id="professionalGoal"
            name="professionalGoal"
            value={formData.professionalGoal}
            onChange={handleChange}
            placeholder="Décrivez votre objectif professionnel..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Niveau actuel"
              id="currentLevel"
              name="currentLevel"
              value={formData.currentLevel}
              onChange={handleChange}
              options={levelOptions}
              placeholder="Sélectionner..."
            />
            <Select
              label="Format souhaité"
              id="preferredFormat"
              name="preferredFormat"
              value={formData.preferredFormat}
              onChange={handleChange}
              options={formatOptions}
              placeholder="Sélectionner..."
            />
          </div>

          <Input
            label="Délai idéal de démarrage"
            id="idealDelay"
            name="idealDelay"
            value={formData.idealDelay}
            onChange={handleChange}
            placeholder="Ex : Septembre 2026, Dès que possible..."
          />

          <Select
            label="Mode de financement envisagé *"
            id="fundingMode"
            name="fundingMode"
            value={formData.fundingMode}
            onChange={handleChange}
            options={fundingOptions}
            placeholder="Sélectionner un mode de financement..."
            required
          />

          <Textarea
            label="Message complémentaire"
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Précisions, questions, contexte..."
          />

          {status === "error" && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={status === "submitting" || (isRefused && status === "refused")}
          >
            {status === "submitting" ? (
              "Envoi en cours..."
            ) : isRefused ? (
              "Demande non éligible"
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer ma demande de devis
              </>
            )}
          </Button>
        </form>
      </section>

      <PublicFooter />
    </div>
  );
}
