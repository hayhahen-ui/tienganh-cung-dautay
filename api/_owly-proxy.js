/**
 * _owly-proxy.js — Logic proxy LLM dùng chung cho:
 *   - api/ask-owly.js (Vercel serverless, production)
 *   - llmProxyPlugin trong vite.config.ts (dev)
 *
 * Key của user (từ localStorage máy bé) được ưu tiên; proxy chỉ chuyển tiếp,
 * KHÔNG lưu, KHÔNG log key.
 */

const PROVIDERS = [
  {
    id: "groq",
    test: (k) => k.startsWith("gsk_"),
    base: "https://api.groq.com/openai/v1",
    // llama-3.3-70b-versatile bị Groq khai tử cho gói Free/Developer từ 16/08/2026
    // → model_not_found. Model thay thế chính thức: openai/gpt-oss-20b.
    model: "openai/gpt-oss-20b",
    fallbackModel: "openai/gpt-oss-120b",
    name: "groq",
    openAiCompatible: true,
  },
  {
    id: "openrouter",
    test: (k) => k.startsWith("sk-or-"),
    base: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4o-mini",
    name: "openrouter",
    openAiCompatible: true,
  },
  {
    id: "anthropic",
    test: (k) => k.startsWith("sk-ant-"),
    base: "https://api.anthropic.com/v1",
    model: "claude-3-5-haiku-latest",
    name: "anthropic",
    openAiCompatible: false, // dùng /v1/messages với header x-api-key
  },
  {
    id: "gemini",
    test: (k) => k.startsWith("AIza"),
    base: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.0-flash",
    name: "gemini",
    openAiCompatible: true,
  },
  {
    // Novita: key dạng "sk_" (gạch dưới) — phân biệt với OpenAI "sk-" (gạch ngang).
    // PHẢI đứng trước openai trong danh sách. Novita dùng cho cả chat
    // (dịch/tra cứu) lẫn giọng đọc AI qua api/tts.js (MiniMax Speech HD).
    id: "novita",
    test: (k) => k.startsWith("sk_"),
    base: "https://api.novita.ai/openai/v1",
    model: "deepseek/deepseek-v4.1-flash-1017",
    fallbackModel: "zai-org/glm-5.3-flash",
    name: "novita",
    openAiCompatible: true,
  },
  {
    id: "openai",
    test: (k) => k.startsWith("sk-"),
    base: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    name: "openai",
    openAiCompatible: true,
  },
  {
    id: "larprouter",
    test: (k) => k.startsWith("lrsk-") || k.startsWith("lrsk_"),
    base: "https://larprouter.com/v1",
    model: "deepseek-v4.1-flash",
    fallbackModel: "glm-5.3-flash",
    name: "larprouter",
    openAiCompatible: true,
  },
  {
    id: "dashscope",
    test: () => true,
    base: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
    name: "dashscope",
    openAiCompatible: true,
  },
];

const SYSTEM_PROMPT = `Bạn là Cô Owly 🦉, trợ lý dạy tiếng Anh cho trẻ em 8-12 tuổi Việt Nam, theo chuẩn Cambridge YLE (Starters, Movers, Flyers).
Quy tắc:
- Trả lời tối đa 80 từ, tiếng Việt đơn giản, kèm từ/câu tiếng Anh trong dấu ngoặc kép, có phiên âm IPA nếu là từ vựng.
- Ưu tiên dùng ngữ cảnh giáo trình được cung cấp; nếu câu hỏi là tra từ ngoài ngữ cảnh, vẫn trả lời đúng nghĩa tiếng Anh.
- Nếu câu hỏi yêu cầu DỊCH tiếng Việt sang tiếng Anh: dịch TOÀN BỘ câu gốc một cách TỰ NHIÊN như người bản xứ và ĐẦY ĐỦ mọi ý — dịch hết từng mệnh đề, KHÔNG bỏ sót phần nào; chọn từ theo ngữ cảnh (vd "học tiếng Anh rất vui" → "Learning English is very fun", đừng dịch máy móc từng từ). Viết câu dịch hoàn chỉnh trong dấu ngoặc kép ở đầu câu trả lời, rồi mới giải thích ngắn gọn bằng tiếng Việt.
- Không bịa link, không nói về chủ đề ngoài học tiếng Anh; nếu bé hỏi chuyện không phù hợp, nhẹ nhàng hướng về bài học.
- An toàn cho trẻ em, thân thiện, khích lệ, xưng "cô" và gọi "bé".`;

// ── CORS: cho phép frontend ở origin khác (Render) gọi API ───────────────────
// API không dùng cookie/auth — key là của user gửi kèm body, nên "*" an toàn.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};
function applyCors(res) {
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.setHeader(k, v);
}

