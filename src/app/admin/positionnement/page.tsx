"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, ClipboardList, Eye, FileText } from "lucide-react";

interface Question {
  id?: string;
  orderIndex: number;
  question: string;
  type: string;
  required: boolean;
}

interface Response {
  id: string;
  submittedAt: string;
  formationId: string;
  trainerNotes?: string | null;
  answers: { id: string; answer: string; question: { question: string; type: string } }[];
}

const TYPES = [
  { value: "OPEN", label: "Question ouverte (texte libre)" },
  { value: "SCALE_1_5", label: "Échelle 1 à 5" },
  { value: "YES_NO", label: "Oui / Non" },
  { value: "MCQ", label: "Choix multiple" },
];

export default function PositionnementPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [tab, setTab] = useState<"questions" | "responses">("questions");
  const [saving, setSaving] = useState(false);

  async function fetchAll() {
    const res = await fetch("/api/positionnement");
    if (res.ok) {
      const data = await res.json();
      setQuestions(data.questions || []);
      setResponses(data.responses || []);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  function addQuestion() {
    setQuestions([
      ...questions,
      { orderIndex: questions.length + 1, question: "", type: "OPEN", required: true },
    ]);
  }

  function removeQuestion(idx: number) {
    setQuestions(questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, orderIndex: i + 1 })));
  }

  function updateQuestion(idx: number, field: keyof Question, value: string | boolean) {
    const newQ = [...questions];
    // @ts-expect-error - dynamic field assignment
    newQ[idx][field] = value;
    setQuestions(newQ);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/positionnement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });
      if (res.ok) {
        await fetchAll();
        alert("Questions enregistrées");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-cyan-400" />
          Questionnaire de positionnement
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Évaluation préalable à la formation pour adapter le parcours. Couvre Qualiopi Critère 3 indicateur 7.
        </p>
      </header>

      <div className="flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setTab("questions")}
          className={`px-4 py-2 text-sm font-medium ${tab === "questions" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-400 hover:text-slate-200"}`}
        >
          Questions ({questions.length})
        </button>
        <button
          onClick={() => setTab("responses")}
          className={`px-4 py-2 text-sm font-medium ${tab === "responses" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-400 hover:text-slate-200"}`}
        >
          Réponses reçues ({responses.length})
        </button>
      </div>

      {tab === "questions" && (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-mono text-sm pt-2">Q{q.orderIndex}</span>
                <div className="flex-1 space-y-2">
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, "question", e.target.value)}
                    rows={2}
                    placeholder="Énoncé de la question"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 text-sm"
                  />
                  <div className="flex flex-wrap gap-3 text-xs">
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(idx, "type", e.target.value)}
                      className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200"
                    >
                      {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <label className="flex items-center gap-1 text-slate-400">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(idx, "required", e.target.checked)}
                      />
                      Obligatoire
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => removeQuestion(idx)}
                  className="p-2 text-rose-400 hover:bg-rose-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-sm"
            >
              <Plus className="w-4 h-4" />
              Ajouter une question
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {tab === "responses" && (
        <div className="space-y-3">
          {responses.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="text-sm">Aucune réponse reçue pour le moment.</p>
              <p className="text-xs mt-1">Les réponses apparaîtront ici dès qu'un apprenant remplira le questionnaire.</p>
            </div>
          ) : (
            responses.map((r) => (
              <details key={r.id} className="bg-slate-900 border border-slate-800 rounded-lg">
                <summary className="px-4 py-3 cursor-pointer flex items-center gap-3 hover:bg-slate-800/50">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-200">
                    Réponse du {new Date(r.submittedAt).toLocaleDateString("fr-FR")} — {r.answers.length} réponses
                  </span>
                </summary>
                <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3">
                  {r.answers.map((a) => (
                    <div key={a.id} className="text-sm">
                      <p className="text-slate-400 text-xs mb-1">{a.question.question}</p>
                      <p className="text-slate-100">{a.answer || <span className="italic text-slate-600">(vide)</span>}</p>
                    </div>
                  ))}
                </div>
              </details>
            ))
          )}
        </div>
      )}
    </div>
  );
}
