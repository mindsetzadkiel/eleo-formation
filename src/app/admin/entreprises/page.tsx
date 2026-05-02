"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";

interface Company {
  id: string;
  name: string;
  siret: string | null;
  address: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  opcoName: string | null;
  notes: string | null;
  _count: { learners: number; prospects: number; opcoDocuments: number };
}

export default function EntreprisesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [selected, setSelected] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "", siret: "", address: "", contactName: "", contactEmail: "", contactPhone: "", opcoName: "", notes: "",
  });

  useEffect(() => { fetchCompanies(); }, []);

  async function fetchCompanies() {
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/companies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      setShowCreate(false);
      setFormData({ name: "", siret: "", address: "", contactName: "", contactEmail: "", contactPhone: "", opcoName: "", notes: "" });
      fetchCompanies();
    } catch (error) { console.error(error); }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await fetch(`/api/companies/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      setEditing(null);
      fetchCompanies();
    } catch (error) { console.error(error); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette entreprise ?")) return;
    try { await fetch(`/api/companies/${id}`, { method: "DELETE" }); fetchCompanies(); }
    catch (error) { console.error(error); }
  }

  function openEdit(c: Company) {
    setEditing(c);
    setFormData({
      name: c.name, siret: c.siret || "", address: c.address || "", contactName: c.contactName || "",
      contactEmail: c.contactEmail || "", contactPhone: c.contactPhone || "", opcoName: c.opcoName || "", notes: c.notes || "",
    });
  }

  const formFields = (
    <div className="space-y-4">
      <Input label="Raison sociale *" id="name" name="name" value={formData.name} onChange={handleChange} required />
      <Input label="SIRET" id="siret" name="siret" value={formData.siret} onChange={handleChange} />
      <Input label="Adresse" id="address" name="address" value={formData.address} onChange={handleChange} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nom du contact" id="contactName" name="contactName" value={formData.contactName} onChange={handleChange} />
        <Input label="Email du contact" id="contactEmail" name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Téléphone du contact" id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} />
        <Input label="OPCO" id="opcoName" name="opcoName" value={formData.opcoName} onChange={handleChange} placeholder="Ex: OPCO Atlas, AFDAS..." />
      </div>
      <Textarea label="Notes" id="notes" name="notes" value={formData.notes} onChange={handleChange} />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Entreprises clientes</h1>
          <p className="text-sm text-slate-500">Gestion des entreprises et de leurs salariés</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setFormData({ name: "", siret: "", address: "", contactName: "", contactEmail: "", contactPhone: "", opcoName: "", notes: "" }); }}>
          <Plus className="w-4 h-4 mr-2" /> Nouvelle entreprise
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-500 py-8 text-center">Chargement...</p>
      ) : (
        <div className="grid gap-4">
          {companies.map((c) => (
            <div key={c.id} className="p-5 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{c.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-slate-500">
                    {c.siret && <span>SIRET : {c.siret}</span>}
                    {c.opcoName && <span>OPCO : {c.opcoName}</span>}
                    {c.contactName && <span>Contact : {c.contactName}</span>}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-400">
                    <span>{c._count.learners} salarié(s) inscrit(s)</span>
                    <span>{c._count.prospects} prospect(s)</span>
                    <span>{c._count.opcoDocuments} document(s) OPCO</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => setSelected(c)} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Eye className="w-4 h-4 text-slate-500" />
                  </button>
                  <button onClick={() => openEdit(c)} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {companies.length === 0 && <p className="text-center text-slate-500 py-8">Aucune entreprise.</p>}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle entreprise" size="lg">
        <form onSubmit={handleCreate}>
          {formFields}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Modifier l'entreprise" size="lg">
        <form onSubmit={handleUpdate}>
          {formFields}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Détails entreprise" size="lg">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500">Raison sociale :</span> <span className="font-medium">{selected.name}</span></div>
              <div><span className="text-slate-500">SIRET :</span> {selected.siret || "—"}</div>
              <div><span className="text-slate-500">Adresse :</span> {selected.address || "—"}</div>
              <div><span className="text-slate-500">OPCO :</span> {selected.opcoName || "—"}</div>
              <div><span className="text-slate-500">Contact :</span> {selected.contactName || "—"}</div>
              <div><span className="text-slate-500">Email :</span> {selected.contactEmail || "—"}</div>
              <div><span className="text-slate-500">Téléphone :</span> {selected.contactPhone || "—"}</div>
            </div>
            {selected.notes && <div><span className="text-slate-500">Notes :</span><p className="mt-1">{selected.notes}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}
