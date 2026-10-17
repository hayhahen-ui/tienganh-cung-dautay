import { Volume2 } from "lucide-react";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

export function SpeakButton({
  text,
  label,
  slow,
  className,
}: {
  text: string;
  label?: string;
  slow?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => speak(text, { slow })}
      aria-label={`Nghe: ${text}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 border-border bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0",
        className,
      )}
    >
      <Volume2 className="size-4" />
      {label ?? "Nghe"}
    </button>
  );
}
