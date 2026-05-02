"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { Plus, Edit2, Trash2, Users } from "lucide-react";

interface Session {
  id: string;
  formationId: string;
  trainerId: string | null;
  startDate: string;
  endDate: string;
  maxPlaces: number;
  format: string;
  location: string | null;
  status: string;
  formation: { title: string; slug: string };
  trainer: { firstName: string; lastName: string } | null;
  _count: { enrollments: number };
}

interface FormationOption {
  id: string;
  title: string;
}

const statusOptions = [
  { value: "BROUILLON", label: "Brouillon" },
  { value: "OUVERTE", label: "Ouverte" },
  { value: "COMPLETE", label: "Complète" },
  { value: "TERMINEE", label: "Terminée" },
  { value: "ARCHIVEE", label: "Archivée" },
];

const formatOptions = [
  { value: "DISTANCE", label: "À distance" },
  { value: "PRESENTIEL", label: "Présentiel" },
  { value: "HYBRIDE", label: "Hybride" },
];

export default function SessionsAdminPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [formations, setFormations] = useState<FormationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    formationId: "",
    startDate: "",
    endDate: "",
    maxPlaces: 8,
    format: "HYBRIDE",
    location: "Atelier Eleo — 49 Avenue Henri Malacrida, 13100 Aix-en-Provence",
    status: "BROUILLON",
  });

  useEffect(() => {
    fetchSessions();
    fetchFormations();
  }, []);

  async function fetchSessions() {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  async function fetchFormations() {
    try {
      const res = await fetch("/api/formations");
      const data = await res.json();
      setFormations((data.formations || []).map((f: FormationOption) => ({ id: f.id, title: f.title })));
    } catch (error) { console.error(error); }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxPlaces" ? Number(value) : value,
    }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setShowCreate(false);
      fetchSessions();
    } catch (error) { console.error(error); }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`/api/sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchSessions();
    } catch (error) { console.error(error); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette session ?")) return;
    try {
      await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      fetchSessions();
    } catch (error) { console.error(error); }
  }

  const statusBadge = (s: string) => {
    switch (s) {
      case "OUVERTE": return "success";
      case "COMPLETE": return "info";
      case "TERMINEE": return "secondary";
      case "ARCHIVEE": return "secondary";
      default: return "warning";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sessions</h1>
          <p className="text-sm text-slate-500">Gestion des sessions de formation</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nouvelle session
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-500 py-8 text-center">Chargement...</p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Formation</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Dates</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Format</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Places</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Formateur</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{session.formation.title}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">
                      {formatDate(session.startDate)} — {formatDate(session.endDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{session.format}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Users className="w-3.5 h-3.5" />
                        {session._count.enrollments}/{session.maxPlaces}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {session.trainer ? `${session.trainer.firstName} ${session.trainer.lastName}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadge(session.status) as "success" | "warning" | "info" | "secondary"}>
                        {session.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <select
                          value={session.status}
                          onChange={(e) => updateStatus(session.id, e.target.value)}
                          className="text-xs border rounded px-1 py-0.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                          {statusOptions.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <button onClick={() => handleDelete(session.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Aucune session.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle session" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Formation *"
            id="formationId"
            name="formationId"
            value={formData.formationId}
            onChange={handleChange}
            options={formations.map((f) => ({ value: f.id, label: f.title }))}
            placeholder="Sélectionner une formation"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date de début *" id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
            <Input label="Date de fin *" id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Places max" id="maxPlaces" name="maxPlaces" type="number" value={formData.maxPlaces} onChange={handleChange} />
            <Select label="Format" id="format" name="format" value={formData.format} onChange={handleChange} options={formatOptions} />
          </div>
          <Input label="Lieu" id="location" name="location" value={formData.location} onChange={handleChange} />
          <Select label="Statut" id="status" name="status" value={formData.status} onChange={handleChange} options={statusOptions} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
