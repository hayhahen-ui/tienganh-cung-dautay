// ─────────────────────────────────────────────────────────────────────────────
// Owly English — Speech engine
// Text-to-Speech dùng Web Speech API với 2 giọng bản địa: Nữ / Nam (người lớn),
// tốc độ "Chậm" (mặc định cho trẻ em) hoặc "Vừa". Lựa chọn được lưu lại
// trong localStorage và dùng chung cho toàn bộ nút loa trong app.
// ─────────────────────────────────────────────────────────────────────────────

export type VoiceGender = "female" | "male";
export type SpeechSpeed = "slow" | "normal";

export type VoiceSettings = {
  gender: VoiceGender;
  speed: SpeechSpeed;
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

/**
 * Đọc văn bản bằng giọng bản địa theo cài đặt toàn cục.
 * - `slow = true`  → ép nghe chậm (0.6×) bất kể cài đặt (dùng cho nút "Nghe chậm").
 * - Tốc độ theo cài đặt: Chậm = 0.7× · Vừa = 0.9× (chuẩn người bản địa nói với trẻ).
 * - Pitch: nữ 1.05 / nam 0.95 → giọng người lớn tự nhiên, không bị méo.
 */
export function speak(
  text: string,
  opts: { slow?: boolean | undefined; rate?: number | undefined } = {},
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  ensureVoicesLoaded();

  const settings = getVoiceSettings();

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
  window.speechSynthesis.speak(u);
  return true;
}

/** Nghe thử câu mẫu với cài đặt hiện tại (dùng trong bảng chọn giọng). */
export function previewVoice(gender: VoiceGender, speed: SpeechSpeed) {
  const sample =
    gender === "female"
      ? "Hello! I am Miss Emily. Let's learn English together!"
      : "Hello! I am Mister Daniel. Are you ready to learn English?";
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  ensureVoicesLoaded();
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(sample);
  u.rate = speed === "slow" ? 0.7 : 0.9;
  u.pitch = gender === "male" ? 0.95 : 1.05;
  const voice = getEnglishVoices(gender)[0];
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  } else {
    u.lang = "en-GB";
  }
  window.speechSynthesis.speak(u);
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
