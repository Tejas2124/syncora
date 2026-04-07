/**
 * MoodRead Backend
 * Express server with CORS, file upload, and database support
 */

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs/promises");
const { initializeDb } = require("./db/db");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const bookRoutes = require("./routes/books");
const { all, get } = require("./db/db");
const { validateEmotionFilter } = require("./utils/content");

const app = express();
const PORT = process.env.PORT || 3001;

// ============ MIDDLEWARE ============

// CORS setup
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  })
);

app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Static files for uploaded assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============ ROUTES ============

app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true, service: "syncora-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.get("/api/songs", async (req, res, next) => {
  try {
    const filter = validateEmotionFilter(req.query.emotion);

    if (!filter.valid) {
      return res.status(400).json({ error: filter.error });
    }

    const songs = filter.emotion
      ? await all("SELECT id as songId, title, artist, emotion FROM songs WHERE emotion = ? ORDER BY title ASC", [filter.emotion])
      : await all("SELECT id as songId, title, artist, emotion FROM songs ORDER BY emotion ASC, title ASC");

    return res.status(200).json({ songs });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/songs/:songId", async (req, res, next) => {
  try {
    const song = await get(
      "SELECT id as songId, title, artist, emotion, filePath, duration FROM songs WHERE id = ?",
      [req.params.songId]
    );

    if (!song) {
      return res.status(404).json({ error: "Song not found." });
    }

    return res.status(200).json({
      songId: song.songId,
      title: song.title,
      artist: song.artist,
      emotion: song.emotion,
      audioUrl: `/api/songs/${song.songId}/stream`,
      duration: song.duration,
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/songs/:songId/stream", async (req, res, next) => {
  try {
    const song = await get("SELECT filePath, title FROM songs WHERE id = ?", [req.params.songId]);

    if (!song) {
      return res.status(404).json({ error: "Song not found." });
    }

    const absolutePath = path.isAbsolute(song.filePath)
      ? song.filePath
      : path.join(__dirname, song.filePath);

    try {
      const stats = await fs.stat(absolutePath);
      const range = req.headers.range;

      if (!range) {
        res.writeHead(200, {
          "Content-Length": stats.size,
          "Content-Type": "audio/mpeg",
        });
        return fs.createReadStream(absolutePath).pipe(res);
      }

      const match = /bytes=(\d+)-(\d*)/.exec(range);
      if (!match) {
        return res.status(416).json({ error: "Invalid range request." });
      }

      const start = Number.parseInt(match[1], 10);
      const end = match[2] ? Number.parseInt(match[2], 10) : stats.size - 1;

      if (Number.isNaN(start) || Number.isNaN(end) || start >= stats.size || end < start) {
        return res.status(416).json({ error: "Invalid range request." });
      }

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "audio/mpeg",
      });

      return fs.createReadStream(absolutePath, { start, end }).pipe(res);
    } catch (fileError) {
      return res.status(404).json({
        error: `Audio file not found for song: ${song.title}`,
      });
    }
  } catch (error) {
    return next(error);
  }
});

app.use("/api", uploadRoutes);

// ============ ERROR HANDLING ============

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({ error: message });
});

// ============ INITIALIZATION ============

async function start() {
  try {
    // Initialize database
    await initializeDb();
    console.log("✓ Database initialized");

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`  Emotion Classification: Disabled (Phase 3)`);
      console.log(`  Audio Streaming: Disabled (Phase 4)`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

module.exports = app;
