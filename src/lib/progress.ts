// ─────────────────────────────────────────────────────────────────────────────
// Owly English — Progress store (tiến độ, XP, streak, huy hiệu, ôn tập SRS)
// Lưu toàn bộ trong localStorage (không cần tài khoản), đồng bộ giữa các tab
// qua sự kiện "storage". Mọi component đọc qua hook useProgress().
// ─────────────────────────────────────────────────────────────────────────────

import { useSyncExternalStore } from "react";

export const SECTION_IDS = [
  "vocab",
  "video",
  "grammar",
  "reading",
  "listen",
  "speak",
  "write",
  "games",
  "quiz",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export type LessonProgress = {
  sections: Partial<Record<SectionId, boolean>>;
  /** Điểm quiz cuối bài cao nhất (0–100). */
  bestQuiz?: number;
  /** 0–3 sao, tính từ bestQuiz. */
  stars: number;
  completedAt?: string;
  lastVisit?: string;
};

/** Thẻ ôn tập theo thuật toán SM-2 rút gọn. */
export type SrsCard = {
  word: string;
  lessonSlug: string;
  ease: number; // 1.3 – 2.5+
  interval: number; // ngày
  due: string; // ISO date (yyyy-mm-dd)
  reps: number;
  lapses: number;
};

export type PlacementResult = {
  level: "starters" | "movers" | "flyers";
  score: number;
  total: number;
  date: string;
};

export type ProgressState = {
  version: 1;
  name: string;
  avatar: string;
  xp: number;
  streak: { count: number; lastDate: string | null; best: number };
  lessons: Record<string, LessonProgress>;
  srs: Record<string, SrsCard>;
  badges: string[];
  placement?: PlacementResult;
  /** Lịch sử XP theo ngày — dùng cho biểu đồ tuần ở Góc ba mẹ. */
  daily: Record<string, { xp: number; minutes: number }>;
  createdAt: string;
};

const KEY = "owly-progress-v1";
const EVENT = "owly-progress-changed";

export const XP = {
  section: 10,
  listenCorrect: 5,
  speakGood: 8,
  writeCorrect: 5,
  gameWin: 15,
  quizPerQuestion: 4,
  quizPerfectBonus: 30,
  lessonComplete: 50,
  reviewCard: 3,
  placement: 40,
} as const;

export const LEVEL_XP = 300; // XP cho mỗi "cấp cú"

export const RANKS = [
  { min: 0, name: "Cú non", emoji: "🥚" },
  { min: 1, name: "Cú tập bay", emoji: "🐣" },
  { min: 3, name: "Cú nhanh nhẹn", emoji: "🦉" },
  { min: 6, name: "Cú thông thái", emoji: "🎓" },
  { min: 10, name: "Cú bậc thầy", emoji: "👑" },
] as const;

export const BADGES: { id: string; name: string; emoji: string; desc: string }[] = [
  { id: "first-lesson", name: "Bước đầu tiên", emoji: "🚀", desc: "Hoàn thành bài học đầu tiên" },
  { id: "five-lessons", name: "Chăm chỉ", emoji: "📚", desc: "Hoàn thành 5 bài học" },
  { id: "starters-done", name: "Starters Star", emoji: "🌟", desc: "Hoàn thành mọi bài Starters" },
  { id: "movers-done", name: "Movers Master", emoji: "🏅", desc: "Hoàn thành mọi bài Movers" },
  { id: "flyers-done", name: "Flyers Champion", emoji: "🏆", desc: "Hoàn thành mọi bài Flyers" },
  { id: "streak-3", name: "3 ngày liên tiếp", emoji: "🔥", desc: "Học 3 ngày liền" },
  { id: "streak-7", name: "Tuần vàng", emoji: "⚡", desc: "Học 7 ngày liền" },
  { id: "perfect-quiz", name: "Điểm 10", emoji: "💯", desc: "Đạt 100% một bài quiz" },
  { id: "speaker", name: "Nói như gió", emoji: "🎤", desc: "Đạt ≥80% ở 10 câu nói" },
  { id: "review-50", name: "Ôn tập đều", emoji: "🧠", desc: "Ôn 50 thẻ từ vựng" },
  { id: "placement", name: "Biết mình ở đâu", emoji: "🧭", desc: "Làm bài kiểm tra đầu vào" },
];

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(key: string, n: number): string {
  const d = new Date(key + "T00:00:00");
  d.setDate(d.getDate() + n);
  return todayKey(d);
}

function defaultState(): ProgressState {
  return {
    version: 1,
    name: "",
    avatar: "🦉",
    xp: 0,
    streak: { count: 0, lastDate: null, best: 0 },
    lessons: {},
    srs: {},
    badges: [],
    daily: {},
    createdAt: new Date().toISOString(),
  };
}

let cache: ProgressState | null = null;

export function getProgress(): ProgressState {
  if (cache) return cache;
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProgressState;
      if (parsed && parsed.version === 1) {
        cache = { ...defaultState(), ...parsed };
        return cache;
      }
    }
  } catch {
    // dữ liệu hỏng → bắt đầu lại
  }
  cache = defaultState();
  return cache;
}

