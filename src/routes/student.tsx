import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { LEVELS, PEOPLE, ROLES, UNIS } from "../data/data";
import { I } from "../components/icons";
import { useGo } from "../components/layout";
import { DayPlanRail, Opt, RoleCard, UniField } from "../components/shared";
import { Badge, Button, Card, Chip, Chips, Field, Hello, KV, Org, Pill, Promo, Section, Stats, cx, inputCls, narrowCls, wrapCls } from "../components/ui";
import { avg, badgesFor, canonUni, prettyDate, readiness } from "../lib/logic";
import { setState, signOut, toast, toggleTheme, updateUser, useStore } from "../lib/store";
import type { RoleId } from "../lib/types";
import { CAREERS } from "./auth";

const SIM_IDS: RoleId[] = ["pm", "swe", "da"];

/* ---------- dashboard ---------- */
export function Dashboard() {
  const go = useGo();
  const u = useStore(s => s.user)!;
  const certs = useStore(s => s.certs);
  const bookings = useStore(s => s.bookings);
  const first = u.name.split(" ")[0];
  const avgScore = certs.length ? avg(certs.map(c => c.overall)) : 0;
  const onTimeRate = certs.length ? Math.round(certs.reduce((a, c) => a + c.onTime, 0) / certs.reduce((a, c) => a + c.n, 0) * 100) : 0;
  const latest = certs[certs.length - 1];
  const badges = latest ? badgesFor(latest.sc, latest.n) : [];
  return (
    <main className={wrapCls}>
      <Hello>
        <h1>Hi {first}</h1>
        <Chips className="mt-2">
          <Chip tone="blue"><I.uni />&nbsp;{u.uni}</Chip>
          <Chip>{u.level}</Chip>
          <Chip tone={u.plan === "plus" ? "ok" : ""}>{u.plan === "plus" ? "Premium" : "Free plan"}</Chip>
        </Chips>
      </Hello>

      <section className="mt-[18px]">
        <Stats items={[
          [certs.length, "simulations completed"],
          [certs.length ? avgScore + "%" : "-", "average score"],
          [certs.length ? onTimeRate + "%" : "-", "on-time check-ins"],
          [badges.length, "badges from your latest run"]
        ]} />
      </section>

      <Section>
        <h2 className="mb-1.5">{certs.length ? "Start another simulation" : "Start your first workday"}</h2>
        <p className="text-ink2 mb-4 max-w-[62ch]">Pick a role. Each workday takes 10 to 15 minutes.</p>
        <div className="grid gap-3 m720:grid-cols-3">{SIM_IDS.map(k => <RoleCard key={k} id={k} />)}</div>
      </Section>

      {certs.length > 0 && (
        <Section>
          <h2 className="mb-1.5">Your certificates</h2>
          <div className="grid gap-3 mt-3 m720:grid-cols-2">
            {certs.slice().reverse().map(c => (
              <Card key={c.code}>
                <div className="flex items-center gap-2">
                  <Org cls={ROLES[c.role].cls}>{ROLES[c.role].short}</Org>
                  <div><b>{ROLES[c.role].title}</b><div className="text-[14px] text-ink2">{c.n}-day simulation &middot; {prettyDate(c.date)}</div></div>
                </div>
                <div className="flex items-center gap-2 mt-3 justify-between">
                  <Chip tone="ok">{c.overall}% &middot; {readiness(c.overall)}</Chip>
                  <Button variant="out" sm onClick={() => go("/cert/" + c.code)}>View</Button>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {badges.length > 0 && (
        <Section>
          <h2 className="mb-1.5">Badges</h2>
          <div className="grid gap-3 mt-3 m720:grid-cols-3">{badges.map(b => <Badge key={b[0]} title={b[0]} sub={b[1]} />)}</div>
        </Section>
      )}

      {bookings.length > 0 && (
        <Section>
          <h2 className="mb-1.5">Your mentor sessions</h2>
          <Card className="mt-3">
            {bookings.map((b, i) => (
              <div key={i} className="py-3 border-b border-line grid gap-1 last:border-b-0">
                <div className="flex justify-between gap-2 items-center text-[14px] flex-wrap"><b>{b.mentor}</b><Chip tone="ok">Booked</Chip></div>
                <div className="flex justify-between gap-2 items-center text-[14px] flex-wrap text-ink2"><span>{b.title}</span><span>{b.slot}</span></div>
              </div>
            ))}
          </Card>
        </Section>
      )}

      {u.plan !== "plus" && (
        <Section>
          <Promo>
            <h2 className="text-white">Practise with real mentors</h2>
            <p>Premium adds live mock sessions with experienced professionals, human review of your final project, and a Verified+ badge on your certificate.</p>
            <div><Button variant="white" onClick={() => go("/premium")}>See Premium</Button></div>
          </Promo>
        </Section>
      )}
    </main>
  );
}

/* ---------- explore ---------- */
export function Explore() {
  const [q, setQ] = useState("");
  const s = q.toLowerCase();
  const list = SIM_IDS.filter(k => !s || ROLES[k].title.toLowerCase().includes(s) || ROLES[k].skills.join(" ").toLowerCase().includes(s));
  return (
    <main className={wrapCls}>
      <Hello>
        <h1>Explore simulations</h1>
        <p className="text-ink2 mt-1.5">Choose a role and experience a real workday at Tembea Logistics.</p>
      </Hello>
      <Field label="Search" htmlFor="exq" srOnly className="max-w-[420px]">
        <input id="exq" className={inputCls} value={q} onChange={e => setQ(e.target.value)} placeholder="Search roles or skills" />
      </Field>
      <Section>
        <div className="grid gap-3 m720:grid-cols-3">
          {list.map(k => <RoleCard key={k} id={k} />)}
          {!list.length && <p className="text-ink2">No roles match your search.</p>}
        </div>
      </Section>
      <Section>
        <h2 className="mb-1.5">More careers coming soon</h2>
        <Chips className="mt-3">{["Marketing Associate", "Customer Support", "Accountant", "UI/UX Designer", "Sales Executive", "HR Assistant"].map(x => <Pill key={x}>{x}</Pill>)}</Chips>
      </Section>
    </main>
  );
}

/* ---------- simulation page ---------- */
export function Sim() {
  const go = useGo();
  const { id: rawId } = useParams({ from: "/sim/$id" });
  const user = useStore(s => s.user);
  const [days, setDays] = useState(1);
  const r = ROLES[rawId as RoleId] ?? ROLES.pm;
  const id = r.id;
  const lens: [number, string, string][] = [[1, "1 day", "About 12 minutes"], [2, "2 days", "About 25 minutes in total"], [3, "3 days", "About 40 minutes in total"]];

  const enroll = () => {
    if (!user) { setState({ next: "/sim/" + id }); go("/signup"); return; }
    setState({ enroll: { role: id, days }, day: 0, log: [], revised: false, aiFails: 0 });
    go("/clockin");
  };
  const h2 = "mb-1.5";
  return (
    <main>
      <section className="bg-panel pt-4 pb-[26px] border-b border-line">
        <div className={wrapCls}>
          <div className="text-[13px] text-ink2 flex flex-wrap gap-1.5 mb-3">
            <button className="text-ink2" onClick={() => go("/")}>Home</button>&rsaquo;
            <button className="text-ink2" onClick={() => go("/explore")}>Simulations</button>&rsaquo;<span>{r.title}</span>
          </div>
          <h1>{r.title} Simulation</h1>
          <p className="text-ink2 mt-2 max-w-[60ch]">{r.blurb}</p>
          <p className="text-[14px] mt-3">Part of <b>OfficeLife Career Simulations</b></p>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <Org cls={r.cls} className="w-7 h-7 text-[11px]">TL</Org>
            <span className="text-[14px]">Manager: <b>{PEOPLE[r.manager].name}</b> (simulated)</span>
            <Chip tone="blue">New</Chip>
          </div>
        </div>
      </section>
      <div className={wrapCls}>
        <div className="grid gap-4 mt-5 m720:grid-cols-4">
          {([
            [`${days} ${days > 1 ? "workdays" : "workday"}`, "Experience a real day at the office"],
            ["Beginner level", "No prior experience required"],
            ["10 to 15 minutes a day", "Learn at your own pace"],
            ["Verified certificate", "Link, QR code and scores"]
          ] as const).map(([b, s]) => <div key={b}><b className="block">{b}</b><span className="text-[14px] text-ink2">{s}</span></div>)}
        </div>

        <Section>
          <Card className="max-w-[640px]">
            <h2 className="text-[20px]">Set up your simulation</h2>
            <p className="text-[14px] text-ink2 mt-1 mb-3.5">Choose how long you want to work.</p>
            <div className="grid gap-2.5 mt-3" role="radiogroup" aria-label="Simulation length">
              {lens.map(l => <Opt key={l[0]} checked={days === l[0]} onClick={() => setDays(l[0])} title={l[1]} sub={l[2]} />)}
            </div>
            <Button block className="mt-[18px]" onClick={enroll}>{user ? "Enroll for free" : "Sign up to enroll"}</Button>
            <p className="text-[12px] text-ink2 mt-2 text-center">Starts now &middot; Your arrival time is logged against a 9:00 AM shift</p>
          </Card>
        </Section>

        <Section>
          <h2 className={h2}>What you'll learn</h2>
          <ul className="grid gap-2.5 mt-3">
            {r.learn.map(x => <li key={x} className="flex gap-2.5 items-start"><I.check className="text-green mt-[3px] shrink-0" /><span>{x}</span></li>)}
          </ul>
        </Section>
        <Section>
          <h2 className={h2}>Skills you'll gain</h2>
          <Chips className="mt-3">{r.skills.map(x => <Chip key={x}>{x}</Chip>)}</Chips>
        </Section>
        <Section>
          <h2 className={h2}>Your {days > 1 ? days + " days" : "day"} at Tembea</h2>
          <div className="grid gap-3 mt-3 m720:grid-cols-3">
            {r.days.slice(0, days).map((d, i) => <Card key={i}><Chip tone="blue">Day {i + 1}</Chip><h3 className="mt-2">{d.theme}</h3></Card>)}
          </div>
        </Section>
        <Section><h2 className={h2}>How each day runs</h2><DayPlanRail /></Section>
        <Section><h2 className={h2}>Jobs this prepares you for</h2><p className="text-ink2 mt-1.5">{r.jobs}</p></Section>
        <Section>
          <h2 className={h2}>Details to know</h2>
          <Card className="mt-3">
            <KV rows={[["Assessments", "Reviewed on every task"], ["Check-ins", "Clock in and out logged"], ["Certificate", "Verified link and QR"], ["Language", "English"]]} />
          </Card>
        </Section>
      </div>
    </main>
  );
}

/* ---------- profile ---------- */
export function Profile() {
  const go = useGo();
  const u = useStore(s => s.user)!;
  const lite = useStore(s => s.lite);
  const [f, setF] = useState({ name: u.name, uni: u.uni, level: u.level, course: u.course, target: u.target });
  const [uniErr, setUniErr] = useState("");
  const set = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }));

  const save = () => {
    const uni = canonUni(f.uni, UNIS);
    if (!uni) { setUniErr("Choose your university from the list."); return; }
    if (f.name.trim().length < 3) { toast("Enter your full name"); return; }
    updateUser({ name: f.name.trim(), uni, level: f.level, course: f.course || "", target: f.target || "" });
    toast("Profile saved");
    go("/dashboard");
  };
  return (
    <main className={cx(narrowCls)}>
      <Hello><h1>Your profile</h1></Hello>
      <Card>
        <Field label="Full name" htmlFor="pf-name"><input id="pf-name" className={inputCls} value={f.name} onChange={e => set("name", e.target.value)} /></Field>
        <UniField id="pf-uni" value={f.uni} onChange={v => { set("uni", v); setUniErr(""); }} err={uniErr} />
        <Field label="Level" htmlFor="pf-level">
          <select id="pf-level" className={inputCls} value={f.level} onChange={e => set("level", e.target.value)}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select>
        </Field>
        <Field label="Course of study" htmlFor="pf-course"><input id="pf-course" className={inputCls} value={f.course} onChange={e => set("course", e.target.value)} /></Field>
        <Field label="Career you want" htmlFor="pf-target">
          <select id="pf-target" className={inputCls} value={f.target} onChange={e => set("target", e.target.value)}>{CAREERS.map(c => <option key={c[0]} value={c[0]}>{c[1]}</option>)}</select>
        </Field>
        <Button block className="mt-[18px]" onClick={save}>Save changes</Button>
      </Card>
      <Card className="mt-3.5">
        <h3>Settings</h3>
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <Button variant="out" sm onClick={toggleTheme}>Switch light or dark</Button>
          <Button variant="out" sm onClick={() => setState({ lite: !lite })}>{lite ? "Turn off" : "Turn on"} lite mode</Button>
          <Button variant="out" sm onClick={() => { signOut(); toast("Signed out"); go("/"); }}>Sign out</Button>
        </div>
        <p className="text-[12px] text-ink2 mt-2.5">Lite mode removes animations to save battery and data.</p>
      </Card>
    </main>
  );
}
