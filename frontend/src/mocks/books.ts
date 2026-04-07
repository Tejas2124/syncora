import type { Book, Paragraph, Emotion } from "@/types";
import { pickSongForEmotion } from "./songs";

interface MockBookData {
  book: Book;
  paragraphs: Paragraph[];
}

const BOOK_1_PARAGRAPHS: { text: string; emotion: Emotion }[] = [
  {
    text: "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.",
    emotion: "melancholy",
  },
  {
    text: "The hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features.",
    emotion: "tension",
  },
  {
    text: "Behind Winston's back the voice from the telescreen was still babbling away about pig-iron and the overfulfilment of the Ninth Three-Year Plan. The telescreen received and transmitted simultaneously. Any sound that Winston made, above the level of a very low whisper, would be picked up by it.",
    emotion: "fear",
  },
  {
    text: "He thought of the telescreen with its never-sleeping ear. They could spy upon you night and day, but if you kept your head you could still outwit them. With all their cleverness they had never mastered the secret of finding out what another human being was thinking.",
    emotion: "mystery",
  },
  {
    text: "The thing that he was about to do was to open a diary. This was not illegal, since nothing was illegal, since there were no longer any laws. But if detected it was reasonably certain that it would be punished by death, or at least by twenty-five years in a forced-labour camp.",
    emotion: "tension",
  },
  {
    text: "He dipped the pen into the ink and then faltered for just a second. A tremor had gone through his bowels. To mark the paper was the decisive act. In small clumsy letters he wrote: April 4th, 1984.",
    emotion: "fear",
  },
  {
    text: "For whom was he writing this diary? For the future, for the unborn. His mind hovered for a moment round the doubtful date on the page, and then fetched up with a bump against the Newspeak word doublethink.",
    emotion: "mystery",
  },
  {
    text: "He sat back. A sense of complete helplessness had descended upon him. To begin with, he did not know with any certainty that this was 1984. It must be round about that date, since he was fairly sure that his age was thirty-nine, and he believed that he had been born in 1944 or 1945.",
    emotion: "melancholy",
  },
  {
    text: "Outside, even through the shut window-pane, the world looked cold. Down in the street little eddies of wind were whirling dust and torn paper into spirals, and though the sun was shining and the sky a harsh blue, there seemed to be no colour in anything.",
    emotion: "sadness",
  },
  {
    text: "The black-moustachio'd face gazed down from every commanding corner. There was one on the house-front immediately opposite. BIG BROTHER IS WATCHING YOU, the caption said, while the dark eyes looked deep into Winston's own.",
    emotion: "tension",
  },
  {
    text: "In the far distance a helicopter skimmed down between the roofs, hovered for an instant like a bluebottle, and darted away again with a curving flight. It was the police patrol, snooping into people's windows.",
    emotion: "fear",
  },
  {
    text: "But it was all right, everything was all right, the struggle was finished. He had won the victory over himself. He loved Big Brother.",
    emotion: "sadness",
  },
];

const BOOK_2_PARAGRAPHS: { text: string; emotion: Emotion }[] = [
  {
    text: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. 'Whenever you feel like criticizing anyone,' he told me, 'just remember that all the people in this world haven't had the advantages that you've had.'",
    emotion: "nostalgia",
  },
  {
    text: "And so with the sunshine and the great bursts of leaves growing on the trees, just as things grow in fast movies, I had that familiar conviction that life was beginning over again with the summer.",
    emotion: "joy",
  },
  {
    text: "I believe that on the first night I went to Gatsby's house I was one of the few guests who had actually been invited. People were not invited — they went there. They got into automobiles which bore them out to Long Island, and somehow they ended up at Gatsby's door.",
    emotion: "surprise",
  },
  {
    text: "He smiled understandingly — much more than understandingly. It was one of those rare smiles with a quality of eternal reassurance in it, that you may come across four or five times in life. It faced — or seemed to face — the whole eternal world for an instant, and then concentrated on you with an irresistible prejudice in your favour.",
    emotion: "love",
  },
  {
    text: "The lights grow brighter as the earth lurches away from the sun, and now the orchestra is playing yellow cocktail music, and the opera of voices pitches a key higher. Laughter is easier minute by minute, spilled with prodigality, tipped out at a cheerful word.",
    emotion: "joy",
  },
  {
    text: "There must have been moments even that afternoon when Daisy tumbled short of his dreams — not through her own fault, but because of the colossal vitality of his illusion. It had gone beyond her, beyond everything.",
    emotion: "melancholy",
  },
  {
    text: "Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that's no matter — tomorrow we will run faster, stretch out our arms farther.",
    emotion: "nostalgia",
  },
  {
    text: "So we beat on, boats against the current, borne back ceaselessly into the past.",
    emotion: "melancholy",
  },
];

