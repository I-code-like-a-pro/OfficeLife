import { useEffect, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { I } from "./icons";

/** Joins class names and lets later utilities win over earlier conflicting ones (p-4 then p-0). */
export const cx = (...a: (string | false | null | undefined)[]) => twMerge(a.filter(Boolean).join(" "));

/* ---------- layout containers (.wrap, .narrow, .center) ---------- */
export const wrapCls = "max-w-[1080px] mx-auto px-4";
export const narrowCls = "max-w-[760px] mx-auto px-4";
export const centerCls = "max-w-[540px] mx-auto px-4 pt-6 pb-14";
export const Wrap = ({ children, className }: { children: ReactNode; className?: string }) => <div className={cx(wrapCls, className)}>{children}</div>;

/* ---------- buttons ---------- */
type Variant = "pri" | "out" | "white" | "ghost" | "outWhite";
const variants: Record<Variant, string> = {
  pri: "bg-blue text-blue-ink hover:brightness-[1.08]",
  out: "border-blue text-blue hover:bg-blue-soft",
  white: "bg-white text-[#0B1E4D]",
  ghost: "text-blue",
  // .btn.out with the hero's inline white colour; hover still uses blue-soft like the original
  outWhite: "border-white text-white hover:bg-blue-soft"
};
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; sm?: boolean; block?: boolean }
export function Button({ variant = "pri", sm, block, className, type = "button", ...rest }: BtnProps) {
  return (
    <button type={type} {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-2 border border-transparent rounded-lg font-semibold",
        sm ? "min-h-9 py-0 px-3.5 text-[14px]" : "min-h-12 py-0 px-5 text-[16px]",
        "leading-[1.1] text-center disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant], block && "w-full", className
      )} />
  );
}
export function LinkButton({ className, type = "button", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} {...rest} className={cx("text-blue underline font-semibold text-[14px]", className)} />;
}
export function IconButton({ className, type = "button", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} {...rest} className={cx("w-10 h-10 grid place-items-center rounded-lg text-ink hover:bg-chip", className)} />;
}

