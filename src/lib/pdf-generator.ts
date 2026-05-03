import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { COMPANY, LEGAL_DISCLAIMER } from "@/config/company";

const COLORS = {
  primary: rgb(0.1, 0.4, 0.7),
  dark: rgb(0.15, 0.15, 0.15),
  gray: rgb(0.4, 0.4, 0.4),
  lightGray: rgb(0.85, 0.85, 0.85),
  white: rgb(1, 1, 1),
  accent: rgb(0, 0.6, 0.8),
};

async function createBasePdf() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  return { pdf, font, fontBold };
}

function addHeader(
  page: ReturnType<typeof PDFDocument.prototype.addPage>,
  fontBold: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
  font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
  title: string
) {
  const { height } = page.getSize();
  const y = height - 50;

  page.drawText(COMPANY.brandName, {
    x: 50,
    y,
    size: 18,
    font: fontBold,
    color: COLORS.primary,
  });

  page.drawText(COMPANY.name, {
    x: 50,
    y: y - 20,
    size: 9,
    font,
    color: COLORS.gray,
  });

  page.drawText(`${COMPANY.address}, ${COMPANY.postalCode} ${COMPANY.city}`, {
    x: 50,
    y: y - 32,
    size: 8,
    font,
    color: COLORS.gray,
  });

  page.drawText(
    `Tél : ${COMPANY.phone} | ${COMPANY.email} | SIRET : ${COMPANY.siret}`,
    {
      x: 50,
      y: y - 44,
      size: 8,
      font,
      color: COLORS.gray,
    }
  );

  page.drawLine({
    start: { x: 50, y: y - 55 },
    end: { x: 545, y: y - 55 },
    thickness: 1,
    color: COLORS.primary,
  });

  page.drawText(title.toUpperCase(), {
    x: 50,
    y: y - 80,
    size: 14,
    font: fontBold,
    color: COLORS.primary,
  });

  return y - 110;
}

function addFooter(
  page: ReturnType<typeof PDFDocument.prototype.addPage>,
  font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>,
  pageNum: number,
  totalPages: number
) {
  page.drawLine({
    start: { x: 50, y: 60 },
    end: { x: 545, y: 60 },
    thickness: 0.5,
    color: COLORS.lightGray,
  });

  page.drawText(
    `${COMPANY.brandName} — ${COMPANY.name} — SIRET ${COMPANY.siret} — TVA ${COMPANY.tvaIntra}`,
    {
      x: 50,
      y: 45,
      size: 7,
      font,
      color: COLORS.gray,
    }
  );

  page.drawText(`Page ${pageNum}/${totalPages}`, {
    x: 500,
    y: 45,
    size: 7,
    font,
    color: COLORS.gray,
  });
}

