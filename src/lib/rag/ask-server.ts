/**
 * LLM client — calls server proxy /api/ask-owly to keep API key secure.
 * The proxy (Vite dev middleware or Vercel serverless function) forwards
 * the request to DashScope/Qwen API without exposing the key to the browser.
 *
 * The proxy itself checks if the API key is configured and returns
 * { mode: "not-configured" } if not — so the client always calls it.
 *
 * Falls back gracefully when not configured or offline.
 */

type LlmRequest = {
  question: string;
  context: string;
};

type LlmResponse =
  { mode: "llm"; text: string } | { mode: "not-configured" } | { mode: "error"; error: string };

export async function askLlm({ data }: { data: LlmRequest }): Promise<LlmResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch("/api/ask-owly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: data.question,
        context: data.context,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { mode: "error", error: `HTTP ${response.status}` };
    }

    return (await response.json()) as LlmResponse;
  } catch (err) {
    return { mode: "error", error: err instanceof Error ? err.message : "Unknown error" };
  }
}
