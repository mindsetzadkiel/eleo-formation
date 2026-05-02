"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { PROSPECT_STATUSES, FUNDING_MODES } from "@/config/company";
import { formatDateTime } from "@/lib/utils";
import { Search, Eye, Edit2, Trash2 } from "lucide-react";

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  companySiret: string | null;
  professionalGoal: string | null;
  fundingMode: string;
  status: string;
  source: string;
  notes: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  autoRefused: boolean;
  refusalReason: string | null;
  message: string | null;
  createdAt: string;
  formation?: { title: string } | null;
}

const statusOptions = Object.entries(PROSPECT_STATUSES).map(([value, label]) => ({ value, label }));

export default function CRMPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);

  useEffect(() => {
    fetchProspects();
  }, []);

  async function fetchProspects() {
    try {
      const res = await fetch("/api/prospects");
      const data = await res.json();
      setProspects(data.prospects || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProspect(id: string, updates: Partial<Prospect>) {
    try {
      await fetch(`/api/prospects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      fetchProspects();
      setEditingProspect(null);
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  async function deleteProspect(id: string) {
    if (!confirm("Supprimer ce prospect ?")) return;
    try {
      await fetch(`/api/prospects/${id}`, { method: "DELETE" });
      fetchProspects();
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  const filtered = prospects.filter((p) => {
    const matchSearch =
      !search ||
      `${p.firstName} ${p.lastName} ${p.email} ${p.companyName || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const badgeVariant = (status: string): "default" | "success" | "warning" | "danger" | "info" => {
    if (status.startsWith("REFUS")) return "danger";
    if (status.startsWith("PROSPECT")) return "success";
    if (status === "GAGNE") return "success";
    if (status === "PERDU") return "danger";
    if (status === "DEVIS_ENVOYE" || status === "DEVIS_A_PREPARER") return "warning";
    if (status === "CONTACTE") return "info";
    return "default";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CRM Prospects</h1>
        <p className="text-sm text-slate-500">Gestion des demandes entrantes et prospects commerciaux</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
          />
        </div>
        <Select
          options={statusOptions}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          placeholder="Tous les statuts"
          className="sm:w-64"
        />
      </div>

      {loading ? (
        <p className="text-slate-500 py-8 text-center">Chargement...</p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Nom</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Entreprise</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Financement</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prospect) => (
                  <tr key={prospect.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {prospect.firstName} {prospect.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{prospect.email}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{prospect.companyName || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">
                      {FUNDING_MODES[prospect.fundingMode as keyof typeof FUNDING_MODES] || prospect.fundingMode}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={badgeVariant(prospect.status)}>
                        {PROSPECT_STATUSES[prospect.status as keyof typeof PROSPECT_STATUSES] || prospect.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDateTime(prospect.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedProspect(prospect)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Voir">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </button>
                        <button onClick={() => setEditingProspect(prospect)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Modifier">
                          <Edit2 className="w-4 h-4 text-slate-500" />
                        </button>
                        <button onClick={() => deleteProspect(prospect.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20" title="Supprimer">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Aucun prospect trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={!!selectedProspect} onClose={() => setSelectedProspect(null)} title="Détails du prospect" size="lg">
        {selectedProspect && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500">Nom :</span> <span className="font-medium">{selectedProspect.firstName} {selectedProspect.lastName}</span></div>
              <div><span className="text-slate-500">Email :</span> {selectedProspect.email}</div>
              <div><span className="text-slate-500">Téléphone :</span> {selectedProspect.phone || "—"}</div>
              <div><span className="text-slate-500">Entreprise :</span> {selectedProspect.companyName || "—"}</div>
              <div><span className="text-slate-500">SIRET :</span> {selectedProspect.companySiret || "—"}</div>
              <div><span className="text-slate-500">Source :</span> {selectedProspect.source}</div>
              <div><span className="text-slate-500">Financement :</span> {FUNDING_MODES[selectedProspect.fundingMode as keyof typeof FUNDING_MODES]}</div>
              <div><span className="text-slate-500">Statut :</span> <Badge variant={badgeVariant(selectedProspect.status)}>{PROSPECT_STATUSES[selectedProspect.status as keyof typeof PROSPECT_STATUSES] || selectedProspect.status}</Badge></div>
            </div>
            {selectedProspect.professionalGoal && (
              <div><span className="text-slate-500">Objectif professionnel :</span><p className="mt-1">{selectedProspect.professionalGoal}</p></div>
            )}
            {selectedProspect.message && (
              <div><span className="text-slate-500">Message :</span><p className="mt-1">{selectedProspect.message}</p></div>
            )}
            {selectedProspect.refusalReason && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20">
                <span className="text-red-600 dark:text-red-400 font-medium">Raison du refus :</span>
                <p className="mt-1 text-red-600 dark:text-red-300">{selectedProspect.refusalReason}</p>
              </div>
            )}
            {selectedProspect.notes && (
              <div><span className="text-slate-500">Notes :</span><p className="mt-1">{selectedProspect.notes}</p></div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingProspect} onClose={() => setEditingProspect(null)} title="Modifier le prospect" size="md">
        {editingProspect && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateProspect(editingProspect.id, {
                status: formData.get("status") as string,
                notes: formData.get("notes") as string,
                nextAction: formData.get("nextAction") as string,
              });
            }}
            className="space-y-4"
          >
            <Select
              label="Statut"
              id="status"
              name="status"
              options={statusOptions}
              defaultValue={editingProspect.status}
            />
            <Input
              label="Prochaine action"
              id="nextAction"
              name="nextAction"
              defaultValue={editingProspect.nextAction || ""}
              placeholder="Ex: Relancer par email"
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
              <textarea
                name="notes"
                defaultValue={editingProspect.notes || ""}
                rows={3}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditingProspect(null)}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
