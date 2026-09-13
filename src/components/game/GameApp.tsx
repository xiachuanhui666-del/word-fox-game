import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Sparkles, Volume2, Snail, Mic, BookOpen, User, Ear, Puzzle, Flame } from "lucide-react";
import { playSfx, setMuted as setAudioMuted, speakWord, stopSpeech, unlockAudio } from "@/lib/audio";
import {
  buildMatch,
  buildQuestions,
  starsForScore,
  type PlayMode,
  type Question,
  type UnitFilter,
} from "@/lib/quiz";
import { WORDS, getWord, wordsForUnit, UNITS } from "@/lib/words";
import { knownCount, useProgress } from "@/store/progress";
import { cn } from "@/lib/utils";
import { FoxMascot, WordArt, type FoxMood } from "./WordArt";
import {
  BubblePop,
  EasyChoice,
  FoxStage,
  MatchView,
  TeachCard,
  ListenFirstCard,
  SpellingTileCard,
  VoiceReadCard,
  foxLine,
} from "./PlayViews";
import { IconButton, MuteToggle, PrimaryButton, ProgressDots, StarPips } from "./ui";

type Screen = "home" | "play" | "result" | "book" | "parent";

export function GameApp() {
  const hydrate = useProgress((s) => s.hydrate);
  const muted = useProgress((s) => s.muted);
  const setMuted = useProgress((s) => s.setMuted);
  const stars = useProgress((s) => s.stars);
  const berries = useProgress((s) => s.berries);
  const streak = useProgress((s) => s.streak);
  const mastery = useProgress((s) => s.mastery);
  const misses = useProgress((s) => s.misses);
  const rounds = useProgress((s) => s.rounds);
  const recordAnswer = useProgress((s) => s.recordAnswer);
  const completeRound = useProgress((s) => s.completeRound);
  const feedFox = useProgress((s) => s.feedFox);
  const reset = useProgress((s) => s.reset);

  const [screen, setScreen] = useState<Screen>("home");
  const [unit, setUnit] = useState<UnitFilter>(1);
  const [mode, setMode] = useState<PlayMode>("quest");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongOnce, setWrongOnce] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [earned, setEarned] = useState<2 | 3>(3);
  const [combo, setCombo] = useState(0);
  const [matchIds, setMatchIds] = useState<string[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [homeFoxMood, setHomeFoxMood] = useState<FoxMood>("idle");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setAudioMuted(muted);
  }, [muted]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") unlockAudio();
      else stopSpeech();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const known = knownCount(mastery);
  const current = questions[qIndex];

  function start(nextMode: PlayMode, nextUnit: UnitFilter) {
    unlockAudio();
    playSfx("tap");
    stopSpeech();
    setMode(nextMode);
    setUnit(nextUnit);
    setQIndex(0);
    setCorrectCount(0);
    setWrongOnce(false);
    setPicked(null);
    setLocked(false);
    setCombo(0);

    if (nextMode === "match") {
      setMatchIds(buildMatch(nextUnit).wordIds);
      setQuestions([]);
    } else {
      setQuestions(buildQuestions(nextMode, nextUnit, useProgress.getState().mastery));
      setMatchIds([]);
    }
    setScreen("play");
  }

  function finishRound(correct: number, total: number) {
    const star = starsForScore(correct, total);
    setCorrectCount(correct);
    setEarned(star);
    completeRound(star);
    playSfx(star === 3 ? "win" : "star");
    setScreen("result");
  }

  function advance(wasCorrect: boolean) {
    const total = mode === "match" ? matchIds.length : questions.length;
    const nextCorrect = correctCount + (wasCorrect ? 1 : 0);
    setCorrectCount(nextCorrect);
    setWrongOnce(false);
    setPicked(null);
    setLocked(false);
    if (qIndex + 1 >= total && mode !== "match") {
      finishRound(nextCorrect, total);
      return;
    }
    setQIndex((i) => i + 1);
  }

  function handlePick(option: string) {
    if (!current || locked) return;
    const ok = option === current.answer;
    if (!ok) {
      playSfx("bad");
      setPicked(option);
      setWrongOnce(true);
      setCombo(0);
      return;
    }
    setPicked(option);
    setLocked(true);
    recordAnswer(current.wordId, !wrongOnce);
    playSfx(current.kind === "bubble" ? "pop" : "ok");
    speakWord(getWord(current.wordId).en, false);
    if (!wrongOnce) setCombo((c) => c + 1);
    window.setTimeout(() => advance(!wrongOnce), 850);
  }

  function handleSpellComplete(success: boolean) {
    if (!current || locked) return;
    if (success) {
      setLocked(true);
      recordAnswer(current.wordId, !wrongOnce);
      if (!wrongOnce) setCombo((c) => c + 1);
      window.setTimeout(() => advance(!wrongOnce), 850);
    }
  }

  function handleVoiceComplete(success: boolean) {
    if (!current || locked) return;
    if (success) {
      setLocked(true);
      recordAnswer(current.wordId, true);
      setCombo((c) => c + 1);
      window.setTimeout(() => advance(true), 850);
    }
  }

  function handleFeedFox() {
    if (berries <= 0) {
      playSfx("bad");
      return;
    }
    const ok = feedFox();
    if (ok) {
      playSfx("crunch");
      setHomeFoxMood("yum");
      window.setTimeout(() => setHomeFoxMood("idle"), 1500);
    }
  }

  const foxMood: FoxMood =
    locked && (picked === current?.answer || current?.kind === "spell" || current?.kind === "voice")
      ? combo >= 2
        ? "wow"
        : "yum"
      : wrongOnce
        ? "sad"
        : "idle";

  return (
    <Shell>
      {screen === "home" ? (
        <HomeScreen
          stars={stars}
          berries={berries}
          known={known}
          streak={streak}
          muted={muted}
          unit={unit}
          foxMood={homeFoxMood}
          onMute={() => setMuted(!muted)}
          onUnit={setUnit}
          onStart={(m) => start(m, unit)}
          onFeedFox={handleFeedFox}
          onBook={() => setScreen("book")}
          onParent={() => setScreen("parent")}
        />
      ) : null}

      {screen === "book" ? (
        <BookScreen
          mastery={mastery}
          onBack={() => setScreen("home")}
        />
      ) : null}

      {screen === "parent" ? (
        <ParentScreen
          stars={stars}
          berries={berries}
          streak={streak}
          rounds={rounds}
          known={known}
          misses={misses}
          confirmReset={confirmReset}
          onConfirmReset={setConfirmReset}
          onReset={() => {
            reset();
            setConfirmReset(false);
          }}
          onBack={() => setScreen("home")}
        />
      ) : null}

      {screen === "play" ? (
        <PlayScreen
          mode={mode}
          qIndex={qIndex}
          total={mode === "match" ? matchIds.length : questions.length}
          muted={muted}
          current={current}
          matchIds={matchIds}
          picked={picked}
          locked={locked}
          foxMood={foxMood}
          onMute={() => setMuted(!muted)}
          onExit={() => {
            stopSpeech();
            setScreen("home");
          }}
          onPick={handlePick}
          onSpellComplete={handleSpellComplete}
          onVoiceComplete={handleVoiceComplete}
          onMatchDone={(m) => {
            matchIds.forEach((id) => recordAnswer(id, true));
            const ok = Math.max(1, matchIds.length - Math.min(m, matchIds.length - 1));
            finishRound(ok, matchIds.length);
          }}
        />
      ) : null}

      {screen === "result" ? (
        <ResultScreen
          earned={earned}
          correct={correctCount}
          total={mode === "match" ? matchIds.length : questions.length}
          stars={stars}
          berries={berries}
          known={known}
          onAgain={() => start(mode, unit)}
          onHome={() => setScreen("home")}
        />
      ) : null}
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper text-ink selection:bg-coral-soft">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
        {children}
      </div>
    </div>
  );
}

