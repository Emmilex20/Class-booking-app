import { generateText } from "ai";
import { geminiModel } from "./gemini";

/**
 * Minimal message shape compatible with ai@6
 */
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function runFitnessAI(messages: ChatMessage[]) {
  const useMock =
    process.env.USE_MOCK_LLM === "1" || process.env.NODE_ENV === "development";

  if (useMock) {
    const url = process.env.MOCK_LLM_URL || "http://localhost:5000/generate";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      throw new Error(`Mock LLM responded with status ${res.status}`);
    }

    const data = await res.json();

    return data.text as string;
  }

  const result = await generateText({
    model: geminiModel,
    messages,
    temperature: 0.4,
  });

  return result.text;
}
