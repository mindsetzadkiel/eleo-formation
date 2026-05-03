"use client";

import { useState } from "react";
import { CheckCircle2, Send, Star } from "lucide-react";

interface Question {
  id: string;
  label: string;
}

interface Props {
  formationId: string;
  type: string; // CHAUD ou FROID
  questions: Question[];
}

export function SatisfactionForm({ formationId, type, questions }: Props) {
  const [identity, setIdentity] = useState({ name: "", email: "" });
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const overallAvg =
    Object.values(ratings).length > 0
      ? Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length
      : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(ratings).length < questions.length) {
      alert("Merci de noter toutes les questions.");
      return;
    }
    if (recommend === null) {
      alert("Merci de répondre à la question \"Recommanderiez-vous cette formation ?\".");
      return;
    }
    setSubmitting(true);
    try {
      // Trouver/créer le learner via email
      const learnerRes = await fetch("/api/learners/find-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identity.email, name: identity.name }),
      });
      if (!learnerRes.ok) {
        alert("Impossible d'identifier votre profil apprenant.");
        return;
      }
      const { learnerId } = await learnerRes.json();

      const res = await fetch("/api/satisfaction/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerId,
          formationId,
          type,
          rating: overallAvg,
          comments,
          recommend,
          raw: { ...ratings, comments, recommend },
        }),
      });
      if (res.ok) setSubmitted(true);
      else alert("Erreur lors de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
        <h2 className="text-xl font-bold text-eleo-gray-800 mb-2">Merci pour votre retour !</h2>
        <p className="text-sm text-eleo-gray-600 max-w-md mx-auto">
          Vos réponses ont été enregistrées. Elles nous aident à améliorer nos formations en continu.
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
            required
            value={identity.name}
            onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
            className="w-full px-3 py-2 border border-eleo-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-eleo-gray-600 mb-1">Email *</label>
          <input
            type="email"
            required
            value={identity.email}
            onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
            className="w-full px-3 py-2 border border-eleo-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {questions.map((q) => (
        <div key={q.id}>
          <label className="block text-sm font-medium text-eleo-gray-800 mb-2">{q.label}</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRatings({ ...ratings, [q.id]: n })}
                className={`flex-1 max-w-[80px] py-2 rounded-lg border ${ratings[q.id] >= n ? "bg-amber-400 border-amber-400" : "bg-white border-eleo-gray-300 hover:bg-amber-50"}`}
              >
                <Star className={`w-5 h-5 mx-auto ${ratings[q.id] >= n ? "text-white fill-white" : "text-eleo-gray-300"}`} />
              </button>
            ))}
            <span className="text-xs text-eleo-gray-500 self-center ml-2">
              {ratings[q.id] ? `${ratings[q.id]}/5` : "Pas noté"}
            </span>
          </div>
        </div>
      ))}

      <div className="border-t border-eleo-gray-200 pt-5">
        <label className="block text-sm font-medium text-eleo-gray-800 mb-2">
          Recommanderiez-vous cette formation à un proche ou collègue ? *
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRecommend(true)}
            className={`px-4 py-2 rounded-lg border ${recommend === true ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-eleo-gray-700 border-eleo-gray-300 hover:bg-emerald-50"}`}
          >
            Oui, je recommande
          </button>
          <button
            type="button"
            onClick={() => setRecommend(false)}
            className={`px-4 py-2 rounded-lg border ${recommend === false ? "bg-rose-500 text-white border-rose-500" : "bg-white text-eleo-gray-700 border-eleo-gray-300 hover:bg-rose-50"}`}
          >
            Non
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-eleo-gray-800 mb-2">Commentaires libres (facultatif)</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          placeholder="Ce qui vous a plu, ce qui pourrait être amélioré..."
          className="w-full px-3 py-2 border border-eleo-gray-300 rounded-lg text-sm"
        />
      </div>

      {overallAvg != null && (
        <div className="bg-eleo-50 rounded-lg px-4 py-3 text-sm text-eleo-700">
          Note moyenne : <strong>{overallAvg.toFixed(1)}/5</strong>
        </div>
      )}

      <div className="pt-4 border-t border-eleo-gray-200">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 bg-eleo-500 hover:bg-eleo-600 text-white font-semibold rounded-lg disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Envoi..." : "Envoyer mon évaluation"}
        </button>
      </div>
    </form>
  );
}