function persist(next: ProgressState) {
  cache = next;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // private mode: vẫn dùng trong phiên
  }
  window.dispatchEvent(new Event(EVENT));
}

function update(fn: (draft: ProgressState) => void) {
  const next: ProgressState = structuredClone(getProgress());
  fn(next);
  persist(next);
  return next;
}

export function subscribeProgress(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

const SERVER_SNAPSHOT = defaultState();
export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribeProgress, getProgress, () => SERVER_SNAPSHOT);
}

// ── Streak & XP ─────────────────────────────────────────────────────────────

function touchStreak(d: ProgressState) {
  const today = todayKey();
  if (d.streak.lastDate === today) return;
  if (d.streak.lastDate === addDays(today, -1)) d.streak.count += 1;
  else d.streak.count = 1;
  d.streak.lastDate = today;
  d.streak.best = Math.max(d.streak.best, d.streak.count);
}

/** Cộng XP, cập nhật streak + nhật ký ngày. Trả về state mới. */
export function addXp(amount: number, reason?: string) {
  return update((d) => {
    touchStreak(d);
    d.xp += amount;
    const t = todayKey();
    const day = d.daily[t] ?? { xp: 0, minutes: 0 };
    day.xp += amount;
    d.daily[t] = day;
    void reason;
    checkBadges(d);
  });
}

export function addMinutes(min: number) {
  return update((d) => {
    const t = todayKey();
    const day = d.daily[t] ?? { xp: 0, minutes: 0 };
    day.minutes += min;
    d.daily[t] = day;
  });
}

export function rankFor(xp: number) {
  const lvl = Math.floor(xp / LEVEL_XP);
  let r: (typeof RANKS)[number] = RANKS[0];
  for (const rank of RANKS) if (lvl >= rank.min) r = rank;
  return { level: lvl + 1, ...r, into: xp % LEVEL_XP, next: LEVEL_XP };
}

// ── Lesson sections ─────────────────────────────────────────────────────────

function ensureLesson(d: ProgressState, slug: string): LessonProgress {
  const lp = d.lessons[slug] ?? { sections: {}, stars: 0 };
  d.lessons[slug] = lp;
  return lp;
}

export function visitLesson(slug: string) {
  update((d) => {
    const lp = ensureLesson(d, slug);
    lp.lastVisit = new Date().toISOString();
  });
}

/** Đánh dấu 1 phần của bài đã xong (chỉ cộng XP lần đầu). */
export function completeSection(slug: string, section: SectionId) {
  return update((d) => {
    const lp = ensureLesson(d, slug);
    if (lp.sections[section]) return;
    lp.sections[section] = true;
    touchStreak(d);
    d.xp += XP.section;
    const t = todayKey();
    const day = d.daily[t] ?? { xp: 0, minutes: 0 };
    day.xp += XP.section;
    d.daily[t] = day;
    checkBadges(d);
  });
}

export function starsFromScore(score: number): number {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  if (score >= 50) return 1;
  return 0;
}

/** Ghi kết quả quiz cuối bài; hoàn thành bài nếu ≥ 50%. */
export function recordQuiz(slug: string, score: number, level: string, allSlugsInLevel: string[]) {
  return update((d) => {
    const lp = ensureLesson(d, slug);
    const first = lp.bestQuiz === undefined;
    lp.bestQuiz = Math.max(lp.bestQuiz ?? 0, score);
    lp.stars = Math.max(lp.stars, starsFromScore(score));
    lp.sections["quiz"] = true;
    touchStreak(d);
    let gained = Math.round((score / 100) * 10) * XP.quizPerQuestion;
    if (score === 100) gained += XP.quizPerfectBonus;
    if (first && score >= 50) gained += XP.lessonComplete;
    if (score >= 50 && !lp.completedAt) lp.completedAt = new Date().toISOString();
    d.xp += gained;
    const t = todayKey();
    const day = d.daily[t] ?? { xp: 0, minutes: 0 };
    day.xp += gained;
    d.daily[t] = day;
    if (score === 100) grant(d, "perfect-quiz");
    const doneInLevel = allSlugsInLevel.every((s) => d.lessons[s]?.completedAt);
    if (doneInLevel) grant(d, `${level}-done`);
    checkBadges(d);
  });
}

export function isLessonComplete(d: ProgressState, slug: string) {
  return Boolean(d.lessons[slug]?.completedAt);
}

export function lessonPercent(d: ProgressState, slug: string) {
  const lp = d.lessons[slug];
  if (!lp) return 0;
  const done = SECTION_IDS.filter((s) => lp.sections[s]).length;
  return Math.round((done / SECTION_IDS.length) * 100);
}

