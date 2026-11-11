import { useEffect, useRef, useState, type ReactNode } from "react";
import { DAY_PLAN, ROLES, UNIS } from "../data/data";
import { CONFIG } from "../lib/config";
import { searchUnis } from "../lib/logic";
import type { RoleId } from "../lib/types";
import { useGo } from "./layout";
import { Field, Org, inputCls } from "./ui";

export function RoleCard({ id }: { id: RoleId }) {
  const go = useGo();
  const r = ROLES[id];
  return (
    <button onClick={() => go("/sim/" + id)}
      className="flex gap-3 items-start bg-surface border border-line rounded-xl p-3.5 text-left w-full [box-shadow:var(--shadow)] hover:border-blue">
      <Org cls={r.cls}>{r.short}</Org>
      <div>
        <div className="text-[13px] text-ink2">Tembea Logistics</div>
        <div className="text-[17px] font-semibold leading-[1.3] mt-0.5 mb-1">{r.title}</div>
        <div className="text-[13px] text-ink2">Career simulation &middot; 1 to 3 workdays &middot; Certificate</div>
      </div>
    </button>
  );
}

export function DayPlanRail() {
  return (
    <div className="border-l-2 border-line pl-4 ml-1 grid gap-4">
      {DAY_PLAN.map(p => (
        <div key={p[0]} className="flex gap-3 items-start">
          <div className="min-w-[76px] font-bold tabular-nums text-blue">{p[0]}</div>
          <div><b className="block">{p[1]}</b><span className="text-[14px] text-ink2">{p[2]}</span></div>
        </div>
      ))}
    </div>
  );
}

/** Radio-style option button (.opt). */
export function Opt({ checked, onClick, title, sub }: { checked: boolean; onClick: () => void; title: ReactNode; sub?: ReactNode }) {
  return (
    <button role="radio" aria-checked={checked} onClick={onClick}
      className="group flex gap-3 items-center border border-line rounded-xl p-3.5 w-full text-left bg-surface aria-checked:border-blue aria-checked:[box-shadow:0_0_0_1px_var(--blue)] aria-checked:bg-blue-soft">
      <span className="w-5 h-5 border-2 border-ink2 rounded-full shrink-0 grid place-items-center group-aria-checked:border-blue group-aria-checked:after:content-[''] group-aria-checked:after:w-2.5 group-aria-checked:after:h-2.5 group-aria-checked:after:rounded-full group-aria-checked:after:bg-blue" />
      <div><b className="block">{title}</b>{sub && <span className="text-[14px] text-ink2">{sub}</span>}</div>
    </button>
  );
}

/* ---------- tables ---------- */
export const Table = ({ children }: { children: ReactNode }) => <table className="w-full border-collapse text-[14px]"><tbody>{children}</tbody></table>;
export const Th = ({ children }: { children?: ReactNode }) => <th className="text-left text-[12px] text-ink2 font-semibold px-2.5 py-2 border-b border-line">{children}</th>;
export const Td = ({ children, className }: { children: ReactNode; className?: string }) => <td className={"px-2.5 py-3 border-b border-line align-middle " + (className ?? "")}>{children}</td>;

/* ---------- university combobox ---------- */
export function UniField({ id, value, onChange, err }: { id: string; value: string; onChange: (v: string) => void; err?: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const res = searchUnis(value, UNIS);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const pick = (u: string) => { onChange(u); setOpen(false); };
  return (
    <Field label="University" htmlFor={id} err={err}
      hint="Required. Your university can see how its students are doing, and employers can find graduates by campus.">
      <div className="relative" ref={box}>
        <input id={id} className={inputCls} value={value} autoComplete="off" role="combobox" aria-expanded={open}
          aria-controls={id + "-list"} placeholder="Start typing, for example Wale University"
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter") { e.preventDefault(); if (res[0]) pick(res[0]); }
          }} />
        {open && (
          <div id={id + "-list"} role="listbox"
            className="absolute left-0 right-0 top-full mt-1 bg-surface border border-line rounded-[10px] z-15 max-h-[280px] overflow-auto [box-shadow:0_8px_24px_rgba(0,0,0,.18)]">
            {res.length === 0
              ? <button type="button" disabled className="block w-full text-left px-3.5 py-[11px] text-[15px]">No match. Choose "Other Nigerian university".</button>
              : res.map(u => (
                <button key={u} type="button" role="option" aria-selected={u === value} onClick={() => pick(u)}
                  className="block w-full text-left px-3.5 py-[11px] text-[15px] hover:bg-blue-soft">
                  {u}{u === CONFIG.hackathonUni && <span className="text-[12px] text-blue font-bold ml-1.5">Hackathon host</span>}
                </button>
              ))}
          </div>
        )}
      </div>
    </Field>
  );
}
