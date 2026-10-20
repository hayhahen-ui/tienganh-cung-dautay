/**
 * Cloudflare Worker — proxy LLM cho "Hỏi cô Owly", thay thế api/ask-owly.js trên Vercel.
 *
 * Lý do: Vercel free giới hạn 100 deployments/ngày, API bị kẹt mỗi khi chạm trần.
 * Worker free: 100k requests/ngày, không cold-start, deploy không giới hạn.
 * Dùng chung logic với Vercel/dev qua ../api/_owly-proxy.js (resolveConfig,
 * callChat, validateKey, checkRateLimit) — key của user chỉ chuyển tiếp,
 * KHÔNG lưu, KHÔNG log.
 *
 * Deploy: Workers & Pages → Create → Connect Git → chọn repo này
 * (wrangler.toml đã cấu hình sẵn entry worker/ask-owly-worker.js).
 * Xong copy URL https://<name>.<subdomain>.workers.dev vào biến
 * VITE_OWLY_API_URL trên Render (dashboard → Environment) → rebuild là chạy.
 *
 * Actions (POST JSON) — giống hệt bản Vercel:
 *   { question, context, apiKey? } → { mode: "llm", text } | { mode: "not-configured" } | { mode: "error", error }
 *   { action: "validate", apiKey } → { valid: true, provider, model } | { valid: false, error }
 * GET → { status: "ok", hasKey, provider, model } (chỉ phản ánh key server)
 */
import { resolveConfig, callChat, validateKey, checkRateLimit } from "../api/_owly-proxy.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function clientIp(request) {
  return request.headers.get("cf-connecting-ip") || "unknown";
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method === "GET") {
      const { apiKey, model, provider } = resolveConfig("", env);
      return json({
        status: "ok",
        service: "owly-ask-worker",
        hasKey: !!apiKey,
        provider: apiKey ? provider.name : null,
        model: apiKey ? model : null,
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    if (checkRateLimit(clientIp(request))) {
      return json({ mode: "error", error: "Quá nhiều yêu cầu, bé đợi 1 phút nhé." });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // ── Validate key của user (nút "Kiểm tra kết nối" trong UI) ──────────
    if (body.action === "validate") {
      const { apiKey, baseUrl, model, provider } = resolveConfig(body.apiKey, env);
      if (!apiKey) return json({ valid: false, error: "Chưa nhập key." });
      try {
        const v = await validateKey(provider, baseUrl, apiKey);
        if (v.valid) return json({ valid: true, provider: provider.name, model });
        return json({ valid: false, error: v.error || "Key không hợp lệ." });
      } catch (err) {
        return json({
          valid: false,
          error: err instanceof Error ? err.message : "Không kiểm tra được.",
        });
      }
    }

    // ── Chat ────────────────────────────────────────────────────────────
    const { apiKey, baseUrl, model, provider } = resolveConfig(body.apiKey, env);
    if (!apiKey) {
      return json({ mode: "not-configured" });
    }

    const question = String(body.question || "").slice(0, 300);
    const context = String(body.context || "").slice(0, 4000);
    if (!question.trim()) return json({ mode: "error", error: "empty question" });

    try {
      const r = await callChat(provider, baseUrl, model, apiKey, question, context);
      if (!r.ok) return json({ mode: "error", error: r.error });
      return json({ mode: "llm", text: r.text });
    } catch (err) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      return json({
        mode: "error",
        error: isAbort ? "LLM request timed out" : err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
};
