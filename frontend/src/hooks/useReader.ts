import { useState, useCallback, useEffect, useRef } from "react";
import type { Book, Paragraph } from "@/types";
import { getBook, getParagraph, getSong } from "@/api/api";
import { useAudio } from "./useAudio";
import {
  getReadingProgress,
  saveReadingProgress,
} from "@/utils/storage";

interface ReaderState {
  book: Book | null;
  paragraph: Paragraph | null;
  currentIndex: number;
  loading: boolean;
  error: string | null;
}

export function useReader(bookId: string) {
  const audio = useAudio();
  const [state, setState] = useState<ReaderState>({
    book: null,
    paragraph: null,
    currentIndex: 0,
    loading: true,
    error: null,
  });

  // Track current fetch so we can ignore stale responses
  const fetchId = useRef(0);

  // Load book metadata on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const book = await getBook(bookId);
        if (cancelled) return;
        const savedIndex = getReadingProgress(bookId);
        const index = Math.min(savedIndex, book.totalParagraphs - 1);
        setState((s) => ({ ...s, book, currentIndex: index, loading: false }));
      } catch (err) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load book",
        }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  // Fetch paragraph + song whenever currentIndex changes (and book is loaded)
  useEffect(() => {
    if (!state.book) return;

    const id = ++fetchId.current;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const para = await getParagraph(bookId, state.currentIndex);
        if (fetchId.current !== id) return;

        setState((s) => ({ ...s, paragraph: para, loading: false }));
        saveReadingProgress(bookId, state.currentIndex);

        const song = await getSong(para.songId);
        if (fetchId.current !== id) return;
        await audio.playSong(song);
      } catch (err) {
        if (fetchId.current !== id) return;
        setState((s) => ({
          ...s,
          loading: false,
          error:
            err instanceof Error ? err.message : "Failed to load paragraph",
        }));
      }
    }

    load();
  }, [bookId, state.book, state.currentIndex, audio.playSong]);

  const goToNext = useCallback(() => {
    setState((s) => {
      if (!s.book || s.currentIndex >= s.book.totalParagraphs - 1) return s;
      return { ...s, currentIndex: s.currentIndex + 1 };
    });
  }, []);

  const goToPrev = useCallback(() => {
    setState((s) => {
      if (s.currentIndex <= 0) return s;
      return { ...s, currentIndex: s.currentIndex - 1 };
    });
  }, []);

  const goToIndex = useCallback((index: number) => {
    setState((s) => {
      if (!s.book || index < 0 || index >= s.book.totalParagraphs) return s;
      return { ...s, currentIndex: index };
    });
  }, []);

  return {
    ...state,
    goToNext,
    goToPrev,
    goToIndex,
  };
}
