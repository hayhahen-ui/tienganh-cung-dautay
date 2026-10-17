/**
 * Vercel Serverless Function — proxy LLM API
 * Keeps API key on the server side.
 * URL: /api/ask-owly
 *
 * Uses the classic Node.js (req, res) signature for maximum compatibility.
 */
export default async function handler(req, res) {
  // Quick health check for GET requests
  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      hasKey:
        !!process.env.VITE_OWLY_LLM_API_KEY ||
        !!process.env.mrbit1 ||
        !!process.env.OWLY_LLM_API_KEY,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Accept multiple env var names so the user doesn't need to rename on Vercel
  const apiKey =
    process.env.VITE_OWLY_LLM_API_KEY || process.env.mrbit1 || process.env.OWLY_LLM_API_KEY || "";
  const baseUrl =
    process.env.VITE_OWLY_LLM_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
  const model = process.env.VITE_OWLY_LLM_MODEL || "qwen-plus";

  if (!apiKey) {
    return res.status(200).json({ mode: "not-configured" });
  }

  let body = {};
  try {
    body = req.body || {};
  } catch {
    // ignore malformed body
  }

  const systemPrompt = `Bạn là Cô Owly 🦉, trợ lý dạy tiếng Anh cho trẻ em 8-12 tuổi Việt Nam.
Quy tắc:
- Trả lời tối đa 80 từ, dùng tiếng Anh đơn giản + giải thích tiếng Việt.
- KHÔNG bịa thông tin ngoài ngữ cảnh được cung cấp.
- Nếu không biết, nói thẳng "Cô chưa có thông tin về điều này".
- An toàn cho trẻ em, thân thiện, khích lệ.
- Luôn gắn ví dụ tiếng Anh trong dấu ngoặc kép.`;

  try {
    const controller = new AbortController();
    // Vercel serverless functions have a default 10s timeout on the free
    // plan. Use a shorter internal timeout so we return a graceful error
    // instead of FUNCTION_INVOCATION_TIMEOUT.
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Ngữ cảnh từ giáo trình:\n${body.context || ""}\n\nCâu hỏi của bé: ${body.question || ""}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return res.status(200).json({
        mode: "error",
        error: `HTTP ${response.status}: ${errText.slice(0, 150)}`,
      });
    }

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content ?? "";

    return res.status(200).json({ mode: "llm", text });
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return res.status(200).json({
      mode: "error",
      error: isAbort
        ? "LLM request timed out"
        : err instanceof Error
          ? err.message
          : "Unknown error",
    });
  }
}
