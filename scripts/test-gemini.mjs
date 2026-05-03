const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.argv[2] || "gemini-2.5-flash-image";
console.log("Testing model:", MODEL);
const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "a friendly cat illustration" }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  },
);
console.log("Status:", res.status);
console.log("Headers retry-after:", res.headers.get("retry-after"));
const text = await res.text();
console.log("Body:", text.substring(0, 2000));
