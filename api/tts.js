/**
 * Vercel Serverless Function — Text-to-Speech AI của Novita. URL: /api/tts
 *
 * Đầu vào (POST JSON): { text, voiceId?, speed?, lang?: "en"|"vi", apiKey }
 *   - apiKey: key Novita (dạng sk_...) của ba mẹ, lưu ở localStorage máy bé,
 *     gửi kèm từng request — hàm này KHÔNG lưu, KHÔNG log key.
 * Đầu ra: audio/mpeg (mp3 32kHz, MiniMax Speech-02-HD qua Novita).
 * Lỗi: JSON { error, reason } với HTTP 4xx/5xx tương ứng —
 *   reason "balance" = tài khoản Novita hết credit (app tự rơi về giọng máy).
 */
import { applyCors, checkRateLimit } from "./_owly-proxy.js";
import { callNovitaTts, isNovitaKey, TTS_MAX_CHARS } from "./_tts-core.js";

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd) return fwd.split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

export default async function handler(req, res) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") {
    return res.status(200).json({ status: "ok", engine: "novita-minimax-speech-02-hd" });
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
  if (!isNovitaKey(apiKey)) {
    return res
      .status(400)
      .json({ error: "Giọng AI cần key Novita (dạng sk_...).", reason: "bad-request" });
  }
  const text = String(body.text || "").trim();
  if (!text) return res.status(400).json({ error: "Thiếu văn bản cần đọc.", reason: "bad-request" });
  if (text.length > TTS_MAX_CHARS) {
    return res
      .status(400)
      .json({ error: `Văn bản quá dài (tối đa ${TTS_MAX_CHARS} ký tự).`, reason: "bad-request" });
  }

  const r = await callNovitaTts(apiKey, {
    text,
    voiceId: body.voiceId,
    speed: body.speed,
    lang: body.lang === "vi" ? "vi" : "en",
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
