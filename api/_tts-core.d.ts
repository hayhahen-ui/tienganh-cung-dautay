/** Type declarations cho api/_tts-core.js (dùng chung dev + Vercel). */
export declare const NOVITA_TTS_VOICES: string[];
export declare const NOVITA_TTS_DEFAULTS: { female: string; male: string };
export declare const TTS_MAX_CHARS: number;
export declare function isNovitaKey(k: unknown): boolean;
export declare function callNovitaTts(
  apiKey: string,
  opts: { text: string; voiceId?: string; speed?: number; lang?: string },
): Promise<
  | { ok: true; audio: Buffer; ms: number }
  | { ok: false; reason: "balance" | "auth" | "upstream" | "bad-request"; error: string }
>;
