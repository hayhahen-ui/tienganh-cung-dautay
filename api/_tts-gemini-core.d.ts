/** Type declarations cho api/_tts-gemini-core.js (dùng chung dev + Vercel). */
export declare const GEMINI_TTS_VOICES: string[];
export declare function isGeminiKey(k: unknown): boolean;
export declare function pcmToWav(pcm: Buffer, sampleRate?: number): Buffer;
export declare function callGeminiTts(
  apiKey: string,
  opts: { text: string; voice?: string; lang?: string },
): Promise<
  | { ok: true; audio: Buffer }
  | { ok: false; reason: "quota" | "auth" | "upstream"; error: string }
>;
