/** Type declarations cho api/_owly-proxy.js (dùng chung dev + Vercel). */
export interface OwlyProxyProvider {
  id: string;
  test: (k: string) => boolean;
  base: string;
  model: string;
  name: string;
  openAiCompatible: boolean;
}
export interface OwlyProxyConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  provider: OwlyProxyProvider;
}
export declare const PROVIDERS: OwlyProxyProvider[];
export declare const SYSTEM_PROMPT: string;
export declare function checkRateLimit(ip: string): boolean;
export declare function resolveConfig(
  userKey: unknown,
  env?: Record<string, string | undefined>,
): OwlyProxyConfig;
export declare function callChat(
  provider: OwlyProxyProvider,
  baseUrl: string,
  model: string,
  apiKey: string,
  question: string,
  context: string,
): Promise<{ ok: boolean; text?: string; error?: string }>;
export declare function validateKey(
  provider: OwlyProxyProvider,
  baseUrl: string,
  apiKey: string,
): Promise<{ valid: boolean; error?: string }>;
