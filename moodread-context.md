# MoodRead — Project Context

## Overview

A web application that takes novels or text files as input, displays content paragraph by paragraph, and plays emotionally-matched music for each paragraph. The system analyzes the emotion of each paragraph and selects a suitable song from a pre-curated catalog of 50 songs.

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js with Express
- **Database:** TBD (SQLite for dev, Postgres for prod recommended)

## Core Concept

1. User uploads a text file (novel, story, etc.)
2. Backend parses the file into paragraphs
3. Each paragraph is analyzed for its dominant emotion
4. A matching song is selected from a catalog of 50 pre-analyzed songs
5. Frontend displays paragraphs one at a time with the matched song playing

## Emotion Taxonomy

Shared enum used by both frontend and backend:

```
joy, sadness, anger, fear, surprise, love,
melancholy, tension, triumph, peace, mystery, nostalgia
```

Each of the 50 songs is tagged with one or more of these emotions.

## Database Schema

### books

| Column          | Type      |
| --------------- | --------- |
| id              | uuid (PK) |
| title           | string    |
| fileName        | string    |
| totalParagraphs | integer   |
| createdAt       | timestamp |

### paragraphs

| Column     | Type          |
| ---------- | ------------- |
| id         | uuid (PK)     |
| bookId     | uuid (FK)     |
| index      | integer       |
| text       | text          |
| emotion    | string        |
| confidence | float         |
| songId     | uuid (FK)     |

### songs

| Column   | Type      |
| -------- | --------- |
| id       | uuid (PK) |
| title    | string    |
| artist   | string    |
| emotion  | string    |
| filePath | string    |
| duration | integer   |

## API Endpoints

| Method | Endpoint                                  | Purpose                                        |
| ------ | ----------------------------------------- | ---------------------------------------------- |
| POST   | `/api/upload`                             | Upload a text file, returns bookId + para count |
| GET    | `/api/books/:bookId`                      | Get book metadata                              |
| GET    | `/api/books/:bookId/paragraphs?page=&limit=` | Get paragraphs (paginated) with emotion + songId |
| GET    | `/api/books/:bookId/paragraphs/:index`    | Get single paragraph with full analysis        |
| GET    | `/api/songs/:songId`                      | Get song metadata                              |
| GET    | `/api/songs/:songId/stream`               | Stream audio file                              |
| GET    | `/api/songs?emotion=`                     | List/filter songs                              |

## Request / Response Shapes

### POST /api/upload

**Request:** `multipart/form-data` with field `file` (`.txt`, `.epub`, `.pdf`)

**Response 201:**

```json
{
  "bookId": "uuid",
  "title": "string",
  "totalParagraphs": 42
}
```

### GET /api/books/:bookId

**Response 200:**

```json
{
  "bookId": "uuid",
  "title": "string",
  "fileName": "string",
  "totalParagraphs": 42,
  "createdAt": "2026-04-04T00:00:00Z"
}
```

### GET /api/books/:bookId/paragraphs?page=1&limit=10

**Response 200:**

```json
{
  "paragraphs": [
    {
      "index": 0,
      "text": "It was a bright cold day in April...",
      "emotion": "melancholy",
      "songId": "uuid"
    }
  ],
  "page": 1,
  "totalPages": 5
}
```

### GET /api/books/:bookId/paragraphs/:index

**Response 200:**

```json
{
  "index": 0,
  "text": "It was a bright cold day in April...",
  "emotion": "melancholy",
  "confidence": 0.87,
  "songId": "uuid",
  "songTitle": "Clair de Lune"
}
```

### GET /api/songs/:songId

**Response 200:**

```json
{
  "songId": "uuid",
  "title": "Clair de Lune",
  "artist": "Debussy",
  "emotion": "melancholy",
  "audioUrl": "/api/songs/uuid/stream",
  "duration": 234
}
```

### GET /api/songs/:songId/stream

**Response:** Audio stream (`Content-Type: audio/mpeg`), supports range requests.

### GET /api/songs?emotion=melancholy

**Response 200:**

```json
{
  "songs": [
    { "songId": "uuid", "title": "Clair de Lune", "artist": "Debussy", "emotion": "melancholy" }
  ]
}
```

## Frontend Pages

1. **Upload Page** — Drag-and-drop or file picker to upload a text file.
2. **Reader View** — Displays one paragraph at a time, centered with good typography. Supports prev/next navigation via buttons and keyboard arrows. Audio crossfades between songs on paragraph change.
3. **Audio Player Bar** — Persistent bottom bar with play/pause, progress bar, volume control, and an emotion indicator (color tint or label).
4. **Library Page** — Lists previously uploaded books for re-reading.

## Frontend Development Plan

### Phase 1 — Core Setup
- React + Vite project scaffolding, router, base layout
- API service layer (`api.ts`) with functions for every endpoint
- Mock responses in a `/mocks/` folder matching the API contract

### Phase 2 — Upload Flow
- Upload page with drag-and-drop
- Call `POST /api/upload`, redirect to reader view on success

### Phase 3 — Reader View
- Single paragraph display with prev/next navigation
- On paragraph change: fetch data, start playing matched song
- Crossfade between songs (two alternating `<audio>` elements or Web Audio API)

### Phase 4 — Audio Player
- Persistent bottom bar: song title, play/pause, progress, volume
- Visual emotion indicator

### Phase 5 — Polish
- Loading states and error handling
- Library page listing uploaded books
- Reading progress persistence via localStorage

## Backend Development Plan

### Phase 1 — Core Setup
- Express app with CORS, multer for file uploads, error handling middleware
- Database setup and schema migration
- Seed the 50 pre-analyzed songs into the `songs` table

### Phase 2 — File Processing Pipeline
- `POST /api/upload`: accept file, parse into paragraphs (split on double newlines / chapter markers)
- Store paragraphs in DB linked to bookId

### Phase 3 — Emotion Analysis
- Run emotion classification on each paragraph (HuggingFace model or LLM API)
- Match detected emotion to the closest song from the catalog
- Store emotion + songId per paragraph

### Phase 4 — Serving Endpoints
- Implement all GET endpoints
- Audio streaming with range request support for seeking

## Parallel Development Strategy

Frontend and backend can be developed independently by agreeing on:

1. The **emotion enum** listed above
2. The **response shapes** listed above

Frontend uses hardcoded mock JSON during development. When backend is ready, swap the base URL from mocks to `localhost:3001`.

## Current State

- 50 songs have been pre-analyzed and tagged with emotions
- No code written yet — project is in planning phase
