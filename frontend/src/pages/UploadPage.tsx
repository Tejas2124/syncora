import { useState, useCallback, useRef, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { uploadBook, getBook } from "@/api/api";
import { saveBookToLibrary } from "@/utils/storage";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

const ACCEPTED = ".txt,.pdf,.epub";

export function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setLoading(true);
      try {
        const { bookId } = await uploadBook(file);
        const book = await getBook(bookId);
        saveBookToLibrary(book);
        navigate(`/read/${bookId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setLoading(false);
      }
    },
    [navigate],
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <h1 className="mb-2 text-center text-3xl font-bold">
          Upload a book
        </h1>
        <p className="mb-8 text-center text-sm text-muted">
          Drop a .txt, .pdf, or .epub file and start reading with music
        </p>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-16 transition-colors ${
            dragging
              ? "border-white bg-surface-hover"
              : "border-border hover:border-muted"
          }`}
        >
          <svg
            className="h-10 w-10 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>

          {loading ? (
            <p className="text-sm text-muted">Processing your book...</p>
          ) : (
            <>
              <p className="text-sm text-muted">
                Drag and drop your file here, or
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                Browse files
              </Button>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        {loading && (
          <div className="mt-6 flex justify-center">
            <div className="h-1 w-48 overflow-hidden rounded-full bg-border">
              <div className="h-full animate-pulse rounded-full bg-white/60" />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6">
            <ErrorMessage message={error} onRetry={() => setError(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
