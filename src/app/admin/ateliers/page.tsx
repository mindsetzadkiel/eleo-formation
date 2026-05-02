"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { COMPANY } from "@/config/company";
import { Wrench, ClipboardList, Shield, Users, CheckCircle2 } from "lucide-react";

const equipmentList = [
  "Tournevis cruciforme et plat (précision)",
  "Bracelet antistatique",
  "Pâte thermique",
  "Bombe à air comprimé",
  "SSD SATA 2.5\" et M.2 NVMe (démo)",
  "Barrettes RAM DDR4 (démo)",
  "Multimètre basique",
  "Câbles SATA, alimentation",
  "PC tour ouvert (cas pratique)",
  "Ordinateur portable (cas pratique)",
  "Écran, clavier, souris de test",
  "Clé USB bootable (Linux live, Windows PE)",
  "Switch réseau + câbles RJ45",
];

const safetyRules = [
  "Toujours porter un bracelet antistatique lors de la manipulation de composants",
  "Débrancher l'alimentation avant toute intervention",
  "Ne jamais forcer un composant dans un slot",
  "Travailler sur une surface propre et dégagée",
  "Manipuler les composants par les bords",
  "Ranger les vis dans un récipient magnétique",
  "Signaler immédiatement tout incident",
];

const practicalCases = [
  {
    title: "Cas 1 — PC lent, 8 Go RAM, HDD mécanique",
    description: "Diagnostic des causes de lenteur. Proposition de remplacement HDD par SSD. Clonage et migration.",
  },
  {
    title: "Cas 2 — PC qui s'éteint aléatoirement",
    description: "Vérification alimentation, températures, RAM. Test composant par composant.",
  },
  {
    title: "Cas 3 — Client victime de phishing",
    description: "Analyse de la situation. Changement des mots de passe. Vérification des accès. Mise en place MFA.",
  },
  {
    title: "Cas 4 — Sauvegarde inexistante",
    description: "Audit de la situation. Mise en place d'une sauvegarde locale et cloud. Procédure de restauration.",
  },
  {
    title: "Cas 5 — Mac lent, stockage plein",
    description: "Nettoyage stockage macOS. Optimisation démarrage. Vérification Time Machine.",
  },
];

const competenceGrid = [
  { skill: "Diagnostic symptômes", levels: ["Identifie les symptômes de base", "Distingue matériel/logiciel/réseau", "Diagnostic autonome complet"] },
  { skill: "Remplacement SSD/RAM", levels: ["Observe la procédure", "Réalise avec aide", "Réalise en autonomie"] },
  { skill: "Nettoyage logiciel", levels: ["Connaît les outils", "Applique la procédure", "Adapte selon contexte"] },
  { skill: "Cybersécurité client", levels: ["Connaît les risques", "Applique les bonnes pratiques", "Forme le client"] },
  { skill: "Utilisation IA diagnostic", levels: ["Connaît les possibilités", "Formule des prompts efficaces", "Vérifie et adapte les résultats"] },
  { skill: "Communication client", levels: ["Écoute le besoin", "Explique simplement", "Rédige un rapport clair"] },
];

export default function AteliersPage() {
  const [activeTab, setActiveTab] = useState<"planning" | "materiel" | "securite" | "cas" | "grille">("planning");

  const tabs = [
    { id: "planning" as const, label: "Planning", icon: Users },
    { id: "materiel" as const, label: "Matériel", icon: Wrench },
    { id: "securite" as const, label: "Sécurité", icon: Shield },
    { id: "cas" as const, label: "Cas pratiques", icon: ClipboardList },
    { id: "grille" as const, label: "Grille compétences", icon: CheckCircle2 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wrench className="w-7 h-7 text-cyan-600" />
          Atelier présentiel
        </h1>
        <p className="text-sm text-slate-500">
          Gestion de l&apos;atelier pratique — {COMPANY.fullAddress}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Planning */}
      {activeTab === "planning" && (
        <Card>
          <CardHeader>
            <CardTitle>Planning atelier</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">
              Les sessions d&apos;atelier sont planifiées dans le module Sessions.
              Chaque session hybride inclut des jours de présentiel à l&apos;atelier Eleo.
            </p>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">Informations atelier</h3>
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <p><strong>Lieu :</strong> {COMPANY.fullAddress}</p>
                <p><strong>Capacité :</strong> 4 postes de travail</p>
                <p><strong>Horaires :</strong> 9h — 12h30 / 13h30 — 17h</p>
                <p><strong>Accès :</strong> Sur rendez-vous uniquement, dans le cadre d&apos;une formation contractualisée</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={() => window.location.href = "/admin/sessions"}>
                Gérer les sessions &rarr;
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matériel */}
      {activeTab === "materiel" && (
        <Card>
          <CardHeader>
            <CardTitle>Liste du matériel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {equipmentList.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-xs font-medium text-cyan-600">
                    {i + 1}
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sécurité */}
      {activeTab === "securite" && (
        <Card>
          <CardHeader>
            <CardTitle>Consignes de sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safetyRules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20">
                  <Shield className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{rule}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cas pratiques */}
      {activeTab === "cas" && (
        <div className="space-y-4">
          {practicalCases.map((cas, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">{cas.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-300">{cas.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Grille de compétences */}
      {activeTab === "grille" && (
        <Card>
          <CardHeader>
            <CardTitle>Grille de compétences pratiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Compétence</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Niveau 1 — Découverte</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Niveau 2 — Application</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Niveau 3 — Autonomie</th>
                  </tr>
                </thead>
                <tbody>
                  {competenceGrid.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row.skill}</td>
                      {row.levels.map((level, j) => (
                        <td key={j} className="px-4 py-3 text-slate-600 dark:text-slate-300">{level}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
