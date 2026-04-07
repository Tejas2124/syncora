import type { Book } from "@/types";

const BOOKS_KEY = "moodread_books";
const PROGRESS_KEY = "moodread_progress";

export function getBooksFromLibrary(): Book[] {
  try {
    const raw = localStorage.getItem(BOOKS_KEY);
    return raw ? (JSON.parse(raw) as Book[]) : [];
  } catch {
    return [];
  }
}

export function saveBookToLibrary(book: Book): void {
  const books = getBooksFromLibrary();
  if (!books.some((b) => b.bookId === book.bookId)) {
    books.unshift(book);
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  }
}

export function removeBookFromLibrary(bookId: string): void {
  const books = getBooksFromLibrary().filter((b) => b.bookId !== bookId);
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  localStorage.removeItem(`${PROGRESS_KEY}:${bookId}`);
}

export function getReadingProgress(bookId: string): number {
  try {
    const raw = localStorage.getItem(`${PROGRESS_KEY}:${bookId}`);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export function saveReadingProgress(bookId: string, index: number): void {
  localStorage.setItem(`${PROGRESS_KEY}:${bookId}`, String(index));
}
