export type NormalizedMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function normalizeMessages(messages: any[]): NormalizedMessage[] {
  return messages.map((m) => {
    // Case 1: Already correct
    if (typeof m.content === "string") {
      return { role: m.role, content: m.content };
    }

    // Case 2: Gemini / parts format
    if (Array.isArray(m.parts)) {
      const content = m.parts
        .map((p: any) => p.text)
        .filter(Boolean)
        .join("\n");

      return { role: m.role, content };
    }

    // Fallback (never crash)
    return {
      role: m.role ?? "user",
      content: String(m.text ?? ""),
    };
  });
}
