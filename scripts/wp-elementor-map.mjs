import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("wp-elementor-parsed.json", "utf8"));

let widgetCount = 0;
const editable = [];

function walk(node, path = "") {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((n, i) => walk(n, `${path}[${i}]`));
    return;
  }
  if (node.elType === "widget") {
    widgetCount++;
    const wt = node.widgetType;
    const s = node.settings || {};
    const entry = { path, id: node.id, widgetType: wt };
    
    // Capture text content based on widget type
    if (wt === "heading") entry.title = s.title;
    if (wt === "text-editor") entry.editor = s.editor;
    if (wt === "button") {
      entry.text = s.text;
      entry.link = s.link?.url;
    }
    if (wt === "image") entry.alt = s.image?.alt;
    if (wt === "icon-box") {
      entry.title = s.title_text;
      entry.description = s.description_text;
      entry.link = s.link?.url;
    }
    if (wt === "image-box") {
      entry.title = s.title_text;
      entry.description = s.description_text;
      entry.link = s.link?.url;
    }
    if (s.title_text || s.text || s.title || s.editor || s.description_text || s.link?.url) {
      editable.push(entry);
    }
  }
  if (node.elements) walk(node.elements, `${path}/elements`);
}

walk(data);

console.log("=== Total widgets:", widgetCount, "===");
console.log("=== Editable widgets:", editable.length, "===\n");

editable.forEach((e, i) => {
  console.log(`[${i}] ${e.widgetType} (id=${e.id}) at ${e.path}`);
  if (e.title) console.log(`    title: ${e.title.substring(0, 100).replace(/<[^>]+>/g, "")}`);
  if (e.editor) console.log(`    editor: ${e.editor.substring(0, 150).replace(/<[^>]+>/g, "").replace(/\s+/g, " ")}`);
  if (e.text) console.log(`    text: ${e.text}`);
  if (e.description) console.log(`    desc: ${e.description.substring(0, 100).replace(/<[^>]+>/g, "")}`);
  if (e.link) console.log(`    link: ${e.link}`);
  if (e.alt) console.log(`    alt: ${e.alt}`);
  console.log();
});
