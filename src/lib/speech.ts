// ─────────────────────────────────────────────────────────────────────────────
// Owly English — Speech engine
// Hai tầng giọng đọc:
//  1. Giọng AI Novita (MiniMax Speech HD) — khi ba mẹ dán key Novita:
//     giọng NAM/NỮ thật, mp3 HD rõ nét trên mọi thiết bị, bé chọn được
//     từng giọng Cô/Thầy cụ thể (xem lib/ttsCloud.ts). Đường mặc định.
//  2. Giọng máy (Web Speech API) — dự phòng khi không có key Novita hoặc
//     giọng AI lỗi; và là đường DUY NHẤT cho đọc karaoke (cần sự kiện
//     boundary để highlight từng từ — file mp3 không có thông tin này).
// Lựa chọn lưu trong localStorage, dùng chung cho mọi nút loa trong app.
// ─────────────────────────────────────────────────────────────────────────────
import {
  defaultNovitaVoice,
  hasNovitaKey,
  novitaVoiceById,
  speakCloud,
  stopCloudSpeech,
} from "./ttsCloud";

export type VoiceGender = "female" | "male";
export type SpeechSpeed = "slow" | "normal";

export type VoiceSettings = {
  gender: VoiceGender;
  speed: SpeechSpeed;
  /** Giọng AI cụ thể (voice_id của Novita) — undefined = tự chọn theo gender. */
  voiceId?: string | undefined;
};

const SETTINGS_KEY = "owly-voice-settings";
const CHANGE_EVENT = "owly-voice-settings-changed";

/** Mặc định: giọng nữ, đọc chậm — phù hợp bé mới bắt đầu. */
const DEFAULT_SETTINGS: VoiceSettings = { gender: "female", speed: "slow" };

export function getVoiceSettings(): VoiceSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<VoiceSettings>;
    return {
      gender: parsed.gender === "male" ? "male" : "female",
      speed: parsed.speed === "normal" ? "normal" : "slow",
      voiceId: typeof parsed.voiceId === "string" ? parsed.voiceId : undefined,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function setVoiceSettings(next: Partial<VoiceSettings>) {
  if (typeof window === "undefined") return;
  const merged = { ...getVoiceSettings(), ...next };
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  } catch {
    // private mode — bỏ qua, vẫn dùng trong phiên
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Đăng ký lắng nghe khi cài đặt giọng đọc thay đổi (kể cả tab khác). */
export function onVoiceSettingsChange(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

// ── Nhận diện giọng Nữ / Nam từ tên voice của hệ điều hành / trình duyệt ────
// Lưu ý: chuỗi "female" chứa cả "male" nên PHẢI kiểm tra nữ trước.

const FEMALE_HINTS = [
  "female",
  "samantha",
  "victoria",
  "karen",
  "moira",
  "tessa",
  "zira",
  "aria",
  "jenny",
  "sonia",
  "libby",
  "maisie",
  "catherine",
  "susan",
  "hazel",
  "fiona",
  "kate",
  "stephanie",
  "serena",
  "allison",
  "ava",
  "emma",
  "olivia",
  "joana",
  "nicky",
  "joelle",
  "michelle",
  "ana",
  "clara",
  "natasha",
  "priya",
  "raveena",
  "martha",
  "shelley",
  "sophie",
  "linda",
  "amy",
  "mia",
  "isabella",
  "bella",
  "hollie",
  "eva",
  "salli",
  "joanna",
  "kendra",
  "kimberly",
  "ivy",
];

const MALE_HINTS = [
  "male",
  "daniel",
  "alex",
  "fred",
  "david",
  "mark",
  "george",
  "guy",
  "ryan",
  "thomas",
  "james",
  "oliver",
  "brian",
  "arthur",
  "aaron",
  "gordon",
  "rishi",
  "reed",
  "eddy",
  "rocko",
  "christopher",
  "eric",
  "roger",
  "brandon",
  "andrew",
  "liam",
  "justin",
  "matthew",
  "joey",
  "brian",
  "russell",
];

function guessGender(voiceName: string): VoiceGender | null {
  const n = voiceName.toLowerCase();
  // Kiểm tra nữ TRƯỚC vì "female" chứa "male".
  if (FEMALE_HINTS.some((h) => n.includes(h))) return "female";
  if (MALE_HINTS.some((h) => n.includes(h))) return "male";
  return null;
}

function langScore(lang: string): number {
  const l = lang.toLowerCase().replace("_", "-");
  if (l === "en-gb") return 4; // mục tiêu chính: Anh–Anh
  if (l === "en-us") return 3;
  if (l.startsWith("en")) return 2; // en-AU, en-IE, en-ZA…
  return 0;
}

function qualityScore(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  let s = 0;
  if (n.includes("natural") || n.includes("neural") || n.includes("premium")) s += 3;
  if (n.includes("google")) s += 2;
  if (n.includes("online")) s += 1; // Microsoft * Online (Natural) — Edge
  if (v.localService) s += 1;
  if (n.includes("compact") || n.includes("eloquence")) s -= 2; // giọng máy móc
  return s;
}

/** Danh sách voice tiếng Anh có sẵn, sắp xếp tốt nhất lên đầu. */
export function getEnglishVoices(gender?: VoiceGender): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith("en"));
  const scored = voices
    .map((v) => ({
      v,
      g: guessGender(v.name),
      score: langScore(v.lang) * 10 + qualityScore(v),
    }))
    .sort((a, b) => b.score - a.score);
  if (!gender) return scored.map((s) => s.v);
  const matched = scored.filter((s) => s.g === gender);
  return (matched.length ? matched : scored).map((s) => s.v);
}

// Một số trình duyệt nạp voice bất đồng bộ — đảm bảo đã nạp trước khi chọn.
let voicesReady = false;
function ensureVoicesLoaded() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (voicesReady) return;
  const list = window.speechSynthesis.getVoices();
  if (list.length > 0) {
    voicesReady = true;
    return;
  }
  window.speechSynthesis.onvoiceschanged = () => {
    voicesReady = true;
  };
}