// ── Speaking counter (cho huy hiệu) ─────────────────────────────────────────
const SPEAK_KEY = "owly-speak-good";
export function recordSpeak(score: number) {
  if (typeof window === "undefined") return;
  if (score < 80) return;
  const n = Number(window.localStorage.getItem(SPEAK_KEY) ?? "0") + 1;
  window.localStorage.setItem(SPEAK_KEY, String(n));
  addXp(XP.speakGood, "speak");
  if (n >= 10) update((d) => grant(d, "speaker"));
}

// ── SRS (SM-2 rút gọn) ──────────────────────────────────────────────────────

/** Thêm từ vào hộp ôn tập (nếu chưa có). Gọi khi bé học xong phần từ vựng. */
export function addToSrs(words: { word: string; lessonSlug: string }[]) {
  update((d) => {
    const today = todayKey();
    for (const w of words) {
      if (d.srs[w.word]) continue;
      d.srs[w.word] = {
        word: w.word,
        lessonSlug: w.lessonSlug,
        ease: 2.5,
        interval: 0,
        due: today,
        reps: 0,
        lapses: 0,
      };
    }
  });
}

export function dueCards(d: ProgressState, limit = 20): SrsCard[] {
  const today = todayKey();
  return Object.values(d.srs)
    .filter((c) => c.due <= today)
    .sort((a, b) => a.due.localeCompare(b.due) || a.reps - b.reps)
    .slice(0, limit);
}

/** grade: 0 = quên, 1 = khó, 2 = nhớ, 3 = dễ */
export function reviewCard(word: string, grade: 0 | 1 | 2 | 3) {
  update((d) => {
    const c = d.srs[word];
    if (!c) return;
    const today = todayKey();
    if (grade === 0) {
      c.reps = 0;
      c.lapses += 1;
      c.interval = 0;
      c.ease = Math.max(1.3, c.ease - 0.2);
      c.due = today; // ôn lại ngay trong phiên
    } else {
      c.reps += 1;
      if (c.reps === 1) c.interval = 1;
      else if (c.reps === 2) c.interval = grade === 3 ? 4 : 3;
      else c.interval = Math.round(c.interval * c.ease);
      if (grade === 1) {
        c.ease = Math.max(1.3, c.ease - 0.15);
        c.interval = Math.max(1, Math.round(c.interval * 0.6));
      } else if (grade === 3) c.ease += 0.1;
      c.due = addDays(today, c.interval);
    }
    touchStreak(d);
    d.xp += XP.reviewCard;
    const t = todayKey();
    const day = d.daily[t] ?? { xp: 0, minutes: 0 };
    day.xp += XP.reviewCard;
    d.daily[t] = day;
    const total = Object.values(d.srs).reduce((s, x) => s + x.reps + x.lapses, 0);
    if (total >= 50) grant(d, "review-50");
    checkBadges(d);
  });
}

// ── Placement ───────────────────────────────────────────────────────────────
export function savePlacement(result: PlacementResult) {
  update((d) => {
    d.placement = result;
    touchStreak(d);
    d.xp += XP.placement;
    grant(d, "placement");
    checkBadges(d);
  });
}

export function setProfile(p: { name?: string; avatar?: string }) {
  update((d) => {
    if (p.name !== undefined) d.name = p.name.slice(0, 20);
    if (p.avatar !== undefined) d.avatar = p.avatar;
  });
}

export function resetProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem(SPEAK_KEY);
  cache = null;
  window.dispatchEvent(new Event(EVENT));
}

// ── Badges ──────────────────────────────────────────────────────────────────
function grant(d: ProgressState, id: string) {
  if (!d.badges.includes(id)) d.badges.push(id);
}

function checkBadges(d: ProgressState) {
  const completed = Object.values(d.lessons).filter((l) => l.completedAt).length;
  if (completed >= 1) grant(d, "first-lesson");
  if (completed >= 5) grant(d, "five-lessons");
  if (d.streak.count >= 3) grant(d, "streak-3");
  if (d.streak.count >= 7) grant(d, "streak-7");
}

/** 7 ngày gần nhất (cũ → mới) để vẽ biểu đồ. */
export function lastSevenDays(d: ProgressState) {
  const today = todayKey();
  const out: { key: string; label: string; xp: number; minutes: number }[] = [];
  const names = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  for (let i = 6; i >= 0; i--) {
    const key = addDays(today, -i);
    const day = d.daily[key] ?? { xp: 0, minutes: 0 };
    out.push({ key, label: names[new Date(key + "T00:00:00").getDay()]!, ...day });
  }
  return out;
}

/** Chuỗi đã học hôm nay chưa. */
export function studiedToday(d: ProgressState) {
  return d.streak.lastDate === todayKey();
}
