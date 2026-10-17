import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import {
  getVoiceSettings,
  onVoiceSettingsChange,
  previewVoice,
  setVoiceSettings,
  type SpeechSpeed,
  type VoiceGender,
  type VoiceSettings,
} from "@/lib/speech";
import { cn } from "@/lib/utils";

const genders: { id: VoiceGender; label: string; emoji: string; hint: string }[] = [
  { id: "female", label: "Cô giáo", emoji: "👩‍🏫", hint: "giọng nữ bản địa" },
  { id: "male", label: "Thầy giáo", emoji: "👨‍🏫", hint: "giọng nam bản địa" },
];

const speeds: { id: SpeechSpeed; label: string; emoji: string }[] = [
  { id: "slow", label: "Chậm", emoji: "🐢" },
  { id: "normal", label: "Vừa", emoji: "🚶" },
];

/**
 * Bảng chọn giọng đọc toàn cục: giọng Nữ/Nam người bản địa + tốc độ Chậm/Vừa.
 * Lựa chọn được lưu lại và áp dụng cho mọi nút loa trong app.
 */
export function VoiceSettings({ compact = false }: { compact?: boolean }) {
  const [settings, setSettings] = useState<VoiceSettings>(() => getVoiceSettings());

  useEffect(() => onVoiceSettingsChange(() => setSettings(getVoiceSettings())), []);

  return (
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
            onClick={() => setVoiceSettings({ gender: g.id })}
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
        onClick={() => previewVoice(settings.gender, settings.speed)}
        className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground"
      >
        <Volume2 className="size-3.5" /> Nghe thử
      </button>
    </div>
  );
}
