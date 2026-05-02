/**
 * Vérifie les derniers emails envoyés via Resend (API).
 * Usage: node --env-file=.env.local scripts/resend-check-logs.mjs
 */
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("RESEND_API_KEY manquante");
  process.exit(1);
}

const res = await fetch("https://api.resend.com/emails", {
  headers: { Authorization: `Bearer ${apiKey}` },
});

if (!res.ok) {
  const text = await res.text();
  console.error(`HTTP ${res.status}:`, text);
  process.exit(1);
}

const data = await res.json();
const emails = data.data || [];

console.log(`=== ${emails.length} emails recents dans votre compte Resend ===\n`);

emails.slice(0, 15).forEach((e, i) => {
  const dt = new Date(e.created_at).toLocaleString("fr-FR");
  console.log(`[${i + 1}] ${dt}`);
  console.log(`    de      : ${e.from}`);
  console.log(`    a       : ${Array.isArray(e.to) ? e.to.join(", ") : e.to}`);
  console.log(`    sujet   : ${e.subject}`);
  console.log(`    status  : ${e.last_event || e.status || "?"}`);
  console.log(`    id      : ${e.id}`);
  console.log("");
});

if (emails.length === 0) {
  console.log("Aucun email envoye. Causes possibles :");
  console.log("  1. RESEND_API_KEY pas configuree sur Vercel");
  console.log("  2. Redeploiement Vercel pas declenche apres ajout des env vars");
  console.log("  3. Nouvelle cle Resend utilisee differente de celle-ci");
}
