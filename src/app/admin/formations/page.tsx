"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface Formation {
  id: string;
  title: string;
  slug: string;
  description: string;
  objectives: string;
  targetAudience: string;
  nonTargetAudience: string;
  prerequisites: string;
  duration: number;
  format: string;
  priceHT: number;
  accessModalities: string;
  accessDelay: string;
  disabilityAccess: string;
  teachingMethods: string;
  evaluationMethods: string;
  status: string;
  modules: Array<{ id: string; title: string; orderIndex: number }>;
  _count: { sessions: number };
}

const statusOptions = [
  { value: "BROUILLON", label: "Brouillon" },
  { value: "PUBLIEE", label: "Publiée" },
  { value: "ARCHIVEE", label: "Archivée" },
];

const formatOptions = [
  { value: "DISTANCE", label: "À distance" },
  { value: "PRESENTIEL", label: "Présentiel" },
  { value: "HYBRIDE", label: "Hybride" },
];

const emptyFormation = {
  title: "",
  description: "",
  objectives: "",
  targetAudience: "",
  nonTargetAudience: "",
  prerequisites: "",
  duration: 35,
  format: "HYBRIDE",
  priceHT: 0,
  accessModalities: "",
  accessDelay: "",
  disabilityAccess: "",
  teachingMethods: "",
  evaluationMethods: "",
  status: "BROUILLON",
};

export default function FormationsAdminPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Formation | null>(null);
  const [formData, setFormData] = useState(emptyFormation);

  useEffect(() => { fetchFormations(); }, []);

  async function fetchFormations() {
    try {
      const res = await fetch("/api/formations");
      const data = await res.json();
      setFormations(data.formations || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" || name === "priceHT" ? Number(value) : value,
    }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/formations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setShowCreate(false);
      setFormData(emptyFormation);
      fetchFormations();
    } catch (error) { console.error(error); }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await fetch(`/api/formations/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setEditing(null);
      setFormData(emptyFormation);
      fetchFormations();
    } catch (error) { console.error(error); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette formation ?")) return;
    try {
      await fetch(`/api/formations/${id}`, { method: "DELETE" });
      fetchFormations();
    } catch (error) { console.error(error); }
  }

  function openEdit(f: Formation) {
    setEditing(f);
    setFormData({
      title: f.title,
      description: f.description,
      objectives: f.objectives,
      targetAudience: f.targetAudience,
      nonTargetAudience: f.nonTargetAudience,
      prerequisites: f.prerequisites,
      duration: f.duration,
      format: f.format,
      priceHT: f.priceHT,
      accessModalities: f.accessModalities,
      accessDelay: f.accessDelay,
      disabilityAccess: f.disabilityAccess,
      teachingMethods: f.teachingMethods,
      evaluationMethods: f.evaluationMethods,
      status: f.status,
    });
  }

  const statusBadge = (s: string) => {
    if (s === "PUBLIEE") return "success";
    if (s === "ARCHIVEE") return "secondary";
    return "warning";
  };

  const formFields = (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <Input label="Titre *" id="title" name="title" value={formData.title} onChange={handleChange} required />
      <Textarea label="Description *" id="description" name="description" value={formData.description} onChange={handleChange} required />
      <Textarea label="Objectifs pédagogiques" id="objectives" name="objectives" value={formData.objectives} onChange={handleChange} />
      <Textarea label="Public cible" id="targetAudience" name="targetAudience" value={formData.targetAudience} onChange={handleChange} />
      <Textarea label="Public non cible" id="nonTargetAudience" name="nonTargetAudience" value={formData.nonTargetAudience} onChange={handleChange} />
      <Input label="Prérequis" id="prerequisites" name="prerequisites" value={formData.prerequisites} onChange={handleChange} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Durée (heures)" id="duration" name="duration" type="number" value={formData.duration} onChange={handleChange} />
        <Input label="Tarif HT (€)" id="priceHT" name="priceHT" type="number" step="0.01" value={formData.priceHT} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Format" id="format" name="format" value={formData.format} onChange={handleChange} options={formatOptions} />
        <Select label="Statut" id="status" name="status" value={formData.status} onChange={handleChange} options={statusOptions} />
      </div>
      <Input label="Modalités d'accès" id="accessModalities" name="accessModalities" value={formData.accessModalities} onChange={handleChange} />
      <Input label="Délais d'accès" id="accessDelay" name="accessDelay" value={formData.accessDelay} onChange={handleChange} />
      <Input label="Accessibilité handicap" id="disabilityAccess" name="disabilityAccess" value={formData.disabilityAccess} onChange={handleChange} />
      <Textarea label="Méthodes pédagogiques" id="teachingMethods" name="teachingMethods" value={formData.teachingMethods} onChange={handleChange} />
      <Textarea label="Modalités d'évaluation" id="evaluationMethods" name="evaluationMethods" value={formData.evaluationMethods} onChange={handleChange} />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Formations</h1>
          <p className="text-sm text-slate-500">Gestion du catalogue de formations</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setFormData(emptyFormation); }}>
          <Plus className="w-4 h-4 mr-2" /> Nouvelle formation
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-500 py-8 text-center">Chargement...</p>
      ) : (
        <div className="grid gap-4">
          {formations.map((f) => (
            <div key={f.id} className="p-5 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                    <Badge variant={statusBadge(f.status) as "success" | "warning" | "secondary"}>{f.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-2 line-clamp-2">{f.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{f.duration}h</span>
                    <span>{f.format}</span>
                    <span>{formatCurrency(f.priceHT)} HT</span>
                    <span>{f.modules.length} modules</span>
                    <span>{f._count.sessions} sessions</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Link href={`/formations/${f.slug}`} target="_blank" className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Eye className="w-4 h-4 text-slate-500" />
                  </Link>
                  <button onClick={() => openEdit(f)} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(f.id)} className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {formations.length === 0 && (
            <p className="text-center text-slate-500 py-8">Aucune formation. Créez votre première formation.</p>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle formation" size="xl">
        <form onSubmit={handleCreate}>
          {formFields}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Modifier la formation" size="xl">
        <form onSubmit={handleUpdate}>
          {formFields}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
