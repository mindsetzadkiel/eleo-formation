import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMPANY, REFUSED_FUNDING_MODES, FUNDING_MODES, PROSPECT_STATUSES } from "@/config/company";
import { getSession } from "@/lib/auth";
import { sendEmail, emailTemplate, escapeHtml, NOTIFICATION_EMAIL } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      companySiret,
      professionalGoal,
      formationTitle,
      currentLevel,
      preferredFormat,
      idealDelay,
      message,
      fundingMode,
    } = body;

    if (!firstName || !lastName || !email || !fundingMode) {
      return NextResponse.json(
        { error: "Nom, prénom, email et mode de financement sont requis" },
        { status: 400 }
      );
    }

    const isRefused = (REFUSED_FUNDING_MODES as readonly string[]).includes(fundingMode);

    let status = "NOUVEAU";
    let autoRefused = false;
    let refusalReason: string | null = null;

    if (isRefused) {
      autoRefused = true;
      if (fundingMode === "STAGE_ALTERNANCE") {
        status = "REFUS_ALTERNANCE";
        refusalReason = "Demande de stage/alternance/apprentissage — refus automatique";
      } else if (fundingMode === "IMMERSION_GRATUITE") {
        status = "REFUS_IMMERSION";
        refusalReason = "Demande d'immersion gratuite/PMSMP — refus automatique";
      } else if (fundingMode === "CANDIDATURE_EMPLOI") {
        status = "REFUS_CANDIDATURE";
        refusalReason = "Candidature emploi — refus automatique";
      }
    } else {
      switch (fundingMode) {
        case "FONDS_PROPRES":
          status = "PROSPECT_FONDS_PROPRES";
          break;
        case "ENTREPRISE":
          status = "PROSPECT_ENTREPRISE";
          break;
        case "OPCO":
          status = "PROSPECT_OPCO";
          break;
        case "FRANCE_TRAVAIL":
          status = "PROSPECT_FRANCE_TRAVAIL";
          break;
        default:
          status = "NOUVEAU";
      }
    }

    let formation = null;
    if (formationTitle) {
      formation = await prisma.formation.findFirst({
        where: {
          OR: [
            { title: { contains: formationTitle } },
            { slug: { contains: formationTitle.toLowerCase().replace(/\s+/g, "-") } },
          ],
        },
      });
    }

    const prospect = await prisma.prospect.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        companyName: companyName || null,
        companySiret: companySiret || null,
        professionalGoal: professionalGoal || null,
        formationId: formation?.id || null,
        currentLevel: currentLevel || null,
        preferredFormat: preferredFormat || null,
        idealDelay: idealDelay || null,
        message: message || null,
        fundingMode,
        status,
        autoRefused,
        refusalReason,
        source: "SITE",
      },
    });

    // Notifications email (non bloquant : on ne fait pas échouer la requête si l'email plante)
    const statusLabel =
      (PROSPECT_STATUSES as Record<string, string>)[status] || status;
    const fundingLabel =
      (FUNDING_MODES as Record<string, string>)[fundingMode] || fundingMode;
    const badge = autoRefused
      ? `<span style="display:inline-block;padding:2px 8px;background:#fee2e2;color:#991b1b;border-radius:4px;font-size:12px;font-weight:600;">REFUS AUTO</span>`
      : `<span style="display:inline-block;padding:2px 8px;background:#dcfce7;color:#166534;border-radius:4px;font-size:12px;font-weight:600;">NOUVEAU</span>`;

    const rows = [
      ["Nom", `${escapeHtml(firstName)} ${escapeHtml(lastName)}`],
      ["Email", `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`],
      phone ? ["Téléphone", `<a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>`] : null,
      companyName ? ["Entreprise", escapeHtml(companyName)] : null,
      companySiret ? ["SIRET", escapeHtml(companySiret)] : null,
      formationTitle ? ["Formation souhaitée", escapeHtml(formationTitle)] : null,
      currentLevel ? ["Niveau actuel", escapeHtml(currentLevel)] : null,
      preferredFormat ? ["Format préféré", escapeHtml(preferredFormat)] : null,
      idealDelay ? ["Délai souhaité", escapeHtml(idealDelay)] : null,
      professionalGoal ? ["Objectif pro", escapeHtml(professionalGoal)] : null,
      ["Financement", escapeHtml(fundingLabel)],
      ["Statut", `${escapeHtml(statusLabel)} ${badge}`],
      refusalReason ? ["Raison refus", escapeHtml(refusalReason)] : null,
      message ? ["Message", escapeHtml(message).replace(/\n/g, "<br>")] : null,
    ].filter(Boolean) as [string, string][];

    const tableRows = rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;width:140px;vertical-align:top;">${k}</td><td style="padding:8px 12px;background:#ffffff;border-top:1px solid #e5e7eb;">${v}</td></tr>`,
      )
      .join("");

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://formation.eleo-informatique.fr";

    // 1. Notification interne (vers NOTIFICATION_EMAIL = eleo.informatique@gmail.com)
    const notifSubject = autoRefused
      ? `[Eleo Formation] Demande refusée automatiquement — ${firstName} ${lastName}`
      : `[Eleo Formation] Nouvelle demande de devis — ${firstName} ${lastName}`;

    sendEmail({
      to: NOTIFICATION_EMAIL,
      replyTo: email,
      subject: notifSubject,
      html: emailTemplate({
        title: autoRefused
          ? "Demande refusée automatiquement"
          : "Nouvelle demande reçue",
        bodyHtml: `
          <p>Une nouvelle demande vient d'être soumise via la plateforme.</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;border-radius:6px;overflow:hidden;margin-top:12px;">
            ${tableRows}
          </table>
        `,
        ctaLabel: "Voir dans le CRM",
        ctaUrl: `${appUrl}/admin/crm`,
        footerNote: autoRefused
          ? "Cette demande a été automatiquement refusée selon les règles Qualiopi (stage/alternance/immersion gratuite/candidature emploi)."
          : undefined,
      }),
    }).catch(() => undefined);

    // 2. Accusé de réception au prospect (sauf si refus auto : on envoie une réponse personnalisée)
    if (!autoRefused) {
      sendEmail({
        to: email,
        subject: `Votre demande — ${COMPANY.brandName}`,
        html: emailTemplate({
          title: `Bonjour ${escapeHtml(firstName)},`,
          bodyHtml: `
            <p>Nous avons bien reçu votre demande concernant${formationTitle ? ` la formation <strong>${escapeHtml(formationTitle)}</strong>` : " une formation"}.</p>
            <p>Notre équipe vous recontacte sous <strong>48 heures ouvrées</strong> pour préparer un devis adapté à votre projet et à votre mode de financement (<em>${escapeHtml(fundingLabel)}</em>).</p>
            <p>En attendant, vous pouvez consulter notre catalogue de formations ou nous contacter directement au <strong>${COMPANY.phone}</strong>.</p>
          `,
          ctaLabel: "Voir notre catalogue",
          ctaUrl: `${appUrl}/formations`,
          footerNote: "Cet email est automatique, merci de ne pas y répondre directement. Pour nous contacter, utilisez l'adresse email ou le téléphone ci-dessus.",
        }),
      }).catch(() => undefined);
    }

    return NextResponse.json({ prospect, autoRefused });
  } catch (error) {
    console.error("Erreur création prospect:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du prospect" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getSession();
  if (!user || (user.role !== "ADMIN" && user.role !== "FORMATEUR")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const prospects = await prisma.prospect.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      formation: { select: { title: true } },
      company: { select: { name: true } },
    },
  });

  return NextResponse.json({ prospects });
}
