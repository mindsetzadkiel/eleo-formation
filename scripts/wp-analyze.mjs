import fs from "node:fs";

const raw = fs.readFileSync("wp-page-1237-original.json", "utf8");
const json = JSON.parse(raw);
const html = json.content.rendered;

console.log("=== TITLE ===");
console.log(json.title.rendered);
console.log("\n=== HTML length ===", html.length);

console.log("\n=== BUREAUTIQUE mentions (case-insensitive) ===");
const bureautiqueMatches = [...html.matchAll(/[^.>"\s]{0,40}bureautique[^<.\s"]{0,40}/gi)];
console.log("Count:", bureautiqueMatches.length);
bureautiqueMatches.slice(0, 30).forEach((m) => console.log(" -", m[0].replace(/\s+/g, " ")));

console.log("\n=== INTERNAL LINKS (href) ===");
const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const internal = [...new Set(links)].filter((l) => l.includes("eleo-informatique.fr") || l.startsWith("/") || l.startsWith("#"));
internal.forEach((l) => console.log(" ", l));

console.log("\n=== ALL LINKS UNIQUE ===");
[...new Set(links)].forEach((l) => console.log(" ", l));

console.log("\n=== TEXT CONTENT (sans HTML) ===");
const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&rsquo;/g, "'").replace(/&laquo;|&raquo;|&quot;/g, '"').replace(/\s+/g, " ").trim();
console.log(text);

console.log("\n=== HEADINGS ===");
const headings = [...html.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => `[${m[1]}] ${m[2].replace(/<[^>]+>/g, "").trim()}`);
headings.forEach((h) => console.log(" ", h));
