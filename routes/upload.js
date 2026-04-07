const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const multer = require("multer");
const { v4: uuid } = require("uuid");
const pdfParse = require("pdf-parse");
const { all, get, run } = require("../db/db");
const { extractParagraphs, inferEmotion, pickMatchingSong } = require("../utils/content");

const router = express.Router();
const uploadDir = path.join(__dirname, "..", "uploads");
const fileUpload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

function getOriginalTitle(originalName) {
  return path.parse(originalName).name.replace(/[_.]+/g, " ").trim() || "Untitled";
}

function isSupportedFile(file) {
  const extension = path.extname(file.originalname || "").toLowerCase();
  return [".txt", ".pdf"].includes(extension);
}

async function readUploadedText(file) {
  const extension = path.extname(file.originalname || "").toLowerCase();

  if (extension === ".txt") {
    return fs.readFile(file.path, "utf8");
  }

  if (extension === ".pdf") {
    const buffer = await fs.readFile(file.path);
    const parsed = await pdfParse(buffer);
    return parsed.text || "";
  }

  throw new Error("Unsupported file type.");
}

router.post("/upload", fileUpload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "A file is required." });
    }

    if (!isSupportedFile(req.file)) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(415).json({ error: "Only .txt and .pdf files are supported right now." });
    }

    const rawText = await readUploadedText(req.file);
    const paragraphs = extractParagraphs(rawText);

    if (paragraphs.length === 0) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ error: "No paragraphs were found in the uploaded file." });
    }

    const title = getOriginalTitle(req.file.originalname);
    const now = new Date().toISOString();
    const bookId = uuid();
    const songs = await all("SELECT id, title, artist, emotion, filePath, duration FROM songs");

    await run(
      "INSERT INTO books (id, title, fileName, totalParagraphs, createdAt) VALUES (?, ?, ?, ?, ?)",
      [bookId, title, req.file.originalname, paragraphs.length, now]
    );

    for (let index = 0; index < paragraphs.length; index += 1) {
      const paragraphText = paragraphs[index];
      const detected = inferEmotion(paragraphText);
      const matchedSong = pickMatchingSong(songs, detected.emotion);

      await run(
        `INSERT INTO paragraphs (id, bookId, "index", text, emotion, confidence, songId)
         VALUES (?, ?, ?, ?, ?, ?, ?)` ,
        [
          uuid(),
          bookId,
          index,
          paragraphText,
          detected.emotion,
          detected.confidence,
          matchedSong ? matchedSong.id : null,
        ]
      );
    }

    await fs.unlink(req.file.path).catch(() => {});

    return res.status(201).json({
      bookId,
      title,
      totalParagraphs: paragraphs.length,
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return next(error);
  }
});

module.exports = router;