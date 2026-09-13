import type { ReactNode } from "react";
import type { Word } from "@/lib/words";

type Props = { word: Word; className?: string };

function Frame({
  children,
  className,
  fill,
}: {
  children: ReactNode;
  className?: string;
  fill: string;
}) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="160" height="160" rx="32" className={fill} />
      {children}
    </svg>
  );
}

export function WordArt({ word, className = "size-full" }: Props) {
  switch (word.id) {
    case "name":
      return (
        <Frame className={className} fill="fill-sky-soft">
          <rect x="38" y="44" width="84" height="78" rx="10" className="fill-surface" />
          <rect x="46" y="56" width="40" height="8" rx="4" className="fill-ink" />
          <rect x="46" y="72" width="68" height="6" rx="3" className="fill-line" />
          <rect x="46" y="86" width="54" height="6" rx="3" className="fill-line" />
          <circle cx="108" cy="108" r="16" className="fill-coral" />
          <path
            d="M100 108h16M108 100v16"
            className="stroke-surface"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </Frame>
      );
    case "nice":
      return (
        <Frame className={className} fill="fill-moss-soft">
          <path
            d="M80 118c-28-18-44-34-44-54 0-16 12-28 28-28 8 0 14 4 16 10 2-6 8-10 16-10 16 0 28 12 28 28 0 20-16 36-44 54Z"
            className="fill-coral"
          />
        </Frame>
      );
    case "ear":
      return (
        <Frame className={className} fill="fill-peach">
          <path
            d="M92 36c22 8 32 28 32 52s-12 46-34 50c-8 2-14-4-14-12V50c0-10 6-16 16-14Z"
            className="fill-surface"
          />
          <path
            d="M96 56c12 6 18 18 18 32 0 16-8 28-20 32"
            className="stroke-coral"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="90" cy="84" r="7" className="fill-coral" />
        </Frame>
      );
    case "hand":
      return (
        <Frame className={className} fill="fill-coral-soft">
          <path
            d="M70 118c-18-4-26-22-18-40l8-18c3-6 12-6 14-1l4 16 2-28c1-7 10-8 12-1l3 32 6-22c3-8 13-6 13 2v40c0 18-14 28-32 28h-12Z"
            className="fill-peach"
          />
          <path
            d="M78 58c1-12 8-28 18-32 6-2 10 4 8 10-4 10-12 18-18 24"
            className="fill-peach"
          />
        </Frame>
      );
    case "eye":
      return (
        <Frame className={className} fill="fill-sky-soft">
          <path
            d="M24 80c20-28 44-40 56-40s36 12 56 40c-20 28-44 40-56 40S44 108 24 80Z"
            className="fill-surface"
          />
          <circle cx="80" cy="80" r="22" className="fill-sky" />
          <circle cx="80" cy="80" r="10" className="fill-ink" />
          <circle cx="88" cy="72" r="4" className="fill-surface" />
        </Frame>
      );
    case "mouth":
      return (
        <Frame className={className} fill="fill-coral-soft">
          <ellipse cx="80" cy="86" rx="46" ry="28" className="fill-coral" />
          <path
            d="M40 82c12 22 28 30 40 30s28-8 40-30"
            className="fill-surface"
          />
          <rect x="58" y="54" width="44" height="16" rx="6" className="fill-surface" />
        </Frame>
      );
    case "arm":
      return (
        <Frame className={className} fill="fill-teal-soft">
          <path
            d="M38 108c8-28 22-52 40-70 6-6 16-2 16 6 0 14-6 28-4 42 16-10 34-8 44 2 8 8 2 20-8 20H58c-10 0-22 6-26 12-3 4-10 2-8-12Z"
            className="fill-peach"
          />
          <circle cx="118" cy="92" r="10" className="fill-coral" />
        </Frame>
      );
    case "can":
      return (
        <Frame className={className} fill="fill-moss-soft">
          <rect x="46" y="40" width="68" height="80" rx="14" className="fill-teal" />
          <rect x="58" y="56" width="44" height="12" rx="6" className="fill-surface" />
          <circle cx="80" cy="92" r="14" className="fill-surface" />
          <path
            d="M74 92l6 6 10-12"
            className="stroke-teal"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Frame>
      );
    case "share":
      return (
        <Frame className={className} fill="fill-sky-soft">
          <circle cx="56" cy="80" r="16" className="fill-coral" />
          <circle cx="108" cy="56" r="12" className="fill-teal" />
          <circle cx="108" cy="104" r="12" className="fill-sky" />
          <path
            d="M70 74l26-14M70 86l26 14"
            className="stroke-ink"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </Frame>
      );
    case "smile":
      return (
        <Frame className={className} fill="fill-peach">
          <circle cx="80" cy="80" r="44" className="fill-surface" />
          <circle cx="64" cy="70" r="6" className="fill-ink" />
          <circle cx="96" cy="70" r="6" className="fill-ink" />
          <path
            d="M56 92c8 16 24 22 24 22s16-6 24-22"
            className="stroke-coral"
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </Frame>
      );
    case "listen":
      return (
        <Frame className={className} fill="fill-teal-soft">
          <path
            d="M54 58v44c0 8 8 14 16 10l28-16V64L70 48c-8-4-16 2-16 10Z"
            className="fill-ink"
          />
          <path
            d="M108 58c10 8 16 20 16 22s-6 14-16 22"
            className="stroke-teal"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M118 46c16 12 22 28 22 34s-6 22-22 34"
            className="stroke-teal"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.55"
          />
        </Frame>
      );
    case "help":
      return (
        <Frame className={className} fill="fill-coral-soft">
          <circle cx="62" cy="70" r="18" className="fill-peach" />
          <circle cx="100" cy="70" r="18" className="fill-peach" />
          <path
            d="M44 118c4-22 14-30 18-30h38c4 0 14 8 18 30"
            className="fill-teal"
          />
          <path
            d="M78 86v-8"
            className="stroke-ink"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </Frame>
      );
    case "say":
      return (
        <Frame className={className} fill="fill-sky-soft">
          <path
            d="M36 52h70c10 0 18 8 18 18v28c0 10-8 18-18 18H72l-20 16v-16H36c-10 0-18-8-18-18V70c0-10 8-18 18-18Z"
            className="fill-surface"
          />
          <circle cx="58" cy="82" r="5" className="fill-coral" />
          <circle cx="76" cy="82" r="5" className="fill-coral" />
          <circle cx="94" cy="82" r="5" className="fill-coral" />
        </Frame>
      );
    case "friend":
      return (
        <Frame className={className} fill="fill-moss-soft">
          <circle cx="58" cy="62" r="16" className="fill-peach" />
          <circle cx="102" cy="62" r="16" className="fill-coral" />
          <path d="M34 118c2-22 12-34 24-34h8c12 0 20 12 22 22" className="fill-sky" />
          <path d="M126 118c-2-22-12-34-24-34h-8c-8 0-14 8-18 18" className="fill-teal" />
        </Frame>
      );
    case "good":
      return (
        <Frame className={className} fill="fill-teal-soft">
          <path
            d="M68 118V70c0-6 4-10 10-10 8 0 10 8 10 8s4-14 14-14c10 0 12 10 12 16 0 0 6-10 14-8 8 2 8 12 8 18v38H68Z"
            className="fill-coral"
          />
          <rect x="48" y="70" width="20" height="48" rx="6" className="fill-ink" />
        </Frame>
      );
    case "mum":
      return (
        <Frame className={className} fill="fill-coral-soft">
          <circle cx="80" cy="58" r="22" className="fill-peach" />
          <path
            d="M48 48c4-18 18-24 32-20 10 4 16 4 24 0 8-4 16 6 12 16-8 18-22 22-36 18"
            className="fill-ink"
          />
          <path d="M48 124c4-28 14-40 32-40s28 12 32 40" className="fill-sky" />
        </Frame>
      );
    case "dad":
      return (
        <Frame className={className} fill="fill-sky-soft">
          <circle cx="80" cy="60" r="22" className="fill-peach" />
          <rect x="56" y="40" width="48" height="12" rx="4" className="fill-ink" />
          <path d="M46 124c4-28 16-40 34-40s30 12 34 40" className="fill-teal" />
          <path
            d="M68 68h6M86 68h6"
            className="stroke-ink"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </Frame>
      );
    case "grandma":
      return (
        <Frame className={className} fill="fill-peach">
          <circle cx="80" cy="62" r="22" className="fill-surface" />
          <path
            d="M50 58c6-24 18-30 30-30s24 6 30 30v8c-8 10-20 14-30 14s-22-4-30-14V58Z"
            className="fill-ink-soft"
          />
          <path d="M48 126c4-26 14-38 32-38s28 12 32 38" className="fill-coral" />
          <circle cx="68" cy="68" r="2.5" className="fill-ink" />
          <circle cx="92" cy="68" r="2.5" className="fill-ink" />
        </Frame>
      );
    case "grandpa":
      return (
        <Frame className={className} fill="fill-teal-soft">
          <circle cx="80" cy="60" r="22" className="fill-peach" />
          <path
            d="M54 52c4-16 14-22 26-22s22 6 26 22v6H54v-6Z"
            className="fill-ink-soft"
          />
          <rect x="58" y="62" width="44" height="8" rx="4" className="fill-sky" />
          <path d="M46 126c4-26 16-38 34-38s30 12 34 38" className="fill-ink" />
        </Frame>
      );
    default:
      return (
        <Frame className={className} fill="fill-surface-2">
          <text
            x="80"
            y="92"
            textAnchor="middle"
            className="fill-ink"
            fontSize="36"
            fontWeight="700"
          >
            {word.en.slice(0, 1).toUpperCase()}
          </text>
        </Frame>
      );
  }
}

