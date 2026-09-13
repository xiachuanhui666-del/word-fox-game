import type { CSSProperties, ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { chunkTone, type ChunkTone } from "@/lib/words";

export function ChunkTile({
  letters,
  ipa,
  tone,
  size = "md",
  dimmed = false,
  onClick,
  selected = false,
}: {
  letters: string;
  ipa?: string;
  tone: ChunkTone;
  size?: "sm" | "md" | "lg";
  dimmed?: boolean;
  onClick?: () => void;
  selected?: boolean;
}) {
  const toneClass = {
    teal: "bg-teal text-surface",
    coral: "bg-coral text-surface",
    sky: "bg-sky text-surface",
    moss: "bg-moss text-surface",
  }[tone];
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex flex-col items-center justify-center rounded-md font-display font-semibold tracking-wide shadow-card transition-transform duration-150 ease-out",
        size === "sm" && "min-h-11 min-w-11 px-2.5 py-1 text-lg",
        size === "md" && "min-h-14 min-w-14 px-3.5 py-2 text-2xl",
        size === "lg" && "min-h-16 min-w-16 px-4 py-2.5 text-3xl",
        toneClass,
        dimmed && "opacity-40",
        selected && "ring-2 ring-ink ring-offset-2 ring-offset-paper",
        onClick && "active:scale-[0.96]",
      )}
    >
      {letters}
      {ipa ? (
        <span className="mt-0.5 text-xs font-normal opacity-80">{ipa}</span>
      ) : null}
    </Tag>
  );
}

export function PhonicsRow({
  chunks,
  size = "md",
}: {
  chunks: { letters: string; ipa: string }[];
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {chunks.map((chunk, i) => (
        <ChunkTile
          key={`${chunk.letters}-${i}`}
          letters={chunk.letters}
          ipa={chunk.ipa}
          tone={chunkTone(i)}
          size={size}
        />
      ))}
    </div>
  );
}

export function StarPips({
  value,
  max = 3,
  size = "md",
}: {
  value: number;
  max?: number;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex items-center gap-1" aria-label={`${value}星`}>
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={cn(
            size === "sm" ? "size-4" : "size-6",
            i < value ? "fill-star text-star" : "fill-paper-deep text-line",
          )}
        >
          <path d="M12 3.2 14.6 9l6.4.6-4.8 4.2 1.5 6.2L12 16.8 6.3 20l1.5-6.2L3 9.6 9.4 9 12 3.2Z" />
        </svg>
      ))}
    </div>
  );
}

export function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-11 items-center justify-center rounded-lg bg-surface text-ink shadow-card transition-transform duration-150 ease-out active:scale-[0.96]"
    >
      {children}
    </button>
  );
}

export function MuteToggle({
  muted,
  onToggle,
}: {
  muted: boolean;
  onToggle: () => void;
}) {
  return (
    <IconButton label={muted ? "打开声音" : "关闭声音"} onClick={onToggle}>
      {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
    </IconButton>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex min-h-12 w-full items-center justify-center rounded-lg bg-coral px-5 py-3 font-display text-base font-semibold text-surface shadow-pop transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-12 w-full items-center justify-center rounded-lg bg-surface px-5 py-3 font-display text-base font-semibold text-ink shadow-card transition-transform duration-150 ease-out active:scale-[0.96]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-[width,background-color] duration-250",
            i === current ? "w-5 bg-coral" : i < current ? "w-2.5 bg-teal" : "w-2.5 bg-line",
          )}
        />
      ))}
    </div>
  );
}

export function Burst({ show }: { show: boolean }) {
  if (!show) return null;
  const bits = Array.from({ length: 10 }).map((_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const dist = 36 + (i % 3) * 12;
    return {
      dx: `${Math.cos(angle) * dist}px`,
      dy: `${Math.sin(angle) * dist}px`,
      tone: ["bg-coral", "bg-teal", "bg-sky", "bg-star"][i % 4],
    };
  });
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {bits.map((b, i) => (
        <span
          key={i}
          className={cn("burst absolute size-2 rounded-full", b.tone)}
          style={{ "--dx": b.dx, "--dy": b.dy, animationDelay: `${i * 20}ms` } as CSSProperties}
        />
      ))}
    </div>
  );
}
