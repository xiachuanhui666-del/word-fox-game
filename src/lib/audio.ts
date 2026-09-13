export type Sfx = "tap" | "ok" | "bad" | "star" | "win" | "flip" | "pop" | "crunch" | "cheer" | "ding";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let englishVoice: SpeechSynthesisVoice | null = null;
let currentAudioElement: HTMLAudioElement | null = null;

// 音频缓存字典（防止重复加载网络人声音频）
const audioCache = new Map<string, HTMLAudioElement>();

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC({ latencyHint: "interactive" });
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.75;
    master.connect(ctx.destination);
  }
  return ctx;
}

export function unlockAudio() {
  const audio = getCtx();
  if (audio && audio.state === "suspended") {
    void audio.resume();
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.getVoices();
  }
}

export function setMuted(next: boolean) {
  muted = next;
  if (master && ctx) {
    master.gain.setTargetAtTime(next ? 0 : 0.75, ctx.currentTime, 0.02);
  }
  if (next) {
    stopSpeech();
  }
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  gain = 0.12,
) {
  const audio = getCtx();
  if (!audio || !master || muted) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export function playSfx(kind: Sfx) {
  const audio = getCtx();
  if (!audio || muted) return;
  const t = audio.currentTime;
  const jitter = 0.94 + Math.random() * 0.12;

  if (kind === "tap") {
    tone(720 * jitter, t, 0.05, "triangle", 0.06);
  } else if (kind === "flip") {
    tone(420 * jitter, t, 0.07, "sine", 0.05);
    tone(640 * jitter, t + 0.04, 0.06, "sine", 0.04);
  } else if (kind === "pop") {
    tone(880 * jitter, t, 0.06, "sine", 0.08);
    tone(1320 * jitter, t + 0.04, 0.1, "triangle", 0.09);
  } else if (kind === "ok") {
    tone(523, t, 0.09, "triangle", 0.1);
    tone(659, t + 0.07, 0.1, "triangle", 0.1);
    tone(784, t + 0.14, 0.16, "sine", 0.12);
  } else if (kind === "bad") {
    tone(220 * jitter, t, 0.14, "square", 0.05);
    tone(180 * jitter, t + 0.08, 0.16, "square", 0.04);
  } else if (kind === "star") {
    tone(784, t, 0.08, "sine", 0.08);
    tone(988, t + 0.06, 0.1, "sine", 0.08);
    tone(1175, t + 0.12, 0.16, "triangle", 0.1);
  } else if (kind === "win") {
    [523, 659, 784, 1046, 1318].forEach((f, i) => {
      tone(f, t + i * 0.08, 0.2, "triangle", 0.12);
    });
  } else if (kind === "crunch") {
    tone(440, t, 0.04, "square", 0.08);
    tone(550, t + 0.05, 0.04, "square", 0.07);
    tone(660, t + 0.1, 0.06, "triangle", 0.09);
  } else if (kind === "cheer") {
    tone(659, t, 0.1, "sine", 0.09);
    tone(880, t + 0.07, 0.15, "triangle", 0.12);
  } else if (kind === "ding") {
    tone(1046, t, 0.18, "sine", 0.1);
  }
}

/** 优选清晰温和的美式自然英语语音 */
function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (englishVoice && voices.includes(englishVoice)) return englishVoice;

  const preferred =
    voices.find((v) => v.lang === "en-US" && /natural|aria|jenny|guy/i.test(v.name)) ||
    voices.find((v) => v.lang === "en-US" && /google/i.test(v.name)) ||
    voices.find((v) => v.lang === "en-US" && /samantha|karen|daniel/i.test(v.name)) ||
    voices.find((v) => v.lang === "en-US") ||
    voices.find((v) => v.lang.startsWith("en"));

  englishVoice = preferred ?? null;
  return englishVoice;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    englishVoice = null;
    pickEnglishVoice();
  });
}

function speakSynthetic(text: string, rate = 0.72, pitch = 1.05): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis || muted) {
      resolve(false);
      return;
    }
    unlockAudio();
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = rate;
    utter.pitch = pitch;
    const voice = pickEnglishVoice();
    if (voice) utter.voice = voice;
    utter.onend = () => resolve(true);
    utter.onerror = () => resolve(false);
    window.speechSynthesis.speak(utter);
  });
}

