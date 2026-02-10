// app/api/chat/route.ts
import { auth } from "@clerk/nextjs/server";
import { getUserTier } from "@/lib/subscription";
import { getUserPreferences } from "@/lib/actions/profile";
import { runFitnessAI } from "@/lib/ai/runner";

type IncomingMessage = {
  role: "user" | "assistant";
  content?: string;
  parts?: { text?: string }[];
};

function normalizeMessages(messages: IncomingMessage[]) {
  return messages.map((m) => {
    if (typeof m.content === "string") {
      return { role: m.role, content: m.content };
    }

    if (Array.isArray(m.parts)) {
      return {
        role: m.role,
        content: m.parts.map((p) => p.text).filter(Boolean).join("\n"),
      };
    }

    return { role: m.role, content: "" };
  });
}

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [tier, preferences] = await Promise.all([
    getUserTier(),
    getUserPreferences(),
  ]);

  const { messages } = await request.json();

  const locationContext = preferences?.location
    ? `- Location: ${preferences.location.address}
- Search radius: ${preferences.searchRadius} km`
    : "- Location: Not set";

  const tierContext = tier
    ? `- Subscription: ${tier} tier`
    : "- Subscription: No active subscription";

  const now = new Date();
  const dateTimeContext = now.toLocaleString("en-US", {
    timeZoneName: "short",
  });

  const systemMessage = {
    role: "system" as const,
    content: `
Current date/time: ${dateTimeContext}

User context:
- Clerk ID: ${clerkId}
${tierContext}
${locationContext}

Rules:
- Use tools when real data is required
- Consider user location and tier
- Encourage subscription if none exists
- Keep answers concise and friendly
`,
  };

  try {
    const normalizedMessages = normalizeMessages(messages);

    const text = await runFitnessAI([
      systemMessage,
      ...normalizedMessages,
    ]);

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI error:", error);

    return new Response(
      JSON.stringify({ error: "AI assistant unavailable" }),
      { status: 500 }
    );
  }
}
