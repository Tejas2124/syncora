interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  color = "#ffffff",
  className = "",
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div
      className={`h-1 w-full overflow-hidden rounded-full bg-border ${className}`}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}
