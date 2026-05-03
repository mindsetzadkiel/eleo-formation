"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AI_DISCLAIMER } from "@/config/company";
import { Bot, Send, AlertTriangle, Copy, Check, Upload, Loader2 } from "lucide-react";

type Target = "lesson" | "quiz" | "qualiopi" | "opco" | "email";

type Targets = {
  formations: Array<{
    id: string;
    slug: string;
    title: string;
    modules: Array<{
      id: string;
      title: string;
      orderIndex: number;
      lessons: Array<{ id: string; title: string; orderIndex: number; type: string }>;
      quizzes: Array<{ id: string; title: string }>;
    }>;
  }>;
  qualiopiCriteria: Array<{
    id: string;
    number: number;
    title: string;
    items: Array<{ id: string; label: string; status: string }>;
  }>;
  opcoDocs: Array<{
    id: string;
    type: string;
    status: string;
    formation: { title: string };
    company: { name: string } | null;
  }>;
  emailTemplates: Array<{ id: string; slug: string; name: string }>;
};

const quickActions = [
  { label: "Leçon (markdown 4000-5000c)", prompt: "Rédige une leçon de formation en markdown (4000-5000 caractères) avec ## titres, ### sous-titres, listes, **gras**. Sujet : " },
  { label: "Quiz QCM (JSON)", prompt: "Génère un quiz au format JSON STRICT : {\"questions\":[{\"question\":\"...\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"correctAnswer\":\"A\",\"points\":1}]}. 6 questions QCM, 4 options chacune, correctAnswer doit être identique à l'une des options. Sujet : " },
  { label: "Plan Qualiopi (markdown)", prompt: "Rédige un plan d'action Qualiopi détaillé en markdown : objectifs, étapes, livrables, indicateurs de réussite, échéances. Indicateur : " },
  { label: "Template OPCO (markdown)", prompt: "Rédige un template de document OPCO professionnel en markdown, prêt à compléter avec variables [NOM]. Type : " },
  { label: "Modèle email", prompt: "Rédige un email professionnel pour Eleo Formation. Inclure objet et corps. Contexte : " },
  { label: "Programme de formation", prompt: "Rédige un programme de formation professionnelle détaillé." },
  { label: "Mail OPCO prise en charge", prompt: "Rédige un mail pour demander une prise en charge OPCO." },
  { label: "Refus alternance", prompt: "Rédige un email de refus poli pour une demande d'alternance/stage." },
];

