/**
 * Réécriture du contenu Elementor de la page WP "Formation" (id 1237)
 * - Préserve TOUTE la structure visuelle Elementor
 * - Modifie uniquement les textes (titles, editors, buttons) par ID widget
 * - Met à jour les liens vers la nouvelle plateforme formation.eleo-informatique.fr
 * - Retire toutes les mentions "bureautique" et "DIF" (obsolète depuis 2015)
 *
 * Usage:
 *   node scripts/wp-elementor-rewrite.mjs            # dry-run (affiche les diffs)
 *   node scripts/wp-elementor-rewrite.mjs --push     # pousse via REST API
 */
import fs from "node:fs";
import path from "node:path";

const PLATFORM_URL = "https://formation.eleo-informatique.fr";
const ARGS = process.argv.slice(2);
const PUSH = ARGS.includes("--push");

// Charge l'environnement
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

const WP_USER = env.WP_USER;
const WP_PASS = env.WP_APP_PASSWORD;
const WP_URL = env.WP_SITE_URL;
const PAGE_ID = 1237;

// Modifications par ID widget Elementor
// Les IDs viennent de l'analyse du JSON existant
const REWRITES = {
  // [0] H1 hero
  "0607898": {
    type: "heading",
    title: "Formations informatique, cybersécurité et IA à Aix en Provence",
  },
  // [1] H2 section financement
  "b80934e": {
    type: "heading",
    title: "Financez votre formation professionnelle avec votre OPCO à Aix en Provence",
  },
  // [3] H3 sous-titre
  "8fb4ebf": {
    type: "heading",
    title: "Comment financer votre formation professionnelle ?",
  },
  // [4] text-editor : explication financement
  "0678256": {
    type: "text-editor",
    editor:
      "<p>Eleo Informatique propose des formations professionnelles courtes et finançables. " +
      "Salariés et indépendants peuvent mobiliser leur OPCO pour la prise en charge totale ou partielle. " +
      "Les indépendants et professionnels peuvent également régler en fonds propres. " +
      "Toutes nos formations sont contractualisées, facturées et traçables (Qualiopi en cours).</p>",
  },
  // [5] bouton CTA principal
  "8ee7c09": {
    type: "button",
    text: "Demander un devis",
    link: `${PLATFORM_URL}/devis`,
  },
  // [6] avantage 1
  "ba84940": {
    type: "heading",
    title: "Adaptée aux professionnels en activité",
  },
  // [7] avantage 2 (était "DIF")
  "4bec331": {
    type: "heading",
    title: "Financement OPCO ou fonds propres",
  },
  // [8] avantage 3 — on garde
  "dcae0f8": {
    type: "heading",
    title: "Atelier équipé inclus pendant la formation",
  },
  // [9] badge "Spécial débutant" → "Formation phare"
  "8f8da15": {
    type: "heading",
    title: "Formation phare",
  },
  // [10] H2 formation 1 (était bureautique)
  "11392de": {
    type: "heading",
    title: "Technicien informatique IA-augmenté à Aix en Provence",
  },
  // [11] text formation 1
  "09b653b": {
    type: "text-editor",
    editor:
      "<p>Notre formation phare prépare au métier de technicien informatique en intégrant " +
      "des outils d'intelligence artificielle dans le diagnostic, la maintenance et le support utilisateur. " +
      "Modules : matériel PC/Mac, systèmes Windows et Linux, réseaux TCP/IP, dépannage assisté par IA, " +
      "cybersécurité de base, communication client. Format hybride 35 ou 70 heures, " +
      "alternant atelier présentiel à Aix en Provence et plateforme en ligne.</p>",
  },
  // [12] badge "Spécial débutant" → "Pour TPE/PME"
  "b1d0a64": {
    type: "heading",
    title: "Pour TPE et PME",
  },
  // [13] H2 formation 2 (était bureautique)
  "569881b": {
    type: "heading",
    title: "Cybersécurité pratique pour entreprises",
  },
  // [14] text formation 2 — on remplace tout le contenu (qui contient des sous-blocs Elementor)
  "a1709a8": {
    type: "text-editor",
    editor:
      "<p>Sensibilisation et mise en pratique de la cybersécurité en TPE/PME : " +
      "phishing, gestion des mots de passe, sauvegarde 3-2-1, configuration des accès, " +
      "sécurisation des emails et du Wi-Fi, plan de continuité simple. " +
      "Adaptée à tous les profils, sans prérequis technique. " +
      "Modules pratiques sur les outils du quotidien (Microsoft 365, gestionnaires de mots de passe, antivirus). " +
      "Possibilité d'accompagnement post-formation pour audit de votre infrastructure.</p>",
  },
  // [15] bouton formation 2 (était "Inscrivez-vous formation bureautique")
  "47c2d07": {
    type: "button",
    text: "Voir le catalogue complet",
    link: `${PLATFORM_URL}/formations`,
  },
  // [16] bouton formation Internet
  "83c9666": {
    type: "button",
    text: "Demander un devis personnalisé",
    link: `${PLATFORM_URL}/devis`,
  },
  // [17] badge "Spécial débutant"
  "049c697": {
    type: "heading",
    title: "Initiation pratique",
  },
  // [18] H2 formation 3 (était "internet")
  "252494e": {
    type: "heading",
    title: "IA pratique pour professionnels à Aix en Provence",
  },
};

