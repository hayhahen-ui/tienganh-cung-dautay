/**
 * owlyProviders.ts — Metadata PUBLIC các nhà cung cấp LLM cho cô Owly.
 * Không chứa secret/baseUrl chi tiết — logic gọi API nằm ở proxy server
 * (api/ask-owly.js production, llmProxyPlugin trong vite.config.ts khi dev).
 *
 * Provider được TỰ ĐỘNG nhận diện từ tiền tố key (giống mt5-mrbit-2026:
 * key của user, lưu ở localStorage, gửi kèm mỗi request — proxy không lưu).
 */
export interface OwlyProviderMeta {
  id: string;
  name: string;
  /** Link chính thức để ba mẹ tự tạo API key miễn phí */
  keyUrl: string;
  defaultModel: string;
  description: string;
  /** true = API OpenAI-compatible (/chat/completions, auth Bearer) */
  openAiCompatible: boolean;
}

export const OWLY_PROVIDERS: OwlyProviderMeta[] = [
  {
    id: "larprouter",
    name: "LarpRouter",
    keyUrl: "https://larprouter.com/api-keys",
    defaultModel: "deepseek-v4.1-flash",
    description: "Cổng router AI — model DeepSeek V4.1 Flash miễn phí, nhanh.",
    openAiCompatible: true,
  },
  {
    id: "groq",
    name: "Groq",
    keyUrl: "https://console.groq.com/keys",
    defaultModel: "openai/gpt-oss-20b",
    description: "Miễn phí, trả lời siêu nhanh — lựa chọn tốt nhất cho bé.",
    openAiCompatible: true,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    keyUrl: "https://aistudio.google.com/apikey",
    defaultModel: "gemini-2.0-flash",
    description: "Miễn phí hào phóng, hiểu tiếng Việt tốt.",
    openAiCompatible: true,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    keyUrl: "https://openrouter.ai/keys",
    defaultModel: "openai/gpt-4o-mini",
    description: "Cổng chung nhiều model, có model miễn phí.",
    openAiCompatible: true,
  },
  {
    id: "openai",
    name: "OpenAI",
    keyUrl: "https://platform.openai.com/api-keys",
    defaultModel: "gpt-4o-mini",
    description: "ChatGPT — cần tài khoản có thanh toán.",
    openAiCompatible: true,
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    keyUrl: "https://console.anthropic.com/",
    defaultModel: "claude-3-5-haiku-latest",
    description: "Claude — trả lời cẩn thận, an toàn cho trẻ em.",
    openAiCompatible: false,
  },
  {
    id: "dashscope",
    name: "Alibaba Qwen (DashScope)",
    keyUrl: "https://bailian.console.aliyun.com/",
    defaultModel: "qwen-plus",
    description: "Mặc định của app khi không nhận diện được key.",
    openAiCompatible: true,
  },
];

/**
 * Nhận diện provider từ tiền tố key — PHẢI khớp với logic ở
 * api/ask-owly.js và llmProxyPlugin (vite.config.ts).
 */
export function detectOwlyProvider(apiKey: string): OwlyProviderMeta {
  const k = apiKey.trim();
  if (k.startsWith("lrsk-") || k.startsWith("lrsk_")) return OWLY_PROVIDERS[0]!;
  if (k.startsWith("gsk_")) return OWLY_PROVIDERS[1]!;
  if (k.startsWith("sk-or-")) return OWLY_PROVIDERS[3]!;
  if (k.startsWith("sk-ant-")) return OWLY_PROVIDERS[5]!;
  if (k.startsWith("AIza")) return OWLY_PROVIDERS[2]!;
  if (k.startsWith("sk-")) return OWLY_PROVIDERS[4]!;
  return OWLY_PROVIDERS[6]!;
}

export function getOwlyProviderMeta(id: string): OwlyProviderMeta | undefined {
  return OWLY_PROVIDERS.find((p) => p.id === id);
}
