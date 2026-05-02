export const COMPANY = {
  name: "Eleo Informatique",
  brandName: "Eleo Formation",
  legalForm: "SARL",
  address: "49 Avenue Henri Malacrida",
  postalCode: "13100",
  city: "Aix-en-Provence",
  phone: "04 42 29 06 65",
  mobile: "06 10 67 46 52",
  email: "eleo.informatique@gmail.com",
  siret: "87773553000017",
  tvaIntra: "FR79877735530",
  fullAddress: "49 Avenue Henri Malacrida, 13100 Aix-en-Provence",
  website: "https://formation.eleo-informatique.fr",
} as const;

export const LEGAL_DISCLAIMER =
  "Les documents générés doivent être vérifiés par un humain avant usage officiel. Cette plateforme aide à structurer l'activité de formation, mais ne remplace pas un audit Qualiopi, un conseil juridique ou une validation administrative.";

export const AI_DISCLAIMER =
  "Vérification humaine obligatoire avant envoi officiel.";

export const REFUSAL_MESSAGE =
  "Eleo Informatique ne recrute actuellement ni apprenti, ni alternant, ni stagiaire, et n'accueille plus de personnes en immersion gratuite. Seules les demandes de formation financée, contractualisée ou payée en fonds propres sont traitées.";

export const REFUSAL_MESSAGE_LONG = `Eleo Informatique ne recrute actuellement ni apprenti, ni alternant, ni stagiaire, et n'accueille plus de personnes en immersion ou formation gratuite.

L'entreprise accompagne déjà un apprenti, ce qui mobilise notre capacité de formation interne.

Nous ne traitons désormais que les demandes de formation professionnelle financée, contractualisée ou payée en fonds propres.`;

export const CONDITIONS_ACCUEIL = `Eleo Informatique ne recrute actuellement ni apprenti, ni alternant, ni stagiaire.

Aucune demande d'accueil gratuit, d'immersion non financée, de PMSMP gratuite ou de formation informelle ne sera traitée.

Eleo Formation traite uniquement les demandes de formation professionnelle financée, contractualisée ou payée en fonds propres.`;

export const FUNDING_MODES = {
  ENTREPRISE: "Entreprise / facture directe",
  OPCO: "OPCO",
  FRANCE_TRAVAIL: "France Travail ou organisme financeur",
  FONDS_PROPRES: "Fonds propres / paiement personnel",
  NE_SAIT_PAS: "Je ne sais pas encore",
  STAGE_ALTERNANCE: "Stage / alternance / apprentissage",
  IMMERSION_GRATUITE: "Immersion gratuite / PMSMP",
  CANDIDATURE_EMPLOI: "Candidature emploi",
} as const;

export const VALID_FUNDING_MODES = [
  "ENTREPRISE",
  "OPCO",
  "FRANCE_TRAVAIL",
  "FONDS_PROPRES",
  "NE_SAIT_PAS",
] as const;

export const REFUSED_FUNDING_MODES = [
  "STAGE_ALTERNANCE",
  "IMMERSION_GRATUITE",
  "CANDIDATURE_EMPLOI",
] as const;

export type FundingMode = keyof typeof FUNDING_MODES;

export const PROSPECT_STATUSES = {
  NOUVEAU: "Nouveau",
  CONTACTE: "Contacté",
  DEVIS_A_PREPARER: "Devis à préparer",
  DEVIS_ENVOYE: "Devis envoyé",
  GAGNE: "Gagné",
  PERDU: "Perdu",
  PROSPECT_FONDS_PROPRES: "Prospect valide — fonds propres",
  PROSPECT_ENTREPRISE: "Prospect valide — entreprise payeur direct",
  PROSPECT_OPCO: "Prospect valide — OPCO",
  PROSPECT_FRANCE_TRAVAIL: "Prospect valide — France Travail / organisme financeur",
  REFUS_ALTERNANCE: "Refus automatique — alternance/stage",
  REFUS_IMMERSION: "Refus automatique — immersion gratuite",
  REFUS_CANDIDATURE: "Refus automatique — candidature emploi",
  REFUS_NON_FINANCE: "Refus automatique — demande non financée",
  REFUS_GRATUIT: "Refus automatique — demande gratuite",
} as const;
