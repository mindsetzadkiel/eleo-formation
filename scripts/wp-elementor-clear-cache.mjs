/**
 * Force la régénération du cache Elementor après update via REST API.
 *
 * Stratégie :
 * 1. Vide les postmeta _elementor_css et _elementor_page_assets
 * 2. Ré-envoie _elementor_data + force un "save_post" en modifiant aussi le status
 *    (trick classique pour déclencher les hooks Elementor)
 */
import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(".env.local");
const env = Object.fromEntries(
  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    }),
);

const WP_URL = env.WP_SITE_URL;
const WP_USER = env.WP_USER;
const WP_PASS = env.WP_APP_PASSWORD;
const PAGE_ID = 1237;

const auth = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
const headers = {
  "Authorization": `Basic ${auth}`,
  "Content-Type": "application/json",
};

// Re-charger le JSON modifié
const modified = JSON.parse(fs.readFileSync("wp-elementor-modified.json", "utf8"));
const modifiedStr = JSON.stringify(modified);

console.log("=== Etape 1 : Vider les caches Elementor ===");
const clearRes = await fetch(`${WP_URL}/wp-json/wp/v2/pages/${PAGE_ID}`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    meta: {
      _elementor_css: "",
      _elementor_page_assets: "",
      _elementor_inline_svg: "",
      _elementor_controls_usage: "",
    },
  }),
});
console.log(`  Status: ${clearRes.status}`);

console.log("\n=== Etape 2 : Re-pousser _elementor_data avec save_post trigger ===");
// Pour trigger save_post, on inclut un champ post (status) + les meta
const pushRes = await fetch(`${WP_URL}/wp-json/wp/v2/pages/${PAGE_ID}`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    status: "publish",
    meta: {
      _elementor_data: modifiedStr,
      _elementor_edit_mode: "builder",
      _elementor_template_type: "wp-page",
      _elementor_version: "3.21.0",
      _elementor_pro_version: "",
    },
  }),
});
const pushData = await pushRes.json();
console.log(`  Status: ${pushRes.status}`);
console.log(`  Modified: ${pushData.modified}`);

console.log("\n=== Etape 3 : Verif meta apres update ===");
const verifyRes = await fetch(
  `${WP_URL}/wp-json/wp/v2/pages/${PAGE_ID}?context=edit`,
  { headers }
);
const verifyData = await verifyRes.json();
const metaKeys = Object.keys(verifyData.meta || {}).filter((k) => k.startsWith("_elementor"));
console.log(`  Meta keys Elementor: ${metaKeys.join(", ")}`);
const dataLen = (verifyData.meta?._elementor_data || "").length;
console.log(`  _elementor_data length: ${dataLen} chars`);
const hasDif = (verifyData.meta?._elementor_data || "").includes("DIF");
const hasBureautique = /bureautique/i.test(verifyData.meta?._elementor_data || "");
console.log(`  Contient "DIF" : ${hasDif}`);
console.log(`  Contient "bureautique" : ${hasBureautique}`);

console.log("\n=== Etape 4 : Test de la page publique ===");
// Wait a bit for cache to clear
await new Promise((r) => setTimeout(r, 3000));
const pageRes = await fetch(
  `${WP_URL}/formation-informatique-et-formation-bureautique-aix-en-provence/?nocache=${Date.now()}`
);
const pageHtml = await pageRes.text();
const checks = {
  "Technicien informatique IA-augment": pageHtml.includes("Technicien informatique IA-augment"),
  "Cybersecurite pratique (cherche Cybers)": pageHtml.includes("Cybers"),
  "Financement OPCO ou fonds propres": pageHtml.includes("OPCO ou fonds propres"),
  "Lien formation.eleo-informatique.fr/devis": pageHtml.includes("formation.eleo-informatique.fr/devis"),
  "Lien formation.eleo-informatique.fr/formations": pageHtml.includes("formation.eleo-informatique.fr/formations"),
  "[NEGATIF] Pas de DIF": !pageHtml.includes("DIF") || pageHtml.match(/DIF/g).length < 2,
};
for (const [k, v] of Object.entries(checks)) {
  console.log(`  [${v ? "OK" : "--"}] ${k}`);
}
