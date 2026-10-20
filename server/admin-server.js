/**
 * Owly Admin API — chạy api/admin-users.js trên Render Web Service (Node thuần).
 *
 * Lý do tồn tại: Vercel free chạm trần 100 deploys/ngày nên function admin-users
 * chưa deploy lên Vercel được (20/10/2026). Server này bọc ĐÚNG handler đó bằng
 * Node http: bổ sung req.query / req.body (JSON) và res.status().json() theo
 * chuẩn Vercel, nên logic dùng chung 1 bản — sửa api/admin-users.js là cả hai
 * môi trường cùng hưởng.
 *
 * Chạy: node server/admin-server.js   (Render: Start Command, PORT do Render cấp)
 * Env (giống hệt Vercel): SUPABASE_URL, SUPABASE_ANON_KEY,
 *   SUPABASE_SERVICE_ROLE_KEY, OWLY_SETUP_TOKEN.
 */
import { createServer } from "node:http";
import dns from "node:dns";
import handler from "../api/admin-users.js";

// Ưu tiên IPv4 khi phân giải DNS: Node fetch (undici) có thể kẹt ở IPv6 khi
// gọi *.supabase.co trên một số hạ tầng → "TypeError: fetch failed".
dns.setDefaultResultOrder("ipv4first");

const PORT = Number(process.env.PORT) || 10000;

/** Bổ sung helper kiểu Vercel cho http.ServerResponse. */
function decorateRes(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (obj) => {
    if (!res.hasHeader("Content-Type"))
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(obj));
    return res;
  };
  return res;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 1_000_000) {
        reject(new Error("Body quá lớn."));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  decorateRes(res);
  const url = new URL(req.url || "/", "http://localhost");

  // Health check / ping giữ ấm: GET / → 200
  if (url.pathname === "/" || url.pathname === "/health") {
    return res.status(200).json({ ok: true, service: "owly-admin-api" });
  }

  if (url.pathname !== "/api/admin-users") {
    return res.status(404).json({ ok: false, error: "Not found." });
  }

  // Chuẩn Vercel: req.query + req.body (đã parse JSON nếu có)
  req.query = Object.fromEntries(url.searchParams.entries());
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    const raw = await readBody(req).catch(() => "");
    if (raw) {
      try {
        req.body = JSON.parse(raw);
      } catch {
        req.body = {};
      }
    } else {
      req.body = {};
    }
  }

  try {
    await handler(req, res);
  } catch (e) {
    console.error("[admin-server]", e);
    if (!res.headersSent)
      res.status(500).json({ ok: false, error: e?.message ?? "Lỗi server." });
    else res.end();
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[owly-admin-api] listening on :${PORT}`);
});
