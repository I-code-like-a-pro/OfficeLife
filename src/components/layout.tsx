import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ArchBg, I, Logo } from "./icons";
import { Button, IconButton, cx, wrapCls } from "./ui";
import { initials } from "../lib/logic";
import { toggleTheme, setState, useStore } from "../lib/store";

/** Navigate by path string. Routes are code-defined, so a plain string is the simplest typed-enough API. */
export function useGo() {
  const navigate = useNavigate();
  return (to: string) => { void navigate({ to: to as never }); };
}

/** Go home and jump to the FAQ, like the original footer link. */
export function useGoFaq() {
  const go = useGo();
  return () => { go("/"); setTimeout(() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }), 60); };
}

export function Brand({ size = 34, className, text = "text-[25px]" }: { size?: number; className?: string; text?: string }) {
  return (
    <span className={cx("flex items-center gap-2 px-1 font-bold tracking-[-.03em] text-blue", text, className)}>
      <Logo size={size} /><span>officelife</span>
    </span>
  );
}

const NAV: [string, string][] = [["explore", "Explore"], ["universities", "Universities"], ["employers", "Employers"], ["premium", "Premium"]];

export function Header({ active }: { active: string }) {
  const go = useGo();
  const user = useStore(s => s.user);
  const [drawer, setDrawer] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-30 bg-bg border-b border-line">
        <div className={cx(wrapCls, "flex items-center gap-2 h-[60px]")}>
          <IconButton className="m900:hidden" onClick={() => setDrawer(true)} aria-label="Open menu"><I.menu /></IconButton>
          <button className="flex items-center gap-2 p-0" onClick={() => go("/")} aria-label="OfficeLife home"><Brand /></button>
          <nav className="hidden m900:flex gap-1 ml-3" aria-label="Main">
            {NAV.map(([k, label]) => (
              <button key={k} onClick={() => go("/" + k)} aria-current={active === k ? "page" : undefined}
                className="px-3 py-2 rounded-lg font-semibold text-[15px] hover:bg-chip aria-[current=page]:bg-chip">{label}</button>
            ))}
          </nav>
          <span className="flex-1" />
          {user
            ? <button className="flex items-center gap-2" onClick={() => go("/dashboard")} aria-label="Open your dashboard">
                <span className="w-[34px] h-[34px] rounded-full bg-blue text-blue-ink grid place-items-center font-bold text-[14px] shrink-0">{initials(user.name)}</span>
              </button>
            : <>
                <Button variant="ghost" sm onClick={() => go("/login")}>Log in</Button>
                <Button sm onClick={() => go("/signup")}>Sign up</Button>
              </>}
        </div>
      </header>
      {drawer && <Drawer onClose={() => setDrawer(false)} />}
    </>
  );
}