// Marche récursivement et applique les modifications
function applyRewrites(node, log) {
  if (!node) return node;
  if (Array.isArray(node)) return node.map((n) => applyRewrites(n, log));
  if (node.elType === "widget" && REWRITES[node.id]) {
    const rule = REWRITES[node.id];
    const before = JSON.stringify(node.settings).substring(0, 200);
    const settings = { ...node.settings };
    if (rule.type === "heading" && rule.title) {
      log.push({ id: node.id, type: "heading", from: settings.title, to: rule.title });
      settings.title = rule.title;
    }
    if (rule.type === "text-editor" && rule.editor) {
      log.push({
        id: node.id,
        type: "text-editor",
        from: (settings.editor || "").substring(0, 80) + "…",
        to: rule.editor.substring(0, 80) + "…",
      });
      settings.editor = rule.editor;
    }
    if (rule.type === "button") {
      if (rule.text) {
        log.push({ id: node.id, type: "button.text", from: settings.text, to: rule.text });
        settings.text = rule.text;
      }
      if (rule.link) {
        const oldLink = settings.link?.url;
        log.push({ id: node.id, type: "button.link", from: oldLink, to: rule.link });
        settings.link = {
          ...(settings.link || {}),
          url: rule.link,
          is_external: "true",
          nofollow: "",
        };
        // IMPORTANT : supprimer le dynamic tag popup qui écrase link.url
        if (settings.__dynamic__ && settings.__dynamic__.link) {
          log.push({
            id: node.id,
            type: "button.dynamic.removed",
            from: settings.__dynamic__.link.substring(0, 50) + "…",
            to: "(supprimé)",
          });
          const dyn = { ...settings.__dynamic__ };
          delete dyn.link;
          settings.__dynamic__ = Object.keys(dyn).length ? dyn : undefined;
        }
      }
    }
    node = { ...node, settings };
  }
  if (node.elements) node = { ...node, elements: applyRewrites(node.elements, log) };
  return node;
}

// Charge le JSON original
const elementorData = JSON.parse(fs.readFileSync("wp-elementor-parsed.json", "utf8"));

// Applique les rewrites
const log = [];
const modified = applyRewrites(elementorData, log);

// Vérification : pas de "bureautique" ni "DIF" résiduels
const finalString = JSON.stringify(modified);
const bureautiqueLeft = (finalString.match(/bureautique/gi) || []).length;
const difLeft = (finalString.match(/\bDIF\b/g) || []).length;

console.log("\n=== MODIFICATIONS APPLIQUÉES ===\n");
log.forEach((l, i) => {
  console.log(`[${i + 1}] widget ${l.id} (${l.type})`);
  console.log(`    AVANT : ${(l.from || "").toString().replace(/<[^>]+>/g, "").substring(0, 120)}`);
  console.log(`    APRÈS : ${(l.to || "").toString().replace(/<[^>]+>/g, "").substring(0, 120)}`);
  console.log();
});

console.log("=== VÉRIFICATIONS ===");
console.log(`  Mentions "bureautique" restantes : ${bureautiqueLeft}`);
console.log(`  Mentions "DIF" restantes        : ${difLeft}`);
console.log(`  Total modifications              : ${log.length}`);

// Sauvegarde du résultat localement
fs.writeFileSync("wp-elementor-modified.json", JSON.stringify(modified, null, 2), "utf8");
console.log("\n✅ JSON modifié sauvegardé dans wp-elementor-modified.json");

if (!PUSH) {
  console.log("\n💡 DRY-RUN terminé. Relancez avec --push pour appliquer sur WordPress.");
  process.exit(0);
}

// PUSH MODE
console.log("\n=== PUSH VERS WORDPRESS ===");
const auth = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");

const body = {
  meta: {
    _elementor_data: JSON.stringify(modified),
    _elementor_edit_mode: "builder",
  },
};

console.log(`  URL: ${WP_URL}/wp-json/wp/v2/pages/${PAGE_ID}`);
console.log(`  Body size: ${JSON.stringify(body).length} chars`);

const res = await fetch(`${WP_URL}/wp-json/wp/v2/pages/${PAGE_ID}`, {
  method: "POST",
  headers: {
    "Authorization": `Basic ${auth}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log(`  Status: ${res.status}`);
if (!res.ok) {
  console.log(`  Erreur: ${text.substring(0, 500)}`);
  process.exit(1);
}

const data = JSON.parse(text);
console.log(`  ✅ Page mise à jour. Modified at: ${data.modified}`);
console.log(`  🔗 ${data.link}`);