export default function AssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [targets, setTargets] = useState<Targets | null>(null);
  const [loadingTargets, setLoadingTargets] = useState(true);

  // Publication state
  const [target, setTarget] = useState<Target>("lesson");
  const [targetId, setTargetId] = useState<string>("");
  const [emailName, setEmailName] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailSlug, setEmailSlug] = useState("");
  const [qualiopiStatus, setQualiopiStatus] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/ai/targets")
      .then((r) => r.json())
      .then((d) => setTargets(d))
      .catch(() => setTargets(null))
      .finally(() => setLoadingTargets(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse("");
    setPublishMsg(null);

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

  async function handlePublish() {
    if (!response.trim()) return;
    setPublishing(true);
    setPublishMsg(null);

    const extra: Record<string, string> = {};
    if (target === "email") {
      extra.name = emailName;
      extra.subject = emailSubject;
      extra.slug = emailSlug;
    }
    if (target === "qualiopi" && qualiopiStatus) {
      extra.status = qualiopiStatus;
    }

    try {
      const res = await fetch("/api/ai/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          targetId: targetId || undefined,
          content: response,
          extra,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishMsg({ type: "err", text: data.error || "Erreur" });
      } else {
        setPublishMsg({ type: "ok", text: data.message || "Publié" });
      }
    } catch (e) {
      setPublishMsg({ type: "err", text: e instanceof Error ? e.message : "Erreur réseau" });
    } finally {
      setPublishing(false);
    }
  }

  // Options dropdown values selon le target choisi
  function renderTargetSelector() {
    if (!targets) return <p className="text-xs text-slate-500">Chargement des cibles...</p>;

    if (target === "lesson") {
      return (
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        >
          <option value="">— Choisir une leçon —</option>
          {targets.formations.flatMap((f) =>
            f.modules.flatMap((m) =>
              m.lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {f.title.substring(0, 30)} › M{m.orderIndex} › L{l.orderIndex} {l.title}
                </option>
              )),
            ),
          )}
        </select>
      );
    }

    if (target === "quiz") {
      return (
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        >
          <option value="">— Choisir un quiz —</option>
          {targets.formations.flatMap((f) =>
            f.modules.flatMap((m) =>
              m.quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  M{m.orderIndex} › {q.title}
                </option>
              )),
            ),
          )}
        </select>
      );
    }

    if (target === "qualiopi") {
      return (
        <div className="space-y-2">
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
          >
            <option value="">— Choisir un indicateur Qualiopi —</option>
            {targets.qualiopiCriteria.flatMap((c) =>
              c.items.map((it) => (
                <option key={it.id} value={it.id}>
                  Crit.{c.number} — {it.label} [{it.status}]
                </option>
              )),
            )}
          </select>
          <select
            value={qualiopiStatus}
            onChange={(e) => setQualiopiStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
          >
            <option value="">— Conserver le statut actuel —</option>
            <option value="A_FAIRE">A_FAIRE</option>
            <option value="EN_COURS">EN_COURS</option>
            <option value="FAIT">FAIT</option>
            <option value="VALIDE">VALIDE</option>
          </select>
        </div>
      );
    }

    if (target === "opco") {
      return (
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
        >
          <option value="">— Choisir un document OPCO —</option>
          {targets.opcoDocs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.type} — {d.formation.title.substring(0, 30)} {d.company ? `(${d.company.name})` : ""} [{d.status}]
            </option>
          ))}
        </select>
      );
    }

    if (target === "email") {
      return (
        <div className="space-y-2">
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
          >
            <option value="">— Nouveau modèle —</option>
            {targets.emailTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                Mettre à jour : {t.name} ({t.slug})
              </option>
            ))}
          </select>
          <Input
            label="Nom du modèle"
            id="email-name"
            value={emailName}
            onChange={(e) => setEmailName(e.target.value)}
            placeholder="Ex : Refus alternance v2"
          />
          <Input
            label="Objet de l'email"
            id="email-subject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="Ex : Réponse à votre demande"
          />
          <Input
            label="Slug (optionnel)"
            id="email-slug"
            value={emailSlug}
            onChange={(e) => setEmailSlug(e.target.value)}
            placeholder="auto-généré depuis le nom si vide"
          />
        </div>
      );
    }

    return null;
  }

  const targetHints: Record<Target, string> = {
    lesson: "Le contenu markdown remplacera le contenu actuel de la leçon.",
    quiz: "⚠️ Le contenu doit être au format JSON {questions:[...]}. Utilise l'action rapide « Quiz QCM (JSON) ».",
    qualiopi: "Le contenu sera enregistré comme commentaire/plan d'action de l'indicateur.",
    opco: "Le contenu sera enregistré comme template du document OPCO (champ remarks) et le statut passera à GENERE.",
    email: "Le contenu sera enregistré comme corps du modèle d'email réutilisable.",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bot className="w-7 h-7 text-cyan-600" />
          Assistant IA Eleo Formation
        </h1>
        <p className="text-sm text-slate-500">
          Génère et publie directement : leçons, quiz, plans Qualiopi, templates OPCO, modèles emails.
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
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Réponse de l&apos;assistant ({response.length} car.)</h3>
                <button onClick={copyResponse} className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-600">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto">
                <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {response}
                </pre>
              </div>

              {/* Editable response (pour ajustements avant publication) */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                <Textarea
                  label="Ajuster avant publication (optionnel)"
                  id="response-edit"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={6}
                />
              </div>

              {/* Publication */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-xl">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-600" />
                  Publier vers
                </h4>

                <div className="grid grid-cols-5 gap-1 text-xs">
                  {(["lesson", "quiz", "qualiopi", "opco", "email"] as Target[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTarget(t); setTargetId(""); setPublishMsg(null); }}
                      className={`px-2 py-2 rounded-lg border transition-colors ${
                        target === t
                          ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 font-semibold"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-cyan-300"
                      }`}
                    >
                      {t === "lesson" ? "Leçon" : t === "quiz" ? "Quiz" : t === "qualiopi" ? "Qualiopi" : t === "opco" ? "OPCO" : "Email"}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-slate-500 italic">{targetHints[target]}</p>

                {loadingTargets ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="w-3 h-3 animate-spin" /> Chargement...
                  </div>
                ) : (
                  renderTargetSelector()
                )}

                <Button
                  onClick={handlePublish}
                  disabled={publishing || !response.trim() || (target !== "email" && !targetId) || (target === "email" && !targetId && (!emailName || !emailSubject))}
                  className="w-full"
                >
                  {publishing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publication...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Publier maintenant</>
                  )}
                </Button>

                {publishMsg && (
                  <div className={`text-xs p-2 rounded-lg ${
                    publishMsg.type === "ok"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/40"
                      : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/40"
                  }`}>
                    {publishMsg.text}
                  </div>
                )}
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
