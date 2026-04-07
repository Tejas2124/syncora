import type {
  Book,
  Paragraph,
  PaginatedParagraphs,
  Song,
  UploadResponse,
  Emotion,
} from "@/types";
import { request } from "./client";
import {
  mockUpload,
  mockGetBook,
  mockGetParagraphs,
  mockGetParagraph,
  mockGetSong,
  mockGetSongs,
} from "@/mocks/handlers";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

export async function uploadBook(file: File): Promise<UploadResponse> {
  if (USE_MOCKS) return mockUpload(file);
  const form = new FormData();
  form.append("file", file);
  return request<UploadResponse>("POST", "/api/upload", form);
}

export async function getBook(bookId: string): Promise<Book> {
  if (USE_MOCKS) return mockGetBook(bookId);
  return request<Book>("GET", `/api/books/${bookId}`);
}

export async function getParagraphs(
  bookId: string,
  page: number,
  limit: number,
): Promise<PaginatedParagraphs> {
  if (USE_MOCKS) return mockGetParagraphs(bookId, page, limit);
  return request<PaginatedParagraphs>(
    "GET",
    `/api/books/${bookId}/paragraphs?page=${page}&limit=${limit}`,
  );
}

export async function getParagraph(
  bookId: string,
  index: number,
): Promise<Paragraph> {
  if (USE_MOCKS) return mockGetParagraph(bookId, index);
  return request<Paragraph>("GET", `/api/books/${bookId}/paragraphs/${index}`);
}

export async function getSong(songId: string): Promise<Song> {
  if (USE_MOCKS) return mockGetSong(songId);
  return request<Song>("GET", `/api/songs/${songId}`);
}

export async function getSongs(emotion?: Emotion): Promise<Song[]> {
  if (USE_MOCKS) return mockGetSongs(emotion);
  const query = emotion ? `?emotion=${emotion}` : "";
  const res = await request<{ songs: Song[] }>("GET", `/api/songs${query}`);
  return res.songs;
}
