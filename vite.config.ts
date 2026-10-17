import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

/**
 * Vite plugin: proxy /api/ask-owly → DashScope/Qwen LLM API
 * Keeps API key on the server side — never exposed to the browser.
 * In production (Vercel), use /api/ask-owly.ts serverless function.
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

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(chunk as Buffer);
          }
          const body = JSON.parse(Buffer.concat(chunks).toString());

          const apiKey = env["OWLY_LLM_API_KEY"] || env["VITE_OWLY_LLM_API_KEY"] || "";
          const baseUrl =
            env["VITE_OWLY_LLM_BASE_URL"] ||
            "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
          const model = env["VITE_OWLY_LLM_MODEL"] || "qwen-plus";

          if (!apiKey) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ mode: "not-configured" }));
            return;
          }

          const systemPrompt = `Bạn là Cô Owly 🦉, trợ lý dạy tiếng Anh cho trẻ em 8-12 tuổi Việt Nam.
Quy tắc:
- Trả lời tối đa 80 từ, dùng tiếng Anh đơn giản + giải thích tiếng Việt.
- KHÔNG bịa thông tin ngoài ngữ cảnh được cung cấp.
- Nếu không biết, nói thẳng "Cô chưa có thông tin về điều này".
- An toàn cho trẻ em, thân thiện, khích lệ.
- Luôn gắn ví dụ tiếng Anh trong dấu ngoặc kép.`;

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 20000);

          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                {
                  role: "user",
                  content: `Ngữ cảnh từ giáo trình:\n${body.context || ""}\n\nCâu hỏi của bé: ${body.question || ""}`,
                },
              ],
              max_tokens: 200,
              temperature: 0.3,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!response.ok) {
            const errText = await response.text().catch(() => "");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                mode: "error",
                error: `HTTP ${response.status}: ${errText.slice(0, 150)}`,
              }),
            );
            return;
          }

          const json = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const text = json.choices?.[0]?.message?.content ?? "";

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ mode: "llm", text }));
        } catch (err) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              mode: "error",
              error: err instanceof Error ? err.message : "Unknown error",
            }),
          );
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