/* ---------- chips ---------- */
type Tone = "" | "ok" | "warn" | "bad" | "blue";
const tones: Record<Tone, string> = {
  "": "bg-chip",
  ok: "bg-green-soft text-green",
  warn: "bg-warn-soft text-warn",
  bad: "bg-red-soft text-red",
  blue: "bg-blue-soft text-blue"
};
export function Chip({ tone = "", className, style, children }: { tone?: Tone; className?: string; style?: CSSProperties; children: ReactNode }) {
  return <span style={style} className={cx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-semibold", tones[tone], className)}>{children}</span>;
}
export const Chips = ({ children, className }: { children: ReactNode; className?: string }) => <div className={cx("flex flex-wrap gap-2", className)}>{children}</div>;
export const pillCls = "border border-line rounded-full px-3.5 py-2 text-[14px] font-semibold bg-surface";
export const Pill = ({ children }: { children: ReactNode }) => <span className={pillCls}>{children}</span>;

/* ---------- cards and small blocks ---------- */
export const cardCls = "border border-line rounded-xl bg-surface p-4 [box-shadow:var(--shadow)]";
export function Card({ className, pad0, children, style }: { className?: string; pad0?: boolean; children: ReactNode; style?: CSSProperties }) {
  return <div style={style} className={cx(cardCls, pad0 && "p-0 overflow-hidden", className)}>{children}</div>;
}
export const Section = ({ children, className, id }: { children: ReactNode; className?: string; id?: string }) =>
  <section id={id} className={cx("mt-9", className)}>{children}</section>;
export const Lead = ({ children }: { children: ReactNode }) => <p className="text-ink2 mb-4 max-w-[62ch]">{children}</p>;
export const Src = ({ children }: { children: ReactNode }) => <p className="text-[12px] text-ink2 mt-2.5">{children}</p>;
export const Sample = ({ children }: { children: ReactNode }) => <div className="bg-warn-soft text-warn rounded-[10px] px-3.5 py-2.5 text-[14px] font-semibold mt-2.5 mb-3.5">{children}</div>;
export const Hello = ({ children }: { children: ReactNode }) => <div className="pt-[22px] pb-1.5">{children}</div>;

export function Stats({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <div className="grid grid-cols-2 gap-3 m720:grid-cols-4">
      {items.map(([b, s], i) => (
        <div key={i} className="border border-line rounded-xl p-3.5 bg-surface">
          <b className="block text-[30px] leading-[1.1] tracking-[-.02em] text-blue">{b}</b>
          <span className="text-[13px] text-ink2 block mt-1">{s}</span>
        </div>
      ))}
    </div>
  );
}

const orgBg = { "": "bg-[#0B1E4D]", v: "bg-[#5B2BC4]", g: "bg-[#0A7A5A]" } as const;
export function Org({ cls = "", children, className }: { cls?: "" | "v" | "g"; children: ReactNode; className?: string }) {
  return <div className={cx("w-11 h-11 rounded-lg grid place-items-center text-white font-bold text-[15px] shrink-0", orgBg[cls], className)}>{children}</div>;
}
export const Ico = ({ children }: { children: ReactNode }) =>
  <div className="w-[42px] h-[42px] rounded-[10px] bg-blue-soft text-blue grid place-items-center">{children}</div>;

export function Avatar({ color, ini, className }: { color: string; ini: string; className?: string }) {
  return <div className={cx("w-9 h-9 rounded-lg grid place-items-center text-white font-bold text-[13px] shrink-0", className)} style={{ background: color }} aria-hidden="true">{ini}</div>;
}

export function Ring({ p }: { p: number }) {
  return (
    <div style={{ "--p": p } as CSSProperties}
      className="w-[52px] h-[52px] rounded-full grid place-items-center font-bold text-[15px] shrink-0 relative bg-[conic-gradient(var(--blue)_calc(var(--p)*1%),var(--chip)_0)] before:content-[''] before:absolute before:inset-[5px] before:rounded-full before:bg-surface">
      <span className="relative">{p}</span>
    </div>
  );
}

export function Bar({ pct, green, className }: { pct: number; green?: boolean; className?: string }) {
  return (
    <div className={cx("h-2 rounded-[99px] bg-chip overflow-hidden flex-1", className)}>
      <i className={cx("block h-full rounded-[99px]", green ? "bg-green" : "bg-blue")} style={{ width: pct + "%" }} />
    </div>
  );
}

export function Badge({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex gap-2.5 items-center border border-line rounded-xl px-3 py-2.5 bg-surface">
      <div className="w-[34px] h-[34px] rounded-full bg-amber grid place-items-center text-[#0B1E4D] shrink-0"><I.star /></div>
      <div><b>{title}</b><div className="text-[14px] text-ink2">{sub}</div></div>
    </div>
  );
}

export const Promo = ({ children }: { children: ReactNode }) =>
  <div className="rounded-[14px] p-[18px] bg-[linear-gradient(135deg,#0A1F5C,#3B2A8C)] text-white grid gap-3 [&_p]:text-[#D7E1FF]">{children}</div>;

/* ---------- form fields ---------- */
export const inputCls = "min-h-12 border border-line rounded-lg px-3.5 py-2.5 bg-surface w-full";
export function Field({ label, htmlFor, err, hint, children, srOnly, className }: {
  label: ReactNode; htmlFor: string; err?: string; hint?: ReactNode; children: ReactNode; srOnly?: boolean; className?: string;
}) {
  return (
    <div className={cx("grid gap-1.5 mt-3.5 relative", err && "[&_input]:border-red [&_select]:border-red", className)}>
      <label htmlFor={htmlFor} className={cx("font-semibold text-[14px]", srOnly && "absolute w-px h-px overflow-hidden [clip:rect(0_0_0_0)]")}>{label}</label>
      {children}
      {hint && <span className="text-[13px] text-ink2">{hint}</span>}
      {err && <span className="text-red text-[13px] font-semibold">{err}</span>}
    </div>
  );
}
export const ErrMsg = ({ children, className }: { children: ReactNode; className?: string }) => <span className={cx("text-red text-[13px] font-semibold", className)}>{children}</span>;

/* ---------- modal sheet ---------- */
export function Sheet({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 bg-[rgba(10,15,30,.55)] z-60 flex items-end justify-center m620:items-center"
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div role="dialog" aria-modal="true"
        className="bg-surface w-full max-w-[560px] rounded-t-2xl m620:rounded-2xl px-4 pt-5 pb-6 max-h-[92vh] overflow-auto [&_h2]:text-[21px] [&_h2]:mb-1.5">
        {children}
      </div>
    </div>
  );
}
export const SheetHead = ({ children }: { children: ReactNode }) => <div className="flex justify-between items-center mb-2.5 gap-2">{children}</div>;
export function CloseButton({ onClick }: { onClick: () => void }) {
  return <IconButton onClick={onClick} aria-label="Close"><I.x /></IconButton>;
}

/** Choice button used in the decision and quiz modals (.choice). */
export function choiceCls(state?: "right" | "wrong") {
  return cx(
    "border rounded-xl p-3.5 text-left bg-surface w-full [&_b]:block [&_span]:text-[14px] [&_span]:text-ink2",
    state === "right" ? "border-green bg-green-soft" : state === "wrong" ? "border-red bg-red-soft" : "border-line hover:border-blue"
  );
}

/** Stat-style key/value list (.kv). */
export function KV({ rows, className }: { rows: [ReactNode, ReactNode][]; className?: string }) {
  return (
    <div className={className}>
      {rows.map(([k, v], i) => (
        <div key={i} className="flex justify-between gap-3 py-3 border-b border-line items-center last:border-b-0">
          <span className="text-ink2 text-[15px]">{k}</span><span className="font-semibold text-right">{v}</span>
        </div>
      ))}
    </div>
  );
}

/** Lock body scroll-free helper: runs a handler on Escape. */
export function useEscape(fn: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") fn(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [fn]);
}
