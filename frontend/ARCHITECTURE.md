# MoodRead Frontend — Architecture

## What is MoodRead?

MoodRead is a web app that turns reading into an immersive experience. You upload a novel or text file, and the app displays it paragraph by paragraph — each one paired with emotionally-matched music from a catalog of pre-analyzed songs. As you read, the music crossfades between tracks to match the shifting mood of the story.

## Tech Stack

- **React 19** with TypeScript
- **Vite 6** for dev server and bundling
- **Tailwind CSS 4** for styling (utility-first, dark theme)
- **React Router 7** for client-side navigation

## Project Structure

```
frontend/
├── index.html                  # Vite entry point
├── vite.config.ts              # Vite config + custom song-serving plugin
├── .env                        # VITE_USE_MOCKS=true (toggle mock/real API)
│
└── src/
    ├── main.tsx                # App entry: BrowserRouter → AudioProvider → App
    ├── App.tsx                 # Route definitions
    ├── index.css               # Tailwind imports + dark theme tokens
    ├── vite-env.d.ts           # Vite type references
    │
    ├── types/
    │   └── index.ts            # Shared types and emotion taxonomy
    │
    ├── api/
    │   ├── client.ts           # Generic fetch wrapper with error handling
    │   └── api.ts              # Public API functions (mock-switchable)
    │
    ├── mocks/
    │   ├── songs.ts            # 37 real songs mapped to emotion taxonomy
    │   ├── books.ts            # 3 mock books with pre-assigned paragraphs
    │   └── handlers.ts         # Simulated API responses with latency
    │
    ├── audio/
    │   ├── AudioEngine.ts      # Dual-player crossfade engine (no React)
    │   └── AudioContext.tsx     # React context wrapping the engine
    │
    ├── hooks/
    │   ├── useAsync.ts         # Generic async state wrapper
    │   ├── useAudio.ts         # Shortcut to audio context
    │   ├── useReader.ts        # Reader page state machine
    │   └── useKeyboardNavigation.ts  # Arrow key bindings
    │
    ├── utils/
    │   ├── storage.ts          # localStorage helpers for library + progress
    │   └── formatTime.ts       # Seconds → "m:ss" formatting
    │
    ├── components/
    │   ├── Layout.tsx          # App shell: responsive nav + player bar
    │   ├── ErrorBoundary.tsx   # Catches render crashes
    │   │
    │   ├── ui/                 # Reusable primitives
    │   │   ├── Button.tsx
    │   │   ├── EmotionBadge.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── ErrorMessage.tsx
    │   │   ├── ProgressBar.tsx
    │   │   └── Skeleton.tsx
    │   │
    │   ├── reader/
    │   │   ├── ParagraphDisplay.tsx   # Text display with fade-in animation
    │   │   └── ReaderNavigation.tsx   # Prev/Next buttons + progress
    │   │
    │   └── player/
    │       ├── PlayerBar.tsx          # Fixed bottom bar
    │       ├── ProgressSlider.tsx     # Seekable audio timeline
    │       └── VolumeControl.tsx      # Volume slider + mute toggle
    │
    └── pages/
        ├── UploadPage.tsx      # Drag-and-drop file upload
        ├── LibraryPage.tsx     # Grid of previously uploaded books
        └── ReaderPage.tsx      # Core reading experience
```

## Pages

### Upload Page (`/`)

Drag-and-drop zone or file picker for `.txt`, `.pdf`, `.epub` files. On upload, calls the API, saves the book to the local library, and redirects to the reader.

### Library Page (`/library`)

Card grid of all uploaded books stored in localStorage. Each card shows the title, paragraph count, and a reading progress bar. Cards link to the reader. Books can be deleted.

### Reader Page (`/read/:bookId`)

The core experience. Displays one paragraph at a time, centered with comfortable typography. Features:

- **Prev/Next navigation** via buttons or arrow keys
- **Emotion badge** showing the detected mood of the current paragraph
- **Automatic music playback** — fetches the matched song and plays it with crossfade
- **Reading progress** saved to localStorage and restored on return
- **Fade-in animation** on paragraph transitions
- **Skeleton loading** while fetching paragraph data

## Audio System

The audio system is split into two layers:

### AudioEngine (plain TypeScript class)

Manages two `HTMLAudioElement` instances (`playerA` and `playerB`) that alternate for crossfading. When a new song starts:

1. The incoming song loads on the inactive player
2. If a song is already playing, a 2-second crossfade begins — the outgoing player's volume ramps down while the incoming player's volume ramps up (30 steps)
3. Once the fade completes, the outgoing player is paused and reset

Handles edge cases:
- **Rapid navigation**: calling `play()` during an active crossfade cancels the in-progress fade and starts a new one
- **Autoplay restrictions**: catches blocked play attempts and reports an error instead of crashing

### AudioContext (React provider)

Wraps `AudioEngine` in a React context, exposing reactive state (`currentSong`, `isPlaying`, `currentTime`, `duration`, `volume`) and control methods (`playSong`, `pause`, `resume`, `togglePlayPause`, `seek`, `setVolume`). Volume preference persists in localStorage.

### Player Bar

A fixed bottom bar that appears when a song is playing. Shows the song title, artist, emotion badge, play/pause button, seekable progress slider with timestamps, and a volume control with mute toggle. Stays visible across all page navigations.

## Emotion Taxonomy

12 emotions shared between frontend and backend:

```
joy · sadness · anger · fear · surprise · love
melancholy · tension · triumph · peace · mystery · nostalgia
```

Each emotion has a unique color used in badges and indicators. The pre-analyzed songs use a different 6-category mood system, so the mock layer maps between them:

| Song mood (from analyzer) | Frontend emotion |
|---------------------------|-----------------|
| Happy / Uplifting         | joy             |
| Emotional / Melancholic   | melancholy      |
| Dreamy / Ambient          | peace           |
| Energetic / Hype          | triumph         |
| Calm / Dark               | mystery         |
| Neutral / Mixed           | nostalgia       |

## Mock System

The frontend is fully functional without a backend. The `VITE_USE_MOCKS` env variable controls this:

- **`true` (default)**: All API calls route to `mocks/handlers.ts`, which returns data from `mocks/books.ts` and `mocks/songs.ts` with simulated network latency (150-800ms)
- **`false`**: API calls go through `api/client.ts` to the real backend via the Vite proxy

Mock data includes:
- **37 real songs** from `audio_features.csv`, with cleaned titles and mapped emotions
- **3 books**: "1984" (12 paragraphs), "The Great Gatsby" (8 paragraphs), "Echoes of Light" (10 paragraphs) — each paragraph tagged with an emotion and matched to a real song

## Song Serving

A custom Vite plugin (`serveSongsPlugin` in `vite.config.ts`) serves MP3 files from the `songs/` directory at the project root. It handles:
- URL decoding for Unicode characters in filenames
- HTTP range requests for audio seeking
- Directory traversal protection

## Data Flow: Reading a Paragraph

```
User clicks "Next"
  → useReader increments currentIndex
  → useReader calls api.getParagraph(bookId, index)
  → (mock returns paragraph with emotion + songId)
  → ParagraphDisplay renders text + EmotionBadge with fade-in
  → useReader calls api.getSong(songId)
  → useReader calls audio.playSong(song)
  → AudioEngine crossfades from old song to new song
  → PlayerBar updates with new song info + progress
  → Reading progress saved to localStorage
```

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. The three mock books are available immediately — upload a file or navigate to `/read/book-001` to start reading.
