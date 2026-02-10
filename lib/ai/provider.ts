export type ChatMessage = { role: string; content: string };

export async function chatWithProvider(
  messages: ChatMessage[],
  opts?: { model?: string }
): Promise<string> {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  if (provider === "local") {
      const localUrl = process.env.LOCAL_LLM_URL;
      if (!localUrl) throw new Error("Local LLM not configured (LOCAL_LLM_URL)");

      const res = await fetch(localUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) throw new Error(`Local LLM error: ${await res.text()}`);
      const json = await res.json();

      // Handle common local server response shapes:
      // - { text: "..." }
      // - { output: "..." }
      // - { result: "..." }
      // - { results: [{ text: "..." }] }
      // - text-generation-webui: { results: [{ generation: [{ text: "..." }] }] }
      const text =
        json?.text ??
        json?.output ??
        json?.result ??
        json?.results?.[0]?.text ??
        json?.results?.[0]?.generation?.[0]?.text ??
        (typeof json === "string" ? json : JSON.stringify(json));
      return text;
    }
  if (provider === "gemini") {
    const key = process.env.GEMINI_API_KEY;
    const model = opts?.model ?? process.env.GEMINI_MODEL ?? "models/gemini-1.5";
    if (!key) throw new Error("Gemini API key not configured (GEMINI_API_KEY)");

    // Flatten messages into a single prompt for the REST API
    const prompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");

    const url = `https://generativelanguage.googleapis.com/v1beta2/${model}:generate?key=${key}`;
    const payload = {
      prompt: { text: prompt },
      temperature: 0.2,
      maxOutputTokens: 1024,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini error: ${text}`);
    }

    const json = await res.json();
    // Extract candidate content
    const text = json?.candidates?.[0]?.content ?? json?.output?.[0]?.content?.[0]?.text ?? "";
    return text;
  }

  // Default: OpenAI
  {
    const key = process.env.OPENAI_API_KEY;
    const model = opts?.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    if (!key) throw new Error("OpenAI API key not configured (OPENAI_API_KEY)");

    const payload = {
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 1024,
      temperature: 0.2,
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenAI error: ${txt}`);
    }

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content ?? json.output?.[0]?.content?.[0]?.text ?? "";
    return text;
  }
}
