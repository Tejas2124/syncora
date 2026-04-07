import { useParams } from "react-router-dom";
import { useReader } from "@/hooks/useReader";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { ParagraphDisplay } from "@/components/reader/ParagraphDisplay";
import { ReaderNavigation } from "@/components/reader/ReaderNavigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ParagraphSkeleton } from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const reader = useReader(bookId ?? "");

  useKeyboardNavigation(reader.goToPrev, reader.goToNext);

  if (!bookId) {
    return <ErrorMessage message="No book ID provided" />;
  }

  if (!reader.book && reader.loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (reader.error && !reader.paragraph) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <ErrorMessage message={reader.error} />
      </div>
    );
  }

  if (!reader.book) return null;

  return (
    <div className="flex flex-1 flex-col px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-lg font-semibold">{reader.book.title}</h1>
      </div>

      <div className="flex flex-1 items-center justify-center">
        {reader.loading && !reader.paragraph ? (
          <ParagraphSkeleton />
        ) : reader.paragraph ? (
          <ParagraphDisplay paragraph={reader.paragraph} />
        ) : null}
      </div>

      <div className="mt-8">
        <ReaderNavigation
          currentIndex={reader.currentIndex}
          totalParagraphs={reader.book.totalParagraphs}
          onPrev={reader.goToPrev}
          onNext={reader.goToNext}
        />
      </div>
    </div>
  );
}