function wrapText(text: string, font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>, fontSize: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generateProgrammePDF(formation: {
  title: string;
  description: string;
  objectives: string;
  targetAudience: string;
  prerequisites: string;
  duration: number;
  format: string;
  priceHT: number;
  accessModalities: string;
  accessDelay: string;
  disabilityAccess: string;
  teachingMethods: string;
  evaluationMethods: string;
  modules?: Array<{ title: string; description: string; duration: number }>;
}): Promise<Uint8Array> {
  const { pdf, font, fontBold } = await createBasePdf();
  const page = pdf.addPage([595, 842]);
  let y = addHeader(page, fontBold, font, "Programme de formation");

  const sections = [
    { label: "Intitulé", value: formation.title },
    { label: "Durée", value: `${formation.duration} heures` },
    { label: "Format", value: formation.format },
    { label: "Tarif HT", value: `${formation.priceHT.toFixed(2)} € HT` },
    { label: "Description", value: formation.description },
    { label: "Objectifs pédagogiques", value: formation.objectives },
    { label: "Public cible", value: formation.targetAudience },
    { label: "Prérequis", value: formation.prerequisites },
    { label: "Modalités d'accès", value: formation.accessModalities },
    { label: "Délais d'accès", value: formation.accessDelay },
    { label: "Accessibilité handicap", value: formation.disabilityAccess },
    { label: "Méthodes pédagogiques", value: formation.teachingMethods },
    { label: "Modalités d'évaluation", value: formation.evaluationMethods },
  ];

  for (const section of sections) {
    if (y < 100) break;
    page.drawText(`${section.label} :`, {
      x: 50,
      y,
      size: 9,
      font: fontBold,
      color: COLORS.dark,
    });
    y -= 14;
    const lines = wrapText(section.value, font, 8, 470);
    for (const line of lines) {
      if (y < 80) break;
      page.drawText(line, { x: 60, y, size: 8, font, color: COLORS.gray });
      y -= 12;
    }
    y -= 6;
  }

  addFooter(page, font, 1, 1);

  return pdf.save();
}

export async function generateDevisPDF(data: {
  devisNumber: string;
  date: string;
  clientName: string;
  clientAddress?: string;
  clientSiret?: string;
  formationTitle: string;
  duration: number;
  format: string;
  priceHT: number;
  learnerName?: string;
}): Promise<Uint8Array> {
  const { pdf, font, fontBold } = await createBasePdf();
  const page = pdf.addPage([595, 842]);
  let y = addHeader(page, fontBold, font, "Devis");

  page.drawText(`Devis N° : ${data.devisNumber}`, { x: 50, y, size: 10, font: fontBold, color: COLORS.dark });
  y -= 16;
  page.drawText(`Date : ${data.date}`, { x: 50, y, size: 9, font, color: COLORS.gray });
  y -= 30;

  page.drawText("Client :", { x: 50, y, size: 10, font: fontBold, color: COLORS.dark });
  y -= 14;
  page.drawText(data.clientName, { x: 60, y, size: 9, font, color: COLORS.dark });
  y -= 12;
  if (data.clientAddress) {
    page.drawText(data.clientAddress, { x: 60, y, size: 8, font, color: COLORS.gray });
    y -= 12;
  }
  if (data.clientSiret) {
    page.drawText(`SIRET : ${data.clientSiret}`, { x: 60, y, size: 8, font, color: COLORS.gray });
    y -= 12;
  }
  y -= 20;

  // Table header
  page.drawRectangle({ x: 50, y: y - 2, width: 495, height: 20, color: COLORS.primary });
  page.drawText("Désignation", { x: 55, y: y + 3, size: 9, font: fontBold, color: COLORS.white });
  page.drawText("Durée", { x: 320, y: y + 3, size: 9, font: fontBold, color: COLORS.white });
  page.drawText("Montant HT", { x: 430, y: y + 3, size: 9, font: fontBold, color: COLORS.white });
  y -= 22;

  // Table row
  page.drawText(data.formationTitle, { x: 55, y: y + 3, size: 8, font, color: COLORS.dark });
  page.drawText(`${data.duration}h`, { x: 330, y: y + 3, size: 8, font, color: COLORS.dark });
  page.drawText(`${data.priceHT.toFixed(2)} €`, { x: 435, y: y + 3, size: 8, font, color: COLORS.dark });
  y -= 20;

  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: COLORS.lightGray });
  y -= 20;

  const tva = data.priceHT * 0.2;
  const ttc = data.priceHT + tva;

  page.drawText(`Total HT : ${data.priceHT.toFixed(2)} €`, { x: 400, y, size: 9, font, color: COLORS.dark });
  y -= 14;
  page.drawText(`TVA (20%) : ${tva.toFixed(2)} €`, { x: 400, y, size: 9, font, color: COLORS.dark });
  y -= 14;
  page.drawText(`Total TTC : ${ttc.toFixed(2)} €`, { x: 400, y, size: 10, font: fontBold, color: COLORS.primary });
  y -= 30;

  page.drawText("Conditions :", { x: 50, y, size: 9, font: fontBold, color: COLORS.dark });
  y -= 14;
  page.drawText("• Validité du devis : 30 jours", { x: 60, y, size: 8, font, color: COLORS.gray });
  y -= 12;
  page.drawText("• Paiement à 30 jours après facturation", { x: 60, y, size: 8, font, color: COLORS.gray });
  y -= 12;
  page.drawText("• Formation contractualisée et facturée", { x: 60, y, size: 8, font, color: COLORS.gray });

  addFooter(page, font, 1, 1);
  return pdf.save();
}

