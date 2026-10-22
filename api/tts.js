/**
 * Vercel Serverless Function — Text-to-Speech AI cho Owly. URL: /api/tts
 *
 * Hai engine, chọn theo key của ba mẹ (lưu ở localStorage máy bé, gửi kèm
 * từng request — hàm này KHÔNG lưu, KHÔNG log key):
 *   - Key Novita (sk_...)  → MiniMax Speech-02-HD: audio/mpeg 32kHz.
 *   - Key Gemini (AIza...) → Gemini TTS: audio/wav 24kHz (miễn phí theo key).
 * Đầu vào (POST JSON): { text, voiceId?, speed?, lang?: "en"|"vi", apiKey }
 * Lỗi: JSON { error, reason } — reason "balance" = Novita hết credit,
 * "quota" = Gemini hết lượt (app tự rơi về engine khác / giọng máy).
 */
import { applyCors, checkRateLimit } from "./_owly-proxy.js";
import { callNovitaTts, isNovitaKey, TTS_MAX_CHARS } from "./_tts-core.js";
import { callGeminiTts, isGeminiKey } from "./_tts-gemini-core.js";

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd) return fwd.split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") {
    return res
      .status(200)
      .json({ status: "ok", engines: ["novita-minimax-speech-02-hd", "gemini-2.5-flash-tts"] });
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

  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  const text = String(body.text || "").trim();
  if (!text) return res.status(400).json({ error: "Thiếu văn bản cần đọc.", reason: "bad-request" });
  if (text.length > TTS_MAX_CHARS) {
    return res
      .status(400)
      .json({ error: `Văn bản quá dài (tối đa ${TTS_MAX_CHARS} ký tự).`, reason: "bad-request" });
  }
  const lang = body.lang === "vi" ? "vi" : "en";

  if (isGeminiKey(apiKey)) {
    const g = await callGeminiTts(apiKey, { text, voice: body.voiceId, lang });
    if (!g.ok) {
      const status = g.reason === "quota" ? 429 : g.reason === "auth" ? 401 : 502;
      return res.status(status).json({ error: g.error, reason: g.reason });
    }
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", String(g.audio.length));
    res.setHeader("Cache-Control", "private, max-age=3600");
    return res.status(200).send(g.audio);
  }

  if (!isNovitaKey(apiKey)) {
    return res.status(400).json({
      error: "Giọng AI cần key Novita (sk_...) hoặc key Gemini (AIza...).",
      reason: "bad-request",
    });
  }
  const r = await callNovitaTts(apiKey, {
    text,
    voiceId: body.voiceId,
    speed: body.speed,
    lang,
  });
  if (!r.ok) {
    const status = r.reason === "balance" ? 402 : r.reason === "auth" ? 401 : 502;
    return res.status(status).json({ error: r.error, reason: r.reason });
  }
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Length", String(r.audio.length));
  res.setHeader("Cache-Control", "private, max-age=3600");
  return res.status(200).send(r.audio);
}
