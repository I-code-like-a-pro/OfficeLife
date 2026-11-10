import type { ReactNode } from "react";

interface IconProps { size?: number; className?: string }

/** Builds a stroke icon component from SVG path children, same attributes as the original svg() helper. */
const mk = (children: ReactNode, defaultSize = 22) =>
  function Icon({ size = defaultSize, className }: IconProps) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
        {children}
      </svg>
    );
  };

export const I = {
  menu: mk(<path d="M4 7h16M4 12h16M4 17h16" />, 24),
  x: mk(<path d="M6 6l12 12M18 6L6 18" />, 22),
  back: mk(<path d="M15 6l-6 6 6 6" />, 24),
  check: mk(<path d="M5 12.5l4.5 4.5L19 7.5" />, 20),
  upload: mk(<path d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14" />, 20),
  file: mk(<><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5" /></>, 18),
  clock: mk(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, 22),
  sparkle: mk(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />, 18),
  alert: mk(<><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3.5v.01" /></>, 22),
  uni: mk(<><path d="M3 10l9-5 9 5-9 5z" /><path d="M7 12.5V17c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5" /></>, 22),
  brief: mk(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18" /></>, 22),
  shield: mk(<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M8.5 12l2.5 2.5L16 9.5" /></>, 22),
  chart: mk(<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />, 22),
  chat: mk(<path d="M4 5h16v11H9l-5 4z" />, 22),
  star: mk(<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />, 20)
};

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width={20} height={20} aria-hidden="true" className="block">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/** Logo: bridge arch (university to office) with a clock. */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" className="block">
      <rect width="64" height="64" rx="14" fill="#0056D2" />
      <path d="M12 46 C12 22 52 22 52 46" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M8 46 H56" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M12 46 V54 M52 46 V54" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="32" cy="37.5" r="6.5" fill="#FFB020" />
      <path d="M32 33.6 V37.5 H35.4" fill="none" stroke="#0B1E4D" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArchBg() {
  return (
    <svg viewBox="0 0 400 260" aria-hidden="true" className="pointer-events-none absolute -right-[60px] -bottom-10 block w-[420px] opacity-[.12]">
      <path d="M30 190 C30 30 370 30 370 190" fill="none" stroke="#fff" strokeWidth="22" strokeLinecap="round" />
      <path d="M0 190 H400" stroke="#fff" strokeWidth="22" strokeLinecap="round" />
      <path d="M30 190 V250 M370 190 V250" stroke="#fff" strokeWidth="22" strokeLinecap="round" />
    </svg>
  );
}