// ── Rate limit đơn giản: 30 request/phút/IP (chống lạm dụng proxy) ─────────
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 30;
const rateHits = new Map(); // ip -> number[]
function checkRateLimit(ip) {
  const now = Date.now();
  const arr = (rateHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  rateHits.set(ip, arr);
  if (rateHits.size > 2000) {
    const oldest = [...rateHits.keys()][0];
    rateHits.delete(oldest);
  }
  return arr.length > RATE_MAX;
}

function resolveConfig(userKey, env = process.env) {
  const envKey = env.OWLY_LLM_API_KEY || env.VITE_OWLY_LLM_API_KEY || env.mrbit1 || "";
  // Key của user (từ localStorage máy bé) được ưu tiên — proxy không lưu lại.
  const apiKey = (typeof userKey === "string" && userKey.trim()) || envKey;
  const provider = PROVIDERS.find((x) => x.test(apiKey)) || PROVIDERS[PROVIDERS.length - 1];
  const baseUrl = (env.OWLY_LLM_BASE_URL || env.VITE_OWLY_LLM_BASE_URL || provider.base).replace(
    /\/$/,
    "",
  );
  const model = env.OWLY_LLM_MODEL || env.VITE_OWLY_LLM_MODEL || provider.model;
  return { apiKey, baseUrl, model, provider };
}

async function fetchWithTimeout(url, opts, ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/** Gọi chat — hỗ trợ cả OpenAI-compatible và Anthropic Messages API.
 * Tự thử model dự phòng 1 lần khi nhà cung cấp báo model không tồn tại
 * (Groq hay khai tử model — đã gặp 19/10/2026 với llama-3.3-70b-versatile). */
async function callChat(provider, baseUrl, model, apiKey, question, context) {
  const userContent = `Ngữ cảnh từ giáo trình:\n${context}\n\nCâu hỏi của bé: ${question}`;
  const attempts = [model];
  if (provider.fallbackModel && provider.fallbackModel !== model)
    attempts.push(provider.fallbackModel);

  let lastError = "";
  for (const m of attempts) {
    const r = await singleChatAttempt(provider, baseUrl, m, apiKey, userContent);
    if (r.ok && (r.text || "").trim()) return r;
    if (r.ok) {
      // Model trả 200 nhưng nội dung rỗng (gặp với DeepSeek qua LarpRouter 20/10/2026,
      // app in header "giải thích thêm" trống) → thử model dự phòng.
      lastError = "AI trả về câu trả lời trống.";
      continue;
    }
    lastError = r.error;
    if (!isModelNotFound(r.error)) break; // lỗi khác (key sai, hết quota…) → không thử tiếp
  }
  if (isModelNotFound(lastError)) {
    return {
      ok: false,
      error:
        "Model AI đã bị nhà cung cấp ngừng hỗ trợ — cô Owly vẫn trả lời bằng giáo trình bên dưới nhé.",
    };
  }
  return { ok: false, error: lastError };
}

function isModelNotFound(errText) {
  return /model_not_found|does not exist|model .* not found/i.test(errText || "");
}

async function singleChatAttempt(provider, baseUrl, model, apiKey, userContent) {
  if (!provider.openAiCompatible && provider.id === "anthropic") {
    const response = await fetchWithTimeout(
      `${baseUrl}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 220,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userContent }],
          temperature: 0.3,
        }),
      },
      20000,
    );
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return { ok: false, error: `HTTP ${response.status}: ${errText.slice(0, 150)}` };
    }
    const json = await response.json();
    const text = (json.content || []).map((b) => b.text || "").join("");
    return { ok: true, text };
  }

  const response = await fetchWithTimeout(
    `${baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(provider.id === "openrouter"
          ? { "HTTP-Referer": "https://owly-english.app", "X-Title": "Owly English" }
          : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        max_tokens: 220,
        temperature: 0.3,
      }),
    },
    20000,
  );
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    return { ok: false, error: `HTTP ${response.status}: ${errText.slice(0, 150)}` };
  }
  const json = await response.json();
  const text = json.choices?.[0]?.message?.content ?? "";
  return { ok: true, text };
}

/** Kiểm tra key: gọi endpoint /models (không tốn token chat). */
async function validateKey(provider, baseUrl, apiKey) {
  const headers =
    provider.id === "anthropic"
      ? { "x-api-key": apiKey, "anthropic-version": "2023-06-01" }
      : { Authorization: `Bearer ${apiKey}` };
  const response = await fetchWithTimeout(`${baseUrl}/models`, { headers }, 15000);
  if (response.ok) return { valid: true };
  const errText = await response.text().catch(() => "");
  return { valid: false, error: `HTTP ${response.status}: ${errText.slice(0, 120)}` };
}

export {
  PROVIDERS,
  SYSTEM_PROMPT,
  checkRateLimit,
  resolveConfig,
  callChat,
  validateKey,
  applyCors,
};
