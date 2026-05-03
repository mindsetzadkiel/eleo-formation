"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { LEGAL_DISCLAIMER } from "@/config/company";
import { formatDate } from "@/lib/utils";
import { Plus, FileDown, AlertTriangle, Eye, FileText } from "lucide-react";
import { LessonMarkdown } from "@/components/lesson-markdown";

interface OPCODoc {
  id: string;
  formationId: string;
  companyId: string | null;
  type: string;
  status: string;
  remarks: string | null;
  generatedAt: string | null;
  sentAt: string | null;
  signedAt: string | null;
  validatedAt: string | null;
  createdAt: string;
  formation: { title: string };
  company: { name: string } | null;
}

const docTypes = [
  { value: "DEVIS", label: "Devis" },
  { value: "PROGRAMME", label: "Programme de formation" },
  { value: "CONVENTION", label: "Convention de formation" },
  { value: "CONVOCATION", label: "Convocation" },
  { value: "EMARGEMENT", label: "Feuille d'émargement" },
  { value: "CERTIFICAT", label: "Certificat de réalisation" },
  { value: "ATTESTATION", label: "Attestation de fin de formation" },
  { value: "SATISFACTION", label: "Questionnaire de satisfaction" },
  { value: "EVAL_CHAUD", label: "Évaluation à chaud" },
  { value: "EVAL_FROID", label: "Évaluation à froid" },
  { value: "FACTURE", label: "Facture / note de facturation" },
];

const statusOptions = [
  { value: "A_GENERER", label: "À générer" },
  { value: "GENERE", label: "Généré" },
  { value: "ENVOYE", label: "Envoyé" },
  { value: "SIGNE", label: "Signé" },
  { value: "VALIDE", label: "Validé" },
];

const pdfTypeMap: Record<string, string> = {
  DEVIS: "devis",
  PROGRAMME: "programme",
  CONVENTION: "convention",
  CONVOCATION: "convocation",
  EMARGEMENT: "emargement",
  CERTIFICAT: "certificat",
  ATTESTATION: "attestation",
  SATISFACTION: "satisfaction",
  EVAL_CHAUD: "satisfaction",
  EVAL_FROID: "satisfaction",
};

