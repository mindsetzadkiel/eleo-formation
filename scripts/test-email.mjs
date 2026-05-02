/**
 * Test rapide de l'envoi d'email via Resend.
 * Envoie un email de test à eleo.informatique@gmail.com.
 * Usage: node --env-file=.env.local scripts/test-email.mjs
 */
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("RESEND_API_KEY manquante dans .env.local");
  process.exit(1);
}

const resend = new Resend(apiKey);

console.log("Envoi test vers eleo.informatique@gmail.com...");

const { data, error } = await resend.emails.send({
  from: "Eleo Formation <onboarding@resend.dev>",
  to: ["eleo.informatique@gmail.com"],
  replyTo: "eleo.informatique@gmail.com",
  subject: "[TEST] Plateforme Eleo Formation — Integration Resend OK",
  html: `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="height: 4px; background: linear-gradient(90deg, #0170B9 0%, #ff6900 100%); margin-bottom: 24px;"></div>
      <h1 style="color: #0170B9;">Eleo Formation</h1>
      <h2 style="color: #111827;">Test de l'integration email</h2>
      <p>Bonjour,</p>
      <p>Si vous lisez ce message, l'integration <strong>Resend</strong> fonctionne parfaitement sur la plateforme <strong>formation.eleo-informatique.fr</strong>.</p>
      <p>A partir de maintenant, chaque demande de devis soumise sur le site vous enverra une notification automatique a cette adresse.</p>
      <p style="margin-top: 24px;">
        <a href="https://formation.eleo-informatique.fr/admin/crm"
           style="display:inline-block;padding:12px 24px;background:#0170B9;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
          Ouvrir le CRM
        </a>
      </p>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">Email automatique de test - Eleo Informatique - 49 Avenue Henri Malacrida, 13100 Aix-en-Provence</p>
    </div>
  `,
});

if (error) {
  console.error("ERREUR:", error);
  process.exit(1);
}

console.log("Email envoye avec succes");
console.log("  id:", data.id);
console.log("");
console.log("Verifiez votre boite Gmail eleo.informatique@gmail.com");
console.log("(pensez a regarder dans Spam/Promotions au cas ou)");