function HomeScreen({
  stars,
  berries,
  known,
  streak,
  muted,
  unit,
  foxMood,
  onMute,
  onUnit,
  onStart,
  onFeedFox,
  onBook,
  onParent,
}: {
  stars: number;
  berries: number;
  known: number;
  streak: number;
  muted: boolean;
  unit: UnitFilter;
  foxMood: FoxMood;
  onMute: () => void;
  onUnit: (u: UnitFilter) => void;
  onStart: (mode: PlayMode) => void;
  onFeedFox: () => void;
  onBook: () => void;
  onParent: () => void;
}) {
  const hungry = berries > 0;
  return (
    <div className="flex flex-1 flex-col gap-3.5 pb-2">
      {/* 顶部状态栏：星星、松果、打卡天数与静音 */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 星星 */}
          <div className="flex items-center gap-1.5 rounded-xl bg-surface px-2.5 py-1.5 shadow-card">
            <svg viewBox="0 0 24 24" className="size-4 fill-star text-star" aria-hidden>
              <path d="M12 3.2 14.6 9l6.4.6-4.8 4.2 1.5 6.2L12 16.8 6.3 20l1.5-6.2L3 9.6 9.4 9 12 3.2Z" />
            </svg>
            <span className="tabular-nums text-sm font-bold">{stars}</span>
          </div>

          {/* 浆果/松果 (喂食道具) */}
          <button
            type="button"
            onClick={onFeedFox}
            className="flex items-center gap-1.5 rounded-xl bg-surface px-2.5 py-1.5 shadow-card active:scale-95 transition-transform"
            title="点击喂给小狐狸"
          >
            <span className="text-sm">🌰</span>
            <span className="tabular-nums text-sm font-bold text-coral">{berries}</span>
          </button>

          {/* 连胜天数 */}
          {streak > 0 ? (
            <div className="flex items-center gap-1 rounded-xl bg-surface px-2 py-1.5 shadow-card text-xs font-bold text-coral">
              <Flame className="size-3.5 fill-coral" />
              <span>{streak}天</span>
            </div>
          ) : null}
        </div>

        <MuteToggle muted={muted} onToggle={onMute} />
      </header>

      {/* 小狐狸吉祥物与喂食互动区 */}
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <FoxMascot
            className={cn("size-28", foxMood === "yum" ? "yum-bounce" : "floaty")}
            mood={foxMood}
          />
          {foxMood === "yum" ? (
            <span className="yum-pop pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 font-display text-sm font-bold text-coral">
              好吃！😋
            </span>
          ) : null}
        </div>

        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">喂小狐学英语</h1>
        
        {/* 喂小狐狸快捷按钮 */}
        <div className="mt-1.5 flex items-center gap-2">
          <button
            type="button"
            onClick={onFeedFox}
            className="inline-flex items-center gap-1.5 rounded-full bg-coral-soft px-3.5 py-1 font-display text-xs font-bold text-coral transition-transform active:scale-95"
          >
            <span>🌰 喂它松果 (剩{berries}颗)</span>
          </button>
        </div>
      </div>

      {/* 单元切换 Tab */}
      <div className="flex rounded-xl bg-surface p-1 shadow-card">
        {UNITS.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => {
              playSfx("tap");
              onUnit(u.id);
            }}
            className={cn(
              "flex-1 rounded-lg py-2 text-center font-display text-sm font-bold transition-colors active:scale-[0.98]",
              unit === u.id
                ? "bg-coral text-surface shadow-sm"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {u.title}
          </button>
        ))}
      </div>

      {/* 核心主打：【综合大闯关】(听·说·写·练闭环) */}
      <button
        type="button"
        onClick={() => onStart("quest")}
        className="group relative flex min-h-16 w-full items-center justify-between rounded-2xl bg-coral px-5 py-4 shadow-pop transition-transform duration-150 active:scale-[0.97]"
      >
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-5 text-yellow-200 animate-spin-slow" />
            <span className="font-display text-xl font-bold text-surface">闯关喂小狐</span>
          </div>
          <span className="text-xs font-medium text-surface/80">听音 · 认词 · 拼写 · 跟读综合练</span>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-surface/20 text-surface">
          <ArrowLeft className="size-5 rotate-180" />
        </div>
      </button>

      {/* 听·说·写三维专项游戏网格 */}
      <div className="grid grid-cols-3 gap-2">
        {/* 听懂：纯听音 */}
        <button
          type="button"
          onClick={() => onStart("listen")}
          className="flex flex-col items-center justify-center rounded-xl bg-sky p-3 text-surface shadow-card transition-transform active:scale-95"
        >
          <Ear className="size-6 mb-1" />
          <span className="font-display text-sm font-bold">小耳朵</span>
          <span className="text-[10px] opacity-80">纯听音辨析</span>
        </button>

        {/* 会写：积木拼词 */}
        <button
          type="button"
          onClick={() => onStart("spell")}
          className="flex flex-col items-center justify-center rounded-xl bg-teal p-3 text-surface shadow-card transition-transform active:scale-95"
        >
          <Puzzle className="size-6 mb-1" />
          <span className="font-display text-sm font-bold">拼字母</span>
          <span className="text-[10px] opacity-80">动手拼单词</span>
        </button>

        {/* 会读：麦克风跟读 */}
        <button
          type="button"
          onClick={() => onStart("voice")}
          className="flex flex-col items-center justify-center rounded-xl bg-moss p-3 text-surface shadow-card transition-transform active:scale-95"
        >
          <Mic className="size-6 mb-1" />
          <span className="font-display text-sm font-bold">开口说</span>
          <span className="text-[10px] opacity-80">录音大挑战</span>
        </button>
      </div>

      {/* 趣味消除玩法 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onStart("bubbles")}
          className="flex items-center justify-center gap-2 rounded-xl bg-surface p-3 font-display text-sm font-bold text-ink shadow-card active:scale-[0.96]"
        >
          <span>🎈 拍泡泡</span>
        </button>
        <button
          type="button"
          onClick={() => onStart("match")}
          className="flex items-center justify-center gap-2 rounded-xl bg-surface p-3 font-display text-sm font-bold text-ink shadow-card active:scale-[0.96]"
        >
          <span>🎴 翻牌消消乐</span>
        </button>
      </div>

      {/* 底部功能栏：词汇贴纸墙与家长中心 */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBook}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-surface p-2.5 text-xs font-semibold text-ink shadow-card active:scale-95"
        >
          <BookOpen className="size-4 text-sky" />
          <span>单词贴纸墙 ({known})</span>
        </button>

        <button
          type="button"
          onClick={onParent}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-surface p-2.5 text-xs font-semibold text-ink-soft shadow-card active:scale-95"
        >
          <User className="size-4" />
          <span>家长看板</span>
        </button>
      </div>
    </div>
  );
}