function Drawer({ onClose }: { onClose: () => void }) {
  const go = useGo();
  const user = useStore(s => s.user);
  const links: [string, string][] = [["", "Home"], ["explore", "Explore"], ["universities", "Universities"], ["employers", "Employers"], ["premium", "Premium"]];
  const item = "flex gap-3 w-full text-left px-2 py-3 rounded-lg items-center font-semibold hover:bg-chip";
  const to = (p: string) => () => { onClose(); go(p); };
  return (
    <div className="fixed inset-0 z-70 bg-[rgba(10,15,30,.5)] flex">
      <div className="bg-surface w-[min(320px,86vw)] h-full p-4 overflow-auto">
        <div className="flex items-center gap-2">
          <Brand className="p-0" /><span className="flex-1" />
          <IconButton onClick={onClose} aria-label="Close menu"><I.x /></IconButton>
        </div>
        <div className="mt-3">
          {links.map(([k, label]) => <button key={k} className={item} onClick={to("/" + k)}>{label}</button>)}
          {user
            ? <>
                <button className={item} onClick={to("/dashboard")}>My dashboard</button>
                <button className={item} onClick={to("/profile")}>Profile</button>
              </>
            : <>
                <button className={item} onClick={to("/login")}>Log in</button>
                <button className={item} onClick={to("/signup")}>Sign up</button>
              </>}
          <button className={item} onClick={() => { toggleTheme(); onClose(); }}>Switch light or dark</button>
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
}

export function Footer() {
  const go = useGo();
  const goFaq = useGoFaq();
  const lite = useStore(s => s.lite);
  const btn = "block py-1 px-0 text-ink2 text-left hover:text-blue";
  const h = "text-ink text-[14px] mb-1.5 font-bold";
  return (
    <footer className={wrapCls}>
      <div className="mt-14 pt-7 pb-10 border-t border-line text-[14px] text-ink2">
        <div className="grid gap-5 m720:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Brand className="p-0" />
            <p className="mt-2 max-w-[34ch]">Bridging the university to work gap with simulated workdays and verified evidence.</p>
            <p className="text-[12px] mt-2.5">Built for the NextGen AI Hackathon, Track 2.</p>
          </div>
          <div><h4 className={h}>Students</h4>
            <button className={btn} onClick={() => go("/explore")}>Explore simulations</button>
            <button className={btn} onClick={() => go("/premium")}>Premium mentors</button>
            <button className={btn} onClick={() => go("/signup")}>Sign up</button></div>
          <div><h4 className={h}>Partners</h4>
            <button className={btn} onClick={() => go("/universities")}>For universities</button>
            <button className={btn} onClick={() => go("/employers")}>For employers</button></div>
          <div><h4 className={h}>Help</h4>
            <button className={btn} onClick={goFaq}>FAQ</button>
            <button className={btn} onClick={toggleTheme}>Switch light or dark</button>
            <button className={btn} onClick={() => setState({ lite: !lite })}>{lite ? "Turn off" : "Turn on"} lite mode</button></div>
        </div>
      </div>
    </footer>
  );
}

/** Active nav item for the current path, as the original header(active) argument. */
export function useActiveNav() {
  const path = useRouterState({ select: s => s.location.pathname });
  const name = path.split("/").filter(Boolean)[0] || "";
  return name === "sim" ? "explore" : NAV.some(n => n[0] === name) ? name : "";
}

export function Toaster() {
  const toasts = useStore(s => s.toasts);
  return (
    <>
      {toasts.map(t => (
        <div key={t.id} role="status"
          className="fixed left-1/2 bottom-6 -translate-x-1/2 bg-[#0F1114] text-white px-[18px] py-3 rounded-lg z-90 text-[15px] max-w-[90vw]">{t.msg}</div>
      ))}
    </>
  );
}

/** The blue hero banner shared by the landing, employers and universities pages. */
export function Hero({ children, widget, className }: { children: React.ReactNode; widget: React.ReactNode; className?: string }) {
  return (
    <section className={cx("mt-4 rounded-[14px] text-white px-5 pt-[30px] pb-[26px] bg-[linear-gradient(135deg,#0A1F5C_0%,#1B2A86_55%,#3B2A8C_100%)] grid gap-[26px] overflow-hidden relative m760:grid-cols-[1.3fr_1fr] m760:items-center m760:p-11", className)}>
      <ArchBg />
      <div>{children}</div>
      {widget}
    </section>
  );
}
export const HeroH1 = ({ children }: { children: React.ReactNode }) => <h1 className="relative text-[32px] m760:text-[42px]">{children}</h1>;
export const HeroP = ({ children }: { children: React.ReactNode }) => <p className="text-[#D7E1FF] max-w-[46ch] mt-3 relative">{children}</p>;
export const HeroCta = ({ children }: { children: React.ReactNode }) => <div className="flex gap-2.5 flex-wrap mt-5 relative">{children}</div>;
export function Widget({ children }: { children: React.ReactNode }) {
  return <div aria-hidden="true" className="bg-white/12 border border-white/22 rounded-[14px] p-4 max-w-[340px] relative">{children}</div>;
}
export const WidgetLine = ({ dot, children }: { dot?: "a" | "b"; children: React.ReactNode }) => (
  <div className="flex gap-2.5 items-center text-[14px] text-[#E8EEFF] mt-2">
    <span className={cx("w-2 h-2 rounded-full shrink-0", dot === "a" ? "bg-[#FFC46B]" : dot === "b" ? "bg-[#8AB4FF]" : "bg-[#52E0A0]")} />{children}
  </div>
);