export async function generateConventionPDF(data: {
  conventionNumber: string;
  date: string;
  clientName: string;
  clientAddress?: string;
  clientSiret?: string;
  formationTitle: string;
  duration: number;
  startDate: string;
  endDate: string;
  format: string;
  location?: string;
  priceHT: number;
  learnerName?: string;
}): Promise<Uint8Array> {
  const { pdf, font, fontBold } = await createBasePdf();
  const page = pdf.addPage([595, 842]);
  let y = addHeader(page, fontBold, font, "Convention de formation professionnelle");

  page.drawText(`Convention N° : ${data.conventionNumber}`, { x: 50, y, size: 10, font: fontBold, color: COLORS.dark });
  y -= 16;
  page.drawText(`Date : ${data.date}`, { x: 50, y, size: 9, font, color: COLORS.gray });
  y -= 25;

  page.drawText("Entre :", { x: 50, y, size: 10, font: fontBold, color: COLORS.dark });
  y -= 14;
  page.drawText(`${COMPANY.name}, ${COMPANY.fullAddress}`, { x: 60, y, size: 8, font, color: COLORS.dark });
  y -= 12;
  page.drawText(`SIRET : ${COMPANY.siret} — TVA : ${COMPANY.tvaIntra}`, { x: 60, y, size: 8, font, color: COLORS.gray });
  y -= 12;
  page.drawText(`Ci-après dénommé "l'organisme de formation"`, { x: 60, y, size: 8, font, color: COLORS.gray });
  y -= 20;

  page.drawText("Et :", { x: 50, y, size: 10, font: fontBold, color: COLORS.dark });
  y -= 14;
  page.drawText(data.clientName, { x: 60, y, size: 8, font, color: COLORS.dark });
  y -= 12;
  if (data.clientAddress) {
    page.drawText(data.clientAddress, { x: 60, y, size: 8, font, color: COLORS.gray });
    y -= 12;
  }
  if (data.clientSiret) {
    page.drawText(`SIRET : ${data.clientSiret}`, { x: 60, y, size: 8, font, color: COLORS.gray });
    y -= 12;
  }
  page.drawText(`Ci-après dénommé "le client"`, { x: 60, y, size: 8, font, color: COLORS.gray });
  y -= 25;

  const articles = [
    { title: "Article 1 — Objet", content: `Le client souhaite faire bénéficier son(ses) salarié(s) de la formation "${data.formationTitle}" organisée par l'organisme de formation.` },
    { title: "Article 2 — Durée et dates", content: `La formation se déroulera du ${data.startDate} au ${data.endDate}, pour une durée totale de ${data.duration} heures.` },
    { title: "Article 3 — Format", content: `Format : ${data.format}${data.location ? ` — Lieu : ${data.location}` : ""}` },
    { title: "Article 4 — Prix", content: `Le prix de la formation est fixé à ${data.priceHT.toFixed(2)} € HT, soit ${(data.priceHT * 1.2).toFixed(2)} € TTC.` },
    { title: "Article 5 — Modalités de paiement", content: "Le paiement est dû à réception de la facture, à 30 jours." },
  ];

  for (const article of articles) {
    if (y < 100) break;
    page.drawText(article.title, { x: 50, y, size: 9, font: fontBold, color: COLORS.dark });
    y -= 14;
    const lines = wrapText(article.content, font, 8, 470);
    for (const line of lines) {
      if (y < 80) break;
      page.drawText(line, { x: 60, y, size: 8, font, color: COLORS.gray });
      y -= 12;
    }
    y -= 10;
  }

  y -= 10;
  if (y > 150) {
    page.drawText("Signature organisme de formation", { x: 50, y, size: 8, font, color: COLORS.gray });
    page.drawText("Signature client", { x: 370, y, size: 8, font, color: COLORS.gray });
  }

  addFooter(page, font, 1, 1);
  return pdf.save();
}

