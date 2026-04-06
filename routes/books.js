const express = require("express");
const { all, get } = require("../db/db");

const router = express.Router();

router.get("/:bookId", async (req, res, next) => {
  try {
    const book = await get(
      "SELECT id, title, fileName, totalParagraphs, createdAt FROM books WHERE id = ?",
      [req.params.bookId]
    );

    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }

    return res.status(200).json({
      bookId: book.id,
      title: book.title,
      fileName: book.fileName,
      totalParagraphs: book.totalParagraphs,
      createdAt: book.createdAt,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:bookId/paragraphs", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const book = await get("SELECT id, totalParagraphs FROM books WHERE id = ?", [req.params.bookId]);
    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }

    const paragraphs = await all(
      `SELECT p."index" AS "index", p.text, p.emotion, p.songId
       FROM paragraphs p
       WHERE p.bookId = ?
       ORDER BY p."index" ASC
       LIMIT ? OFFSET ?`,
      [req.params.bookId, limit, offset]
    );

    return res.status(200).json({
      paragraphs,
      page,
      totalPages: Math.max(1, Math.ceil(book.totalParagraphs / limit)),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:bookId/paragraphs/:index", async (req, res, next) => {
  try {
    const index = Number.parseInt(req.params.index, 10);

    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({ error: "Paragraph index must be a non-negative integer." });
    }

    const paragraph = await get(
      `SELECT p."index" AS "index", p.text, p.emotion, p.confidence, p.songId, s.title as songTitle
       FROM paragraphs p
       LEFT JOIN songs s ON s.id = p.songId
       WHERE p.bookId = ? AND p."index" = ?`,
      [req.params.bookId, index]
    );

    if (!paragraph) {
      return res.status(404).json({ error: "Paragraph not found." });
    }

    return res.status(200).json(paragraph);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;