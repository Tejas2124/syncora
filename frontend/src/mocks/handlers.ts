import type {
  Book,
  Paragraph,
  PaginatedParagraphs,
  Song,
  UploadResponse,
  Emotion,
} from "@/types";
import { MOCK_BOOKS, getMockBook } from "./books";
import { MOCK_SONGS, getSongsByEmotion } from "./songs";

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockUpload(_file: File): Promise<UploadResponse> {
  await delay(800);
  const book = MOCK_BOOKS[2]!;
  return {
    bookId: book.book.bookId,
    title: book.book.title,
    totalParagraphs: book.book.totalParagraphs,
  };
}

export async function mockGetBook(bookId: string): Promise<Book> {
  await delay();
  const data = getMockBook(bookId);
  if (!data) throw new Error(`Book not found: ${bookId}`);
  return data.book;
}

export async function mockGetParagraphs(
  bookId: string,
  page: number,
  limit: number,
): Promise<PaginatedParagraphs> {
  await delay();
  const data = getMockBook(bookId);
  if (!data) throw new Error(`Book not found: ${bookId}`);

  const start = (page - 1) * limit;
  const slice = data.paragraphs.slice(start, start + limit);
  const totalPages = Math.ceil(data.paragraphs.length / limit);

  return { paragraphs: slice, page, totalPages };
}

export async function mockGetParagraph(
  bookId: string,
  index: number,
): Promise<Paragraph> {
  await delay(200);
  const data = getMockBook(bookId);
  if (!data) throw new Error(`Book not found: ${bookId}`);

  const para = data.paragraphs[index];
  if (!para) throw new Error(`Paragraph ${index} not found`);
  return para;
}

export async function mockGetSong(songId: string): Promise<Song> {
  await delay(150);
  const song = MOCK_SONGS.find((s) => s.songId === songId);
  if (!song) throw new Error(`Song not found: ${songId}`);
  return song;
}

export async function mockGetSongs(emotion?: Emotion): Promise<Song[]> {
  await delay();
  if (emotion) return getSongsByEmotion(emotion);
  return MOCK_SONGS;
}
