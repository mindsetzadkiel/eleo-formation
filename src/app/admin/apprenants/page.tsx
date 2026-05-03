"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Plus, Eye, FileDown } from "lucide-react";

interface Learner {
  id: string;
  userId: string;
  companyId: string | null;
  funding: string | null;
  specialNeeds: string | null;
  currentLevel: string | null;
  user: { firstName: string; lastName: string; email: string; phone: string | null; active: boolean };
  company: { name: string } | null;
  enrollments: Array<{
    id: string;
    status: string;
    session: { formation: { title: string } };
  }>;
  _count: { completions: number; quizAttempts: number };
}

const fundingOptions = [
  { value: "ENTREPRISE", label: "Entreprise" },
  { value: "OPCO", label: "OPCO" },
  { value: "FRANCE_TRAVAIL", label: "France Travail" },
  { value: "FONDS_PROPRES", label: "Fonds propres" },
];

const levelOptions = [
  { value: "DEBUTANT", label: "Débutant" },
  { value: "INTERMEDIAIRE", label: "Intermédiaire" },
  { value: "AVANCE", label: "Avancé" },
];

export default function ApprenantsPage() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Learner | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    funding: "",
    currentLevel: "",
    specialNeeds: "",
  });

  useEffect(() => { fetchLearners(); }, []);

  async function fetchLearners() {
    try {
      const res = await fetch("/api/learners");
      const data = await res.json();
      setLearners(data.learners || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/learners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowCreate(false);
        setFormData({ firstName: "", lastName: "", email: "", phone: "", funding: "", currentLevel: "", specialNeeds: "" });
        fetchLearners();
      }
    } catch (error) { console.error(error); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Apprenants</h1>
          <p className="text-sm text-slate-500">Gestion des apprenants inscrits</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nouvel apprenant
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
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Nom</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Entreprise</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Financement</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Formations</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Progression</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {learners.map((learner) => (
                  <tr key={learner.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {learner.user.firstName} {learner.user.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{learner.user.email}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{learner.company?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{learner.funding || "—"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {learner.enrollments.length > 0
                        ? learner.enrollments.map((e) => e.session.formation.title).join(", ")
                        : "Aucune"}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {learner._count.completions} leçons | {learner._count.quizAttempts} quiz
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(learner)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Eye className="w-4 h-4 text-slate-500" />
                      </button>
                    </td>
                  </tr>
                ))}
                {learners.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Aucun apprenant.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nouvel apprenant" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom *" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <Input label="Nom *" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
          <Input label="Email *" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          <Input label="Téléphone" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          <Select label="Financement" id="funding" name="funding" value={formData.funding} onChange={handleChange} options={fundingOptions} placeholder="Sélectionner..." />
          <Select label="Niveau" id="currentLevel" name="currentLevel" value={formData.currentLevel} onChange={handleChange} options={levelOptions} placeholder="Sélectionner..." />
          <Input label="Besoins particuliers" id="specialNeeds" name="specialNeeds" value={formData.specialNeeds} onChange={handleChange} />
          <p className="text-xs text-slate-500">Mot de passe par défaut : Eleo2026!</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Détails apprenant" size="lg">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500">Nom :</span> <span className="font-medium">{selected.user.firstName} {selected.user.lastName}</span></div>
              <div><span className="text-slate-500">Email :</span> {selected.user.email}</div>
              <div><span className="text-slate-500">Téléphone :</span> {selected.user.phone || "—"}</div>
              <div><span className="text-slate-500">Entreprise :</span> {selected.company?.name || "—"}</div>
              <div><span className="text-slate-500">Financement :</span> {selected.funding || "—"}</div>
              <div><span className="text-slate-500">Niveau :</span> {selected.currentLevel || "—"}</div>
              <div><span className="text-slate-500">Besoins particuliers :</span> {selected.specialNeeds || "—"}</div>
              <div><span className="text-slate-500">Actif :</span> {selected.user.active ? "Oui" : "Non"}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Formations inscrites :</span>
              {selected.enrollments.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {selected.enrollments.map((e, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Badge variant={e.status === "TERMINE" ? "success" : "info"}>{e.status}</Badge>
                      <span className="flex-1">{e.session.formation.title}</span>
                      <a
                        href={`/api/suivi/${selected.id}/${e.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded hover:bg-cyan-100"
                        title="Télécharger la fiche de suivi PDF (Qualiopi C3-I8)"
                      >
                        <FileDown className="w-3 h-3" />
                        Fiche suivi
                      </a>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-1 text-slate-400">Aucune inscription</p>}
            </div>
            <div className="flex gap-4 text-slate-600">
              <span>{selected._count.completions} leçons complétées</span>
              <span>{selected._count.quizAttempts} quiz passés</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
