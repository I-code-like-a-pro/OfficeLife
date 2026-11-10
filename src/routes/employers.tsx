import { useState } from "react";
import { ROLES, SAMPLE_CANDS } from "../data/data";
import { Hero, HeroCta, HeroH1, HeroP, Widget, WidgetLine, useGo } from "../components/layout";
import { Button, Card, Chip, CloseButton, Field, Ring, Sample, Section, Sheet, SheetHead, inputCls, wrapCls, cx } from "../components/ui";
import { avg, certToken, naira, readiness, sampleToPayload, wordCount } from "../lib/logic";
import { setState, toast, useStore } from "../lib/store";
import type { DimKey, RoleId } from "../lib/types";
import { PRICING } from "./premium";

interface Cand {
  name: string; uni: string; role: RoleId; days: number; s: Record<DimKey, number>; overall: number; token?: string;
}

function useCands(): Cand[] {
  const user = useStore(s => s.user);
  const certs = useStore(s => s.certs);
  const sample: Cand[] = SAMPLE_CANDS.map(c => ({ ...c, overall: avg(Object.values(c.s)) }));
  const mine: Cand[] = certs.map(c => ({
    name: user ? user.name + " (you)" : "You", uni: user ? user.uni : "", role: c.role, days: c.n,
    s: c.sc.dims, overall: c.overall, token: c.token
  }));
  return mine.concat(sample);
}

const filterCls = "min-h-11 border border-line rounded-lg px-3 py-2 bg-surface w-full";

