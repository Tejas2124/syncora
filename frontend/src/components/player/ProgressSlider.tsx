import { useCallback, type MouseEvent } from "react";
import { formatTime } from "@/utils/formatTime";

interface ProgressSliderProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function ProgressSlider({
  currentTime,
  duration,
  onSeek,
}: ProgressSliderProps) {
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (duration <= 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    },
    [duration, onSeek],
  );

  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-right text-xs text-muted tabular-nums">
        {formatTime(currentTime)}
      </span>

      <div
        className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-border"
        onClick={handleClick}
      >
        <div
          className="h-full rounded-full bg-white transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100"
          style={{ left: `${pct}%`, marginLeft: "-6px" }}
        />
      </div>

      <span className="w-10 text-xs text-muted tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  );
}
