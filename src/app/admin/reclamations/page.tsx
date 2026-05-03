"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, MessageSquareWarning, Shield, CheckCircle2, Archive } from "lucide-react";

interface Complaint {
  id: string;
  reporterName: string;
  reporterEmail: string;
  reporterRole: string;
  category: string;
  severity: string;
  description: string;
  status: string;
  resolution?: string | null;
  rootCause?: string | null;
  preventiveAction?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
}

const SEVERITY_COLOR: Record<string, string> = {
  FAIBLE: "text-emerald-300 bg-emerald-900/30 border-emerald-800",
  MOYENNE: "text-amber-300 bg-amber-900/30 border-amber-800",
  ELEVEE: "text-orange-300 bg-orange-900/30 border-orange-800",
  CRITIQUE: "text-rose-300 bg-rose-900/30 border-rose-800",
};

const STATUS_COLOR: Record<string, string> = {
  OUVERT: "text-rose-300 bg-rose-900/30",
  EN_TRAITEMENT: "text-amber-300 bg-amber-900/30",
  RESOLU: "text-emerald-300 bg-emerald-900/30",
  CLOS: "text-slate-400 bg-slate-800",
};

const CATEGORY_LABEL: Record<string, string> = {
  ORGANISATION: "Organisation",
  CONTENU: "Contenu pédagogique",
  ACCESSIBILITE: "Accessibilité",
  FACTURATION: "Facturation",
  AUTRE: "Autre",
};

export default function ReclamationsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [editing, setEditing] = useState<Complaint | null>(null);

  async function fetchAll() {
    const res = await fetch("/api/reclamations");
    if (res.ok) {
      const data = await res.json();
      setComplaints(data.complaints || []);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  async function update(c: Complaint, patch: Partial<Complaint>) {
    await fetch("/api/reclamations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, ...patch }),
    });
    fetchAll();
  }

  const stats = {
    open: complaints.filter((c) => c.status === "OUVERT").length,
    inProgress: complaints.filter((c) => c.status === "EN_TRAITEMENT").length,
    resolved: complaints.filter((c) => c.status === "RESOLU").length,
    closed: complaints.filter((c) => c.status === "CLOS").length,
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <MessageSquareWarning className="w-6 h-6 text-cyan-400" />
          Registre des réclamations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Traitement obligatoire pour Qualiopi (Critère 7 indicateur 30). Toute réclamation doit recevoir une réponse écrite sous 15 jours ouvrés.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Ouvertes", count: stats.open, icon: AlertTriangle, color: "text-rose-400" },
          { label: "En traitement", count: stats.inProgress, icon: Shield, color: "text-amber-400" },
          { label: "Résolues", count: stats.resolved, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Closes", count: stats.closed, icon: Archive, color: "text-slate-400" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center gap-3">
              <Icon className={`w-8 h-8 ${s.color}`} />
              <div>
                <div className="text-2xl font-bold text-slate-100">{s.count}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800">
        {complaints.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-700" />
            <p className="text-sm">Aucune réclamation enregistrée — bravo !</p>
            <p className="text-xs mt-1">
              Lien de soumission public : <a href="/reclamation" target="_blank" className="text-cyan-400 hover:underline">/reclamation</a>
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50 text-xs text-slate-400">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Auteur</th>
                <th className="text-left px-4 py-3">Catégorie</th>
                <th className="text-left px-4 py-3">Sévérité</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-200">{c.reporterName}</div>
                    <div className="text-xs text-slate-500">{c.reporterEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{CATEGORY_LABEL[c.category] || c.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs border ${SEVERITY_COLOR[c.severity]}`}>{c.severity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => update(c, { status: e.target.value })}
                      className={`px-2 py-1 rounded text-xs border-0 ${STATUS_COLOR[c.status]}`}
                    >
                      <option value="OUVERT">Ouvert</option>
                      <option value="EN_TRAITEMENT">En traitement</option>
                      <option value="RESOLU">Résolu</option>
                      <option value="CLOS">Clos</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditing(c)} className="px-2 py-1 text-xs text-cyan-400 hover:text-cyan-300">Détail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-100">Réclamation #{editing.id.substring(0, 8)}</h3>
            <div className="text-xs text-slate-400 space-y-1">
              <div><strong>Auteur :</strong> {editing.reporterName} ({editing.reporterEmail}) — {editing.reporterRole}</div>
              <div><strong>Date :</strong> {new Date(editing.createdAt).toLocaleString("fr-FR")}</div>
              <div><strong>Catégorie :</strong> {CATEGORY_LABEL[editing.category]}</div>
              <div><strong>Sévérité :</strong> {editing.severity}</div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Description</label>
              <p className="text-sm text-slate-200 bg-slate-800 rounded p-3 whitespace-pre-wrap">{editing.description}</p>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Cause racine identifiée</label>
              <textarea
                defaultValue={editing.rootCause || ""}
                onBlur={(e) => update(editing, { rootCause: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Action corrective / résolution</label>
              <textarea
                defaultValue={editing.resolution || ""}
                onBlur={(e) => update(editing, { resolution: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Action préventive</label>
              <textarea
                defaultValue={editing.preventiveAction || ""}
                onBlur={(e) => update(editing, { preventiveAction: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 text-sm"
              />
            </div>
            <button onClick={() => setEditing(null)} className="px-4 py-2 bg-slate-800 text-slate-200 rounded text-sm">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