export default function OPCOPage() {
  const [documents, setDocuments] = useState<OPCODoc[]>([]);
  const [formations, setFormations] = useState<Array<{ id: string; title: string; duration: number; priceHT: number; format: string; description: string; objectives: string; targetAudience: string; prerequisites: string; accessModalities: string; accessDelay: string; disabilityAccess: string; teachingMethods: string; evaluationMethods: string }>>([]);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ formationId: "", companyId: "", type: "DEVIS" });
  const [viewingDoc, setViewingDoc] = useState<OPCODoc | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [docsRes, formRes, compRes] = await Promise.all([
        fetch("/api/opco"),
        fetch("/api/formations"),
        fetch("/api/companies"),
      ]);
      const [docsData, formData, compData] = await Promise.all([docsRes.json(), formRes.json(), compRes.json()]);
      setDocuments(docsData.documents || []);
      setFormations(formData.formations || []);
      setCompanies(compData.companies || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/opco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setShowCreate(false);
      fetchAll();
    } catch (error) { console.error(error); }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const now = new Date().toISOString();
      const updates: Record<string, string> = { status };
      if (status === "GENERE") updates.generatedAt = now;
      if (status === "ENVOYE") updates.sentAt = now;
      if (status === "SIGNE") updates.signedAt = now;
      if (status === "VALIDE") updates.validatedAt = now;
      await fetch(`/api/opco/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
      fetchAll();
    } catch (error) { console.error(error); }
  }

  async function generatePDF(doc: OPCODoc) {
    const formation = formations.find((f) => f.id === doc.formationId);
    if (!formation) return;

    const pdfType = pdfTypeMap[doc.type];
    if (!pdfType) { alert("Type de PDF non supporté pour le moment"); return; }

    let body: Record<string, unknown> = {};
    if (pdfType === "programme") {
      body = formation;
    } else if (pdfType === "devis") {
      body = { devisNumber: `DEV-${Date.now()}`, date: new Date().toLocaleDateString("fr-FR"), clientName: doc.company?.name || "Client", formationTitle: formation.title, duration: formation.duration, format: formation.format, priceHT: formation.priceHT };
    } else if (pdfType === "convention") {
      body = { conventionNumber: `CONV-${Date.now()}`, date: new Date().toLocaleDateString("fr-FR"), clientName: doc.company?.name || "Client", formationTitle: formation.title, duration: formation.duration, startDate: "À définir", endDate: "À définir", format: formation.format, priceHT: formation.priceHT };
    } else if (pdfType === "attestation") {
      body = { learnerName: "Apprenant", formationTitle: formation.title, duration: formation.duration, startDate: "À définir", endDate: "À définir", date: new Date().toLocaleDateString("fr-FR") };
    } else if (pdfType === "convocation") {
      body = { learnerName: "Apprenant", formationTitle: formation.title, startDate: "À définir", endDate: "À définir", format: formation.format, date: new Date().toLocaleDateString("fr-FR") };
    } else if (pdfType === "emargement") {
      body = { formationTitle: formation.title, sessionDate: new Date().toLocaleDateString("fr-FR"), trainerName: "Formateur", learners: [{ name: "Apprenant 1" }] };
    } else if (pdfType === "certificat") {
      body = { learnerName: "Apprenant", formationTitle: formation.title, duration: formation.duration, startDate: "À définir", endDate: "À définir", date: new Date().toLocaleDateString("fr-FR"), completionRate: 100 };
    } else if (pdfType === "satisfaction") {
      body = { formationTitle: formation.title, date: new Date().toLocaleDateString("fr-FR"), type: doc.type === "EVAL_FROID" ? "froid" : "chaud" };
    }

    try {
      const res = await fetch(`/api/pdf/${pdfType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${doc.type.toLowerCase()}-${Date.now()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        updateStatus(doc.id, "GENERE");
      }
    } catch (error) { console.error(error); }
  }

  const statusBadge = (s: string) => {
    switch (s) {
      case "VALIDE": return "success";
      case "SIGNE": return "info";
      case "ENVOYE": return "info";
      case "GENERE": return "warning";
      default: return "secondary";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dossiers OPCO</h1>
          <p className="text-sm text-slate-500">Gestion et suivi des documents de formation</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau document
        </Button>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20">
        <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {LEGAL_DISCLAIMER}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 py-8 text-center">Chargement...</p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Formation</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Entreprise</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {docTypes.find((t) => t.value === doc.type)?.label || doc.type}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{doc.formation.title}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{doc.company?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadge(doc.status) as "success" | "info" | "warning" | "secondary"}>
                        {statusOptions.find((s) => s.value === doc.status)?.label || doc.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(doc.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {doc.remarks && doc.remarks.length > 300 && (
                          <button
                            onClick={() => setViewingDoc(doc)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                            title="Voir le template IA"
                          >
                            <FileText className="w-4 h-4 text-cyan-600" />
                          </button>
                        )}
                        <button onClick={() => generatePDF(doc)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Générer PDF">
                          <FileDown className="w-4 h-4 text-cyan-600" />
                        </button>
                        <select
                          value={doc.status}
                          onChange={(e) => updateStatus(doc.id, e.target.value)}
                          className="text-xs border rounded px-1 py-0.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                          {statusOptions.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Aucun document OPCO.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nouveau document OPCO" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Formation *" id="formationId" name="formationId" value={formData.formationId} onChange={(e) => setFormData((p) => ({ ...p, formationId: e.target.value }))} options={formations.map((f) => ({ value: f.id, label: f.title }))} placeholder="Sélectionner..." required />
          <Select label="Entreprise" id="companyId" name="companyId" value={formData.companyId} onChange={(e) => setFormData((p) => ({ ...p, companyId: e.target.value }))} options={companies.map((c) => ({ value: c.id, label: c.name }))} placeholder="Sélectionner..." />
          <Select label="Type de document *" id="type" name="type" value={formData.type} onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))} options={docTypes} required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        title={viewingDoc ? `${docTypes.find((t) => t.value === viewingDoc.type)?.label || viewingDoc.type} — ${viewingDoc.formation.title}` : ""}
        size="xl"
      >
        {viewingDoc?.remarks ? (
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
              <span>Template généré par IA - {viewingDoc.remarks.length} caractères</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewingDoc.remarks || "");
                }}
                className="text-cyan-600 hover:text-cyan-700"
              >
                Copier le markdown
              </button>
            </div>
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <LessonMarkdown content={viewingDoc.remarks} />
            </div>
          </div>
        ) : (
          <p className="text-slate-500">Aucun contenu. Générez le template via le script IA.</p>
        )}
      </Modal>
    </div>
  );
}
