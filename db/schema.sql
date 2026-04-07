-- MoodRead Database Schema
-- Tables: books, paragraphs, songs, users, auth_sessions

-- Books table: stores uploaded books metadata
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  fileName TEXT NOT NULL,
  totalParagraphs INTEGER NOT NULL,
  createdAt TEXT NOT NULL
);

-- Paragraphs table: stores parsed paragraphs from books
CREATE TABLE IF NOT EXISTS paragraphs (
  id TEXT PRIMARY KEY,
  bookId TEXT NOT NULL,
  "index" INTEGER NOT NULL,
  text TEXT NOT NULL,
  emotion TEXT,
  confidence REAL,
  songId TEXT,
  FOREIGN KEY (bookId) REFERENCES books(id),
  FOREIGN KEY (songId) REFERENCES songs(id),
  UNIQUE(bookId, "index")
);

-- Songs table: pre-analyzed 50-song catalog with emotions
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  emotion TEXT NOT NULL,
  filePath TEXT NOT NULL,
  duration INTEGER,
  createdAt TEXT NOT NULL
);

-- Users table: accounts for authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  lastLoginAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Auth sessions table: stores hashed refresh tokens for session management
CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  refreshTokenHash TEXT NOT NULL,
  userAgent TEXT,
  ipAddress TEXT,
  expiresAt TEXT NOT NULL,
  revokedAt TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_paragraphs_bookId ON paragraphs(bookId);
CREATE INDEX IF NOT EXISTS idx_paragraphs_emotion ON paragraphs(emotion);
CREATE INDEX IF NOT EXISTS idx_songs_emotion ON songs(emotion);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_userId ON auth_sessions(userId);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expiresAt ON auth_sessions(expiresAt);
