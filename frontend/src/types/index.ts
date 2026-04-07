export const EMOTIONS = [
  "joy",
  "sadness",
  "anger",
  "fear",
  "surprise",
  "love",
  "melancholy",
  "tension",
  "triumph",
  "peace",
  "mystery",
  "nostalgia",
] as const;

export type Emotion = (typeof EMOTIONS)[number];

export const EMOTION_COLORS: Record<Emotion, string> = {
  joy: "#f59e0b",
  sadness: "#3b82f6",
  anger: "#ef4444",
  fear: "#8b5cf6",
  surprise: "#f97316",
  love: "#ec4899",
  melancholy: "#6366f1",
  tension: "#dc2626",
  triumph: "#eab308",
  peace: "#10b981",
  mystery: "#6d28d9",
  nostalgia: "#a78bfa",
};

export interface Book {
  bookId: string;
  title: string;
  fileName: string;
  totalParagraphs: number;
  createdAt: string;
}

export interface Paragraph {
  index: number;
  text: string;
  emotion: Emotion;
  songId: string;
  confidence?: number;
  songTitle?: string;
}

export interface PaginatedParagraphs {
  paragraphs: Paragraph[];
  page: number;
  totalPages: number;
}

export interface Song {
  songId: string;
  title: string;
  artist: string;
  emotion: Emotion;
  audioUrl: string;
  duration: number;
}

export interface UploadResponse {
  bookId: string;
  title: string;
  totalParagraphs: number;
}
