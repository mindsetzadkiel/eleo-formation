"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

interface Question {
  id: string;
  orderIndex: number;
  question: string;
  type: string;
  required: boolean;
}

interface Props {
  formationId: string;
  questions: Question[];
}

export function PositioningForm({ formationId, questions }: Props) {
  const [identity, setIdentity] = useState({ name: "", email: "" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function setAnswer(qid: string, value: string) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // validation
    for (const q of questions) {
      if (q.required && !answers[q.id]?.trim()) {
        alert(`La question "${q.question}" est obligatoire.`);
        return;
      }
    }
    if (!identity.email || !identity.name) {
      alert("Merci d'indiquer votre nom et email.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/positionnement/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formationId,
          learnerEmail: identity.email,
          learnerName: identity.name,
          answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Erreur lors de l'envoi. Merci de réessayer.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
        <h2 className="text-xl font-bold text-eleo-gray-800 mb-2">Merci pour vos réponses !</h2>
        <p className="text-sm text-eleo-gray-600 max-w-md mx-auto">
          Nous avons bien reçu votre questionnaire. Le formateur va l'étudier pour adapter le parcours à votre situation. Vous serez recontacté(e) sous 48h ouvrées.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4 border-b border-eleo-gray-200">
        <div>
          <label className="block text-xs font-medium text-eleo-gray-600 mb-1">Nom complet *</label>
          <input
            value={identity.name}
            onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-eleo-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-eleo-gray-600 mb-1">Email *</label>
          <input
            type="email"
            value={identity.email}
            onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
            required
            className="w-full px-3 py-2 border border-eleo-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {questions.map((q) => (
        <div key={q.id}>
          <label className="block text-sm font-medium text-eleo-gray-800 mb-2">
            <span className="text-eleo-500 font-bold mr-2">{q.orderIndex}.</span>
            {q.question}
            {q.required && <span className="text-rose-500 ml-1">*</span>}
          </label>

          {q.type === "SCALE_1_5" && (
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className={`flex-1 min-w-[60px] cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${answers[q.id] === String(n) ? "bg-eleo-500 text-white border-eleo-500" : "bg-white text-eleo-gray-700 border-eleo-gray-300 hover:bg-eleo-50"}`}>
                  <input
                    type="radio"
                    name={q.id}
                    value={n}
                    checked={answers[q.id] === String(n)}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    className="sr-only"
                  />
                  {n}
                </label>
              ))}
            </div>
          )}

          {q.type === "YES_NO" && (
            <div className="flex gap-2">
              {[
                { v: "OUI", l: "Oui" },
                { v: "NON", l: "Non" },
              ].map((opt) => (
                <label key={opt.v} className={`cursor-pointer rounded-lg border px-4 py-2 text-sm ${answers[q.id] === opt.v ? "bg-eleo-500 text-white border-eleo-500" : "bg-white text-eleo-gray-700 border-eleo-gray-300 hover:bg-eleo-50"}`}>
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.v}
                    checked={answers[q.id] === opt.v}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    className="sr-only"
                  />
                  {opt.l}
                </label>
              ))}
            </div>
          )}

          {(q.type === "OPEN" || q.type === "MCQ") && (
            <textarea
              value={answers[q.id] || ""}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-eleo-gray-300 rounded-lg text-sm"
            />
          )}
        </div>
      ))}

      <div className="pt-4 border-t border-eleo-gray-200">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 bg-eleo-500 hover:bg-eleo-600 text-white font-semibold rounded-lg disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Envoi en cours..." : "Envoyer mon questionnaire"}
        </button>
      </div>
    </form>
  );
}
