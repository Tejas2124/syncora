const { EMOTIONS } = require("../config/emotions");

const EMOTION_KEYWORDS = {
  joy: ["happy", "smile", "laugh", "bright", "joy", "delight", "celebrate"],
  sadness: ["sad", "cry", "tears", "lonely", "grief", "loss", "broken"],
  anger: ["angry", "rage", "fury", "hate", "fight", "shout", "furious"],
  fear: ["fear", "scared", "dark", "terror", "panic", "haunted", "afraid"],
  surprise: ["sudden", "suddenly", "unexpected", "astonished", "shocked", "surprise"],
  love: ["love", "kiss", "heart", "tender", "embrace", "romance", "darling"],
  melancholy: ["misty", "wistful", "rain", "memory", "forgotten", "melancholy", "ache"],
  tension: ["tense", "urgent", "danger", "pressure", "fight", "shadow", "await"],
  triumph: ["victory", "win", "triumph", "success", "hero", "conquer", "rise"],
  peace: ["calm", "quiet", "still", "peace", "gentle", "soft", "rest"],
  mystery: ["mystery", "secret", "unknown", "hidden", "fog", "whisper", "enigma"],
  nostalgia: ["remember", "memory", "old", "once", "past", "yesterday", "nostalgia"],
};

function normalizeParagraphText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\t ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractParagraphs(text) {
  const normalized = normalizeParagraphText(text);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.replace(/\n+/g, " ").replace(/\s+/g, " ").trim())
    .filter((paragraph) => paragraph.length > 0);
}

function inferEmotion(text) {
  const lowerText = String(text || "").toLowerCase();
  const scores = new Map(EMOTIONS.map((emotion) => [emotion, 0]));

  for (const emotion of EMOTIONS) {
    for (const keyword of EMOTION_KEYWORDS[emotion] || []) {
      if (lowerText.includes(keyword)) {
        scores.set(emotion, scores.get(emotion) + 1);
      }
    }
  }

  let winner = "mystery";
  let winnerScore = -1;

  for (const emotion of EMOTIONS) {
    const score = scores.get(emotion) || 0;
    if (score > winnerScore) {
      winner = emotion;
      winnerScore = score;
    }
  }

  return {
    emotion: winner,
    confidence: winnerScore > 0 ? Math.min(0.95, 0.55 + winnerScore * 0.1) : 0.5,
  };
}

function pickMatchingSong(songs, emotion) {
  if (!Array.isArray(songs) || songs.length === 0) {
    return null;
  }

  const exactMatch = songs.find((song) => song.emotion === emotion);
  if (exactMatch) {
    return exactMatch;
  }

  const fallback = songs.find((song) => song.emotion === "mystery") || songs[0];
  return fallback;
}

function validateEmotionFilter(emotion) {
  if (!emotion) {
    return { valid: true, emotion: null };
  }

  const normalized = String(emotion).trim().toLowerCase();
  if (!EMOTIONS.includes(normalized)) {
    return { valid: false, error: `Invalid emotion filter. Supported emotions: ${EMOTIONS.join(", ")}` };
  }

  return { valid: true, emotion: normalized };
}

module.exports = {
  extractParagraphs,
  inferEmotion,
  normalizeParagraphText,
  pickMatchingSong,
  validateEmotionFilter,
};