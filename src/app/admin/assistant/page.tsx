"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AI_DISCLAIMER } from "@/config/company";
import { Bot, Send, AlertTriangle, Copy, Check } from "lucide-react";

const quickActions = [
  { label: "Programme de formation", prompt: "Rédige un programme de formation professionnelle en maintenance informatique pour un technicien débutant." },
  { label: "Devis type", prompt: "Génère une proposition de devis pour une formation hybride de 35 heures en maintenance PC/Mac." },
  { label: "Mail OPCO", prompt: "Rédige un mail pour demander une prise en charge OPCO pour une formation de maintenance informatique." },
  { label: "Refus alternance", prompt: "Rédige un email de refus poli pour une demande d'alternance/apprentissage." },
  { label: "Réponse fonds propres", prompt: "Rédige une réponse pour un prospect qui souhaite financer sa formation en fonds propres." },
  { label: "Convention", prompt: "Génère le contenu d'une convention de formation professionnelle." },
  { label: "Quiz diagnostic", prompt: "Crée un quiz de 5 questions sur le diagnostic informatique." },
  { label: "Évaluation à chaud", prompt: "Génère un questionnaire d'évaluation à chaud pour une formation informatique." },
  { label: "Fiche besoin", prompt: "Génère une fiche de recueil des besoins pour un apprenant souhaitant suivre une formation en maintenance informatique." },
  { label: "Grille évaluation", prompt: "Génère une grille d'évaluation des compétences pratiques pour un technicien informatique." },
  { label: "Mail France Travail", prompt: "Rédige une réponse à France Travail expliquant qu'Eleo ne propose que des formations financées." },
  { label: "Proposition commerciale", prompt: "Rédige une proposition commerciale pour une entreprise souhaitant former un salarié en cybersécurité de base." },
];

export default function AssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResponse(data.response || "Aucune réponse générée.");
    } catch {
      setResponse("Erreur lors de la communication avec l'assistant IA.");
    } finally {
      setLoading(false);
    }
  }

  function useQuickAction(action: typeof quickActions[0]) {
    setPrompt(action.prompt);
  }

  async function copyResponse() {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bot className="w-7 h-7 text-cyan-600" />
          Assistant IA Eleo Formation
        </h1>
        <p className="text-sm text-slate-500">
          Aide à la rédaction de documents de formation, emails, devis, programmes et évaluations.
        </p>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20">
        <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {AI_DISCLAIMER}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Actions rapides</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => useQuickAction(action)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/30 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-colors text-slate-700 dark:text-slate-300"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              label="Votre demande"
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez ce que vous souhaitez générer..."
              rows={4}
            />
            <Button type="submit" disabled={loading || !prompt.trim()}>
              {loading ? "Génération en cours..." : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Générer
                </>
              )}
            </Button>
          </form>

          {response && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Réponse de l&apos;assistant</h3>
                <button onClick={copyResponse} className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-600">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>
              <div className="p-4">
                <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {response}
                </pre>
              </div>
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {AI_DISCLAIMER}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
