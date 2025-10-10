// src/components/PhoneFrameChrome.tsx
import type { PropsWithChildren } from "react";

type ChromeProps = PropsWithChildren<{
  className?: string;
  notch?: boolean;
  homeButton?: boolean;
  safeTop?: number;
  safeBottom?: number;
  ratio?: number | string; // z.B. 1/2
}>;

export function PhoneFrameChrome({
  children,
  className = "",
  notch = true,
  homeButton = true,
  safeTop = 12,
  safeBottom = 28,
  ratio,
}: ChromeProps) {
  const base =
    "relative rounded-[26px] bg-gradient-to-b from-black/35 to-black/20 " +
    "border-2 border-white/25 ring-1 ring-black/70 " +
    "shadow-[0_10px_28px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(255,255,255,0.06)]";

  return (
    <div
      className={`${base} ${className}`}
      style={{
        aspectRatio: ratio as any, // z.B. 1/2
        paddingTop: notch ? safeTop : 0,
        paddingBottom: homeButton ? safeBottom : 0,
      }}
    >
      {/* Innen-Ring für Silhouette */}
      <div className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-black/70/60" />

      {/* Inhalt */}
      <div className="relative h-full w-full">{children}</div>

      {/* Notch */}
      {notch && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-0 left-1/2 z-10 h-4 w-20 -translate-x-1/2 rounded-b-[14px] overflow-hidden"
        >
          <div className="absolute inset-0 bg-[rgba(24,28,38,0.9)] dark:bg-[rgba(0,0,0,0.9)] border-x border-b border-white/10" />
          <div className="absolute inset-x-2 top-0 h-px bg-white/20" />
        </div>
      )}

      {/* Home-Button (höher im Rahmen) */}
      {homeButton && (
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 h-8 w-8 rounded-full 
                     bg-neutral-300/70 dark:bg-white/10 border border-black/20 dark:border-white/15 backdrop-blur"
        >
          <div className="absolute inset-0 m-[5px] rounded-full border border-white/30" />
        </div>
      )}
    </div>
  );
}
