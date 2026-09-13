import { useEffect, useMemo, useState } from "react";
import { Volume2, Mic, RotateCcw, Sparkles, CheckCircle2, Snail, Ear, ArrowRight } from "lucide-react";
import {
  playSfx,
  speakWord,
  speakPhonics,
  startVoiceEvaluation,
  isSpeechRecognitionSupported,
  type SpeechEvalResult,
} from "@/lib/audio";
import { getWord, type Word } from "@/lib/words";
import { cn } from "@/lib/utils";
import type { ChoiceQuestion, ListenQuestion, SpellQuestion, VoiceQuestion } from "@/lib/quiz";
import { Burst, PrimaryButton, StarPips } from "./ui";
import { FoxMascot, WordArt, type FoxMood } from "./WordArt";

/** 双速发音控制组合条：包含清晰原声 + 乌龟慢速拼读 */
export function SpeakControls({
  text,
  auto = false,
  large = false,
  className = "",
}: {
  text: string;
  auto?: boolean;
  large?: boolean;
  className?: string;
}) {
  useEffect(() => {
    if (auto) speakWord(text, false);
  }, [auto, text]);

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => {
          playSfx("tap");
          speakWord(text, false);
        }}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky text-surface shadow-card transition-transform duration-150 active:scale-[0.95]",
          large ? "min-h-12 px-4 text-base font-semibold" : "size-11",
        )}
        aria-label="标准原声朗读"
      >
        <Volume2 className={large ? "size-5" : "size-5"} />
        {large ? <span>听发音</span> : null}
      </button>

      <button
        type="button"
        onClick={() => {
          playSfx("tap");
          speakWord(text, true);
        }}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-soft text-ink shadow-card transition-transform duration-150 active:scale-[0.95]",
          large ? "min-h-12 px-3 text-sm font-medium" : "size-11",
        )}
        title="0.55x 慢速拼读，每个音节清晰可辨"
        aria-label="慢速拼读"
      >
        <Snail className="size-4 text-teal" />
        {large ? <span className="text-teal font-semibold">慢速</span> : null}
      </button>
    </div>
  );
}

export function SpeakButton({
  text,
  large = false,
  auto = false,
}: {
  text: string;
  large?: boolean;
  auto?: boolean;
}) {
  return <SpeakControls text={text} auto={auto} large={large} />;
}

export function TeachCard({
  word,
  onDone,
  title = "新词卡",
  doneLabel = "我学会啦",
}: {
  word: Word;
  onDone: () => void;
  title?: string;
  doneLabel?: string;
}) {
  useEffect(() => {
    speakWord(word.en, false);
  }, [word.en]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm font-medium text-ink-soft">{title}</p>
      <div className="mx-auto size-32">
        <WordArt word={word} />
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="font-display text-4xl font-semibold tracking-wide text-ink">{word.en}</p>
        <p className="text-xs text-ink-soft tracking-wider">{word.ipa}</p>
        <SpeakControls text={word.en} large />
      </div>
      <p className="text-center font-display text-xl font-semibold">{word.zh.split("；")[0]}</p>
      <p className="text-center text-sm text-ink-soft">{word.exampleZh}</p>
      <PrimaryButton onClick={onDone}>{doneLabel}</PrimaryButton>
    </div>
  );
}

export function FoxStage({
  mood,
  line,
  yum,
}: {
  mood: FoxMood;
  line: string;
  yum: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center">
      {yum ? (
        <span className="yum-pop pointer-events-none absolute -top-1 font-display text-lg font-semibold text-coral">
          好吃！
        </span>
      ) : null}
      <FoxMascot
        className={cn("size-24", mood === "yum" ? "yum-bounce" : "floaty")}
        mood={mood}
      />
      <p className="mt-1 font-display text-base font-semibold text-ink">{line}</p>
    </div>
  );
}

