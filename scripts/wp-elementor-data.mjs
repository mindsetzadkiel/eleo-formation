import fs from "node:fs";

const json = JSON.parse(fs.readFileSync("wp-page-1237-edit.json", "utf8"));

const elementorData = json.meta._elementor_data;
console.log("Type:", typeof elementorData);
console.log("Length:", elementorData?.length || (Array.isArray(elementorData) ? elementorData.length : "n/a"));

if (typeof elementorData === "string") {
  fs.writeFileSync("wp-elementor-raw.json", elementorData, "utf8");
  console.log("Saved as string to wp-elementor-raw.json");
  
  try {
    const parsed = JSON.parse(elementorData);
    fs.writeFileSync("wp-elementor-parsed.json", JSON.stringify(parsed, null, 2), "utf8");
    console.log("Parsed JSON, saved to wp-elementor-parsed.json");
    console.log("Top-level array length:", parsed.length);
    console.log("First section keys:", Object.keys(parsed[0] || {}));
  } catch (e) {
    console.log("Parse error:", e.message);
  }
} else if (elementorData) {
  fs.writeFileSync("wp-elementor-parsed.json", JSON.stringify(elementorData, null, 2), "utf8");
  console.log("Saved object to wp-elementor-parsed.json");
}

// Save content.raw too
fs.writeFileSync("wp-page-content-raw.html", json.content.raw, "utf8");
console.log("Saved content.raw to wp-page-content-raw.html");
