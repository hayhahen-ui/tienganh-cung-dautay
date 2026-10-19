/**
 * Vercel Serverless Function — proxy LLM cho "Hỏi cô Owly". URL: /api/ask-owly
 *
 * Đấu nối key theo mẫu mt5-mrbit-2026 (BYOK — bring your own key):
 * - Ưu tiên key của user gửi kèm trong body (`apiKey`): ba mẹ dán key trong UI,
 *   key lưu ở localStorage TRÊN MÁY CỦA BÉ, mỗi request gửi kèm — proxy chỉ
 *   chuyển tiếp sang nhà cung cấp AI rồi quên ngay, KHÔNG lưu, KHÔNG log.
 * - Không có key user → dùng key server (biến môi trường, cho admin).
 * - Không có key nào → app chạy chế độ "📚 Giáo trình".
 *
 * Biến môi trường (Vercel → Settings → Environment Variables), tùy chọn:
 *   OWLY_LLM_API_KEY   (key dự phòng của admin)
 *   OWLY_LLM_BASE_URL  (tùy chọn; tự suy ra từ dạng key nếu bỏ trống)
 *   OWLY_LLM_MODEL     (tùy chọn; tự chọn model mặc định theo nhà cung cấp)
 * Vẫn chấp nhận tên cũ VITE_OWLY_LLM_* để tương thích.
 *
 * Actions (POST JSON):
 *   { question, context, apiKey? } → { mode: "llm", text } | { mode: "not-configured" } | { mode: "error", error }
 *   { action: "validate", apiKey } → { valid: true, provider, model } | { valid: false, error }
 * GET → { status: "ok", hasKey, provider, model } (chỉ phản ánh key server)
 */
import { resolveConfig, callChat, validateKey, checkRateLimit } from "./_owly-proxy.js";

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd) return fwd.split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { apiKey, model, provider } = resolveConfig("");
    return res.status(200).json({
      status: "ok",
      hasKey: !!apiKey,
      provider: apiKey ? provider.name : null,
      model: apiKey ? model : null,
    });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (checkRateLimit(clientIp(req))) {
    return res.status(200).json({ mode: "error", error: "Quá nhiều yêu cầu, bé đợi 1 phút nhé." });
  }

  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    body = {};
  }

  // ── Validate key của user (nút "Kiểm tra kết nối" trong UI) ────────────
  if (body.action === "validate") {
    const { apiKey, baseUrl, model, provider } = resolveConfig(body.apiKey);
    if (!apiKey) return res.status(200).json({ valid: false, error: "Chưa nhập key." });
    try {
      const v = await validateKey(provider, baseUrl, apiKey);
      if (v.valid) return res.status(200).json({ valid: true, provider: provider.name, model });
      return res.status(200).json({ valid: false, error: v.error || "Key không hợp lệ." });
    } catch (err) {
      return res.status(200).json({
        valid: false,
        error: err instanceof Error ? err.message : "Không kiểm tra được.",
      });
    }
  }

  // ── Chat ──────────────────────────────────────────────────────────────
  const { apiKey, baseUrl, model, provider } = resolveConfig(body.apiKey);
  if (!apiKey) {
    return res.status(200).json({ mode: "not-configured" });
  }

  const question = String(body.question || "").slice(0, 300);
  const context = String(body.context || "").slice(0, 4000);
  if (!question.trim()) return res.status(200).json({ mode: "error", error: "empty question" });

  try {
    const r = await callChat(provider, baseUrl, model, apiKey, question, context);
    if (!r.ok) return res.status(200).json({ mode: "error", error: r.error });
    return res.status(200).json({ mode: "llm", text: r.text });
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return res.status(200).json({
      mode: "error",
      error: isAbort
        ? "LLM request timed out"
        : err instanceof Error
          ? err.message
          : "Unknown error",
    });
  }
}