export async function generateAttestationPDF(data: {
  learnerName: string;
  formationTitle: string;
  duration: number;
  startDate: string;
  endDate: string;
  date: string;
}): Promise<Uint8Array> {
  const { pdf, font, fontBold } = await createBasePdf();
  const page = pdf.addPage([595, 842]);
  let y = addHeader(page, fontBold, font, "Attestation de fin de formation");

  y -= 10;
  page.drawText("Nous soussignés, Eleo Informatique, organisme de formation,", { x: 50, y, size: 9, font, color: COLORS.dark });
  y -= 20;
  page.drawText("attestons que :", { x: 50, y, size: 9, font, color: COLORS.dark });
  y -= 25;

  page.drawText(`M./Mme ${data.learnerName}`, { x: 70, y, size: 11, font: fontBold, color: COLORS.primary });
  y -= 25;

  page.drawText("a suivi la formation :", { x: 50, y, size: 9, font, color: COLORS.dark });
  y -= 20;
  page.drawText(`"${data.formationTitle}"`, { x: 70, y, size: 10, font: fontBold, color: COLORS.dark });
  y -= 25;

  const details = [
    `Durée : ${data.duration} heures`,
    `Du ${data.startDate} au ${data.endDate}`,
    `Dispensée par : ${COMPANY.name}`,
    `Lieu : ${COMPANY.fullAddress} et/ou à distance`,
  ];

  for (const detail of details) {
    page.drawText(`• ${detail}`, { x: 60, y, size: 9, font, color: COLORS.dark });
    y -= 16;
  }

  y -= 30;
  page.drawText(`Fait à ${COMPANY.city}, le ${data.date}`, { x: 50, y, size: 9, font, color: COLORS.dark });
  y -= 30;
  page.drawText("Le responsable de l'organisme de formation", { x: 50, y, size: 8, font, color: COLORS.gray });
  y -= 14;
  page.drawText(COMPANY.name, { x: 50, y, size: 9, font: fontBold, color: COLORS.dark });

  addFooter(page, font, 1, 1);
  return pdf.save();
}

export async function generateEmargementPDF(data: {
  formationTitle: string;
  sessionDate: string;
  trainerName: string;
  learners: Array<{ name: string }>;
}): Promise<Uint8Array> {
  const { pdf, font, fontBold } = await createBasePdf();
  const page = pdf.addPage([595, 842]);
  let y = addHeader(page, fontBold, font, "Feuille d'émargement");

  page.drawText(`Formation : ${data.formationTitle}`, { x: 50, y, size: 9, font: fontBold, color: COLORS.dark });
  y -= 14;
  page.drawText(`Date : ${data.sessionDate}`, { x: 50, y, size: 9, font, color: COLORS.gray });
  y -= 14;
  page.drawText(`Formateur : ${data.trainerName}`, { x: 50, y, size: 9, font, color: COLORS.gray });
  y -= 25;

  // Table header
  page.drawRectangle({ x: 50, y: y - 2, width: 495, height: 20, color: COLORS.primary });
  page.drawText("Nom", { x: 55, y: y + 3, size: 9, font: fontBold, color: COLORS.white });
  page.drawText("Matin", { x: 230, y: y + 3, size: 9, font: fontBold, color: COLORS.white });
  page.drawText("Après-midi", { x: 350, y: y + 3, size: 9, font: fontBold, color: COLORS.white });
  y -= 22;

  for (const learner of data.learners) {
    if (y < 100) break;
    page.drawText(learner.name, { x: 55, y: y + 3, size: 8, font, color: COLORS.dark });
    page.drawRectangle({ x: 230, y: y - 2, width: 80, height: 18, borderColor: COLORS.lightGray, borderWidth: 1, color: COLORS.white });
    page.drawRectangle({ x: 350, y: y - 2, width: 80, height: 18, borderColor: COLORS.lightGray, borderWidth: 1, color: COLORS.white });
    y -= 22;
  }

  y -= 20;
  page.drawText("Signature formateur :", { x: 50, y, size: 8, font, color: COLORS.gray });

  addFooter(page, font, 1, 1);
  return pdf.save();
}

