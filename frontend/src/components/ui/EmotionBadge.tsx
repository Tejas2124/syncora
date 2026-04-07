import { EMOTION_COLORS, type Emotion } from "@/types";

interface EmotionBadgeProps {
  emotion: Emotion;
  className?: string;
}

export function EmotionBadge({ emotion, className = "" }: EmotionBadgeProps) {
  const color = EMOTION_COLORS[emotion];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {emotion}
    </span>
  );
}
