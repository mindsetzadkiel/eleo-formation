"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/config/company";
import { Mail, Copy, Check } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const templates: EmailTemplate[] = [
  {
    id: "refus-alternance",
    name: "Refus apprentissage / alternance / stage",
    subject: "Réponse à votre demande d'accueil chez Eleo Informatique",
    body: `Bonjour,

Merci pour votre message.

Eleo Informatique ne recrute actuellement ni apprenti, ni alternant, ni stagiaire, et n'accueille plus de personnes en immersion ou formation gratuite.

L'entreprise accompagne déjà un apprenti, ce qui mobilise notre capacité de formation interne.

Nous ne traitons désormais que les demandes de formation professionnelle financée, contractualisée ou payée en fonds propres.

Nous vous souhaitons une bonne continuation dans vos recherches.

Cordialement,
${COMPANY.name}`,
  },
  {
    id: "refus-immersion",
    name: "Refus immersion gratuite / PMSMP",
    subject: "Réponse à votre demande d'immersion",
    body: `Bonjour,

Merci pour votre message.

Eleo Informatique n'accueille plus de personnes en immersion gratuite ni en PMSMP.

Nous proposons uniquement des formations professionnelles financées, contractualisées ou payées en fonds propres.

Si vous souhaitez suivre une formation structurée et que vous disposez d'un financement (OPCO, France Travail, fonds propres), nous pouvons vous transmettre un programme et un devis.

Cordialement,
${COMPANY.name}`,
  },
  {
    id: "reponse-fonds-propres",
    name: "Réponse client fonds propres",
    subject: "Votre demande de formation Eleo Formation",
    body: `Bonjour,

Merci pour votre demande.

Eleo Formation peut accepter les demandes financées directement en fonds propres, à condition qu'elles concernent une formation professionnelle structurée, contractualisée et facturée.

Nous pouvons donc vous transmettre un programme, un devis et les conditions d'inscription.

Merci de nous préciser :
- la formation souhaitée ;
- votre objectif professionnel ;
- votre niveau actuel ;
- le format souhaité : en ligne, atelier à Aix-en-Provence, ou hybride ;
- votre délai idéal de démarrage.

Cordialement,
${COMPANY.name}`,
  },
  {
    id: "proposition-formation",
    name: "Proposition de formation financée",
    subject: "Proposition de formation — Eleo Formation",
    body: `Bonjour,

Suite à votre demande, nous avons le plaisir de vous proposer la formation suivante :

- Intitulé : [à compléter]
- Durée : [à compléter] heures
- Format : Hybride (en ligne + atelier à Aix-en-Provence)
- Tarif : [à compléter] € HT

Vous trouverez en pièce jointe :
- Le programme détaillé
- Le devis
- Les conditions d'inscription

N'hésitez pas à nous contacter pour toute question.

Cordialement,
${COMPANY.name}
${COMPANY.phone}`,
  },
  {
    id: "demande-opco",
    name: "Demande d'information OPCO",
    subject: "Demande de prise en charge — Formation Eleo",
    body: `Madame, Monsieur,

Nous souhaitons vous informer qu'un(e) salarié(e) de l'entreprise [à compléter] souhaite suivre la formation "[à compléter]" dispensée par Eleo Informatique.

Vous trouverez ci-joint :
- Le programme de formation
- Le devis
- La convention de formation

Merci de bien vouloir nous confirmer la prise en charge de cette formation.

Cordialement,
${COMPANY.name}
SIRET : ${COMPANY.siret}
${COMPANY.phone}
${COMPANY.email}`,
  },
  {
    id: "envoi-devis",
    name: "Envoi de devis",
    subject: "Devis formation — Eleo Formation",
    body: `Bonjour,

Suite à votre demande, veuillez trouver ci-joint notre devis pour la formation "[à compléter]".

Ce devis comprend :
- [à compléter] heures de formation
- Format : [à compléter]
- Supports pédagogiques inclus

Le devis est valable 30 jours à compter de sa date d'émission.

N'hésitez pas à nous contacter pour toute question ou précision.

Cordialement,
${COMPANY.name}
${COMPANY.phone}`,
  },
  {
    id: "convocation",
    name: "Convocation apprenant",
    subject: "Convocation — Formation Eleo",
    body: `Bonjour,

Nous avons le plaisir de vous confirmer votre inscription à la formation "[à compléter]".

Détails :
- Date de début : [à compléter]
- Date de fin : [à compléter]
- Format : [à compléter]
- Lieu : [à compléter]

Merci de confirmer votre présence.

Cordialement,
${COMPANY.name}
${COMPANY.phone}`,
  },
  {
    id: "relance-pieces",
    name: "Relance pièces manquantes",
    subject: "Pièces manquantes — Dossier formation",
    body: `Bonjour,

Nous revenons vers vous concernant votre dossier de formation.

Il nous manque les pièces suivantes pour compléter votre inscription :
- [à compléter]

Merci de nous les transmettre dans les meilleurs délais.

Cordialement,
${COMPANY.name}
${COMPANY.phone}`,
  },
  {
    id: "fin-formation",
    name: "Fin de formation + attestation",
    subject: "Fin de formation — Attestation Eleo",
    body: `Bonjour,

Nous vous informons que la formation "[à compléter]" est désormais terminée.

Vous trouverez en pièce jointe :
- Votre attestation de fin de formation
- Votre certificat de réalisation

Nous vous remercions pour votre participation et restons à votre disposition.

Cordialement,
${COMPANY.name}
${COMPANY.phone}`,
  },
  {
    id: "reponse-france-travail",
    name: "Réponse à France Travail",
    subject: "Réponse — Eleo Informatique",
    body: `Bonjour,

Merci pour votre message.

Eleo Informatique ne propose que des formations professionnelles financées, contractualisées et facturées.

Nous n'accueillons ni stagiaire, ni alternant, ni apprenti, et ne réalisons plus d'immersions ou de PMSMP gratuites.

Si un dispositif de financement est validé et contractualisé pour un candidat, nous pouvons étudier la demande et transmettre un programme et un devis.

Cordialement,
${COMPANY.name}
${COMPANY.phone}
${COMPANY.email}`,
  },
  {
    id: "proposition-entreprise",
    name: "Proposition entreprise payeur direct",
    subject: "Formation pour vos salariés — Eleo Formation",
    body: `Bonjour,

Suite à notre échange, nous vous proposons la formation "[à compléter]" pour votre/vos salarié(s).

Détails :
- Durée : [à compléter] heures
- Format : Hybride (en ligne + atelier Aix-en-Provence)
- Tarif : [à compléter] € HT

Possibilité de prise en charge par votre OPCO : [à compléter].

Vous trouverez ci-joint le programme détaillé et le devis.

Cordialement,
${COMPANY.name}
${COMPANY.phone}`,
  },
];

export default function EmailsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyTemplate(template: EmailTemplate) {
    const text = `Objet : ${template.subject}\n\n${template.body}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="w-7 h-7 text-cyan-600" />
          Modèles d&apos;emails
        </h1>
        <p className="text-sm text-slate-500">
          Modèles prêts à copier pour les communications courantes
        </p>
      </div>

      <div className="space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{template.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">Objet : {template.subject}</p>
              </div>
              <Button
                size="sm"
                variant={copiedId === template.id ? "secondary" : "outline"}
                onClick={() => copyTemplate(template)}
              >
                {copiedId === template.id ? (
                  <><Check className="w-4 h-4 mr-1" /> Copié</>
                ) : (
                  <><Copy className="w-4 h-4 mr-1" /> Copier</>
                )}
              </Button>
            </div>
            <div className="px-6 py-4">
              <pre className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {template.body}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