export async function generateCertificatPDF(data: {
  learnerName: string;
  formationTitle: string;
  duration: number;
  startDate: string;
  endDate: string;
  date: string;
  completionRate: number;
}): Promise<Uint8Array> {
  const { pdf, font, fontBold } = await createBasePdf();
  const page = pdf.addPage([595, 842]);
  let y = addHeader(page, fontBold, font, "Certificat de réalisation");

  y -= 10;
  page.drawText("L'organisme de formation Eleo Informatique certifie que :", { x: 50, y, size: 9, font, color: COLORS.dark });
  y -= 25;
  page.drawText(`M./Mme ${data.learnerName}`, { x: 70, y, size: 11, font: fontBold, color: COLORS.primary });
  y -= 25;
  page.drawText("a bien réalisé l'action de formation suivante :", { x: 50, y, size: 9, font, color: COLORS.dark });
  y -= 20;
  page.drawText(`"${data.formationTitle}"`, { x: 70, y, size: 10, font: fontBold, color: COLORS.dark });
  y -= 25;

  const details = [
    `Durée prévue : ${data.duration} heures`,
    `Période : du ${data.startDate} au ${data.endDate}`,
    `Taux de réalisation : ${data.completionRate}%`,
    `Nature de l'action : Action de formation`,
  ];

  for (const detail of details) {
    page.drawText(`• ${detail}`, { x: 60, y, size: 9, font, color: COLORS.dark });
    y -= 16;
  }

  y -= 30;
  page.drawText(`Fait à ${COMPANY.city}, le ${data.date}`, { x: 50, y, size: 9, font, color: COLORS.dark });
  y -= 30;
  page.drawText("Le responsable de l'organisme de formation", { x: 50, y, size: 8, font, color: COLORS.gray });
  y -= 14;
  page.drawText(COMPANY.name, { x: 50, y, size: 9, font: fontBold, color: COLORS.dark });

  y -= 40;
  const disclaimerLines = wrapText(LEGAL_DISCLAIMER, font, 7, 470);
  for (const line of disclaimerLines) {
    page.drawText(line, { x: 50, y, size: 7, font, color: COLORS.gray });
    y -= 10;
  }

  addFooter(page, font, 1, 1);
  return pdf.save();
}

export async function generateSatisfactionPDF(data: {
  formationTitle: string;
  date: string;
  type: "chaud" | "froid";
}): Promise<Uint8Array> {
  const { pdf, font, fontBold } = await createBasePdf();
  const page = pdf.addPage([595, 842]);
  const typeLabel = data.type === "chaud" ? "Évaluation à chaud" : "Évaluation à froid";
  let y = addHeader(page, fontBold, font, typeLabel);

  page.drawText(`Formation : ${data.formationTitle}`, { x: 50, y, size: 9, font: fontBold, color: COLORS.dark });
  y -= 14;
  page.drawText(`Date : ${data.date}`, { x: 50, y, size: 9, font, color: COLORS.gray });
  y -= 25;

  const questions = data.type === "chaud"
    ? [
        "La formation a-t-elle répondu à vos attentes ?",
        "Le contenu était-il adapté à votre niveau ?",
        "Le formateur était-il compétent et pédagogue ?",
        "Les supports pédagogiques étaient-ils adaptés ?",
        "L'organisation logistique était-elle satisfaisante ?",
        "Recommanderiez-vous cette formation ?",
        "Commentaires et suggestions :",
      ]
    : [
        "Avez-vous pu appliquer les connaissances acquises ?",
        "La formation a-t-elle eu un impact sur votre pratique professionnelle ?",
        "Quels modules vous ont été les plus utiles ?",
        "Avez-vous rencontré des difficultés dans l'application ?",
        "Avez-vous des besoins de formation complémentaires ?",
        "Commentaires et suggestions :",
      ];

  const scale = "1 = Pas du tout — 2 = Un peu — 3 = Moyennement — 4 = Plutôt oui — 5 = Tout à fait";
  page.drawText(scale, { x: 50, y, size: 7, font, color: COLORS.gray });
  y -= 20;

  for (const question of questions) {
    if (y < 100) break;
    page.drawText(`• ${question}`, { x: 50, y, size: 9, font, color: COLORS.dark });
    y -= 14;
    if (!question.includes("Commentaires")) {
      page.drawText("1  ☐    2  ☐    3  ☐    4  ☐    5  ☐", { x: 70, y, size: 9, font, color: COLORS.gray });
      y -= 18;
    } else {
      page.drawRectangle({ x: 50, y: y - 40, width: 495, height: 50, borderColor: COLORS.lightGray, borderWidth: 1, color: COLORS.white });
      y -= 50;
    }
  }

  y -= 15;
  page.drawText("Nom : ____________________    Date : ____________________    Signature : ____________________", {
    x: 50, y, size: 8, font, color: COLORS.gray,
  });

  addFooter(page, font, 1, 1);
  return pdf.save();
}

