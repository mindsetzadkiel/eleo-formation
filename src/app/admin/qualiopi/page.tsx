"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { LEGAL_DISCLAIMER } from "@/config/company";
import { formatDate } from "@/lib/utils";
import { ClipboardCheck, AlertTriangle, CheckCircle2, Clock, CircleDot } from "lucide-react";

interface QualiopiItem {
  id: string;
  label: string;
  description: string | null;
  status: string;
  documentPath: string | null;
  comments: string | null;
  lastUpdated: string;
}

interface QualiopiCriterion {
  id: string;
  number: number;
  title: string;
  description: string;
  items: QualiopiItem[];
}

const statusOptions = [
  { value: "A_FAIRE", label: "À faire" },
  { value: "EN_COURS", label: "En cours" },
  { value: "FAIT", label: "Fait" },
  { value: "VALIDE", label: "Validé" },
];

export default function QualiopiPage() {
  const [criteria, setCriteria] = useState<QualiopiCriterion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCriteria(); }, []);

  async function fetchCriteria() {
    try {
      const res = await fetch("/api/qualiopi");
      const data = await res.json();
      setCriteria(data.criteria || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  async function updateItem(itemId: string, status: string, comments?: string) {
    try {
      await fetch("/api/qualiopi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, status, comments }),
      });
      fetchCriteria();
    } catch (error) { console.error(error); }
  }

  const statusIcon = (s: string) => {
    switch (s) {
      case "VALIDE": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "FAIT": return <CheckCircle2 className="w-4 h-4 text-cyan-500" />;
      case "EN_COURS": return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <CircleDot className="w-4 h-4 text-slate-400" />;
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "VALIDE": return "success";
      case "FAIT": return "info";
      case "EN_COURS": return "warning";
      default: return "secondary";
    }
  };

  const totalItems = criteria.reduce((acc, c) => acc + c.items.length, 0);
  const completedItems = criteria.reduce((acc, c) => acc + c.items.filter((i) => i.status === "FAIT" || i.status === "VALIDE").length, 0);
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-cyan-600" />
            Cockpit Qualiopi
          </h1>
          <p className="text-sm text-slate-500">Préparation documentaire aux 7 critères Qualiopi</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-cyan-600">{progressPercent}%</div>
          <div className="text-xs text-slate-500">{completedItems}/{totalItems} éléments</div>
        </div>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20">
        <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {LEGAL_DISCLAIMER}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
      </div>

      {loading ? (
        <p className="text-slate-500 py-8 text-center">Chargement...</p>
      ) : (
        <div className="space-y-6">
          {criteria.map((criterion) => {
            const done = criterion.items.filter((i) => i.status === "FAIT" || i.status === "VALIDE").length;
            const total = criterion.items.length;
            return (
              <div key={criterion.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      Critère {criterion.number} — {criterion.title}
                    </h2>
                    <span className="text-sm text-slate-500">{done}/{total}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{criterion.description}</p>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {criterion.items.map((item) => (
                    <div key={item.id} className="px-6 py-3 flex items-center gap-4">
                      {statusIcon(item.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                        {item.description && <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>}
                        {item.comments && <p className="text-xs text-cyan-600 mt-0.5">Note : {item.comments}</p>}
                        <p className="text-xs text-slate-400 mt-0.5">Mis à jour : {formatDate(item.lastUpdated)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusBadge(item.status) as "success" | "info" | "warning" | "secondary"}>
                          {statusOptions.find((s) => s.value === item.status)?.label || item.status}
                        </Badge>
                        <select
                          value={item.status}
                          onChange={(e) => updateItem(item.id, e.target.value)}
                          className="text-xs border rounded px-1 py-0.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                          {statusOptions.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {criteria.length === 0 && (
            <p className="text-center text-slate-500 py-8">Aucun critère Qualiopi chargé. Lancez le seed pour initialiser les données.</p>
          )}
        </div>
      )}
    </div>
  );
}
