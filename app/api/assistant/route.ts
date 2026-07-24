import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// Reads ANTHROPIC_API_KEY from the server environment — the key never
// reaches the browser (the prototype called api.anthropic.com directly
// from the client, which would have exposed it). Constructed lazily so a
// missing key returns a clear error instead of crashing the route on load.
let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Assistant is not configured — set ANTHROPIC_API_KEY." },
      { status: 503 },
    );
  }

  try {
    const { messages, context } = (await req.json()) as {
      messages: ChatMessage[];
      context: unknown;
    };

    const system = `You are the Axom Intelligence Assistant inside a federal funding dashboard. Axom is an American-owned AI Operating System for scientific research, biotech, autonomous agents, secure enterprise AI, laboratory automation, and sovereign AI infrastructure. Be concise, analytical, and practical. Current opportunity in view (may be null): ${JSON.stringify(context ?? null)}`;

    const response = await getClient().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const reply =
      response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n") || "No response.";

    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Rate limited — try again shortly." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: "Upstream API error." }, { status: 502 });
    }
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
