import type { Song, Emotion } from "@/types";

const MOOD_TO_EMOTION: Record<string, Emotion> = {
  "Happy / Uplifting": "joy",
  "Emotional / Melancholic": "melancholy",
  "Dreamy / Ambient": "peace",
  "Energetic / Hype": "triumph",
  "Calm / Dark": "mystery",
  "Neutral / Mixed": "nostalgia",
  "Epic / Cinematic": "tension",
};

function cleanTitle(filename: string): string {
  return filename
    .replace(/\.mp3$/, "")
    .replace(/^\d+\s*-\s*/, "")
    .replace(/[｜＂⧸：•]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*(NO COPYRIGHT|No Copyright|Copyright FREE|COPYRIGHT FREE|Royalty FREE|Royalty Free|FREE|EMW|Epic Music Waves)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface RawSong {
  filename: string;
  mood: string;
}

const RAW_SONGS: RawSong[] = [
  { filename: "07 - Cinematic epic music｜＂The Sword＂｜Copyright free epic music｜FREE Epic Music｜EPIC MUSIC WAVES.mp3", mood: "Dreamy / Ambient" },
  { filename: "02 - INTRIGUE - Most Cinematic Suspense music ever ｜ No Copyright Music ｜ Epic Music Waves.mp3", mood: "Dreamy / Ambient" },
  { filename: "17 - FREE Cinematic Action Background Music ｜ No Copyright Cinematic Background Music ｜ EMW.mp3", mood: "Neutral / Mixed" },
  { filename: "27 - FREE Emotional Cinematic Background Music ｜ Emotional Cinematic Background Music NO COPYRIGHT • EMW.mp3", mood: "Happy / Uplifting" },
  { filename: "11 - Cinematic Motivational & Intense Epic music - RAY OF HOPE ｜ Epic Motivational music no copyright.mp3", mood: "Dreamy / Ambient" },
  { filename: "29 - Epic Cinematic Background Music NO COPYRIGHT ｜ FREE Epic Background Music For Videos • EMW.mp3", mood: "Emotional / Melancholic" },
  { filename: "22 - Epic Cinematic Background Music NO COPYRIGHT ｜ FREE Epic Background Music For Videos • EMW.mp3", mood: "Neutral / Mixed" },
  { filename: "30 - Epic Cinematic Background Music NO COPYRIGHT ｜ FREE Epic Background Music For Videos • EMW.mp3", mood: "Energetic / Hype" },
  { filename: "24 - Motivational Background Music No Copyright ｜ Motivational Cinematic Background Music Royalty FREE.mp3", mood: "Neutral / Mixed" },
  { filename: "abc3.mp3", mood: "Dreamy / Ambient" },
  { filename: "03 - Trailer - (NO COPYRIGHT) Epic and Action Cinematic Background Music For Videos ｜｜ EMW.mp3", mood: "Happy / Uplifting" },
  { filename: "21 - FREE Cinematic Background Music For Videos ｜ Royalty FREE Cinematic Background Music • EMW.mp3", mood: "Dreamy / Ambient" },
  { filename: "14 - Epic powerful cinematic and heroic music (Bheeshma-The god father) ｜ Epic heroic music｜ Indian music.mp3", mood: "Dreamy / Ambient" },
  { filename: "28 - Cinematic Trailer Background Music No Copyright ｜ Royalty FREE Trailer Background Music • EMW.mp3", mood: "Energetic / Hype" },
  { filename: "31 - Epic Cinematic Background Music NO COPYRIGHT ｜ FREE Epic Background Music For Videos • EMW.mp3", mood: "Happy / Uplifting" },
  { filename: "08 - COPYRIGHT FREE Science Fiction Music ｜ Cinematic Ambient Background Music NO COPYRIGHT • EMW.mp3", mood: "Neutral / Mixed" },
  { filename: "23 - Powerful Cinematic Background Music NO Copyright ｜ Copyright FREE Music For Cinematic Video • EMW.mp3", mood: "Energetic / Hype" },
  { filename: "10 - Beautiful Emotional & Inspiring Epic [No Copyright] Music： ＂The power within＂ by Whitesand • EMW.mp3", mood: "Dreamy / Ambient" },
  { filename: "15 - Beyond the clouds (Epic cinematic adventure and motivational music) ｜ Copyright free epic music.mp3", mood: "Neutral / Mixed" },
  { filename: "abc5.mp3", mood: "Neutral / Mixed" },
  { filename: "13 - [COPYRIGHT FREE] Cinematic Inspiring Background Music ｜ EMW.mp3", mood: "Energetic / Hype" },
  { filename: "01 - Beautiful Cinematic Piano Background Music For Videos ｜ Relaxing Cinematic Music NO COPYRIGHT • EMW.mp3", mood: "Neutral / Mixed" },
  { filename: "abc1.mp3", mood: "Emotional / Melancholic" },
  { filename: "abc2.mp3", mood: "Happy / Uplifting" },
  { filename: "12 - NO COPYRIGHT Cinematic Epic Trailer Music • Resurgence - Ghostrifter Official ｜ Epic Music Waves.mp3", mood: "Calm / Dark" },
  { filename: "16 - Epic Cinematic Background Music NO COPYRIGHT ｜ FREE Epic Background Music For Videos • EMW.mp3", mood: "Happy / Uplifting" },
  { filename: "04 - Epic Cinematic Dramatic Background Music NO COPYRIGHT ｜ Royalty Free Dramatic Music For Videos • EMW.mp3", mood: "Emotional / Melancholic" },
  { filename: "26 - Epic Cinematic Background Music NO COPYRIGHT ｜ FREE Epic Background Music For Videos • EMW.mp3", mood: "Energetic / Hype" },
  { filename: "abc4.mp3", mood: "Happy / Uplifting" },
  { filename: "20 - COPYRIGHT FREE Science Fiction Music ｜ Cinematic Ambient Royalty Free Music Background Music ｜ EMW.mp3", mood: "Emotional / Melancholic" },
  { filename: "18 - Calm Cinematic Background Music No Copyright ｜ Cinematic Ambient Royalty Free Music Background Music.mp3", mood: "Dreamy / Ambient" },
  { filename: "19 - Free Dramatic Background Music No Copyright ｜｜ Royalty Free Dramatic Background Music ｜｜ EMW.mp3", mood: "Dreamy / Ambient" },
  { filename: "06 - The Forbidden Street-Epic cinematic suspense and mysterious music ｜ No Copyright Dark music.mp3", mood: "Neutral / Mixed" },
  { filename: "25 - FREE Background Music For Documentary Videos ｜ Royalty free Cinematic Background Music • EMW.mp3", mood: "Happy / Uplifting" },
  { filename: "05 - Cinematic⧸Inspiring⧸Epic Music [No Copyright] • EMW.mp3", mood: "Dreamy / Ambient" },
  { filename: "09 - Journey to an unknown destiny - epic cinematic music (No Copyright) • EMW.mp3", mood: "Neutral / Mixed" },
  { filename: "asdf.mp3", mood: "Happy / Uplifting" },
];

export const MOCK_SONGS: Song[] = RAW_SONGS.map((raw, i) => ({
  songId: `song-${String(i + 1).padStart(2, "0")}`,
  title: cleanTitle(raw.filename),
  artist: "EMW",
  emotion: MOOD_TO_EMOTION[raw.mood] ?? "nostalgia",
  audioUrl: `/songs/${raw.filename}`,
  duration: 180 + Math.floor(Math.random() * 120),
}));

export function getSongsByEmotion(emotion: Emotion): Song[] {
  return MOCK_SONGS.filter((s) => s.emotion === emotion);
}

export function pickSongForEmotion(emotion: Emotion): Song {
  const matches = getSongsByEmotion(emotion);
  if (matches.length > 0) {
    return matches[Math.floor(Math.random() * matches.length)]!;
  }
  return MOCK_SONGS[0]!;
}
