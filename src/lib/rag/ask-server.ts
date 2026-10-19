/**
 * LLM client — calls server proxy /api/ask-owly.
 *
 * Đấu nối key theo mẫu mt5-mrbit-2026 (BYOK — bring your own key):
 * - Ba mẹ dán API key trong UI "Hỏi cô Owly" → lưu ở localStorage trên máy
 *   (xem owlyKeys.ts), KHÔNG gửi về server lưu trữ.
 * - Mỗi request chat/validate gửi key KÈM THEO trong body; proxy
 *   (/api/ask-owly hoặc Vite dev middleware) chỉ dùng để chuyển tiếp sang
 *   nhà cung cấp AI rồi quên ngay — không lưu, không log key.
 * - Không có key của user → proxy dùng key server (nếu admin cấu hình),
 *   nếu không có nữa → app chạy chế độ "📚 Giáo trình" như cũ.
 */
import { getOwlyKey } from "./owlyKeys";

/**
 * Base URL của API. Mặc định "" = cùng origin (Vercel).
 * Khi frontend chạy trên Render, set VITE_OWLY_API_URL=https://tienganh-cung-dautay.vercel.app
 * để gọi API ask-owly đang ở Vercel (CORS đã mở ở api/ask-owly.js).
 */
const API_BASE = (
  (import.meta.env as Record<string, string | undefined>)["VITE_OWLY_API_URL"] || ""
).replace(/\/$/, "");
const apiUrl = (path: string): string => `${API_BASE}${path}`;

type LlmRequest = {
  question: string;
  context: string;
};

type LlmResponse =
  { mode: "llm"; text: string } | { mode: "not-configured" } | { mode: "error"; error: string };

export type LlmValidateResult = {
  valid: boolean;
  provider?: string | undefined;
  model?: string | undefined;
  error?: string | undefined;
  /** true khi không tới được API (CORS/mạng) — key có thể vẫn đúng, nên cho lưu trước. */
  networkError?: boolean | undefined;
};

async function postApi(body: Record<string, unknown>, timeoutMs = 25000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(apiUrl("/api/ask-owly"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function askLlm({ data }: { data: LlmRequest }): Promise<LlmResponse> {
  try {
    const userKey = getOwlyKey();
    const response = await postApi({
      question: data.question,
      context: data.context,
      // Key của user (nếu có) — proxy ưu tiên dùng key này, không lưu lại.
      ...(userKey ? { apiKey: userKey } : {}),
    });

    if (!response.ok) {
      return { mode: "error", error: `HTTP ${response.status}` };
    }

    return (await response.json()) as LlmResponse;
  } catch (err) {
    return { mode: "error", error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Kiểm tra key ba mẹ vừa dán có thật sự gọi được AI không.
 * Proxy gọi thử endpoint models của provider (không tốn token chat).
 */
export async function validateLlmKey(apiKey: string): Promise<LlmValidateResult> {
  const key = apiKey.trim();
  if (!key) return { valid: false, error: "Chưa nhập key." };
  try {
    const response = await postApi({ action: "validate", apiKey: key }, 20000);
    if (!response.ok) return { valid: false, error: `HTTP ${response.status}` };
    const j = (await response.json()) as Partial<LlmValidateResult>;
    return {
      valid: j.valid === true,
      provider: typeof j.provider === "string" ? j.provider : undefined,
      model: typeof j.model === "string" ? j.model : undefined,
      error: typeof j.error === "string" ? j.error : undefined,
    };
  } catch (err) {
    // TypeError = fetch không tới được server (CORS chặn, DNS, mạng…).
    // Phân biệt với "key sai" (server trả JSON valid:false) để UI cho lưu key trước.
    const isNetwork = err instanceof TypeError;
    return {
      valid: false,
      networkError: isNetwork || undefined,
      error: isNetwork
        ? "Không kết nối được tới máy chủ API (có thể Vercel chưa cập nhật bản mới). Key vẫn có thể đúng — anh lưu trước, app sẽ tự dùng khi API sẵn sàng."
        : err instanceof Error
          ? err.message
          : "Lỗi mạng.",
    };
  }
}

export type LlmHealth = { hasKey: boolean; provider: string | null; model: string | null };

/** GET /api/ask-owly — kiểm tra SERVER có key không (không thấy key của user). */
export async function checkLlm(): Promise<LlmHealth | null> {
  try {
    const r = await fetch(apiUrl("/api/ask-owly"), { method: "GET" });
    if (!r.ok) return null;
    const j = (await r.json()) as Partial<LlmHealth>;
    return { hasKey: Boolean(j.hasKey), provider: j.provider ?? null, model: j.model ?? null };
  } catch {
    return null;
  }
}

/**
 * AI có bật không = server có key HOẶC máy này đã lưu key của ba mẹ.
 * Dùng cho badge "🤖 AI + giáo trình" / "📚 Giáo trình (AI chưa bật)".
 */
export async function isLlmOn(): Promise<boolean> {
  if (getOwlyKey()) return true;
  const h = await checkLlm();
  return h?.hasKey === true;
}
