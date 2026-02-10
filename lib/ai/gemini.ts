import { google } from "@ai-sdk/google";

/**
 * Google Gemini model
 * API key is read from process.env.GOOGLE_GENERATIVE_AI_API_KEY
 */
export const geminiModel = google(
  "models/gemini-1.5-flash-latest"
);
