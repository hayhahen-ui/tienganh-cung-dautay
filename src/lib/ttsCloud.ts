/**
 * ttsCloud.ts — Giọng đọc AI qua Novita (MiniMax Speech-02-HD) cho Owly.
 *
 * Vì sao cần: giọng của trình duyệt/điện thoại (Web Speech) thường chỉ có
 * 1 giọng nữ mặc định, không có giọng nam và khó nghe. Giọng AI của Novita
 * là file mp3 HD tổng hợp trên máy chủ — có cả Cô và Thầy thật, rõ nét
 * như nhau trên mọi thiết bị.
 *
 * Điều kiện dùng: ba mẹ dán key Novita (dạng sk_...) ở mục "Hỏi cô Owly"
 * (cùng 1 key cho chat + giọng đọc). Key gửi kèm từng request qua
 * /api/tts — không lưu ở server. Không có key Novita → app tự dùng giọng máy.
 *
 * Danh mục giọng được tuyển từ 17 giọng hệ thống của MiniMax và cảm hứng
 * phân loại nam/nữ trong bộ sưu tập voice của Voice-Pro (file zip ba mẹ gửi
 * 22/10/2026 — cùng triết lý: mỗi giọng có tên + giới tính rõ ràng để chọn).
 */
import { getOwlyKey } from "./rag/owlyKeys";
import { detectOwlyProvider } from "./rag/owlyProviders";
import type { VoiceGender } from "./speech";

export interface NovitaVoice {
  id: string;
  /** Tên nhân vật hiển thị cho bé/ba mẹ */
  persona: string;
  gender: VoiceGender;
  style: string;
}

/** Giọng nữ — mặc định Lovely_Girl (Cô Emily, giọng trẻ ngọt cho bé). */
export const NOVITA_VOICES_FEMALE: NovitaVoice[] = [
  { id: "Lovely_Girl", persona: "Cô Emily", gender: "female", style: "giọng trẻ, ngọt ngào" },
  { id: "Lively_Girl", persona: "Cô Lily", gender: "female", style: "vui tươi, năng động" },
  { id: "Calm_Woman", persona: "Cô Anna", gender: "female", style: "dịu dàng, chậm rãi" },
  { id: "Wise_Woman", persona: "Cô Mary", gender: "female", style: "ấm áp, rõ ràng" },
];

/** Giọng nam — mặc định Decent_Boy (Thầy Ben, giọng trẻ rõ cho bé). */
export const NOVITA_VOICES_MALE: NovitaVoice[] = [
  { id: "Decent_Boy", persona: "Thầy Ben", gender: "male", style: "giọng trẻ, rõ ràng" },
  { id: "Casual_Guy", persona: "Thầy Jack", gender: "male", style: "thân thiện, tự nhiên" },
  { id: "Patient_Man", persona: "Thầy Tom", gender: "male", style: "điềm đạm, kiên nhẫn" },
  { id: "Deep_Voice_Man", persona: "Thầy David", gender: "male", style: "trầm ấm, vang" },
];

export const NOVITA_VOICES: NovitaVoice[] = [...NOVITA_VOICES_FEMALE, ...NOVITA_VOICES_MALE];

export function novitaVoiceById(id: string | undefined): NovitaVoice | undefined {
  return NOVITA_VOICES.find((v) => v.id === id);
}

export function defaultNovitaVoice(gender: VoiceGender): NovitaVoice {
  return gender === "male" ? NOVITA_VOICES_MALE[0]! : NOVITA_VOICES_FEMALE[0]!;
}

/** true khi key đang lưu là key Novita → dùng được giọng AI. */
export function hasNovitaKey(): boolean {
  const k = getOwlyKey();
  return !!k && detectOwlyProvider(k).id === "novita";
}

// ── Trạng thái lần gọi TTS gần nhất (để UI báo đúng lý do) ──────────────────
export type TtsStatus = "idle" | "ok" | "balance" | "auth" | "error";
let lastStatus: TtsStatus = "idle";
const STATUS_EVENT = "owly-tts-status";
export function getTtsStatus(): TtsStatus {
  return lastStatus;
}
export function onTtsStatusChange(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(STATUS_EVENT, cb);
  return () => window.removeEventListener(STATUS_EVENT, cb);
}
function setStatus(s: TtsStatus) {
  if (s === lastStatus) return;
  lastStatus = s;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(STATUS_EVENT));
}

// ── Phát âm ─────────────────────────────────────────────────────────────────
const API_BASE =
  (import.meta.env as Record<string, string | undefined>)["VITE_OWLY_API_URL"] || "";
const VI_CHARS =
  /[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i;

export function detectLang(text: string): "vi" | "en" {
  return VI_CHARS.test(text) ? "vi" : "en";
}

let audioEl: HTMLAudioElement | null = null;
const blobCache = new Map<string, string>(); // "voice|speed|text" -> objectURL
const CACHE_MAX = 30;

function getAudioEl(): HTMLAudioElement {
  if (!audioEl) audioEl = new Audio();
  return audioEl;
}

/** Dừng giọng AI đang phát (nút Dừng / khi bắt đầu câu mới). */
export function stopCloudSpeech() {
  if (audioEl) {
    try {
      audioEl.pause();
      audioEl.currentTime = 0;
    } catch {
      /* noop */
    }
  }
}

export function isCloudPlaying(): boolean {
  return !!audioEl && !audioEl.paused && !audioEl.ended;
}

/**
 * Đọc bằng giọng AI Novita. Trả true nếu phát được (hoặc đang tải để phát);
 * false nếu không có key Novita / lỗi — caller tự rơi về giọng máy.
 * onEnd được gọi khi đọc xong HOẶC khi lỗi sau lúc đã nhận phát.
 */
export async function speakCloud(
  text: string,
  opts: { voiceId: string; speed: number; onEnd?: (() => void) | undefined },
): Promise<boolean> {
  const key = getOwlyKey();
  if (!key || detectOwlyProvider(key).id !== "novita") return false;
  const clean = text.trim();
  if (!clean) return false;

  const cacheKey = `${opts.voiceId}|${opts.speed.toFixed(2)}|${clean}`;
  const el = getAudioEl();
  stopCloudSpeech();

  const play = (src: string) => {
    el.src = src;
    el.onended = () => opts.onEnd?.();
    el.onerror = () => opts.onEnd?.();
    void el.play().catch(() => opts.onEnd?.());
  };

  const cached = blobCache.get(cacheKey);
  if (cached) {
    setStatus("ok");
    play(cached);
    return true;
  }

  try {
    const r = await fetch(`${API_BASE}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: key,
        text: clean.slice(0, 600),
        voiceId: opts.voiceId,
        speed: opts.speed,
        lang: detectLang(clean),
      }),
    });
    if (!r.ok) {
      let reason = "";
      try {
        reason = ((await r.json()) as { reason?: string }).reason || "";
      } catch {
        /* không phải JSON */
      }
      setStatus(reason === "balance" ? "balance" : reason === "auth" ? "auth" : "error");
      return false;
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    if (blobCache.size >= CACHE_MAX) {
      const oldest = blobCache.keys().next().value;
      if (oldest) {
        URL.revokeObjectURL(blobCache.get(oldest)!);
        blobCache.delete(oldest);
      }
    }
    blobCache.set(cacheKey, url);
    setStatus("ok");
    play(url);
    return true;
  } catch {
    setStatus("error");
    return false;
  }
}