export function Employers() {
  const go = useGo();
  const all = useCands();
  const shortlist = useStore(s => s.shortlist);
  const posts = useStore(s => s.posts);
  const [flt, setFlt] = useState({ role: "", uni: "", min: "", q: "" });
  const [form, setForm] = useState({ co: "", role: "", task: "" });
  const [invite, setInvite] = useState<string | null>(null);

  const unis = Array.from(new Set(all.map(c => c.uni))).sort();
  const list = all
    .filter(c => (!flt.role || c.role === flt.role) && (!flt.uni || c.uni === flt.uni) && (!flt.min || c.overall >= +flt.min) && (!flt.q || c.name.toLowerCase().includes(flt.q.toLowerCase())))
    .sort((a, b) => b.overall - a.overall);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const viewCand = (c: Cand) => go("/verify/" + (c.token || certToken(sampleToPayload(c, "2026-10-20"))));
  const toggleShort = (n: string) => setState(s => ({ shortlist: s.shortlist.includes(n) ? s.shortlist.filter(x => x !== n) : [...s.shortlist, n] }));
  const postSim = () => {
    if (!form.co.trim() || !form.role.trim() || wordCount(form.task) < 5) { toast("Fill in all three fields"); return; }
    setState(s => ({ posts: [...s.posts, { co: form.co.trim(), role: form.role.trim() }] }));
    setForm({ co: "", role: "", task: "" });
    toast("Request received. We will contact you.");
  };

  return (
    <main className={wrapCls}>
      <Hero widget={
        <Widget>
          <div className="text-[12px]" style={{ color: "#C9D6FF" }}>What you see on every candidate</div>
          <WidgetLine>Clock-in record</WidgetLine>
          <WidgetLine dot="b">Task scores and review method</WidgetLine>
          <WidgetLine dot="a">Decisions and explanations</WidgetLine>
          <WidgetLine>Verification link and QR</WidgetLine>
        </Widget>
      }>
        <HeroH1>Hire on proof, not just paper</HeroH1>
        <HeroP>See how candidates behave in a real workday: punctuality, task quality, decisions under pressure and how they explain their thinking. Every score links to evidence.</HeroP>
        <HeroCta>
          <Button variant="white" onClick={() => scrollTo("talent")}>Search talent</Button>
          <Button variant="outWhite" onClick={() => scrollTo("post")}>Post a simulation</Button>
        </HeroCta>
      </Hero>

      <Section id="talent">
        <h2 className="mb-1.5">Talent search</h2>
        <Sample>Sample data. Candidates below are fictional, except any certificate you earn yourself.</Sample>
        <div className="grid gap-2.5 m720:grid-cols-4">
          <select className={filterCls} aria-label="Role" value={flt.role} onChange={e => setFlt({ ...flt, role: e.target.value })}>
            <option value="">All roles</option>{(Object.keys(ROLES) as RoleId[]).map(k => <option key={k} value={k}>{ROLES[k].title}</option>)}
          </select>
          <select className={filterCls} aria-label="University" value={flt.uni} onChange={e => setFlt({ ...flt, uni: e.target.value })}>
            <option value="">All universities</option>{unis.map(u => <option key={u}>{u}</option>)}
          </select>
          <select className={filterCls} aria-label="Minimum score" value={flt.min} onChange={e => setFlt({ ...flt, min: e.target.value })}>
            <option value="">Any score</option>{[70, 80, 90].map(n => <option key={n} value={n}>{n}%+ overall</option>)}
          </select>
          <input className={filterCls} placeholder="Search by name" aria-label="Search by name" value={flt.q} onChange={e => setFlt({ ...flt, q: e.target.value })} />
        </div>
        <div className="grid gap-3 mt-3.5 m720:grid-cols-2">
          {list.length === 0
            ? <Card><p className="text-ink2">No candidates match these filters. Try lowering the minimum score.</p></Card>
            : list.map(c => (
              <Card key={c.name} className="grid gap-2.5">
                <div className="flex gap-3 items-center">
                  <Ring p={c.overall} />
                  <div className="min-w-0"><b>{c.name}</b><div className="text-[14px] text-ink2">{c.uni}</div></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Chip tone="blue">{ROLES[c.role].title}</Chip><Chip>{c.days}-day</Chip>
                  <Chip tone="ok">{readiness(c.overall)}</Chip>
                  <Chip tone={c.s.punct >= 90 ? "ok" : "warn"}>Punctuality {c.s.punct}%</Chip>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="out" sm onClick={() => viewCand(c)}>View evidence</Button>
                  <Button variant={shortlist.includes(c.name) ? "pri" : "out"} sm onClick={() => toggleShort(c.name)}>{shortlist.includes(c.name) ? "Shortlisted" : "Shortlist"}</Button>
                  <Button variant="ghost" sm onClick={() => setInvite(c.name)}>Invite</Button>
                </div>
              </Card>
            ))}
        </div>
      </Section>

      <Section id="post">
        <h2 className="mb-1.5">Post a sponsored simulation</h2>
        <p className="text-ink2 mb-4 max-w-[62ch]">Turn a real entry-level task from your company into a simulation. Candidates complete it, and you meet the ones who did it well.</p>
        <Card className="max-w-[640px]">
          <Field label="Company" htmlFor="p-co"><input id="p-co" className={inputCls} value={form.co} onChange={e => setForm({ ...form, co: e.target.value })} /></Field>
          <Field label="Role" htmlFor="p-role"><input id="p-role" className={inputCls} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Customer Support Associate" /></Field>
          <Field label="A real task a new hire would do" htmlFor="p-task">
            <textarea id="p-task" className={cx(inputCls, "min-h-[110px] resize-y")} value={form.task} onChange={e => setForm({ ...form, task: e.target.value })} placeholder="Describe one real task in 2 or 3 lines" />
          </Field>
          <Button block className="mt-4" onClick={postSim}>Request this simulation</Button>
          <p className="text-[12px] text-ink2 mt-2">From {naira(PRICING.sponsored)} per simulation (pilot pricing).</p>
          {posts.length > 0 && (
            <div className="mt-3.5">
              {posts.map((p, i) => (
                <div key={i} className="py-3 border-b border-line grid gap-1 last:border-b-0">
                  <div className="flex justify-between gap-2 items-center text-[14px] flex-wrap"><b>{p.role} at {p.co}</b><Chip tone="ok">Requested</Chip></div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Section>

      {invite !== null && <InviteSheet name={invite} onClose={() => setInvite(null)} />}
    </main>
  );
}

function InviteSheet({ name, onClose }: { name: string; onClose: () => void }) {
  const [msg, setMsg] = useState(`Hi ${name.split(" ")[0]}, we reviewed your OfficeLife simulation and were impressed. We would like to invite you for a short interview.`);
  return (
    <Sheet onClose={onClose}>
      <SheetHead><h2>Invite {name}</h2><CloseButton onClick={onClose} /></SheetHead>
      <Field label="Message" htmlFor="inv">
        <textarea id="inv" className={cx(inputCls, "min-h-[110px] resize-y")} value={msg} onChange={e => setMsg(e.target.value)} />
      </Field>
      <Button block className="mt-3.5" onClick={() => { onClose(); toast("Invite sent (demo)"); }}>Send invite (demo)</Button>
    </Sheet>
  );
}