export function stopSpeech() {
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.currentTime = 0;
    currentAudioElement = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function speakWord(text: string, slow = false): Promise<boolean> {
  if (muted || typeof window === "undefined") return Promise.resolve(false);
  unlockAudio();
  stopSpeech();

  const cleanText = text.trim();
  const isSingleWord = !cleanText.includes(" ");

  if (slow) {
    return speakSynthetic(cleanText, 0.56, 1.08);
  }

  if (isSingleWord) {
    const audioKey = cleanText.toLowerCase();
    let audio = audioCache.get(audioKey);
    if (!audio) {
      const audioUrl = `https://dict.youdao.com/dictvoice?type=2&audio=${encodeURIComponent(audioKey)}`;
      audio = new Audio(audioUrl);
      audio.preload = "auto";
      audioCache.set(audioKey, audio);
    }

    currentAudioElement = audio;
    audio.currentTime = 0;

    return new Promise((resolve) => {
      audio.play()
        .then(() => {
          audio.onended = () => {
            currentAudioElement = null;
            resolve(true);
          };
        })
        .catch(() => {
          speakSynthetic(cleanText, 0.72, 1.05).then(resolve);
        });
    });
  }

  return speakSynthetic(cleanText, 0.72, 1.05);
}

export async function speakPhonics(
  chunks: { letters: string; ipa: string }[],
  wholeWord: string,
  onHighlightChunk?: (index: number) => void,
) {
  if (muted || typeof window === "undefined") return;
  stopSpeech();

  for (let i = 0; i < chunks.length; i++) {
    onHighlightChunk?.(i);
    await speakSynthetic(chunks[i].letters, 0.6, 1.1);
    await new Promise((r) => setTimeout(r, 260));
  }

  onHighlightChunk?.(-1);
  await new Promise((r) => setTimeout(r, 320));
  await speakWord(wholeWord, false);
}

export type SpeechEvalResult = {
  transcript: string;
  score: number;
  stars: 1 | 2 | 3;
  matched: boolean;
};

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
  );
}

export function startVoiceEvaluation(
  targetWord: string,
  callbacks: {
    onStart?: () => void;
    onResult: (result: SpeechEvalResult) => void;
    onError?: (err: string) => void;
    onEnd?: () => void;
  },
): () => void {
  if (typeof window === "undefined") {
    callbacks.onError?.("not_supported");
    return () => {};
  }

  const SpeechRecognitionConstructor =
    (window as unknown as { SpeechRecognition?: new () => any }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) {
    callbacks.onError?.("not_supported");
    return () => {};
  }

  let recognition: any = null;
  let aborted = false;

  try {
    recognition = new SpeechRecognitionConstructor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      if (!aborted) callbacks.onStart?.();
    };

    recognition.onresult = (event: any) => {
      if (aborted) return;
      const target = targetWord.trim().toLowerCase();
      let bestScore = 0;
      let bestTranscript = "";

      for (let i = 0; i < event.results[0].length; i++) {
        const transcript = event.results[0][i].transcript.trim().toLowerCase().replace(/[^a-z]/g, "");
        if (transcript === target) {
          bestScore = 100;
          bestTranscript = transcript;
          break;
        }
        if (transcript.includes(target) || target.includes(transcript)) {
          const s = Math.max(85, 95 - Math.abs(transcript.length - target.length) * 5);
          if (s > bestScore) {
            bestScore = s;
            bestTranscript = transcript;
          }
        } else {
          const dist = levenshteinDistance(target, transcript);
          const maxLen = Math.max(target.length, transcript.length);
          const s = Math.max(0, Math.round((1 - dist / maxLen) * 100));
          if (s > bestScore) {
            bestScore = s;
            bestTranscript = transcript;
          }
        }
      }

      const matched = bestScore >= 55;
      let stars: 1 | 2 | 3 = 1;
      if (bestScore >= 85) stars = 3;
      else if (bestScore >= 60) stars = 2;

      callbacks.onResult({
        transcript: bestTranscript || "...",
        score: bestScore,
        stars,
        matched,
      });
    };

    recognition.onerror = (event: any) => {
      if (!aborted) {
        callbacks.onError?.(event.error || "recognition_error");
      }
    };

    recognition.onend = () => {
      if (!aborted) callbacks.onEnd?.();
    };

    recognition.start();
  } catch (err) {
    callbacks.onError?.(String(err));
  }

  return () => {
    aborted = true;
    if (recognition) {
      try {
        recognition.abort();
      } catch {}
    }
  };
}