function BookScreen({
  mastery,
  onBack,
}: {
  mastery: Record<string, number>;
  onBack: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? getWord(openId) : null;
  return (
    <div className="flex flex-1 flex-col gap-4">
      <TopBar title="单词贴纸墙" onBack={onBack} />
      {open ? (
        <div className="rounded-2xl bg-surface p-4 shadow-card">
          <TeachCard word={open} title="单词卡" doneLabel="收进书包" onDone={() => setOpenId(null)} />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {WORDS.map((w) => {
            const on = (mastery[w.id] ?? 0) >= 1;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  playSfx("tap");
                  setOpenId(w.id);
                }}
                className={cn(
                  "flex flex-col items-center rounded-xl bg-surface p-2 shadow-card active:scale-95 transition-transform",
                  !on && "opacity-40",
                )}
              >
                <div className="size-16">
                  <WordArt word={w} />
                </div>
                <p className="mt-1 truncate font-display text-sm font-bold">{on ? w.en : "？"}</p>
                <p className="text-[11px] text-ink-soft truncate">{on ? w.zh.split("；")[0] : "未解锁"}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ParentScreen({
  stars,
  berries,
  streak,
  rounds,
  known,
  misses,
  confirmReset,
  onConfirmReset,
  onReset,
  onBack,
}: {
  stars: number;
  berries: number;
  streak: number;
  rounds: number;
  known: number;
  misses: Record<string, number>;
  confirmReset: boolean;
  onConfirmReset: (v: boolean) => void;
  onReset: () => void;
  onBack: () => void;
}) {
  const weak = useMemo(
    () =>
      WORDS.filter((w) => (misses[w.id] ?? 0) > 0).sort(
        (a, b) => (misses[b.id] ?? 0) - (misses[a.id] ?? 0),
      ),
    [misses],
  );
  return (
    <div className="flex flex-1 flex-col gap-4">
      <TopBar title="家长看板" onBack={onBack} />
      <div className="grid grid-cols-4 gap-2">
        {[
          { k: "点心星", v: stars },
          { k: "松果", v: berries },
          { k: "打卡天", v: streak },
          { k: "已掌握", v: `${known}/${WORDS.length}` },
        ].map((s) => (
          <div key={s.k} className="rounded-xl bg-surface px-2 py-3 text-center shadow-card">
            <p className="font-display text-lg font-bold tabular-nums">{s.v}</p>
            <p className="text-[11px] text-ink-soft">{s.k}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-surface p-4 shadow-card">
        <p className="font-display font-bold text-ink">4 步学习闭环设计</p>
        <ul className="mt-2 space-y-2 text-xs leading-relaxed text-ink-soft">
          <li>🎧 <b>听得懂</b>：隐藏英文字形，先听美式纯正原声选图卡。</li>
          <li>🗣️ <b>会开口</b>：自然拼读音节分块带读，支持麦克风跟读打分。</li>
          <li>✍️ <b>会拼写</b>：字母积木磁吸拼装，拒绝机械死记硬背。</li>
          <li>🦊 <b>动力机制</b>：通关掉落松果喂小狐狸，正向激励孩子自驱学习。</li>
        </ul>
      </div>

      <div className="rounded-2xl bg-surface p-4 shadow-card">
        <p className="font-display font-bold text-ink">易错词加强训练</p>
        {weak.length === 0 ? (
          <p className="mt-2 text-xs text-ink-soft">太棒了，目前还没有错误记录！</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {weak.slice(0, 6).map((w) => (
              <li key={w.id} className="flex justify-between text-xs items-center">
                <span className="font-semibold text-ink">
                  {w.en} · {w.zh.split("；")[0]}
                </span>
                <span className="rounded-md bg-coral-soft px-2 py-0.5 font-medium text-coral">
                  错 {misses[w.id] ?? 0} 次
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {confirmReset ? (
        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={() => onConfirmReset(false)}
            className="min-h-12 flex-1 rounded-xl bg-surface font-semibold shadow-card text-sm"
          >
            取消
          </button>
          <PrimaryButton onClick={onReset} className="text-sm">确认清空</PrimaryButton>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onConfirmReset(true)}
          className="mt-auto min-h-11 text-xs text-ink-soft hover:text-coral"
        >
          清空学习记录
        </button>
      )}
    </div>
  );
}

function PlayScreen({
  mode,
  qIndex,
  total,
  muted,
  current,
  matchIds,
  picked,
  locked,
  foxMood,
  onMute,
  onExit,
  onPick,
  onSpellComplete,
  onVoiceComplete,
  onMatchDone,
}: {
  mode: PlayMode;
  qIndex: number;
  total: number;
  muted: boolean;
  current: Question | undefined;
  matchIds: string[];
  picked: string | null;
  locked: boolean;
  foxMood: FoxMood;
  onMute: () => void;
  onExit: () => void;
  onPick: (option: string) => void;
  onSpellComplete: (success: boolean) => void;
  onVoiceComplete: (success: boolean) => void;
  onMatchDone: (misses: number) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <header className="flex items-center justify-between">
        <IconButton label="返回" onClick={onExit}>
          <ArrowLeft className="size-5" />
        </IconButton>
        {mode === "match" ? (
          <p className="font-display text-sm font-bold">翻牌消消乐</p>
        ) : (
          <ProgressDots current={qIndex} total={total} />
        )}
        <MuteToggle muted={muted} onToggle={onMute} />
      </header>

      {mode !== "match" ? (
        <FoxStage mood={foxMood} line={foxLine(foxMood)} yum={foxMood === "yum" || foxMood === "wow"} />
      ) : null}

      <div className="flex-1">
        {mode === "match" ? (
          <MatchView wordIds={matchIds} onDone={onMatchDone} />
        ) : current?.kind === "listen" ? (
          <ListenFirstCard
            key={`${qIndex}-${current.wordId}`}
            question={current}
            locked={locked}
            picked={picked}
            onPick={onPick}
          />
        ) : current?.kind === "spell" ? (
          <SpellingTileCard
            key={`${qIndex}-${current.wordId}`}
            question={current}
            locked={locked}
            onComplete={onSpellComplete}
          />
        ) : current?.kind === "voice" ? (
          <VoiceReadCard
            key={`${qIndex}-${current.wordId}`}
            question={current}
            locked={locked}
            onComplete={onVoiceComplete}
          />
        ) : current?.kind === "bubble" ? (
          <BubblePop
            key={`${qIndex}-${current.wordId}`}
            question={current}
            locked={locked}
            picked={picked}
            onPick={onPick}
          />
        ) : current ? (
          <EasyChoice
            key={`${qIndex}-${current.wordId}`}
            question={current}
            locked={locked}
            picked={picked}
            onPick={onPick}
          />
        ) : null}
      </div>
    </div>
  );
}

function ResultScreen({
  earned,
  correct,
  total,
  stars,
  berries,
  known,
  onAgain,
  onHome,
}: {
  earned: 2 | 3;
  correct: number;
  total: number;
  stars: number;
  berries: number;
  known: number;
  onAgain: () => void;
  onHome: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <FoxMascot className="size-32 yum-bounce" mood="yum" />
      <h2 className="font-display text-3xl font-extrabold text-ink">
        {earned === 3 ? "小狐吃饱啦！" : "小狐吃到松果啦！"}
      </h2>
      <StarPips value={earned} />
      <p className="text-sm font-medium text-ink-soft">
        本局答对 {correct}/{total} · 获得 {earned} 颗松果🌰
      </p>
      <div className="flex w-full flex-col gap-2.5 mt-2">
        <PrimaryButton className="min-h-14 text-lg" onClick={onAgain}>
          再来一关
        </PrimaryButton>
        <button
          type="button"
          onClick={onHome}
          className="min-h-11 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          返回首页喂小狐
        </button>
      </div>
    </div>
  );
}

function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="flex items-center gap-3">
      <IconButton label="返回" onClick={onBack}>
        <ArrowLeft className="size-5" />
      </IconButton>
      <h1 className="font-display text-xl font-bold">{title}</h1>
    </header>
  );
}
