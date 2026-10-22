import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import {
  getVoiceSettings,
  onVoiceSettingsChange,
  previewVoice,
  setVoiceSettings,
  type SpeechSpeed,
  type VoiceGender,
  type VoiceSettings as VoiceSettingsState,
} from "@/lib/speech";
import {
  NOVITA_VOICES_FEMALE,
  NOVITA_VOICES_MALE,
  cloudEngine,
  getTtsStatus,
  hasCloudVoiceKey,
  onTtsStatusChange,
  type NovitaVoice,
} from "@/lib/ttsCloud";
import { cn } from "@/lib/utils";

const genders: { id: VoiceGender; label: string; emoji: string; hint: string }[] = [
  { id: "female", label: "Cô giáo", emoji: "👩‍🏫", hint: "giọng nữ" },
  { id: "male", label: "Thầy giáo", emoji: "👨‍🏫", hint: "giọng nam" },
];

const speeds: { id: SpeechSpeed; label: string; emoji: string }[] = [
  { id: "slow", label: "Chậm", emoji: "🐢" },
  { id: "normal", label: "Vừa", emoji: "🚶" },
];

/**
 * Bảng chọn giọng đọc toàn cục.
 * - Có key Novita: giọng AI MiniMax HD (mp3 rõ nét, nam/nữ thật) — bé chọn
 *   được từng giọng Cô/Thầy cụ thể ở bản đầy đủ (trang Bài học).
 * - Không có key: giọng máy của thiết bị (điện thoại thường chỉ có 1 giọng nữ).
 */
export function VoiceSettings({ compact = false }: { compact?: boolean }) {
  const [settings, setSettings] = useState<VoiceSettingsState>(() => getVoiceSettings());
  const [novita, setNovita] = useState<boolean>(() => hasCloudVoiceKey());
  const [engine, setEngine] = useState(() => cloudEngine());
  const [ttsStatus, setTtsStatus] = useState(() => getTtsStatus());
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => onVoiceSettingsChange(() => setSettings(getVoiceSettings())), []);
  useEffect(() => onTtsStatusChange(() => setTtsStatus(getTtsStatus())), []);
  useEffect(() => {
    const refresh = () => {
      setNovita(hasCloudVoiceKey());
      setEngine(cloudEngine());
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const pickVoice = (v: NovitaVoice) => {
    setVoiceSettings({ gender: v.gender, voiceId: v.id });
    previewVoice(v.gender, settings.speed, v.id);
  };

  return (
    <div className={cn("flex flex-col gap-2", compact && "gap-0")}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-2xl border-2 border-border bg-card p-2",
          compact && "p-1.5",
        )}
      >
        <span className="pl-1 text-xs font-bold text-muted-foreground">🔊 Giọng đọc:</span>
        <div className="flex rounded-full border-2 border-border">
          {genders.map((g) => (
            <button
              key={g.id}
              type="button"
              title={g.hint}
              onClick={() => setVoiceSettings({ gender: g.id, voiceId: undefined })}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-colors",
                settings.gender === g.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {g.emoji} {g.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-full border-2 border-border">
          {speeds.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setVoiceSettings({ speed: s.id })}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-colors",
                settings.speed === s.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => previewVoice(settings.gender, settings.speed, settings.voiceId)}
          className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground"
        >
          <Volume2 className="size-3.5" /> Nghe thử
        </button>
        {novita && (
          <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
            ☁️ Giọng AI
          </span>
        )}
        {novita && compact && (
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            aria-expanded={pickerOpen}
            className={cn(
              "rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors",
              pickerOpen
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            🎙️ Chọn giọng {pickerOpen ? "▴" : "▾"}
          </button>
        )}
      </div>

      {(!compact || pickerOpen) && novita && (
        <div className="rounded-2xl border-2 border-border bg-card p-3">
          <p className="text-xs font-bold text-muted-foreground">
            🎙️ Chọn giọng AI ({engine === "gemini" ? "Gemini" : "Novita"} — rõ nét trên điện
            thoại, có cả giọng nam):
          </p>
          {[
            { label: "👩 Giọng nữ", list: NOVITA_VOICES_FEMALE },
            { label: "👨 Giọng nam", list: NOVITA_VOICES_MALE },
          ].map((group) => (
            <div key={group.label} className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="w-20 shrink-0 text-xs font-bold">{group.label}</span>
              {group.list.map((v) => {
                const active =
                  settings.voiceId === v.id ||
                  (!settings.voiceId &&
                    settings.gender === v.gender &&
                    ((v.gender === "female" && v.id === "Lovely_Girl") ||
                      (v.gender === "male" && v.id === "Decent_Boy")));
                return (
                  <button
                    key={v.id}
                    type="button"
                    title={v.style}
                    onClick={() => pickVoice(v)}
                    className={cn(
                      "rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-muted",
                    )}
                  >
                    {v.persona}
                    <span className="ml-1 font-semibold opacity-75">· {v.style}</span>
                  </button>
                );
              })}
            </div>
          ))}
          {ttsStatus === "balance" && (
            <p className="mt-2 text-xs font-bold text-destructive">
              ⚠️ Tài khoản Novita chưa có credit nên giọng AI chưa chạy — app đang dùng giọng máy.
              Ba mẹ nạp thêm credit tại novita.ai (mục Billing) rồi nghe thử lại nhé.
            </p>
          )}
          {ttsStatus === "quota" && (
            <p className="mt-2 text-xs font-bold text-destructive">
              ⚠️ Gemini đang hết lượt TTS miễn phí — app tạm dùng giọng máy, ba mẹ thử lại sau ít
              phút nhé.
            </p>
          )}
          {ttsStatus === "auth" && (
            <p className="mt-2 text-xs font-bold text-destructive">
              ⚠️ Key {engine === "gemini" ? "Gemini" : "Novita"} không hợp lệ — app đang dùng
              giọng máy. Ba mẹ kiểm tra lại key ở mục "Hỏi cô Owly" nhé.
            </p>
          )}
          {ttsStatus === "error" && (
            <p className="mt-2 text-xs font-bold text-destructive">
              ⚠️ Giọng AI đang lỗi — app tạm dùng giọng máy, ba mẹ thử lại sau nhé.
            </p>
          )}
          {ttsStatus === "ok" && (
            <p className="mt-2 text-xs font-semibold text-success">
              ☁️ Giọng AI đang hoạt động — mọi nút loa sẽ đọc bằng giọng đã chọn.
            </p>
          )}
        </div>
      )}

      {!compact && !novita && (
        <p className="px-1 text-xs text-muted-foreground">
          ☁️ Muốn giọng đọc rõ nét và có giọng nam THẬT trên điện thoại? Dán{" "}
          <strong>key Gemini (miễn phí)</strong> hoặc <strong>key Novita</strong> ở mục "Hỏi cô
          Owly" (nút ⚙️) — một key dùng cho cả chat AI và giọng đọc. Chưa có key thì app dùng
          giọng của máy: nếu máy không có giọng nam, app tự hạ tông để tiếng Thầy trầm hẳn ra.
        </p>
      )}
    </div>
  );
}
