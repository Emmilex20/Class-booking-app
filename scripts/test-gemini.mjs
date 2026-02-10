#!/usr/bin/env node

// Quick test script to verify GEMINI_API_KEY and basic response.
// Usage: node scripts/test-gemini.mjs

const key = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "models/gemini-1.5";
if (!key) {
  console.error("GEMINI_API_KEY not set in environment. Set it in .env.local or export it.");
  process.exit(1);
}

const prompt = `SYSTEM: You are a test assistant.

USER: Say hello and include the current date.`;

const url = `https://generativelanguage.googleapis.com/v1beta2/${model}:generate?key=${key}`;

(async function () {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: { text: prompt }, temperature: 0.2, maxOutputTokens: 256 }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error("Gemini returned error:", t);
      process.exit(1);
    }
    const json = await res.json();
    console.log("Gemini response:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("Gemini test failed:", err);
    process.exit(1);
  }
})();
