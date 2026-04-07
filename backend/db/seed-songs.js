/**
 * CSV-driven seed data from audio_features.csv
 */

const fs = require("fs");
const path = require("path");

const CSV_PATH = path.join(__dirname, "..", "..", "audio_features.csv");

const MOOD_TO_EMOTION = {
  "Dreamy / Ambient": "peace",
  "Neutral / Mixed": "mystery",
  "Happy / Uplifting": "joy",
  "Emotional / Melancholic": "melancholy",
  "Energetic / Hype": "triumph",
  "Calm / Dark": "fear",
};

function splitCsvRow(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function parseCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const dataLines = lines.slice(1);
  const songs = [];
  const seenFilenames = new Set();

  for (const line of dataLines) {
    const cols = splitCsvRow(line);
    if (cols.length < 2) {
      continue;
    }

    const filename = cols[0];
    const mood = cols[1];

    if (!filename || seenFilenames.has(filename)) {
      continue;
    }

    seenFilenames.add(filename);

    const emotion = MOOD_TO_EMOTION[mood] || "mystery";
    const title = path.basename(filename, path.extname(filename));

    songs.push({
      title,
      artist: "MoodRead Catalog",
      emotion,
      filePath: path.join("songs", filename),
      duration: 240,
    });
  }

  return songs;
}

module.exports = parseCsv(CSV_PATH);
