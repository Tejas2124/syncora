import { useEffect, useState } from "react";
import type { Paragraph } from "@/types";
import { EmotionBadge } from "@/components/ui/EmotionBadge";

interface ParagraphDisplayProps {
  paragraph: Paragraph;
}

export function ParagraphDisplay({ paragraph }: ParagraphDisplayProps) {
  const [visible, setVisible] = useState(false);

  // Re-trigger fade-in on paragraph change
  useEffect(() => {
    setVisible(false);
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(timer);
  }, [paragraph.index]);

  return (
    <div
      className={`mx-auto max-w-2xl transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="mb-4">
        <EmotionBadge emotion={paragraph.emotion} />
      </div>

      <p
        className="text-lg leading-relaxed text-white/90"
        aria-live="polite"
      >
        {paragraph.text}
      </p>

      {paragraph.songTitle && (
        <p className="mt-6 text-xs text-muted">
          Playing: {paragraph.songTitle}
        </p>
      )}
    </div>
  );
}
