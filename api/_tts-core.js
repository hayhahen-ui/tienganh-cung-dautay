/**
 * _tts-core.js — Lõi gọi Text-to-Speech của Novita (MiniMax Speech-02-HD)
 * dùng chung cho api/tts.js (Vercel, production) và llmProxyPlugin (dev).
 *
 * Vì sao Novita/MiniMax: giọng AI tổng hợp chất lượng HD (mp3 32kHz),
 * có cả giọng NAM và NỮ thật (giọng của máy/điện thoại chỉ có 1 giọng nữ
 * mặc định, khó nghe) — bé chọn được Cô/Thầy như ý.
 *
 * Key là của ba mẹ (BYOK, localStorage máy bé) gửi kèm từng request —
 * hàm này chỉ chuyển tiếp, KHÔNG lưu, KHÔNG log key.
 *
 * API Novita (đã kiểm chứng 22/10/2026 bằng key thật):
 *   POST https://api.novita.ai/v3/minimax-speech-02-hd
 *   body { text, voice_setting: {voice_id, speed, vol, pitch, emotion},
 *          audio_setting: {format:"mp3", sample_rate:32000, bitrate:128000, channel:1},
 *          language_boost: "English"|"Vietnamese", output_format: "hex" }
 *   → { data: { audio: "<hex mp3>", status: 2 }, extra_info: {...} }
 *   Lỗi số dư: HTTP 403 { code: 403, reason: "NOT_ENOUGH_BALANCE" }.
 */

// 17 giọng hệ thống của MiniMax Speech-02 — whitelist chống lạm dụng endpoint.
export const NOVITA_TTS_VOICES = [
  "Wise_Woman",
  "Calm_Woman",
  "Friendly_Person",
  "Deep_Voice_Man",
  "Inspirational_girl",
  "Casual_Guy",
  "Lively_Girl",
  "Patient_Man",
  "Young_Knight",
  "Determined_Man",
  "Lovely_Girl",
  "Decent_Boy",
  "Imposing_Manner",
  "Elegant_Man",
  "Abbess",
  "Sweet_Girl_2",
  "Exuberant_Girl",
];

export const NOVITA_TTS_DEFAULTS = { female: "Lovely_Girl", male: "Decent_Boy" };

const TTS_URL = "https://api.novita.ai/v3/minimax-speech-02-hd";
export const TTS_MAX_CHARS = 600;

/** Key Novita có dạng "sk_..." (gạch dưới) — khác OpenAI "sk-...". */
export function isNovitaKey(k) {
  return typeof k === "string" && k.trim().startsWith("sk_");
}

/**
 * Gọi Novita TTS. Trả { ok: true, audio: Buffer, ms } hoặc
 * { ok: false, reason: "balance"|"auth"|"upstream"|"bad-request", error }.
 */
export async function callNovitaTts(apiKey, { text, voiceId, speed, lang }) {
  const voice = NOVITA_TTS_VOICES.includes(voiceId) ? voiceId : NOVITA_TTS_DEFAULTS.female;
  const spd = Math.min(2, Math.max(0.5, typeof speed === "number" ? speed : 1));
  const body = {
    text: String(text || "").slice(0, TTS_MAX_CHARS),
    voice_setting: { voice_id: voice, speed: spd, vol: 1, pitch: 0, emotion: "happy" },
    audio_setting: { format: "mp3", sample_rate: 32000, bitrate: 128000, channel: 1 },
    language_boost: lang === "vi" ? "Vietnamese" : "English",
    output_format: "hex",
  };
  const t0 = Date.now();
  let res;
  try {
    res = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${String(apiKey).trim()}`,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { ok: false, reason: "upstream", error: `Không gọi được Novita: ${e.message}` };
  }
  const raw = await res.text().catch(() => "");
  let json = null;
  try {
    json = JSON.parse(raw);
  } catch {
    /* không phải JSON */
  }
  if (!res.ok || !json) {
    const reasonTxt = json?.reason || "";
    if (res.status === 403 && /BALANCE/i.test(reasonTxt))
      return {
        ok: false,
        reason: "balance",
        error: "Tài khoản Novita chưa có credit (số dư $0) — nạp thêm credit để dùng giọng AI.",
      };
    if (res.status === 401 || res.status === 403)
      return { ok: false, reason: "auth", error: `Key Novita không hợp lệ (HTTP ${res.status}).` };
    return {
      ok: false,
      reason: "upstream",
      error: `Novita TTS lỗi HTTP ${res.status}: ${raw.slice(0, 120)}`,
    };
  }
  const hex = json?.data?.audio;
  if (typeof hex !== "string" || hex.length < 100) {
    const br = json?.base_resp;
    return {
      ok: false,
      reason: "upstream",
      error: `Novita không trả audio: ${JSON.stringify(br || json).slice(0, 150)}`,
    };
  }
  return { ok: true, audio: Buffer.from(hex, "hex"), ms: Date.now() - t0 };
}
