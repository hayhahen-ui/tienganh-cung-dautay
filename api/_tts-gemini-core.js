/**
 * _tts-gemini-core.js — Engine giọng đọc Google Gemini TTS cho Owly.
 *
 * Vì sao có thêm engine này: ba mẹ nào đã có key Gemini MIỄN PHÍ
 * (AIza..., lấy ở aistudio.google.com) thì dùng luôn key đó cho giọng đọc
 * AI — Gemini TTS có 30 giọng dựng sẵn gồm cả nam (Puck, Charon...) và nữ
 * (Zephyr, Kore...), đọc được cả tiếng Anh lẫn tiếng Việt. Chạy phía
 * server qua /api/tts nên điện thoại nào cũng nghe giống nhau — khắc phục
 * cảnh "điện thoại chỉ có 1 giọng nữ" của Web Speech.
 *
 * API (tài liệu chính thức Google AI for Developers):
 *   POST https://generativelanguage.googleapis.com/v1beta/models/
 *        gemini-2.5-flash-preview-tts:generateContent
 *   header x-goog-api-key: <key>
 *   body { contents: [{parts: [{text}]}],
 *          generationConfig: { responseModalities: ["AUDIO"],
 *            speechConfig: { voiceConfig: { prebuiltVoiceConfig:
 *              { voiceName } }, languageCode } } }
 *   → candidates[0].content.parts[].inlineData.data = base64 PCM thô
 *     (s16le, 24kHz, mono) — file này bọc thêm header WAV để trình
 *     duyệt phát được ngay.
 */

export const GEMINI_TTS_VOICES = [
  "Zephyr", // nữ — sáng, rõ (Cô Emily)
  "Aoede", // nữ — nhẹ nhàng (Cô Lily)
  "Kore", // nữ — chắc, ấm (Cô Anna)
  "Leda", // nữ — trẻ (Cô Mary)
  "Puck", // nam — vui, hoạt bát (Thầy Ben)
  "Fenrir", // nam — năng động (Thầy Jack)
  "Charon", // nam — điềm đạm (Thầy Tom)
  "Orus", // nam — trầm, chắc (Thầy David)
];

export function isGeminiKey(k) {
  return typeof k === "string" && k.trim().startsWith("AIza");
}

/** Bọc PCM s16le 24kHz mono thành file WAV hoàn chỉnh. */
export function pcmToWav(pcm, sampleRate = 24000) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // độ dài fmt chunk
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate (16-bit mono)
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits/sample
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/**
 * Gọi Gemini TTS. Trả { ok: true, audio: Buffer(wav) } |
 * { ok: false, reason: "quota"|"auth"|"upstream", error }.
 */
export async function callGeminiTts(apiKey, { text, voice, lang }) {
  const v = GEMINI_TTS_VOICES.includes(voice) ? voice : "Zephyr";
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent";
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": String(apiKey).trim(),
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: String(text || "").slice(0, 600) }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: v } },
            languageCode: lang === "vi" ? "vi-VN" : "en-GB",
          },
        },
      }),
    });
  } catch (e) {
    return { ok: false, reason: "upstream", error: `Không gọi được Gemini: ${e.message}` };
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json) {
    const msg = json?.error?.message || `HTTP ${res.status}`;
    if (res.status === 429)
      return {
        ok: false,
        reason: "quota",
        error: "Gemini TTS hết lượt miễn phí lúc này — thử lại sau ít phút.",
      };
    if (res.status === 400 || res.status === 401 || res.status === 403)
      return { ok: false, reason: "auth", error: `Key Gemini không hợp lệ: ${msg.slice(0, 120)}` };
    return { ok: false, reason: "upstream", error: `Gemini TTS lỗi: ${msg.slice(0, 120)}` };
  }
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const inline = parts.find((p) => p?.inlineData?.data)?.inlineData;
  if (!inline?.data) {
    return { ok: false, reason: "upstream", error: "Gemini không trả audio." };
  }
  const pcm = Buffer.from(inline.data, "base64");
  if (pcm.length < 1000) {
    return { ok: false, reason: "upstream", error: "Audio Gemini quá ngắn (bất thường)." };
  }
  return { ok: true, audio: pcmToWav(pcm, 24000) };
}
