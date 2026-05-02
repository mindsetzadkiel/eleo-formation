import fs from "node:fs";

const json = JSON.parse(fs.readFileSync("wp-page-1237-edit.json", "utf8"));

console.log("=== TOP-LEVEL KEYS ===");
console.log(Object.keys(json));

console.log("\n=== META KEYS (if any) ===");
if (json.meta) {
  console.log(Object.keys(json.meta));
}

// Check raw content (has the elementor data?)
console.log("\n=== content.raw length ===", json.content?.raw?.length || 0);
console.log("=== content.rendered length ===", json.content?.rendered?.length || 0);

// Look for elementor_data anywhere
const fullStr = JSON.stringify(json);
console.log("\n=== Has _elementor_data ? ===", fullStr.includes("_elementor_data"));
console.log("=== Has elementor_data ? ===", fullStr.includes("elementor_data"));

// Save raw content if it differs from rendered
if (json.content?.raw) {
  fs.writeFileSync("wp-page-1237-content-raw.txt", json.content.raw, "utf8");
  console.log("\nSaved content.raw to wp-page-1237-content-raw.txt");
  console.log("First 500 chars:", json.content.raw.substring(0, 500));
}
