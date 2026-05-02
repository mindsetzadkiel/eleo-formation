/**
 * Endpoint de debug : vérifie la présence des variables d'env critiques.
 * NE RETOURNE JAMAIS LES VALEURS, seulement des booléens et des infos tronquées.
 * À SUPPRIMER après validation.
 */
import { NextResponse } from "next/server";

export async function GET() {
  const env = process.env;

  const mask = (v: string | undefined) => {
    if (!v) return null;
    if (v.length <= 8) return "***";
    return `${v.slice(0, 4)}...${v.slice(-2)} (len=${v.length})`;
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || "unknown",
    commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE?.substring(0, 80) || "unknown",
    env: {
      RESEND_API_KEY: { set: !!env.RESEND_API_KEY, preview: mask(env.RESEND_API_KEY) },
      EMAIL_FROM: env.EMAIL_FROM || "(default)",
      EMAIL_REPLY_TO: env.EMAIL_REPLY_TO || "(default)",
      NOTIFICATION_EMAIL: env.NOTIFICATION_EMAIL || "(default)",
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL || "(not set)",
      OPENROUTER_SITE_URL: env.OPENROUTER_SITE_URL || "(not set)",
      DATABASE_URL: { set: !!env.DATABASE_URL, preview: mask(env.DATABASE_URL) },
      OPENROUTER_API_KEY: { set: !!env.OPENROUTER_API_KEY, preview: mask(env.OPENROUTER_API_KEY) },
    },
  });
}
