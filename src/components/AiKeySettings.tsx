/**
 * AiKeySettings — Hộp thoại để ba mẹ dán API key bật chế độ AI cho cô Owly.
 *
 * Mẫu mt5-mrbit-2026: key lưu ở localStorage TRÊN MÁY (không gửi về server lưu),
 * UI chỉ hiện ••••abcd, proxy chỉ chuyển tiếp — không lưu, không log.
 * Không có key → app vẫn chạy đầy đủ ở chế độ "📚 Giáo trình".
 */
import { useState } from "react";
import { KeyRound, CheckCircle2, XCircle, Loader2, Trash2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { detectOwlyProvider, OWLY_PROVIDERS } from "@/lib/rag/owlyProviders";
import { validateLlmKey } from "@/lib/rag/ask-server";
import {
  saveOwlyKey,
  removeOwlyKey,
  owlyKeyHint,
  hasOwlyKey,
  owlyKeyProvider,
} from "@/lib/rag/owlyKeys";

export function AiKeySettings({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    text: string;
    networkError?: boolean;
  } | null>(null);
  const [saved, setSaved] = useState(hasOwlyKey());

  const detected = input.trim() ? detectOwlyProvider(input.trim()) : null;
  const savedProvider = owlyKeyProvider();

  const handleCheck = async () => {
    const key = input.trim();
    if (!key || checking) return;
    setChecking(true);
    setResult(null);
    const r = await validateLlmKey(key);
    setChecking(false);
    if (r.valid) {
      saveOwlyKey(key);
      setSaved(true);
      setInput("");
      setResult({
        ok: true,
        text: `✅ Kết nối thành công! (${r.provider ?? "AI"} · ${r.model ?? ""}) — key đã lưu trên máy này.`,
      });
      onSaved();
    } else {
      setResult({
        ok: false,
        text: `❌ ${r.error ?? "Key không hợp lệ, ba mẹ kiểm tra lại nhé."}`,
        networkError: r.networkError === true,
      });
    }
  };

  /** Lưu key khi không kiểm tra được kết nối (lỗi mạng/CORS) — app tự dùng khi API sẵn sàng. */
  const handleSaveAnyway = () => {
    const key = input.trim();
    if (!key) return;
    saveOwlyKey(key);
    setSaved(true);
    setInput("");
    setResult({
      ok: true,
      text: "✅ Đã lưu key trên máy này. Khi máy chủ API cập nhật xong, cô Owly sẽ tự dùng AI — không cần dán lại.",
    });
    onSaved();
  };

  const handleRemove = () => {
    removeOwlyKey();
    setSaved(false);
    setResult({ ok: true, text: "Đã xóa key khỏi máy. App trở về chế độ giáo trình." });
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" /> Bật AI cho cô Owly 🤖
          </DialogTitle>
          <DialogDescription>
            Dán API key của ba mẹ để cô Owly trả lời thông minh hơn (ngoài giáo trình có sẵn).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Trạng thái key đã lưu */}
          {saved && (
            <div className="flex items-center justify-between rounded-xl bg-success/15 px-4 py-3">
              <div>
                <p className="font-bold text-success">
                  ✅ AI đang bật{savedProvider ? ` · ${savedProvider.name}` : ""}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  Key trên máy này: {owlyKeyHint()}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" /> Xóa key
              </button>
            </div>
          )}

          {/* Ô nhập key */}
          <div>
            <label htmlFor="owly-api-key" className="mb-1.5 block font-bold">
              API key mới {saved ? "(để đổi key)" : ""}
            </label>
            <input
              id="owly-api-key"
              type="password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setResult(null);
              }}
              placeholder="Dán key vào đây… (vd: gsk_…)"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary"
            />
            {detected && (
              <p className="mt-1.5 text-xs font-semibold text-muted-foreground">
                🔍 Nhận diện: <strong className="text-foreground">{detected.name}</strong> ·{" "}
                {detected.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void handleCheck()}
            disabled={!input.trim() || checking}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 font-bold text-primary-foreground shadow-pop transition-transform hover:-translate-y-0.5 disabled:opacity-40"
          >
            {checking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {checking ? "Đang kiểm tra…" : "Kiểm tra kết nối & lưu key"}
          </button>

          {result && (
            <p
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                result.ok ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"
              }`}
            >
              {result.text}
            </p>
          )}

          {result && !result.ok && result.networkError && input.trim() && (
            <button
              type="button"
              onClick={handleSaveAnyway}
              className="w-full rounded-full border-2 border-dashed border-primary/50 px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/10"
            >
              💾 Lưu key trước, kiểm tra sau
            </button>
          )}

          {/* Key miễn phí */}
          <div className="rounded-xl bg-muted p-3">
            <p className="mb-2 font-bold">🆓 Lấy key miễn phí ở đâu?</p>
            <ul className="space-y-1.5">
              {OWLY_PROVIDERS.filter((p) => ["groq", "gemini", "openrouter"].includes(p.id)).map(
                (p) => (
                  <li key={p.id}>
                    <a
                      href={p.keyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      {p.name} <ExternalLink className="size-3" />
                    </a>
                    <span className="text-muted-foreground"> — {p.description}</span>
                  </li>
                ),
              )}
            </ul>
          </div>

          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <XCircle className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Key chỉ lưu trong trình duyệt của máy này, gửi kèm mỗi câu hỏi qua máy chủ trung gian
              (không lưu, không ghi log). Xóa key bất cứ lúc nào ở đây.
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
