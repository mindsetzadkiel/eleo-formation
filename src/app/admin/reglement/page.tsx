"use client";

import { useEffect, useState } from "react";
import { Save, Download, FileText, History } from "lucide-react";

interface Regulation {
  id: string;
  version: string;
  title: string;
  content: string;
  active: boolean;
  updatedAt: string;
}

export default function ReglementPage() {
  const [reg, setReg] = useState<Regulation | null>(null);
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<Regulation[]>([]);

  async function fetchData() {
    const res = await fetch("/api/reglement");
    if (res.ok) {
      const data = await res.json();
      setReg(data.active);
      setContent(data.active?.content || "");
      setVersion(data.active?.version || "1.0");
      setTitle(data.active?.title || "Règlement intérieur des stagiaires");
      setHistory(data.history || []);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function save(newVersion: boolean) {
    setSaving(true);
    try {
      const res = await fetch("/api/reglement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, title, content, newVersion }),
      });
      if (res.ok) {
        await fetchData();
        alert(newVersion ? "Nouvelle version créée" : "Modifications enregistrées");
      }
    } finally {
      setSaving(false);
    }
  }

  async function downloadPDF() {
    const res = await fetch("/api/pdf/reglement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version,
        title,
        content,
        date: new Date().toLocaleDateString("fr-FR"),
      }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reglement-interieur-v${version}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-cyan-400" />
          Règlement intérieur des stagiaires
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Document obligatoire (Code du travail art. L.6352-3) — à remettre à chaque stagiaire en début de formation. Couvre Qualiopi Critère 6 indicateur 22.
        </p>
      </header>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Version</label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Contenu (markdown : # titre, ## sous-titre, - liste)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={28}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 text-sm font-mono"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Créer nouvelle version
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm"
          >
            <Download className="w-4 h-4" />
            Télécharger PDF
          </button>
        </div>

        {reg && (
          <p className="text-xs text-slate-500">
            Version active : <span className="font-semibold text-slate-300">v{reg.version}</span> · Mise à jour le{" "}
            {new Date(reg.updatedAt).toLocaleDateString("fr-FR")}
          </p>
        )}
      </div>

      {history.length > 1 && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <History className="w-4 h-4" />
            Historique des versions
          </h2>
          <ul className="space-y-1 text-xs text-slate-400">
            {history.map((h) => (
              <li key={h.id} className="flex items-center gap-2">
                <span className="font-mono text-cyan-400">v{h.version}</span>
                <span>—</span>
                <span>{new Date(h.updatedAt).toLocaleDateString("fr-FR")}</span>
                {h.active && <span className="ml-auto px-2 py-0.5 bg-emerald-900/50 text-emerald-300 rounded text-[10px]">ACTIVE</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