const BOOK_3_PARAGRAPHS: { text: string; emotion: Emotion }[] = [
  {
    text: "The morning sun blazed through the canopy, scattering golden coins of light across the forest floor. Birds erupted from the treetops in great sweeping arcs, their songs weaving together into a symphony of pure, unrestrained celebration.",
    emotion: "joy",
  },
  {
    text: "She stood at the edge of the cliff, the wind tearing at her hair, the vast ocean stretching endlessly before her. In that moment she felt the immensity of the world and her own smallness within it, and yet there was no fear — only a deep, still peace.",
    emotion: "peace",
  },
  {
    text: "The letter arrived on a Tuesday. She recognized the handwriting immediately — the same careful loops and slanted t's she hadn't seen in seven years. Her hands trembled as she broke the seal, and the past came flooding back like a river breaking through a dam.",
    emotion: "surprise",
  },
  {
    text: "He sat beside her hospital bed, holding her thin hand in both of his. The machines beeped their steady rhythm. Outside the window, snow fell softly, blanketing the world in silence. He whispered words he should have said years ago, hoping somehow she could still hear.",
    emotion: "sadness",
  },
  {
    text: "The army surged forward with a roar that shook the earth. Banners snapped in the wind, steel rang against steel, and above it all rose a fierce cry of defiance. They had been beaten before, but today they would not yield. Today they would be remembered.",
    emotion: "triumph",
  },
  {
    text: "The old house creaked and groaned in the darkness. Shadows pooled in the corners like living things, and somewhere deep within its walls came a sound — not quite a voice, not quite a whisper — that made the hair on her arms stand on end.",
    emotion: "fear",
  },
  {
    text: "They danced slowly in the kitchen, barefoot on the cool tile, the radio playing something old and sweet. His arms around her waist, her head against his chest, listening to his heartbeat. The world outside could wait. This moment was enough.",
    emotion: "love",
  },
  {
    text: "He stared at the faded photograph — three children laughing on a summer lawn, a dog bounding between them, a house that no longer existed in a town that had changed beyond recognition. He could almost smell the fresh-cut grass, almost hear their voices calling him to play.",
    emotion: "nostalgia",
  },
  {
    text: "The door at the end of the corridor stood slightly ajar, a thin line of pale light spilling through the gap. She had been told never to open it. Everyone in the house knew the rule. But tonight, for the first time, she heard music coming from the other side.",
    emotion: "mystery",
  },
  {
    text: "His fury erupted like a volcano. He swept the papers off the desk, sent the chair crashing into the wall. Years of silence, years of swallowing every slight and indignity, and now the dam had burst. His voice echoed through the empty office, raw and terrible.",
    emotion: "anger",
  },
];

function buildParagraphs(
  items: { text: string; emotion: Emotion }[],
): Paragraph[] {
  return items.map((item, i) => {
    const song = pickSongForEmotion(item.emotion);
    return {
      index: i,
      text: item.text,
      emotion: item.emotion,
      songId: song.songId,
      confidence: 0.7 + Math.random() * 0.25,
      songTitle: song.title,
    };
  });
}

const BOOK_1: MockBookData = {
  book: {
    bookId: "book-001",
    title: "1984",
    fileName: "1984.txt",
    totalParagraphs: BOOK_1_PARAGRAPHS.length,
    createdAt: "2026-04-01T10:00:00Z",
  },
  paragraphs: buildParagraphs(BOOK_1_PARAGRAPHS),
};

const BOOK_2: MockBookData = {
  book: {
    bookId: "book-002",
    title: "The Great Gatsby",
    fileName: "gatsby.txt",
    totalParagraphs: BOOK_2_PARAGRAPHS.length,
    createdAt: "2026-04-03T14:30:00Z",
  },
  paragraphs: buildParagraphs(BOOK_2_PARAGRAPHS),
};

const BOOK_3: MockBookData = {
  book: {
    bookId: "book-003",
    title: "Echoes of Light",
    fileName: "echoes_of_light.txt",
    totalParagraphs: BOOK_3_PARAGRAPHS.length,
    createdAt: "2026-04-05T09:15:00Z",
  },
  paragraphs: buildParagraphs(BOOK_3_PARAGRAPHS),
};

export const MOCK_BOOKS: MockBookData[] = [BOOK_1, BOOK_2, BOOK_3];

export function getMockBook(bookId: string): MockBookData | undefined {
  return MOCK_BOOKS.find((b) => b.book.bookId === bookId);
}
