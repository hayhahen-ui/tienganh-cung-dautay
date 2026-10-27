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

/** Chuẩn hoá 1 dòng: chịu được nhiều tên key khác nhau của model. */
function normalizeLine(l) {
  if (!l || typeof l !== "object") return null;
  const en = l.en ?? l.english ?? l.sentence ?? l.text ?? "";
  const vi = l.vi ?? l.vietnamese ?? l.translation ?? l.meaning ?? "";
  const scene = l.scene ?? l.scene_label ?? l.emoji ?? "";
  const out = { en: String(en).trim(), vi: String(vi).trim(), scene: String(scene).trim() };
  return out.en && out.vi ? out : null;
}

function normalizeList(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeLine).filter(Boolean).slice(0, 12);
}

/**
 * Bóc bài đọc từ text model trả về. Model đôi khi trả sai định dạng
 * (kèm lời giải thích, key khác tên, JSON gãy do cắt token, dấu phẩy
 * thừa...) nên thử nhiều tầng, từ chặt tới lỏng:
 *  1. JSON.parse toàn bộ (chịu ```json fences).
 *  2. Cắt đoạn {...} / [...] lớn nhất rồi parse lại (kèm khử dấu phẩy thừa).
 *  3. Salvage: quét regex từng cặp "en"/"vi" trong text — cứu được bài
 *     ngay cả khi JSON tổng bị gãy, miễn từng câu còn nguyên.
 */
function parsePassage(text) {
  const raw = String(text || "");
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const candidates = [cleaned];
  const startObj = cleaned.indexOf("{");
  const endObj = cleaned.lastIndexOf("}");
  if (startObj !== -1 && endObj > startObj) candidates.push(cleaned.slice(startObj, endObj + 1));
  const startArr = cleaned.indexOf("[");
  const endArr = cleaned.lastIndexOf("]");
  if (startArr !== -1 && endArr > startArr) candidates.push(cleaned.slice(startArr, endArr + 1));

  for (const cand of candidates) {
    for (const attempt of [cand, cand.replace(/,\s*([}\]])/g, "$1")]) {
      try {
        const data = JSON.parse(attempt);
        const list = Array.isArray(data)
          ? data
          : data?.lines || data?.passage || data?.sentences || data?.story || null;
        const lines = normalizeList(list);
        if (lines.length >= 4) return { lines, via: "json" };
      } catch {
        /* thử tầng tiếp theo */
      }
    }
  }

  // Tầng salvage: quét từng cặp en/vi (kể cả khi vi đứng trước en).
  const pairRe =
    /"en"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"vi"\s*:\s*"((?:[^"\\]|\\.)*)"(?:\s*,\s*"scene"\s*:\s*"((?:[^"\\]|\\.)*)")?/g;
  const pairRe2 =
    /"vi"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"en"\s*:\s*"((?:[^"\\]|\\.)*)"(?:\s*,\s*"scene"\s*:\s*"((?:[^"\\]|\\.)*)")?/g;
  const salvaged = [];
  let m;
  while ((m = pairRe.exec(raw)) !== null) {
    salvaged.push({ en: m[1], vi: m[2], scene: m[3] || "" });
  }
  if (salvaged.length < 4) {
    while ((m = pairRe2.exec(raw)) !== null) {
      salvaged.push({ en: m[2], vi: m[1], scene: m[3] || "" });
    }
  }
  const lines = normalizeList(salvaged);
  if (lines.length >= 4) return { lines, via: "salvage" };
  return null;
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
    'Reply with JSON ONLY, no markdown fences, no greeting, no explanation, no text outside the JSON object — even when the topic is given in Vietnamese.',
    'Exact shape: {"lines":[{"en":"...","vi":"...","scene":"..."}]}.',
    "Each line: one English sentence, its Vietnamese translation, and a scene label that starts with exactly one emoji and a short Vietnamese label (for example \"🐱 Chú mèo\").",
  ].join("\n");

  // Gọi model tối đa 2 lần: lần 1 sai định dạng thì tự gọi lại thay vì
  // bắt ba mẹ bấm "Tạo bài đọc" lại (lỗi user gặp 27/10: Kimi + chủ đề
  // tiếng Việt trả về sai định dạng 3/3 lần).
  let lastRaw = "";
  for (let attempt = 0; attempt < 2; attempt++) {
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
          max_tokens: 1600,
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
    lastRaw = data?.choices?.[0]?.message?.content || "";
    const parsed = parsePassage(lastRaw);
    if (parsed) {
      return res.status(200).json({ lines: parsed.lines, model, level: levelKey });
    }
  }

  return res.status(502).json({
    error: "AI trả về bài chưa đúng định dạng, bấm tạo lại nhé.",
    reason: "bad-format",
    // Đoạn đầu output thô để chẩn đoán (không chứa key, chỉ là bài đọc).
    rawPreview: lastRaw.slice(0, 300),
  });
}
