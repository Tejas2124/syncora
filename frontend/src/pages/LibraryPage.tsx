import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import type { Book } from "@/types";
import {
  getBooksFromLibrary,
  removeBookFromLibrary,
  getReadingProgress,
} from "@/utils/storage";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

export function LibraryPage() {
  const [books, setBooks] = useState<Book[]>(getBooksFromLibrary);

  const handleDelete = useCallback((bookId: string) => {
    removeBookFromLibrary(bookId);
    setBooks(getBooksFromLibrary());
  }, []);

  if (books.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
        <svg
          className="h-12 w-12 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
        <p className="text-muted">No books yet</p>
        <Link to="/">
          <Button variant="secondary" size="sm">
            Upload your first book
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Library</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => {
          const progress = getReadingProgress(book.bookId);
          return (
            <div
              key={book.bookId}
              className="group relative rounded-xl border border-border bg-surface-alt p-5 transition-colors hover:bg-surface-hover"
            >
              <Link to={`/read/${book.bookId}`} className="block">
                <h2 className="mb-1 font-semibold">{book.title}</h2>
                <p className="mb-3 text-xs text-muted">
                  {book.totalParagraphs} paragraphs
                </p>
                <ProgressBar value={progress + 1} max={book.totalParagraphs} />
                <p className="mt-1.5 text-xs text-muted">
                  {progress + 1} / {book.totalParagraphs}
                </p>
              </Link>

              <button
                onClick={() => handleDelete(book.bookId)}
                className="absolute top-3 right-3 rounded p-1 text-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                aria-label={`Delete ${book.title}`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
