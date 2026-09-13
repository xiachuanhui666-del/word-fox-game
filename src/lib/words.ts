export type PhonicsChunk = {
  letters: string;
  ipa: string;
};

export type Word = {
  id: string;
  en: string;
  ipa: string;
  pos: string;
  zh: string;
  chunks: PhonicsChunk[];
  exampleEn: string;
  exampleZh: string;
  source: string;
  unit: 1 | 2;
  unitTitle: string;
};

export const UNITS: { id: 1 | 2; title: string; titleEn: string }[] = [
  { id: 1, title: "交朋友", titleEn: "Making friends" },
  { id: 2, title: "不一样的家庭", titleEn: "Different families" },
];

export const WORDS: Word[] = [
  {
    id: "name",
    en: "name",
    ipa: "/neɪm/",
    pos: "n.",
    zh: "名字",
    chunks: [
      { letters: "n", ipa: "/n/" },
      { letters: "ame", ipa: "/eɪm/" },
    ],
    exampleEn: "My name is Wu Binbin.",
    exampleZh: "我的名字是吴斌斌。",
    source: "教材句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "nice",
    en: "nice",
    ipa: "/naɪs/",
    pos: "adj.",
    zh: "令人愉快的；友好的",
    chunks: [
      { letters: "n", ipa: "/n/" },
      { letters: "ice", ipa: "/aɪs/" },
    ],
    exampleEn: "Nice to meet you.",
    exampleZh: "见到你很高兴。",
    source: "教材句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "ear",
    en: "ear",
    ipa: "/ɪə/",
    pos: "n.",
    zh: "耳朵",
    chunks: [{ letters: "ear", ipa: "/ɪə/" }],
    exampleEn: "Point to your ear.",
    exampleZh: "指向你的耳朵。",
    source: "教材句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "hand",
    en: "hand",
    ipa: "/hænd/",
    pos: "n.",
    zh: "手",
    chunks: [
      { letters: "h", ipa: "/h/" },
      { letters: "an", ipa: "/æn/" },
      { letters: "d", ipa: "/d/" },
    ],
    exampleEn: "Hold my hand.",
    exampleZh: "握住我的手。",
    source: "教材句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "eye",
    en: "eye",
    ipa: "/aɪ/",
    pos: "n.",
    zh: "眼睛",
    chunks: [{ letters: "eye", ipa: "/aɪ/" }],
    exampleEn: "Look into my eyes.",
    exampleZh: "看着我的眼睛。",
    source: "教材句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "mouth",
    en: "mouth",
    ipa: "/maʊθ/",
    pos: "n.",
    zh: "嘴",
    chunks: [
      { letters: "m", ipa: "/m/" },
      { letters: "ou", ipa: "/aʊ/" },
      { letters: "th", ipa: "/θ/" },
    ],
    exampleEn: "Open your mouth.",
    exampleZh: "张开你的嘴。",
    source: "真题句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "arm",
    en: "arm",
    ipa: "/ɑːm/",
    pos: "n.",
    zh: "胳膊",
    chunks: [
      { letters: "ar", ipa: "/ɑː/" },
      { letters: "m", ipa: "/m/" },
    ],
    exampleEn: "Wave your arm.",
    exampleZh: "挥挥你的胳膊。",
    source: "教材句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "can",
    en: "can",
    ipa: "/kæn/",
    pos: "modal v.",
    zh: "可以",
    chunks: [
      { letters: "c", ipa: "/k/" },
      { letters: "an", ipa: "/æn/" },
    ],
    exampleEn: "Can you read the words?",
    exampleZh: "你能读出这些单词吗？",
    source: "教材句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "share",
    en: "share",
    ipa: "/ʃeə/",
    pos: "v.",
    zh: "分享",
    chunks: [
      { letters: "sh", ipa: "/ʃ/" },
      { letters: "are", ipa: "/eə/" },
    ],
    exampleEn: "We can share.",
    exampleZh: "我们可以分享。",
    source: "教材句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "smile",
    en: "smile",
    ipa: "/smaɪl/",
    pos: "v.",
    zh: "微笑；笑",
    chunks: [
      { letters: "sm", ipa: "/sm/" },
      { letters: "ile", ipa: "/aɪl/" },
    ],
    exampleEn: "Look at me and smile.",
    exampleZh: "看着我，微笑。",
    source: "真题句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "listen",
    en: "listen",
    ipa: "/ˈlɪsn/",
    pos: "v.",
    zh: "听；倾听",
    chunks: [
      { letters: "li", ipa: "/lɪ/" },
      { letters: "sten", ipa: "/sn/" },
    ],
    exampleEn: "We listen with care.",
    exampleZh: "我们仔细倾听。",
    source: "教材句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "help",
    en: "help",
    ipa: "/help/",
    pos: "v.",
    zh: "帮助",
    chunks: [
      { letters: "h", ipa: "/h/" },
      { letters: "el", ipa: "/el/" },
      { letters: "p", ipa: "/p/" },
    ],
    exampleEn: "I help and share.",
    exampleZh: "我帮助并分享。",
    source: "教材句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "say",
    en: "say",
    ipa: "/seɪ/",
    pos: "v.",
    zh: "说；讲",
    chunks: [
      { letters: "s", ipa: "/s/" },
      { letters: "ay", ipa: "/eɪ/" },
    ],
    exampleEn: 'I say "Hi!"',
    exampleZh: "我说“嗨！”",
    source: "教材句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "friend",
    en: "friend",
    ipa: "/frend/",
    pos: "n.",
    zh: "朋友",
    chunks: [
      { letters: "fr", ipa: "/fr/" },
      { letters: "ie", ipa: "/e/" },
      { letters: "nd", ipa: "/nd/" },
    ],
    exampleEn: "I am nice to my friends.",
    exampleZh: "我对我的朋友们很好。",
    source: "教材句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "good",
    en: "good",
    ipa: "/gʊd/",
    pos: "adj.",
    zh: "好的",
    chunks: [
      { letters: "g", ipa: "/g/" },
      { letters: "oo", ipa: "/ʊ/" },
      { letters: "d", ipa: "/d/" },
    ],
    exampleEn: "Are you a good friend?",
    exampleZh: "你是一个好朋友吗？",
    source: "教材句",
    unit: 1,
    unitTitle: "Making friends",
  },
  {
    id: "mum",
    en: "mum",
    ipa: "/mʌm/",
    pos: "n.",
    zh: "妈妈",
    chunks: [
      { letters: "m", ipa: "/m/" },
      { letters: "um", ipa: "/ʌm/" },
    ],
    exampleEn: "Mum has a map.",
    exampleZh: "妈妈有一张地图。",
    source: "教材句",
    unit: 2,
    unitTitle: "Different families",
  },
  {
    id: "dad",
    en: "dad",
    ipa: "/dæd/",
    pos: "n.",
    zh: "爸爸；爹爹",
    chunks: [
      { letters: "d", ipa: "/d/" },
      { letters: "ad", ipa: "/æd/" },
    ],
    exampleEn: "Good night, Dad!",
    exampleZh: "晚安，爸爸！",
    source: "真题句",
    unit: 2,
    unitTitle: "Different families",
  },
  {
    id: "grandma",
    en: "grandma",
    ipa: "/ˈgrænmɑː/",
    pos: "n.",
    zh: "奶奶；姥姥",
    chunks: [
      { letters: "gr", ipa: "/gr/" },
      { letters: "and", ipa: "/æn/" },
      { letters: "ma", ipa: "/mɑː/" },
    ],
    exampleEn: "This is my grandma.",
    exampleZh: "这是我的奶奶。",
    source: "教材句",
    unit: 2,
    unitTitle: "Different families",
  },
  {
    id: "grandpa",
    en: "grandpa",
    ipa: "/ˈgrænpɑː/",
    pos: "n.",
    zh: "爷爷；姥爷",
    chunks: [
      { letters: "gr", ipa: "/gr/" },
      { letters: "and", ipa: "/æn/" },
      { letters: "pa", ipa: "/pɑː/" },
    ],
    exampleEn: "That is my grandpa.",
    exampleZh: "那是我的爷爷。",
    source: "教材改编",
    unit: 2,
    unitTitle: "Different families",
  },
];

export const WORD_MAP: Record<string, Word> = Object.fromEntries(
  WORDS.map((w) => [w.id, w]),
);

export function wordsForUnit(unit: 0 | 1 | 2): Word[] {
  if (unit === 0) return WORDS;
  return WORDS.filter((w) => w.unit === unit);
}

export function getWord(id: string): Word {
  const word = WORD_MAP[id];
  if (!word) throw new Error(`Unknown word: ${id}`);
  return word;
}

export const CHUNK_TONES = ["teal", "coral", "sky", "moss"] as const;
export type ChunkTone = (typeof CHUNK_TONES)[number];

export function chunkTone(index: number): ChunkTone {
  const tone = CHUNK_TONES[index % CHUNK_TONES.length];
  return tone ?? "teal";
}
