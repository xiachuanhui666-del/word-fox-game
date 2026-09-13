import { wordsForUnit, type Word } from "./words";
import { pickN, shuffle } from "./utils";

export type UnitFilter = 0 | 1 | 2;
export type PlayMode = "quest" | "listen" | "spell" | "voice" | "bubbles" | "match";

export type ChoiceQuestion = {
  kind: "choice" | "bubble";
  wordId: string;
  options: string[];
  answer: string;
};

export type ListenQuestion = {
  kind: "listen";
  wordId: string;
  options: { id: string; en: string; zh: string }[];
  answer: string;
};

export type SpellQuestion = {
  kind: "spell";
  wordId: string;
  scrambledLetters: { id: string; char: string }[];
  answer: string;
};

export type VoiceQuestion = {
  kind: "voice";
  wordId: string;
  answer: string;
};

export type Question = ChoiceQuestion | ListenQuestion | SpellQuestion | VoiceQuestion;

export type MatchRound = {
  kind: "match";
  wordIds: string[];
};

function distractorWords(target: Word, pool: Word[], n: number): Word[] {
  const others = pool.filter((w) => w.id !== target.id);
  return pickN(others, Math.min(n, others.length));
}

function twoChoice(word: Word, pool: Word[], kind: ChoiceQuestion["kind"]): ChoiceQuestion {
  const extra = kind === "bubble" ? 2 : 1;
  const opts = shuffle([word, ...distractorWords(word, pool, extra)]).map((w) => w.en);
  return {
    kind,
    wordId: word.id,
    options: opts,
    answer: word.en,
  };
}

function listenChoice(word: Word, pool: Word[]): ListenQuestion {
  const distractors = distractorWords(word, pool, 2);
  const options = shuffle([word, ...distractors]).map((w) => ({
    id: w.id,
    en: w.en,
    zh: w.zh.split("；")[0],
  }));
  return {
    kind: "listen",
    wordId: word.id,
    options,
    answer: word.id,
  };
}

function spellChoice(word: Word): SpellQuestion {
  const chars = word.en.toLowerCase().split("");
  const letters = shuffle(chars).map((char, index) => ({
    id: `${char}-${index}-${Math.random().toString(36).substring(2, 6)}`,
    char,
  }));
  return {
    kind: "spell",
    wordId: word.id,
    scrambledLetters: letters,
    answer: word.en.toLowerCase(),
  };
}

function voiceChoice(word: Word): VoiceQuestion {
  return {
    kind: "voice",
    wordId: word.id,
    answer: word.en.toLowerCase(),
  };
}

function weightedPick(pool: Word[], mastery: Record<string, number>, used: Set<string>): Word {
  const candidates = pool.length === used.size ? pool : pool.filter((w) => !used.has(w.id));
  const weights = candidates.map((w) => {
    const m = mastery[w.id] ?? 0;
    return Math.max(1, 6 - m) ** 2;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i += 1) {
    r -= weights[i] ?? 0;
    const word = candidates[i];
    if (r <= 0 && word) return word;
  }
  return candidates[0] ?? pool[0]!;
}

export function buildQuestions(
  mode: Exclude<PlayMode, "match">,
  unit: UnitFilter,
  mastery: Record<string, number>,
): Question[] {
  const pool = wordsForUnit(unit);
  const used = new Set<string>();
  const questions: Question[] = [];

  if (mode === "listen") {
    for (let i = 0; i < 5; i++) {
      const word = weightedPick(pool, mastery, used);
      used.add(word.id);
      questions.push(listenChoice(word, pool));
    }
    return questions;
  }

  if (mode === "spell") {
    for (let i = 0; i < 5; i++) {
      const word = weightedPick(pool, mastery, used);
      used.add(word.id);
      questions.push(spellChoice(word));
    }
    return questions;
  }

  if (mode === "voice") {
    for (let i = 0; i < 5; i++) {
      const word = weightedPick(pool, mastery, used);
      used.add(word.id);
      questions.push(voiceChoice(word));
    }
    return questions;
  }

  if (mode === "bubbles") {
    for (let i = 0; i < 6; i++) {
      const word = weightedPick(pool, mastery, used);
      used.add(word.id);
      questions.push(twoChoice(word, pool, "bubble"));
    }
    return questions;
  }

  // mode === "quest" 综合大闯关：涵盖 听 -> 认 -> 拼 -> 读 -> 玩 闭环流程
  const questionSequence: Array<"listen" | "choice" | "spell" | "voice" | "bubble"> = [
    "listen",
    "choice",
    "spell",
    "voice",
    "bubble",
  ];

  for (const qType of questionSequence) {
    const word = weightedPick(pool, mastery, used);
    used.add(word.id);
    if (used.size === pool.length) used.clear();

    if (qType === "listen") questions.push(listenChoice(word, pool));
    else if (qType === "choice") questions.push(twoChoice(word, pool, "choice"));
    else if (qType === "spell") questions.push(spellChoice(word));
    else if (qType === "voice") questions.push(voiceChoice(word));
    else questions.push(twoChoice(word, pool, "bubble"));
  }

  return questions;
}

export function buildMatch(unit: UnitFilter): MatchRound {
  const pool = wordsForUnit(unit);
  return { kind: "match", wordIds: pickN(pool, Math.min(3, pool.length)).map((w) => w.id) };
}

export function starsForScore(correct: number, total: number): 2 | 3 {
  if (total <= 0) return 2;
  return correct / total >= 0.6 ? 3 : 2;
}