// -------------------------------------------------------------
// 1. 【看词认图】EasyChoice
// -------------------------------------------------------------
export function EasyChoice({
  question,
  locked,
  picked,
  onPick,
}: {
  question: ChoiceQuestion;
  locked: boolean;
  picked: string | null;
  onPick: (option: string) => void;
}) {
  const word = getWord(question.wordId);
  const missed = Boolean(picked && picked !== question.answer && !locked);
  useEffect(() => {
    speakWord(word.en, false);
  }, [word.en]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto size-36">
        <WordArt word={word} />
        <Burst show={locked && picked === question.answer} />
      </div>
      <p className="text-center font-display text-2xl font-semibold">
        {word.zh.split("；")[0]}
      </p>
      <div className="flex justify-center">
        <SpeakControls text={word.en} large />
      </div>
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option) => {
          const correct = option === question.answer;
          const isPicked = picked === option;
          const showCorrect = locked && correct;
          const showWrong = isPicked && !correct;
          const hint = missed && correct;
          return (
            <button
              key={option}
              type="button"
              disabled={locked || (isPicked && !correct)}
              onClick={() => onPick(option)}
              className={cn(
                "min-h-16 rounded-xl px-4 py-3 font-display text-3xl font-semibold tracking-wide shadow-card transition-transform duration-150 ease-out active:scale-[0.96]",
                !showCorrect && !showWrong && !hint && "bg-surface text-ink",
                showCorrect && "squash bg-teal text-surface",
                showWrong && "shake-x bg-coral-soft text-ink",
                hint && "hint-pulse bg-teal-soft text-ink",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      {missed ? (
        <p className="text-center text-sm font-medium text-teal">点绿色闪烁的那个</p>
      ) : null}
    </div>
  );
}

// -------------------------------------------------------------
// 2. 【听音辨析】ListenFirstCard（听懂 - 纯听声音不看英文字形）
// -------------------------------------------------------------
export function ListenFirstCard({
  question,
  locked,
  picked,
  onPick,
}: {
  question: ListenQuestion;
  locked: boolean;
  picked: string | null;
  onPick: (wordId: string) => void;
}) {
  const targetWord = getWord(question.wordId);
  const missed = Boolean(picked && picked !== question.answer && !locked);

  useEffect(() => {
    // 首次进入自动播放纯真声，闭环训练听觉直觉
    speakWord(targetWord.en, false);
  }, [targetWord.en]);

  return (
    <div className="flex flex-col gap-4">
      {/* 顶部听觉提示区 */}
      <div className="flex flex-col items-center rounded-2xl bg-sky-soft/60 p-4 shadow-card">
        <div className="flex items-center gap-1 text-sm font-semibold text-sky">
          <Ear className="size-4" />
          <span>仔细听声音，选对应的图卡</span>
        </div>

        <div className="my-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              playSfx("tap");
              speakWord(targetWord.en, false);
            }}
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-sky px-6 font-display text-xl font-semibold text-surface shadow-pop transition-transform duration-150 active:scale-[0.94]"
          >
            <Volume2 className="size-6 animate-pulse" />
            <span>再听一次</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSfx("tap");
              speakWord(targetWord.en, true);
            }}
            className="flex size-14 items-center justify-center rounded-2xl bg-surface text-ink shadow-card transition-transform duration-150 active:scale-[0.94]"
            title="慢速拼读"
          >
            <Snail className="size-6 text-teal" />
          </button>
        </div>

        {locked ? (
          <div className="animate-fadeIn mt-1 text-center">
            <span className="font-display text-3xl font-bold tracking-wider text-teal">
              {targetWord.en}
            </span>
            <p className="text-xs text-ink-soft">{targetWord.ipa}</p>
          </div>
        ) : (
          <p className="text-xs text-ink-soft">听不清可以点右边的小乌龟慢速听哦</p>
        )}
      </div>

      {/* 3 张图文卡供孩子根据声音辨认 */}
      <div className="grid grid-cols-3 gap-2.5">
        {question.options.map((opt) => {
          const optWord = getWord(opt.id);
          const isCorrect = opt.id === question.answer;
          const isPicked = picked === opt.id;
          const showCorrect = locked && isCorrect;
          const showWrong = isPicked && !isCorrect;
          const hint = missed && isCorrect;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={locked || (isPicked && !isCorrect)}
              onClick={() => onPick(opt.id)}
              className={cn(
                "relative flex flex-col items-center rounded-2xl bg-surface p-2.5 shadow-card transition-transform duration-150 active:scale-[0.95]",
                showCorrect && "ring-4 ring-teal bg-teal-soft squash",
                showWrong && "opacity-40 shake-x",
                hint && "hint-pulse ring-2 ring-teal",
              )}
            >
              <div className="size-20">
                <WordArt word={optWord} />
              </div>
              <span className="mt-2 text-center font-display text-base font-semibold text-ink">
                {opt.zh}
              </span>
            </button>
          );
        })}
      </div>
      {missed ? (
        <p className="text-center text-sm font-medium text-teal">再听一遍，找闪烁的那张</p>
      ) : null}
    </div>
  );
}

