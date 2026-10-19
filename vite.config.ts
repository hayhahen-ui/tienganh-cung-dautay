import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { resolveConfig, callChat, validateKey, checkRateLimit } from "./api/_owly-proxy.js";

/**
 * Vite plugin: proxy /api/ask-owly → LLM provider (dev).
 * Dùng chung logic với api/ask-owly.js (production) qua api/_owly-proxy.js.
 * Key của user (localStorage) được ưu tiên — proxy không lưu, không log.
 */
function llmProxyPlugin(): Plugin {
  let env: Record<string, string> = {};
  return {
    name: "owly-llm-proxy",
    config(_, { mode }) {
      // Use the directory of this config file (not process.cwd()) so the
      // .env is found even when Vite is launched from a parent directory.
      const root = import.meta.dirname;
      env = loadEnv(mode, root, "");
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.includes("/api/ask-owly")) {
          return next();
        }

        const send = (obj: unknown) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(obj));
        };

        if (req.method === "GET") {
          const { apiKey, model, provider } = resolveConfig("", env);
          send({
            status: "ok",
            hasKey: Boolean(apiKey),
            provider: apiKey ? provider.name : null,
            model: apiKey ? model : null,
          });
          return;
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        if (checkRateLimit(req.socket?.remoteAddress || "dev")) {
          send({ mode: "error", error: "Quá nhiều yêu cầu, bé đợi 1 phút nhé." });
          return;
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(chunk as Buffer);
          }
          const body = JSON.parse(Buffer.concat(chunks).toString());

          if (body.action === "validate") {
            const { apiKey, baseUrl, model, provider } = resolveConfig(body.apiKey, env);
            if (!apiKey) {
              send({ valid: false, error: "Chưa nhập key." });
              return;
            }
            try {
              const v = await validateKey(provider, baseUrl, apiKey);
              send(
                v.valid
                  ? { valid: true, provider: provider.name, model }
                  : { valid: false, error: v.error || "Key không hợp lệ." },
              );
            } catch (err) {
              send({
                valid: false,
                error: err instanceof Error ? err.message : "Không kiểm tra được.",
              });
            }
            return;
          }

          const { apiKey, baseUrl, model, provider } = resolveConfig(body.apiKey, env);
          if (!apiKey) {
            send({ mode: "not-configured" });
            return;
          }

          const question = String(body.question || "").slice(0, 300);
          const context = String(body.context || "").slice(0, 4000);
          if (!question.trim()) {
            send({ mode: "error", error: "empty question" });
            return;
          }

          const r = await callChat(provider, baseUrl, model, apiKey, question, context);
          send(r.ok ? { mode: "llm", text: r.text } : { mode: "error", error: r.error });
        } catch (err) {
          send({ mode: "error", error: err instanceof Error ? err.message : "Unknown error" });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routeFilePrefix: undefined,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    llmProxyPlugin(),
  ],
  build: {
    outDir: "dist",
  },
});
