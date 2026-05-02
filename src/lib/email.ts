/**
 * Service d'envoi d'emails transactionnels via Resend.
 *
 * Configuration via variables d'environnement :
 * - RESEND_API_KEY       : clé API Resend (obligatoire en prod)
 * - EMAIL_FROM           : expéditeur par défaut (défaut : Resend sandbox)
 * - EMAIL_REPLY_TO       : adresse reply-to (défaut : eleo.informatique@gmail.com)
 * - NOTIFICATION_EMAIL   : destinataire des notifs admin (défaut : eleo.informatique@gmail.com)
 *
 * Si RESEND_API_KEY est absent, les appels à sendEmail sont no-op (log uniquement)
 * pour ne pas casser la plateforme en dev ou en cas de souci clé.
 */
import { Resend } from "resend";
import { COMPANY } from "@/config/company";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export const EMAIL_FROM =
  process.env.EMAIL_FROM || "Eleo Formation <onboarding@resend.dev>";
export const EMAIL_REPLY_TO =
  process.env.EMAIL_REPLY_TO || COMPANY.email;
export const NOTIFICATION_EMAIL =
  process.env.NOTIFICATION_EMAIL || COMPANY.email;

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Envoie un email transactionnel. Ne lève jamais, renvoie toujours un résultat
 * pour éviter que l'API qui appelle plante si Resend est indispo.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY absente — email non envoyé:", params.subject);
    return { ok: false, skipped: true, error: "RESEND_API_KEY manquante" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo || EMAIL_REPLY_TO,
    });

    if (error) {
      console.error("[email] Erreur Resend:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[email] Exception:", msg);
    return { ok: false, error: msg };
  }
}

/**
 * Template HTML simple avec la charte Eleo (bleu + orange).
 */
export function emailTemplate(opts: {
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}): string {
  const cta = opts.ctaLabel && opts.ctaUrl
    ? `<p style="margin:32px 0;text-align:center;">
         <a href="${opts.ctaUrl}" style="display:inline-block;padding:12px 24px;background:#0170B9;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">${opts.ctaLabel}</a>
       </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        <tr>
          <td style="background:linear-gradient(90deg,#0170B9 0%,#ff6900 100%);height:4px;"></td>
        </tr>
        <tr>
          <td style="padding:32px 32px 16px 32px;">
            <h1 style="margin:0 0 8px 0;font-size:22px;color:#0170B9;">${COMPANY.brandName}</h1>
            <p style="margin:0;color:#6b7280;font-size:13px;">${COMPANY.name}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 24px 32px;">
            <h2 style="margin:0 0 16px 0;font-size:18px;color:#111827;">${opts.title}</h2>
            <div style="font-size:15px;line-height:1.6;color:#374151;">${opts.bodyHtml}</div>
            ${cta}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
            <p style="margin:0 0 4px 0;"><strong>${COMPANY.name}</strong> — ${COMPANY.fullAddress}</p>
            <p style="margin:0 0 4px 0;">Tél : ${COMPANY.phone} — Email : <a href="mailto:${COMPANY.email}" style="color:#0170B9;">${COMPANY.email}</a></p>
            <p style="margin:8px 0 0 0;">SIRET ${COMPANY.siret} — TVA ${COMPANY.tvaIntra}</p>
            ${opts.footerNote ? `<p style="margin:8px 0 0 0;color:#9ca3af;">${opts.footerNote}</p>` : ""}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Échappe un texte pour intégration dans du HTML (anti-XSS).
 */
export function escapeHtml(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
