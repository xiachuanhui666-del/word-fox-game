import { create } from "zustand";
import { clamp } from "@/lib/utils";
import { WORDS } from "@/lib/words";

const SAVE_KEY = "pinpinle-save-v2";
const SAVE_VERSION = 2;

export type ProgressState = {
  version: number;
  hydrated: boolean;
  stars: number;
  berries: number;
  streak: number;
  lastPlayDate: string;
  muted: boolean;
  kidName: string;
  mastery: Record<string, number>;
  seen: Record<string, number>;
  misses: Record<string, number>;
  rounds: number;
  hydrate: () => void;
  persist: () => void;
  setMuted: (muted: boolean) => void;
  setKidName: (name: string) => void;
  recordAnswer: (wordId: string, correct: boolean) => void;
  completeRound: (earnedStars: number) => void;
  feedFox: () => boolean;
  reset: () => void;
};

type SaveBlob = {
  version: number;
  stars: number;
  berries: number;
  streak: number;
  lastPlayDate: string;
  muted: boolean;
  kidName: string;
  mastery: Record<string, number>;
  seen: Record<string, number>;
  misses: Record<string, number>;
  rounds: number;
};

function todayStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function yesterdayStamp() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function emptySave(): SaveBlob {
  return {
    version: SAVE_VERSION,
    stars: 0,
    berries: 3, // 初始赠送3颗小松果
    streak: 0,
    lastPlayDate: "",
    muted: false,
    kidName: "",
    mastery: {},
    seen: {},
    misses: {},
    rounds: 0,
  };
}

function readSave(): SaveBlob {
  if (typeof window === "undefined") return emptySave();
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) {
      // 尝试读取 v1
      const old = window.localStorage.getItem("pinpinle-save-v1");
      if (old) {
        const parsedOld = JSON.parse(old);
        return { ...emptySave(), ...parsedOld, berries: 3, version: SAVE_VERSION };
      }
      return emptySave();
    }
    const parsed = JSON.parse(raw) as Partial<SaveBlob>;
    return { ...emptySave(), ...parsed, version: SAVE_VERSION };
  } catch {
    return emptySave();
  }
}

function writeSave(blob: SaveBlob) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(blob));
  } catch {
    /* private mode / quota */
  }
}

function toBlob(s: ProgressState): SaveBlob {
  return {
    version: SAVE_VERSION,
    stars: s.stars,
    berries: s.berries,
    streak: s.streak,
    lastPlayDate: s.lastPlayDate,
    muted: s.muted,
    kidName: s.kidName,
    mastery: s.mastery,
    seen: s.seen,
    misses: s.misses,
    rounds: s.rounds,
  };
}

export const useProgress = create<ProgressState>((set, get) => ({
  ...emptySave(),
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const saved = readSave();
    set({ ...saved, hydrated: true });
  },
  persist: () => writeSave(toBlob(get())),
  setMuted: (muted) => {
    set({ muted });
    get().persist();
  },
  setKidName: (kidName) => {
    set({ kidName });
    get().persist();
  },
  recordAnswer: (wordId, correct) => {
    const { mastery, seen, misses, berries } = get();
    const nextMastery = { ...mastery };
    const nextSeen = { ...seen, [wordId]: (seen[wordId] ?? 0) + 1 };
    const nextMisses = { ...misses };
    const current = mastery[wordId] ?? 0;
    nextMastery[wordId] = clamp(current + (correct ? 1 : -1), 0, 5);
    if (!correct) nextMisses[wordId] = (misses[wordId] ?? 0) + 1;
    // 答对奖励一颗美味浆果/松果！
    const nextBerries = correct ? berries + 1 : berries;
    set({ mastery: nextMastery, seen: nextSeen, misses: nextMisses, berries: nextBerries });
    get().persist();
  },
  completeRound: (earnedStars) => {
    const today = todayStamp();
    const { lastPlayDate, streak, berries } = get();
    let nextStreak = streak;
    if (lastPlayDate !== today) {
      nextStreak = lastPlayDate === yesterdayStamp() ? streak + 1 : 1;
    }
    set((s) => ({
      stars: s.stars + earnedStars,
      berries: berries + earnedStars, // 通关额外多奖松果
      streak: nextStreak,
      lastPlayDate: today,
      rounds: s.rounds + 1,
    }));
    get().persist();
  },
  feedFox: () => {
    const { berries } = get();
    if (berries <= 0) return false;
    set({ berries: berries - 1 });
    get().persist();
    return true;
  },
  reset: () => {
    const muted = get().muted;
    const kidName = get().kidName;
    set({ ...emptySave(), muted, kidName, hydrated: true });
    get().persist();
  },
}));

export function knownCount(mastery: Record<string, number>) {
  return WORDS.filter((w) => (mastery[w.id] ?? 0) >= 1).length;
}

export function weakWords(mastery: Record<string, number>, misses: Record<string, number>) {
  return WORDS.filter((w) => (mastery[w.id] ?? 0) < 3 && (misses[w.id] ?? 0) + (5 - (mastery[w.id] ?? 0)) > 3)
    .sort((a, b) => (mastery[a.id] ?? 0) - (mastery[b.id] ?? 0));
}