/** Giọng AI đang dùng theo cài đặt: voiceId cụ thể, hoặc mặc định theo gender. */
function activeCloudVoice(settings: VoiceSettings) {
  const picked = settings.voiceId ? novitaVoiceById(settings.voiceId) : undefined;
  return picked ?? defaultNovitaVoice(settings.gender);
}

/** Ánh xạ tốc độ của giọng máy (0.6–0.9) sang thang MiniMax (0.5–2.0). */
function cloudSpeed(
  settings: VoiceSettings,
  opts: { slow?: boolean | undefined; rate?: number | undefined },
): number {
  if (typeof opts.rate === "number") return Math.min(1.2, Math.max(0.6, opts.rate + 0.15));
  if (opts.slow) return 0.75;
  return settings.speed === "slow" ? 0.85 : 1.0;
}

/** Đọc bằng giọng MÁY (Web Speech) — logic gốc, giữ nguyên hành vi. */
function speakDevice(
  text: string,
  opts: {
    slow?: boolean | undefined;
    rate?: number | undefined;
    onBoundary?: ((charIndex: number) => void) | undefined;
    onEnd?: (() => void) | undefined;
  },
  settings: VoiceSettings,
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  ensureVoicesLoaded();

  const baseRate = settings.speed === "slow" ? 0.7 : 0.9;
  const rate = typeof opts.rate === "number" ? opts.rate : opts.slow ? 0.6 : baseRate;

  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  u.pitch = settings.gender === "male" ? 0.95 : 1.05;

  const pool = getEnglishVoices(settings.gender);
  const voice = pool[0];
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  } else {
    u.lang = "en-GB";
  }
  if (opts.onBoundary) {
    u.onboundary = (e: SpeechSynthesisEvent) => opts.onBoundary!(e.charIndex);
  }
  if (opts.onEnd) {
    u.onend = () => opts.onEnd!();
    u.onerror = () => opts.onEnd!();
  }
  window.speechSynthesis.speak(u);
  return true;
}

/**
 * Đọc văn bản theo cài đặt toàn cục — giọng AI Novita là đường mặc định
 * (khi có key Novita), giọng máy là dự phòng.
 * - Có `onBoundary` (karaoke highlight từng từ) → luôn dùng giọng máy.
 * - `slow = true` → ép chậm (nút "Nghe chậm"); tốc độ cài đặt: Chậm/Vừa.
 */
export function speak(
  text: string,
  opts: {
    slow?: boolean | undefined;
    rate?: number | undefined;
    /** Gọi khi bắt đầu đọc 1 từ (charIndex trong text) — dùng highlight karaoke. */
    onBoundary?: ((charIndex: number) => void) | undefined;
    /** Gọi khi đọc xong hoặc bị lỗi/hủy — dùng reset UI. */
    onEnd?: (() => void) | undefined;
  } = {},
) {
  if (typeof window === "undefined") return false;
  const settings = getVoiceSettings();
  stopCloudSpeech();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();

  if (!opts.onBoundary && hasNovitaKey()) {
    const voice = activeCloudVoice(settings);
    void speakCloud(text, {
      voiceId: voice.id,
      speed: cloudSpeed(settings, opts),
      onEnd: opts.onEnd,
    }).then((ok) => {
      if (!ok) speakDevice(text, opts, settings); // AI lỗi → rơi về giọng máy
    });
    return true;
  }
  return speakDevice(text, opts, settings);
}

/** Dừng mọi phát âm đang chạy (cả giọng AI lẫn giọng máy). */
export function stopSpeaking() {
  stopCloudSpeech();
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

/** Nghe thử giọng: ưu tiên đúng giọng AI sẽ dùng, không có key Novita thì giọng máy. */
export function previewVoice(gender: VoiceGender, speed: SpeechSpeed, voiceId?: string) {
  const settings = getVoiceSettings();
  const voice = voiceId ? novitaVoiceById(voiceId) : undefined;
  const persona = voice?.persona ?? defaultNovitaVoice(gender).persona;
  const firstName = persona.replace(/^(Cô|Thầy)\s+/, "");
  const sample =
    gender === "female"
      ? `Hello! I am Miss ${firstName}. Let's learn English together!`
      : `Hello! I am Mister ${firstName}. Are you ready to learn English?`;
  stopSpeaking();
  if (hasNovitaKey()) {
    void speakCloud(sample, {
      voiceId: voice?.id ?? defaultNovitaVoice(gender).id,
      speed: speed === "slow" ? 0.85 : 1.0,
    }).then((ok) => {
      if (!ok) speakDevice(sample, {}, { gender, speed });
    });
    return;
  }
  speakDevice(sample, {}, { ...settings, gender, speed });
}

export function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreSpeech(target: string, said: string) {
  const t = normalize(target).split(" ");
  const s = new Set(normalize(said).split(" "));
  const hit = t.filter((w) => s.has(w)).length;
  return Math.round((hit / Math.max(t.length, 1)) * 100);
}

type Rec = {
  start: () => void;
  stop: () => void;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: { 0: { transcript: string } }[] }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

export function createRecognizer(): Rec | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const Ctor = (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
    (new () => Rec) | undefined;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = "en-GB";
  rec.interimResults = false;
  rec.continuous = false;
  return rec;
}