// -------------------------------------------------------------
// 3. 【字母积木拼写】SpellingTileCard（会写 - 拖拽/点选拼词）
// -------------------------------------------------------------
export function SpellingTileCard({
  question,
  locked,
  onComplete,
}: {
  question: SpellQuestion;
  locked: boolean;
  onComplete: (success: boolean) => void;
}) {
  const word = getWord(question.wordId);
  const targetChars = word.en.toLowerCase().split("");

  // 待选字母池与已填入槽位
  const [pool, setPool] = useState(question.scrambledLetters);
  const [slots, setSlots] = useState<{ id: string; char: string }[]>([]);
  const [wrongShake, setWrongShake] = useState(false);

  useEffect(() => {
    setPool(question.scrambledLetters);
    setSlots([]);
    setWrongShake(false);
    speakWord(word.en, false);
  }, [question, word.en]);

  function pickLetter(item: { id: string; char: string }) {
    if (locked || slots.length >= targetChars.length) return;
    playSfx("tap");
    const nextSlots = [...slots, item];
    const nextPool = pool.filter((p) => p.id !== item.id);
    setSlots(nextSlots);
    setPool(nextPool);

    // 如果填满了，校验拼写
    if (nextSlots.length === targetChars.length) {
      const spelled = nextSlots.map((s) => s.char).join("");
      if (spelled === question.answer) {
        playSfx("ok");
        speakWord(word.en, false);
        onComplete(true);
      } else {
        playSfx("bad");
        setWrongShake(true);
        window.setTimeout(() => setWrongShake(false), 500);
      }
    }
  }

  function removeSlot(index: number) {
    if (locked) return;
    playSfx("pop");
    const item = slots[index];
    if (!item) return;
    const nextSlots = slots.filter((_, i) => i !== index);
    setSlots(nextSlots);
    setPool([...pool, item]);
  }

  function resetAll() {
    if (locked) return;
    playSfx("tap");
    setPool(question.scrambledLetters);
    setSlots([]);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 提示与发音 */}
      <div className="flex items-center justify-between rounded-2xl bg-surface p-3 shadow-card">
        <div className="flex items-center gap-3">
          <div className="size-14 shrink-0">
            <WordArt word={word} />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-ink">{word.zh.split("；")[0]}</p>
            <p className="text-xs text-ink-soft">把字母积木拼入卡槽</p>
          </div>
        </div>
        <SpeakControls text={word.en} />
      </div>

      {/* 拼写卡槽 */}
      <div
        className={cn(
          "flex min-h-20 items-center justify-center gap-2 rounded-2xl bg-surface/70 p-3 shadow-inner",
          wrongShake && "shake-x bg-coral-soft/50",
          locked && "bg-teal-soft/80 squash",
        )}
      >
        <Burst show={locked} />
        {targetChars.map((_, i) => {
          const filled = slots[i];
          return (
            <button
              key={i}
              type="button"
              disabled={locked || !filled}
              onClick={() => removeSlot(i)}
              className={cn(
                "flex size-14 items-center justify-center rounded-xl border-2 border-dashed border-line font-display text-3xl font-bold transition-transform active:scale-95",
                filled && "border-solid border-teal bg-teal text-surface shadow-card",
                !filled && "bg-surface/40 text-transparent",
              )}
            >
              {filled ? filled.char : "_"}
            </button>
          );
        })}
      </div>

      {/* 待选字母积木区 */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 py-2">
        {pool.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={locked}
            onClick={() => pickLetter(item)}
            className="flex size-14 items-center justify-center rounded-xl bg-coral font-display text-3xl font-bold text-surface shadow-pop transition-transform duration-150 active:scale-[0.92]"
          >
            {item.char}
          </button>
        ))}
      </div>

      {/* 控制按钮与提示 */}
      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          onClick={resetAll}
          disabled={locked || slots.length === 0}
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-30"
        >
          <RotateCcw className="size-4" />
          <span>重新拼</span>
        </button>

        {slots.length === targetChars.length && !locked ? (
          <span className="text-sm font-medium text-coral">拼不对哦，点错的字母退回</span>
        ) : (
          <span className="text-xs text-ink-soft">点击上面的字母可撤销</span>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. 【麦克风跟读打分】VoiceReadCard（会读 - 语音识别评测）
// -------------------------------------------------------------
export function VoiceReadCard({
  question,
  locked,
  onComplete,
}: {
  question: VoiceQuestion;
  locked: boolean;
  onComplete: (success: boolean) => void;
}) {
  const word = getWord(question.wordId);
  const [listening, setListening] = useState(false);
  const [evalResult, setEvalResult] = useState<SpeechEvalResult | null>(null);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const supported = useMemo(() => isSpeechRecognitionSupported(), []);

  useEffect(() => {
    speakWord(word.en, false);
    setEvalResult(null);
  }, [word.en]);

  function handleListen() {
    if (locked || listening) return;
    playSfx("tap");
    setListening(true);
    setEvalResult(null);

    const cancel = startVoiceEvaluation(word.en, {
      onStart: () => setListening(true),
      onResult: (res) => {
        setListening(false);
        setEvalResult(res);
        if (res.matched) {
          playSfx(res.stars === 3 ? "win" : "ok");
          window.setTimeout(() => onComplete(true), 1200);
        } else {
          playSfx("bad");
        }
      },
      onError: () => {
        setListening(false);
      },
      onEnd: () => {
        setListening(false);
      },
    });

    // 5秒最长录音保护
    window.setTimeout(() => {
      cancel();
      setListening(false);
    }, 5000);
  }

  function handlePassManually() {
    playSfx("ok");
    setEvalResult({ transcript: word.en, score: 95, stars: 3, matched: true });
    onComplete(true);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 词卡与示范音 */}
      <div className="flex flex-col items-center rounded-2xl bg-surface p-4 shadow-card">
        <div className="size-24 mb-2">
          <WordArt word={word} />
        </div>

        {/* 自然拼读拆节展示 */}
        <div className="flex items-center gap-1.5 my-1">
          {word.chunks.map((chunk, idx) => (
            <span
              key={idx}
              className={cn(
                "rounded-lg px-2.5 py-1 font-display text-2xl font-bold transition-all duration-200",
                highlightIdx === idx
                  ? "bg-coral text-surface scale-110 shadow-md"
                  : "bg-surface-deep text-ink",
              )}
            >
              {chunk.letters}
            </span>
          ))}
        </div>

        <p className="font-display text-3xl font-extrabold tracking-wide text-ink">{word.en}</p>
        <p className="text-sm font-semibold text-ink-soft mb-3">{word.zh.split("；")[0]}</p>

        {/* 听示范与拼读示范 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => speakWord(word.en, false)}
            className="flex items-center gap-1.5 rounded-xl bg-sky-soft px-3 py-1.5 text-sm font-semibold text-ink active:scale-95"
          >
            <Volume2 className="size-4 text-sky" />
            <span>听原声</span>
          </button>
          <button
            type="button"
            onClick={() => speakPhonics(word.chunks, word.en, setHighlightIdx)}
            className="flex items-center gap-1.5 rounded-xl bg-teal-soft px-3 py-1.5 text-sm font-semibold text-ink active:scale-95"
          >
            <Sparkles className="size-4 text-teal" />
            <span>拼读带读</span>
          </button>
        </div>
      </div>

      {/* 麦克风跟读操作区 */}
      <div className="flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          disabled={locked || listening}
          onClick={handleListen}
          className={cn(
            "relative flex size-24 items-center justify-center rounded-full font-display font-semibold text-surface shadow-pop transition-transform active:scale-95",
            listening ? "bg-coral animate-pulse ring-8 ring-coral/30" : "bg-teal",
          )}
          aria-label="点击录音跟读"
        >
          <Mic className="size-10" />
        </button>

        <p className="font-display text-base font-semibold text-ink">
          {listening ? "正在听你说... 请清晰朗读" : "点击麦克风，大声读出单词"}
        </p>

        {/* 打分星星与反馈 */}
        {evalResult ? (
          <div className="flex flex-col items-center gap-1 animate-fadeIn">
            <StarPips value={evalResult.stars} size="md" />
            <p className="font-display text-sm font-bold text-teal">
              {evalResult.stars === 3
                ? "🌟 发音太纯正了！"
                : evalResult.stars === 2
                  ? "👍 读得很清晰，继续保持！"
                  : "💪 再大声读一遍试试看！"}
            </p>
          </div>
        ) : null}

        {/* 兼容兜底：若未授权或不支持语音，提供家长/自主打卡 */}
        <button
          type="button"
          onClick={handlePassManually}
          disabled={locked}
          className="mt-2 text-xs text-ink-soft underline decoration-dashed hover:text-ink"
        >
          我读给爸爸妈妈听过啦（直接通过）
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. 【拍泡泡】BubblePop
// -------------------------------------------------------------
export function BubblePop({
  question,
  locked,
  picked,
  onPick,
}: {
  question: ChoiceQuestion;
  locked: boolean;
  picked: string | null;
  onPick: (option: string) => void;
}) {
  const word = getWord(question.wordId);
  const missed = Boolean(picked && picked !== question.answer && !locked);
  const tones = ["bg-coral", "bg-teal", "bg-sky"] as const;
  useEffect(() => {
    speakWord(word.en, false);
  }, [word.en]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-xl bg-surface p-3 shadow-card">
        <span className="size-16 shrink-0">
          <WordArt word={word} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-semibold">{word.zh.split("；")[0]}</p>
          <p className="text-sm text-ink-soft">拍对的泡泡</p>
        </div>
        <SpeakControls text={word.en} />
      </div>
      <div className="relative min-h-56 overflow-hidden rounded-xl bg-sky-soft px-2 py-4">
        <Burst show={locked && picked === question.answer} />
        <div className="flex h-full items-end justify-around">
          {question.options.map((option, i) => {
            const correct = option === question.answer;
            const isPicked = picked === option;
            const showCorrect = locked && correct;
            const showWrong = isPicked && !correct;
            const hint = missed && correct;
            return (
              <button
                key={option}
                type="button"
                disabled={locked || (isPicked && !correct)}
                onClick={() => onPick(option)}
                style={{ animationDelay: `${i * 180}ms` }}
                className={cn(
                  "bob flex size-24 flex-col items-center justify-center rounded-full font-display text-xl font-semibold text-surface shadow-pop transition-transform duration-150 active:scale-[0.96]",
                  tones[i % tones.length],
                  showCorrect && "squash",
                  showWrong && "shake-x opacity-40",
                  hint && "hint-pulse",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
      {missed ? <p className="text-center text-sm font-medium text-teal">拍还在跳的那个</p> : null}
    </div>
  );
}

// -------------------------------------------------------------
// 6. 【翻牌消消乐】MatchView
// -------------------------------------------------------------
type Face = { key: string; wordId: string; face: "en" | "zh" };

export function MatchView({
  wordIds,
  onDone,
}: {
  wordIds: string[];
  onDone: (misses: number) => void;
}) {
  const cards = useMemo<Face[]>(() => {
    const faces: Face[] = wordIds.flatMap((id) => [
      { key: `${id}-en`, wordId: id, face: "en" as const },
      { key: `${id}-zh`, wordId: id, face: "zh" as const },
    ]);
    return [...faces].sort(() => Math.random() - 0.5);
  }, [wordIds]);

  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [lock, setLock] = useState(false);
  const [misses, setMisses] = useState(0);

  function flip(card: Face) {
    if (lock || matched.has(card.wordId) || open.includes(card.key)) return;
    playSfx("flip");
    const next = [...open, card.key];
    setOpen(next);
    if (next.length < 2) return;
    const a = cards.find((c) => c.key === next[0]);
    const b = cards.find((c) => c.key === next[1]);
    if (!a || !b) return;
    setLock(true);
    if (a.wordId === b.wordId && a.face !== b.face) {
      playSfx("ok");
      const word = getWord(a.wordId);
      speakWord(word.en, false);
      const nextMatched = new Set(matched).add(a.wordId);
      window.setTimeout(() => {
        setMatched(nextMatched);
        setOpen([]);
        setLock(false);
        if (nextMatched.size === wordIds.length) onDone(misses);
      }, 380);
    } else {
      playSfx("bad");
      setMisses((m) => m + 1);
      window.setTimeout(() => {
        setOpen([]);
        setLock(false);
      }, 600);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center font-display text-lg font-semibold">翻开一样的</p>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const isOpen = open.includes(card.key) || matched.has(card.wordId);
          const word = getWord(card.wordId);
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => flip(card)}
              className={cn(
                "relative min-h-24 overflow-hidden rounded-xl shadow-card transition-transform duration-150 ease-out active:scale-[0.96]",
                matched.has(card.wordId) ? "bg-teal-soft" : "bg-surface",
              )}
            >
              <span
                className={cn(
                  "flex h-full min-h-24 items-center justify-center px-3 py-4",
                  isOpen ? "opacity-100" : "invisible",
                )}
                aria-hidden={!isOpen}
              >
                {card.face === "en" ? (
                  <span className="flex flex-col items-center gap-1">
                    <span className="size-12">
                      <WordArt word={word} />
                    </span>
                    <span className="font-display text-2xl font-semibold">{word.en}</span>
                  </span>
                ) : (
                  <span className="font-display text-xl font-semibold">{word.zh.split("；")[0]}</span>
                )}
              </span>
              {!isOpen ? (
                <span className="absolute inset-0 flex items-center justify-center bg-coral font-display text-3xl font-semibold text-surface">
                  ?
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function foxLine(mood: FoxMood): string {
  if (mood === "yum") return "好好吃！松果真香～";
  if (mood === "sad") return "再来一次，小狐陪着你！";
  if (mood === "wow") return "太棒啦！连对超厉害！";
  return "小狐想吃松果，快来答题～";
}
