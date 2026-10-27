/**
 * Vercel Serverless Function — AI tạo bài đọc cho trang "Đọc chạm".
 * URL: /api/ai-passage
 *
 * Dùng River AI (OpenAI-compatible, base https://api.river.ai/v1) với 2
 * model ba mẹ chọn: moonshotai/Kimi-K3 và Qwen/Qwen3.8-27B-FP8.
 * Key lấy theo thứ tự: (1) key ba mẹ nhập trong app, lưu ở localStorage
 * máy bé, gửi kèm từng request (giống cơ chế key cô Owly — hàm này KHÔNG
 * lưu, KHÔNG log key); (2) biến môi trường Vercel RIVER_API_KEY nếu có
 * (đường dùng chung, tùy chọn). Không có key nào -> 503 reason
 * "not-configured" để UI hướng dẫn nhập key.
 *
 * Đầu vào (POST JSON): { topic, level?: "starters"|"movers"|"flyers",
 *   model?: "kimi"|"qwen", apiKey?: string }
 * Đầu ra: { lines: [{ en, vi, scene }], model, level } — khớp đúng kiểu
 * TouchLine của component TouchRead (song ngữ từng câu + cảnh theo câu).
 */
import { applyCors, checkRateLimit } from "./_owly-proxy.js";

const RIVER_BASE = "https://api.river.ai/v1";

const MODELS = {
  kimi: "moonshotai/Kimi-K3",
  qwen: "Qwen/Qwen3.8-27B-FP8",
};

const LEVELS = {
  starters: {
    label: "Starters",
    sentences: "6 to 8 sentences",
    words: "at most 8 words per sentence",
    grammar: "simple present tense only, everyday words a 7-year-old knows",
  },
  movers: {
    label: "Movers",
    sentences: "8 to 10 sentences",
    words: "at most 12 words per sentence",
    grammar: "present simple, present continuous and simple past",
  },
  flyers: {
    label: "Flyers",
    sentences: "10 to 12 sentences",
    words: "at most 15 words per sentence",
    grammar: "past simple and continuous, 'going to', comparatives, connectors (because, so, then)",
  },
};

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd) return fwd.split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

/** Bóc JSON từ text model trả về (chịu được ```json fences). */
function parsePassage(text) {
  const cleaned = String(text || "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      data = JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  const raw = Array.isArray(data?.lines) ? data.lines : null;
  if (!raw) return null;
  const lines = raw
    .map((l) => ({
      en: String(l?.en || "").trim(),
      vi: String(l?.vi || "").trim(),
      scene: String(l?.scene || "").trim(),
    }))
    .filter((l) => l.en && l.vi)
    .slice(0, 12);
  return lines.length >= 4 ? lines : null;
}

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      configured: Boolean(process.env.RIVER_API_KEY),
      clientKeySupported: true,
      models: Object.values(MODELS),
      levels: Object.keys(LEVELS),
    });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (checkRateLimit(clientIp(req))) {
    return res.status(429).json({ error: "Quá nhiều yêu cầu, bé đợi 1 phút nhé.", reason: "rate" });
  }

  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    body = {};
  }

  const topic = String(body.topic || "").trim().slice(0, 120);
  if (!topic) return res.status(400).json({ error: "Chưa nhập chủ đề cho bé.", reason: "bad-request" });
  const levelKey = LEVELS[body.level] ? body.level : "starters";
  const level = LEVELS[levelKey];
  const modelKey = MODELS[body.model] ? body.model : "kimi";
  const model = MODELS[modelKey];

  const apiKey =
    (typeof body.apiKey === "string" && body.apiKey.trim()) || process.env.RIVER_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Chưa có key River AI — nhập key vào ô key trên trang Đọc chạm.",
      reason: "not-configured",
    });
  }

  const system = [
    "You write short English reading passages for Vietnamese children learning English.",
    `Cambridge YLE level: ${level.label}. Write ${level.sentences}, ${level.words}. Grammar: ${level.grammar}.`,
    "Child-friendly, positive, simple story about the given topic. No scary or sad content.",
    'Reply with JSON ONLY, no markdown fences, no extra text: {"lines":[{"en":"...","vi":"...","scene":"..."}]}.',
    "Each line: one English sentence, its Vietnamese translation, and a scene label that starts with exactly one emoji and a short Vietnamese label (for example \"🐱 Chú mèo\").",
  ].join("\n");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60000);
  let r;
  try {
    r = await fetch(`${RIVER_BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Topic: ${topic}` },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
      signal: ctrl.signal,
    });
  } catch {
    clearTimeout(timer);
    return res.status(502).json({ error: "River AI không trả lời kịp, thử lại nhé.", reason: "upstream" });
  }
  clearTimeout(timer);

  if (r.status === 401) {
    return res.status(401).json({ error: "Key River AI không hợp lệ.", reason: "auth" });
  }
  if (r.status === 429) {
    return res.status(429).json({ error: "River AI hết lượt, thử lại sau nhé.", reason: "rate" });
  }
  if (!r.ok) {
    return res.status(502).json({ error: `River AI lỗi (HTTP ${r.status}), thử lại nhé.`, reason: "upstream" });
  }

  const data = await r.json().catch(() => null);
  const text = data?.choices?.[0]?.message?.content || "";
  const lines = parsePassage(text);
  if (!lines) {
    return res.status(502).json({ error: "AI trả về bài chưa đúng định dạng, bấm tạo lại nhé.", reason: "bad-format" });
  }
  return res.status(200).json({ lines, model, level: levelKey });
}