export type FoxMood = "idle" | "yum" | "sad" | "wow";

export function FoxMascot({
  className = "size-28",
  mood = "idle",
}: {
  className?: string;
  mood?: FoxMood;
}) {
  const mouth =
    mood === "yum"
      ? "M68 100c6 10 12 12 12 12s6-2 12-12"
      : mood === "sad"
        ? "M68 108c6-8 12-10 12-10s6 2 12 10"
        : mood === "wow"
          ? null
          : "M80 98c4 8 12 10 16 8";
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden focusable="false">
      <ellipse cx="80" cy="148" rx="46" ry="8" className="fill-paper-deep" />
      <path d="M40 78c0-28 18-50 40-50s40 22 40 50-18 52-40 52-40-24-40-52Z" className="fill-coral" />
      <path d="M58 92c6 16 14 22 22 22s16-6 22-22" className="fill-surface" />
      <path
        d={mood === "sad" ? "M36 50l24 18-16-32c-6-2-14 4-8 14Z" : "M32 42l28 22-18-34c-6-2-14 4-10 12Z"}
        className="fill-coral"
      />
      <path
        d={mood === "sad" ? "M124 50l-24 18 16-32c6-2 14 4 8 14Z" : "M128 42l-28 22 18-34c6-2 14 4 10 12Z"}
        className="fill-coral"
      />
      <path d="M44 48l12 14-8-20" className="fill-surface" />
      <path d="M116 48l-12 14 8-20" className="fill-surface" />
      {mood === "yum" ? (
        <>
          <path d="M56 78c4 6 10 8 12 0" className="stroke-ink" fill="none" strokeWidth="4" strokeLinecap="round" />
          <path d="M92 78c4 6 10 8 12 0" className="stroke-ink" fill="none" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="64" cy="78" r={mood === "wow" ? 8 : 6} className="fill-ink" />
          <circle cx="96" cy="78" r={mood === "wow" ? 8 : 6} className="fill-ink" />
          <circle cx="66" cy="76" r="2" className="fill-surface" />
          <circle cx="98" cy="76" r="2" className="fill-surface" />
        </>
      )}
      {mood === "wow" ? (
        <ellipse cx="80" cy="102" rx="8" ry="10" className="fill-ink" />
      ) : mouth ? (
        <>
          <ellipse cx="80" cy="94" rx="6" ry="4" className="fill-ink" />
          <path d={mouth} className="stroke-ink" fill="none" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
}

