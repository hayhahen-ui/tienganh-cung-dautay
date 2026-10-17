/**
 * Vercel Serverless Function — proxy LLM cho "Hỏi cô Owly".
 * Giữ API key ở server. URL: /api/ask-owly
 *
 * Biến môi trường (Vercel → Settings → Environment Variables):
 *   OWLY_LLM_API_KEY   (bắt buộc để bật AI; không có → app chạy chế độ giáo trình)
 *   OWLY_LLM_BASE_URL  (tùy chọn; tự suy ra từ dạng key nếu bỏ trống)
 *   OWLY_LLM_MODEL     (tùy chọn; tự chọn model mặc định theo nhà cung cấp)
 * Vẫn chấp nhận tên cũ VITE_OWLY_LLM_* để tương thích.
 */

const PROVIDERS = [
  {
    test: (k) => k.startsWith("gsk_"),
    base: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
    name: "groq",
  },
  {
    test: (k) => k.startsWith("sk-or-"),
    base: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4o-mini",
    name: "openrouter",
  },
  {
    test: (k) => k.startsWith("sk-ant-"),
    base: "https://api.anthropic.com/v1/",
    model: "claude-3-5-haiku-latest",
    name: "anthropic",
  },
  {
    test: (k) => k.startsWith("AIza"),
    base: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.0-flash",
    name: "gemini",
  },
  {
    test: (k) => k.startsWith("sk-"),
    base: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    name: "openai",
  },
  {
    test: () => true,
    base: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
    name: "dashscope",
  },
];

function config() {
  const apiKey =
    process.env.OWLY_LLM_API_KEY || process.env.VITE_OWLY_LLM_API_KEY || process.env.mrbit1 || "";
  const p = PROVIDERS.find((x) => x.test(apiKey)) || PROVIDERS[PROVIDERS.length - 1];
  const baseUrl = (
    process.env.OWLY_LLM_BASE_URL ||
    process.env.VITE_OWLY_LLM_BASE_URL ||
    p.base
  ).replace(/\/$/, "");
  const model = process.env.OWLY_LLM_MODEL || process.env.VITE_OWLY_LLM_MODEL || p.model;
  return { apiKey, baseUrl, model, provider: p.name };
}

const SYSTEM_PROMPT = `Bạn là Cô Owly 🦉, trợ lý dạy tiếng Anh cho trẻ em 8-12 tuổi Việt Nam, theo chuẩn Cambridge YLE (Starters, Movers, Flyers).
Quy tắc:
- Trả lời tối đa 80 từ, tiếng Việt đơn giản, kèm từ/câu tiếng Anh trong dấu ngoặc kép, có phiên âm IPA nếu là từ vựng.
- Ưu tiên dùng ngữ cảnh giáo trình được cung cấp; nếu câu hỏi là tra từ ngoài ngữ cảnh, vẫn trả lời đúng nghĩa tiếng Anh.
- Không bịa link, không nói về chủ đề ngoài học tiếng Anh; nếu bé hỏi chuyện không phù hợp, nhẹ nhàng hướng về bài học.
- An toàn cho trẻ em, thân thiện, khích lệ, xưng "cô" và gọi "bé".`;

export default async function handler(req, res) {
  const { apiKey, baseUrl, model, provider } = config();

  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      hasKey: !!apiKey,
      provider: apiKey ? provider : null,
      model: apiKey ? model : null,
    });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!apiKey) {
    return res.status(200).json({ mode: "not-configured" });
  }

  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    body = {};
  }
  const question = String(body.question || "").slice(0, 300);
  const context = String(body.context || "").slice(0, 4000);
  if (!question.trim()) return res.status(200).json({ mode: "error", error: "empty question" });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8500);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(provider === "openrouter"
          ? { "HTTP-Referer": "https://owly-english.app", "X-Title": "Owly English" }
          : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Ngữ cảnh từ giáo trình:\n${context}\n\nCâu hỏi của bé: ${question}`,
          },
        ],
        max_tokens: 220,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return res
        .status(200)
        .json({ mode: "error", error: `HTTP ${response.status}: ${errText.slice(0, 150)}` });
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
