import { useEffect, useState } from "react";

const PIECES = ["🎉", "⭐", "🌟", "✨", "🎊", "🦉", "💫"];

/** Hiệu ứng mưa sao/confetti nhẹ bằng emoji, tự tắt sau 2.2s. */
export function Celebrate({ trigger }: { trigger: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!trigger) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(t);
  }, [trigger]);
  if (!show) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={`${trigger}-${i}`}
          className="animate-confetti absolute top-0 text-2xl"
          style={{
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i % 6) * 0.12}s`,
            animationDuration: `${1.6 + (i % 4) * 0.2}s`,
          }}
        >
          {PIECES[i % PIECES.length]}
        </span>
      ))}
    </div>
  );
}
