const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const { all, get } = require("../db/db");
const { validateEmotionFilter } = require("../utils/content");

const router = express.Router();

router.get("/songs", async (req, res, next) => {
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

router.get("/songs/:songId", async (req, res, next) => {
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

router.get("/songs/:songId/stream", async (req, res, next) => {
  try {
    const song = await get("SELECT filePath, title FROM songs WHERE id = ?", [req.params.songId]);

    if (!song) {
      return res.status(404).json({ error: "Song not found." });
    }

    const absolutePath = path.isAbsolute(song.filePath)
      ? song.filePath
      : path.join(__dirname, "..", "..", song.filePath);

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

module.exports = router;