export async function generateReglementInterieurPDF(data: {
  version: string;
  title: string;
  content: string; // markdown simple — on rend en texte avec mise en forme heuristique
  date: string;
}): Promise<Uint8Array> {
  const { pdf, font, fontBold } = await createBasePdf();
  let page = pdf.addPage([595, 842]);
  let y = addHeader(page, fontBold, font, data.title);

  page.drawText(`Version ${data.version} — ${data.date}`, { x: 50, y, size: 9, font, color: COLORS.gray });
  y -= 25;

  // Parser markdown rudimentaire (## titres, paragraphes, puces)
  const lines = data.content.split(/\r?\n/);
  for (const raw of lines) {
    if (y < 90) {
      addFooter(page, font, 1, 1);
      page = pdf.addPage([595, 842]);
      y = addHeader(page, fontBold, font, data.title);
    }
    const line = raw.trim();
    if (!line) { y -= 8; continue; }
    if (line.startsWith("## ")) {
      y -= 6;
      page.drawText(line.replace(/^##\s*/, ""), { x: 50, y, size: 11, font: fontBold, color: COLORS.primary });
      y -= 16;
      continue;
    }
    if (line.startsWith("# ")) {
      y -= 6;
      page.drawText(line.replace(/^#\s*/, ""), { x: 50, y, size: 13, font: fontBold, color: COLORS.dark });
      y -= 18;
      continue;
    }
    const isBullet = /^[-*•]\s+/.test(line);
    const text = isBullet ? line.replace(/^[-*•]\s+/, "") : line;
    const wrapped = wrapText(text, font, 9, isBullet ? 460 : 480);
    for (let i = 0; i < wrapped.length; i++) {
      if (y < 80) {
        addFooter(page, font, 1, 1);
        page = pdf.addPage([595, 842]);
        y = addHeader(page, fontBold, font, data.title);
      }
      const prefix = isBullet && i === 0 ? "• " : "";
      page.drawText(prefix + wrapped[i], {
        x: isBullet ? 60 : 50,
        y,
        size: 9,
        font,
        color: COLORS.dark,
      });
      y -= 13;
    }
    y -= 3;
  }

  addFooter(page, font, 1, 1);
  return pdf.save();
}

export async function generateLearnerProgressPDF(data: {
  learnerName: string;
  learnerEmail: string;
  formationTitle: string;
  startDate: string;
  endDate: string;
  duration: number;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  modules: Array<{
    title: string;
    orderIndex: number;
    completed: number;
    total: number;
    bestQuizScore?: number | null;
    lessons: Array<{ title: string; completed: boolean; completedAt?: string | null }>;
  }>;
  quizAttempts: Array<{ title: string; module: string; scorePct: number | null; passed: boolean; date: string }>;
  trainerNotes?: string;
  date: string;
}): Promise<Uint8Array> {
  const { pdf, font, fontBold } = await createBasePdf();
  let page = pdf.addPage([595, 842]);
  let y = addHeader(page, fontBold, font, "Fiche de suivi de l'apprenant");

  page.drawText(`Apprenant : ${data.learnerName}`, { x: 50, y, size: 10, font: fontBold, color: COLORS.dark });
  y -= 14;
  page.drawText(`Email : ${data.learnerEmail}`, { x: 50, y, size: 9, font, color: COLORS.gray });
  y -= 14;
  page.drawText(`Formation : ${data.formationTitle}`, { x: 50, y, size: 9, font: fontBold, color: COLORS.dark });
  y -= 14;
  page.drawText(`Période : du ${data.startDate} au ${data.endDate} — ${data.duration}h`, { x: 50, y, size: 9, font, color: COLORS.gray });
  y -= 22;

  // Progression globale
  page.drawText(`Progression globale : ${data.progressPercent}%`, { x: 50, y, size: 12, font: fontBold, color: COLORS.primary });
  y -= 14;
  page.drawText(`${data.completedLessons}/${data.totalLessons} leçons terminées`, { x: 50, y, size: 9, font, color: COLORS.gray });
  y -= 18;

  // Barre de progression
  page.drawRectangle({ x: 50, y, width: 495, height: 8, color: COLORS.lightGray });
  page.drawRectangle({ x: 50, y, width: Math.max(2, (495 * data.progressPercent) / 100), height: 8, color: COLORS.primary });
  y -= 22;

  // Détail par module
  page.drawText("Détail par module", { x: 50, y, size: 11, font: fontBold, color: COLORS.dark });
  y -= 16;

  for (const m of data.modules) {
    if (y < 130) {
      addFooter(page, font, 1, 1);
      page = pdf.addPage([595, 842]);
      y = addHeader(page, fontBold, font, "Fiche de suivi (suite)");
    }
    const modPct = m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0;
    page.drawText(`Module ${m.orderIndex} — ${m.title}`, { x: 50, y, size: 9, font: fontBold, color: COLORS.dark });
    y -= 13;
    const subline = `${m.completed}/${m.total} leçons (${modPct}%)${m.bestQuizScore != null ? ` · meilleur quiz : ${Math.round(m.bestQuizScore)}%` : ""}`;
    page.drawText(subline, { x: 60, y, size: 8, font, color: COLORS.gray });
    y -= 12;

    for (const l of m.lessons) {
      if (y < 80) {
        addFooter(page, font, 1, 1);
        page = pdf.addPage([595, 842]);
        y = addHeader(page, fontBold, font, "Fiche de suivi (suite)");
      }
      const mark = l.completed ? "✓" : "○";
      const dateStr = l.completed && l.completedAt ? `  (${l.completedAt})` : "";
      page.drawText(`  ${mark} ${l.title}${dateStr}`, { x: 60, y, size: 8, font, color: l.completed ? COLORS.dark : COLORS.gray });
      y -= 10;
    }
    y -= 6;
  }

  // Quiz attempts
  if (data.quizAttempts.length > 0) {
    if (y < 130) {
      addFooter(page, font, 1, 1);
      page = pdf.addPage([595, 842]);
      y = addHeader(page, fontBold, font, "Fiche de suivi (suite)");
    }
    page.drawText("Évaluations passées", { x: 50, y, size: 11, font: fontBold, color: COLORS.dark });
    y -= 16;

    for (const qa of data.quizAttempts) {
      if (y < 80) {
        addFooter(page, font, 1, 1);
        page = pdf.addPage([595, 842]);
        y = addHeader(page, fontBold, font, "Fiche de suivi (suite)");
      }
      const status = qa.passed ? "VALIDE" : qa.scorePct != null ? `${qa.scorePct}%` : "—";
      const line = `• ${qa.date} — ${qa.module} — ${qa.title} : ${status}`;
      page.drawText(line, { x: 50, y, size: 9, font, color: COLORS.dark });
      y -= 13;
    }
    y -= 6;
  }

  // Notes formateur
  if (data.trainerNotes) {
    if (y < 130) {
      addFooter(page, font, 1, 1);
      page = pdf.addPage([595, 842]);
      y = addHeader(page, fontBold, font, "Fiche de suivi (suite)");
    }
    page.drawText("Notes du formateur", { x: 50, y, size: 11, font: fontBold, color: COLORS.dark });
    y -= 16;
    const wrapped = wrapText(data.trainerNotes, font, 9, 480);
    for (const line of wrapped) {
      if (y < 80) {
        addFooter(page, font, 1, 1);
        page = pdf.addPage([595, 842]);
        y = addHeader(page, fontBold, font, "Fiche de suivi (suite)");
      }
      page.drawText(line, { x: 50, y, size: 9, font, color: COLORS.dark });
      y -= 12;
    }
  }

  // Signatures
  if (y < 100) {
    addFooter(page, font, 1, 1);
    page = pdf.addPage([595, 842]);
    y = addHeader(page, fontBold, font, "Fiche de suivi (suite)");
  }
  y -= 20;
  page.drawText(`Fait à ${COMPANY.city}, le ${data.date}`, { x: 50, y, size: 9, font, color: COLORS.dark });
  y -= 25;
  page.drawText("Signature formateur :", { x: 50, y, size: 8, font, color: COLORS.gray });
  page.drawText("Signature apprenant :", { x: 350, y, size: 8, font, color: COLORS.gray });

  addFooter(page, font, 1, 1);
  return pdf.save();
}

export async function generatePositioningPDF(data: {
  formationTitle: string;
  questions: Array<{ orderIndex: number; question: string; type: string }>;
  date: string;
}): Promise<Uint8Array> {
  const { pdf, font, fontBold } = await createBasePdf();
  let page = pdf.addPage([595, 842]);
  let y = addHeader(page, fontBold, font, "Questionnaire de positionnement");

  page.drawText(`Formation : ${data.formationTitle}`, { x: 50, y, size: 9, font: fontBold, color: COLORS.dark });
  y -= 14;
  page.drawText(`Date : ${data.date}`, { x: 50, y, size: 9, font, color: COLORS.gray });
  y -= 14;
  page.drawText("À remplir avant le démarrage de la formation pour adapter le parcours à votre niveau et vos attentes.", {
    x: 50, y, size: 8, font, color: COLORS.gray,
  });
  y -= 22;

  page.drawText("Identité de l'apprenant", { x: 50, y, size: 10, font: fontBold, color: COLORS.primary });
  y -= 16;
  page.drawText("Nom, prénom : ____________________________________________", { x: 50, y, size: 9, font, color: COLORS.dark });
  y -= 14;
  page.drawText("Email / Téléphone : _______________________________________", { x: 50, y, size: 9, font, color: COLORS.dark });
  y -= 22;

  for (const q of data.questions) {
    if (y < 100) {
      addFooter(page, font, 1, 1);
      page = pdf.addPage([595, 842]);
      y = addHeader(page, fontBold, font, "Questionnaire de positionnement (suite)");
    }
    const wrapped = wrapText(`${q.orderIndex}. ${q.question}`, font, 9, 480);
    for (const line of wrapped) {
      page.drawText(line, { x: 50, y, size: 9, font: fontBold, color: COLORS.dark });
      y -= 13;
    }
    if (q.type === "SCALE_1_5") {
      page.drawText("1  ☐    2  ☐    3  ☐    4  ☐    5  ☐", { x: 70, y, size: 9, font, color: COLORS.gray });
      y -= 18;
    } else if (q.type === "YES_NO") {
      page.drawText("☐ Oui    ☐ Non", { x: 70, y, size: 9, font, color: COLORS.gray });
      y -= 18;
    } else {
      // Espace de réponse libre
      page.drawRectangle({ x: 50, y: y - 35, width: 495, height: 38, borderColor: COLORS.lightGray, borderWidth: 1, color: COLORS.white });
      y -= 45;
    }
    y -= 4;
  }

  addFooter(page, font, 1, 1);
  return pdf.save();
}

export async function generateConvocationPDF(data: {
  learnerName: string;
  formationTitle: string;
  startDate: string;
  endDate: string;
  format: string;
  location?: string;
  date: string;
}): Promise<Uint8Array> {
  const { pdf, font, fontBold } = await createBasePdf();
  const page = pdf.addPage([595, 842]);
  let y = addHeader(page, fontBold, font, "Convocation à la formation");

  page.drawText(`${COMPANY.city}, le ${data.date}`, { x: 350, y, size: 9, font, color: COLORS.gray });
  y -= 30;

  page.drawText(`À l'attention de : ${data.learnerName}`, { x: 50, y, size: 10, font: fontBold, color: COLORS.dark });
  y -= 25;

  page.drawText("Objet : Convocation à une session de formation", { x: 50, y, size: 9, font: fontBold, color: COLORS.dark });
  y -= 25;

  page.drawText("Madame, Monsieur,", { x: 50, y, size: 9, font, color: COLORS.dark });
  y -= 18;

  const body = `Nous avons le plaisir de vous confirmer votre inscription à la formation "${data.formationTitle}".`;
  const bodyLines = wrapText(body, font, 9, 470);
  for (const line of bodyLines) {
    page.drawText(line, { x: 50, y, size: 9, font, color: COLORS.dark });
    y -= 14;
  }
  y -= 10;

  const details = [
    `Formation : ${data.formationTitle}`,
    `Dates : du ${data.startDate} au ${data.endDate}`,
    `Format : ${data.format}`,
    data.location ? `Lieu : ${data.location}` : `Lieu : À distance`,
    `Organisme : ${COMPANY.name}, ${COMPANY.fullAddress}`,
  ];

  for (const detail of details) {
    page.drawText(`• ${detail}`, { x: 60, y, size: 9, font, color: COLORS.dark });
    y -= 16;
  }

  y -= 20;
  page.drawText("Cordialement,", { x: 50, y, size: 9, font, color: COLORS.dark });
  y -= 20;
  page.drawText(COMPANY.name, { x: 50, y, size: 9, font: fontBold, color: COLORS.dark });
  y -= 12;
  page.drawText(`Tél : ${COMPANY.phone}`, { x: 50, y, size: 8, font, color: COLORS.gray });

  addFooter(page, font, 1, 1);
  return pdf.save();
}
