import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface ReaderNavigationProps {
  currentIndex: number;
  totalParagraphs: number;
  onPrev: () => void;
  onNext: () => void;
}

export function ReaderNavigation({
  currentIndex,
  totalParagraphs,
  onPrev,
  onNext,
}: ReaderNavigationProps) {
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= totalParagraphs - 1;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ProgressBar
        value={currentIndex + 1}
        max={totalParagraphs}
        className="mb-4"
      />

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={isFirst}
          aria-label="Previous paragraph"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Prev
        </Button>

        <span className="text-xs text-muted">
          {currentIndex + 1} / {totalParagraphs}
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={isLast}
          aria-label="Next paragraph"
        >
          Next
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
