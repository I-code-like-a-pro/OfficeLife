import { useEffect, useRef, useState, type ReactNode } from "react";
import { PEOPLE, ROLES } from "../data/data";
import { I } from "../components/icons";
import { useGo } from "../components/layout";
import {
  Avatar, Button, Card, Chip, Chips, IconButton, KV, Sheet, SheetHead, choiceCls, cx, inputCls, wrapCls
} from "../components/ui";
import { CONFIG, loadScript } from "../lib/config";
import {
  ARR, avg, certCode, certPayload, certToken, clamp, clockStatus, evaluateFollowup, evaluateTask, fmt, fmtMin,
  scoreLog, toMin, today, wordCount, type ReviewItem
} from "../lib/logic";
import { getState, setState, toast, useStore } from "../lib/store";
import type {
  Cert, DecisionStep, LogEntry, Method, PersonKey, QuizStep, ReplyOption, TaskStep
} from "../lib/types";

/* =====================================================================
   CLOCK IN
   ===================================================================== */
export function ClockIn() {
  const go = useGo();
  const enroll = useStore(s => s.enroll)!;
  const arrival = useStore(s => s.arrival);
  const day = useStore(s => s.day);
  const L = useStore(s => s.log[s.day]);
  const r = ROLES[enroll.role];
  const a = ARR[arrival];

  const clockIn = () => {
    const c = clockStatus(a.min);
    setState(s => {
      const log = s.log.slice();
      log[s.day] = { in: a.time + " AM", status: c.status, delta: c.delta, pScore: c.pScore, task: 0, dec: 0, quiz: false, rep: 0, ex: null, method: "rules", taskTitle: "", excerpt: "" };
      return { log };
    });
  };
  const statusBox = "rounded-xl p-3.5 mt-4 text-left flex gap-3 items-start [&_b]:block [&_b]:text-ink [&_span]:text-ink2 [&_span]:text-[14px]";
  return (
    <main className="max-w-[540px] mx-auto px-4 pt-6 pb-14">
      <div className="flex items-center gap-2 justify-between mb-3">
        <Chip tone="blue">Day {day + 1} of {enroll.days}</Chip><span className="text-[14px] text-ink2">{r.title}</span>
      </div>
      <Card className="text-center px-4 py-6">
        <div className="flex items-center gap-2.5 justify-center">
          <div className={cx("w-8 h-8 text-[12px] rounded-lg grid place-items-center text-white font-bold shrink-0", r.cls === "v" ? "bg-[#5B2BC4]" : r.cls === "g" ? "bg-[#0A7A5A]" : "bg-[#0B1E4D]")}>TL</div>
          <b>Tembea Logistics</b>
        </div>
        <p className="text-[14px] text-ink2 mt-2">Your shift starts at <b>9:00 AM</b></p>
        <div className="text-[66px] font-bold tracking-[-.03em] tabular-nums leading-none mt-3.5 mb-1.5" aria-live="polite">
          {a.time}<span className="text-[22px] ml-1.5 text-ink2 font-semibold">AM</span>
        </div>
        <p className="text-[14px] text-ink2">{L ? "Clocked in" : "Your arrival time"}</p>
        {L ? (
          <>
            <div className={cx(statusBox, L.status === "late" ? "bg-warn-soft text-warn" : "bg-green-soft text-green")}>
              {L.status === "late" ? <I.alert /> : <I.check />}
              <div>
                <b>{L.status === "early" ? `You clocked in ${-L.delta} minutes early` : L.status === "on" ? "You clocked in on time" : `You are ${L.delta} minutes late`}</b>
                <span>{L.status === "late" ? `${PEOPLE[r.manager].name} has been notified. This is logged on your certificate.` : "Great start. This is logged on your certificate."}</span>
              </div>
            </div>
            <Button block className="mt-4" onClick={() => go("/work")}>Enter the office</Button>
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 mt-3.5" role="group" aria-label="Demo: pretend arrival time">
              {(["early", "on", "late"] as const).map(k => (
                <button key={k} aria-pressed={arrival === k} onClick={() => setState({ arrival: k })}
                  className="border border-line rounded-lg px-1 py-2.5 text-[14px] font-semibold bg-surface aria-pressed:border-blue aria-pressed:bg-blue-soft aria-pressed:text-blue">
                  {ARR[k].label}<br /><span className="text-[12px] font-normal">{ARR[k].time} AM</span>
                </button>
              ))}
            </div>
            <p className="text-[12px] text-ink2 mt-2">Demo control: pick a pretend arrival time. The live version logs your real arrival with a server timestamp.</p>
            <Button block className="mt-4" onClick={clockIn}>Clock in</Button>
          </>
        )}
      </Card>
    </main>
  );
}

/* =====================================================================
   SUMMARY + CERTIFICATE CREATION
   ===================================================================== */
const dayScore = (L: LogEntry) => avg([L.pScore, L.task, L.dec, L.quiz ? 100 : 40, L.rep, L.ex == null ? 60 : L.ex]);

function makeCert(): Cert {
  const { user, enroll, log: all, certs } = getState();
  const log = all.slice(0, enroll!.days);
  const p = certPayload(user!, enroll!.role, enroll!.days, log, today());
  const sc = scoreLog(log);
  const c: Cert = {
    code: certCode(p), token: certToken(p), role: enroll!.role, n: enroll!.days, date: today(), overall: sc.overall, onTime: sc.onTime, sc,
    evidence: log.map((l, i) => ({ day: i + 1, title: l.taskTitle, excerpt: l.excerpt, method: l.method, score: l.task }))
  };
  setState({ certs: certs.filter(x => x.code !== c.code).concat(c) });
  return c;
}

export function Summary() {
  const go = useGo();
  const enroll = useStore(s => s.enroll)!;
  const day = useStore(s => s.day);
  const L = useStore(s => s.log[s.day]) || ({} as LogEntry);
  const r = ROLES[enroll.role];
  const last = day >= enroll.days - 1;
  const o = dayScore(L);
  const m = PEOPLE[r.manager];
  const note = o >= 85 ? "Strong day. Your decisions were sound and your work was clear."
    : o >= 65 ? "Solid day with room to grow. Review the feedback and be sharper tomorrow."
    : "Tough day, and that is how people learn. Read the feedback closely.";
  return (
    <main className="max-w-[540px] mx-auto px-4 pt-6 pb-14">
      <Chip tone="ok"><I.check /> Day {day + 1} complete</Chip>
      <h1 className="mt-2.5 mb-1">Good work today</h1>
      <p className="text-ink2">{r.days[day].theme}</p>
      <Card className="mt-[18px]">
        <KV rows={[
          ["Clocked in", <>{L.in} <Chip tone={L.status === "late" ? "warn" : "ok"} className="ml-1.5">{ARR[L.status].label}</Chip></>],
          ["Clocked out", "5:00 PM"],
          ["Task", L.task + "%"],
          ["Explained thinking", (L.ex || 0) >= 60 ? "Clear" : "Needs more reasoning"],
          ["Urgent decision", L.dec >= 80 ? "Strong call" : "Could be better"],
          ["Afternoon check-in", L.quiz ? "Correct" : "Missed"],
          ["Teamwork reply", L.rep >= 80 ? "Clear and constructive" : "Needs work"]
        ]} />
      </Card>
      <div className="flex gap-2.5 mt-[18px]">
        <Avatar color={m.color} ini={m.ini} />
        <div className="min-w-0">
          <div className="flex gap-2 items-baseline flex-wrap"><b className="text-[15px]">{m.name}</b><span className="text-[12px] text-ink2">{m.role}</span></div>
          <div className="mt-0.5 leading-[1.45]">{note}</div>
        </div>
      </div>
      <Button block className="mt-[22px]" onClick={() => {
        if (last) { const c = makeCert(); go("/cert/" + c.code); } else { setState({ day: day + 1 }); go("/clockin"); }
      }}>{last ? "Get your certificate" : "Start Day " + (day + 2)}</Button>
      {!last && <p className="text-[12px] text-ink2 text-center mt-2">Day {day + 2} opens tomorrow at 9:00 AM. Tap to jump ahead in this preview.</p>}
    </main>
  );
}

/* =====================================================================
   WORKDAY
   ===================================================================== */
interface TaskResult { pct: number; method: Method; title: string; excerpt: string; failedOnce: boolean; forced: boolean }

type FeedItem = { id: number } & (
  | { kind: "sys"; node: ReactNode }
  | { kind: "msg"; from: PersonKey; text: string; time: string }
  | { kind: "me"; text: string; time: string }
  | { kind: "typing"; from: PersonKey }
  | { kind: "quick"; options: ReplyOption[]; onPick: (i: number) => void }
  | { kind: "task"; st: TaskStep; onDone: (r: TaskResult) => void }
  | { kind: "fu"; onSend: (text: string) => void }
  | { kind: "clockout"; onOut: () => void }
);
type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;
type NewItem = DistributiveOmit<FeedItem, "id">;

type ModalState =
  | { kind: "decision"; st: DecisionStep; onChoose: (k: "a" | "b" | null) => void }
  | { kind: "quiz"; st: QuizStep; onAnswer: (ok: boolean) => void; onContinue: () => void };

const msgRow = "flex gap-2.5";
function MsgView({ from, text, time }: { from: PersonKey; text: string; time: string }) {
  const p = PEOPLE[from];
  return (
    <div className={msgRow}>
      <Avatar color={p.color} ini={p.ini} />
      <div className="min-w-0">
        <div className="flex gap-2 items-baseline flex-wrap"><b className="text-[15px]">{p.name}</b><span className="text-[12px] text-ink2">{p.role}</span><time className="text-[12px] text-ink2">{time}</time></div>
        <div className="mt-0.5 leading-[1.45]">{text}</div>
      </div>
    </div>
  );
}

function FeedRow({ item }: { item: FeedItem }) {
  switch (item.kind) {
    case "sys":
      return <div className="text-center text-[13px] text-ink2 flex items-center gap-2.5 before:content-[''] before:flex-1 before:h-px before:bg-line after:content-[''] after:flex-1 after:h-px after:bg-line">{item.node}</div>;
    case "msg": return <MsgView from={item.from} text={item.text} time={item.time} />;
    case "me":
      return (
        <div className={cx(msgRow, "flex-row-reverse")}>
          <div className="min-w-0 flex flex-col items-end">
            <div className="flex gap-2 items-baseline flex-wrap"><b className="text-[15px]">You</b><time className="text-[12px] text-ink2">{item.time}</time></div>
            <div className="mt-0.5 leading-[1.45] bg-blue text-blue-ink px-3.5 py-2.5 rounded-[14px_14px_2px_14px] max-w-[90%]">{item.text}</div>
          </div>
        </div>
      );
    case "typing": {
      const p = PEOPLE[item.from];
      return (
        <div className={msgRow}>
          <Avatar color={p.color} ini={p.ini} />
          <div className="flex gap-1 py-2.5" aria-label={`${p.name} is typing`}>
            {[0, 150, 300].map(d => <i key={d} className="w-[7px] h-[7px] rounded-full bg-ink2 animate-hop" style={{ animationDelay: d + "ms" }} />)}
          </div>
        </div>
      );
    }
    case "quick":
      return (
        <div className="grid gap-2 ml-[46px]">
          {item.options.map((o, i) => (
            <button key={i} onClick={() => item.onPick(i)}
              className="text-left border border-blue text-blue rounded-[10px] px-3.5 py-2.5 font-semibold bg-surface hover:bg-blue-soft">{o.label}</button>
          ))}
        </div>
      );
    case "task": return <TaskCard st={item.st} onDone={item.onDone} />;
    case "fu": return <FollowupInput onSend={item.onSend} />;
    case "clockout":
      return (
        <div className="ml-[46px]">
          <Card>
            <b>It is 5:00 PM</b>
            <p className="text-[14px] text-ink2 mt-1 mb-3">Clock out to save today's report.</p>
            <Button block onClick={item.onOut}>Clock out</Button>
          </Card>
        </div>
      );
  }
}

function FollowupInput({ onSend }: { onSend: (t: string) => void }) {
  const [v, setV] = useState("");
  const send = () => { if (wordCount(v) < 3) { toast("Write at least a short sentence"); return; } onSend(v); };
  return (
    <div className="ml-[46px]">
      <div className="flex items-stretch gap-2 mt-2">
        <input id="fu-in" value={v} onChange={e => setV(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder="Type your answer" aria-label="Your answer" className="flex-1 min-h-[46px] border border-line rounded-lg px-3 bg-surface" />
        <Button onClick={send}>Send</Button>
      </div>
    </div>
  );
}

/* ---------- reading uploaded files ---------- */
type PdfLib = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (o: { data: ArrayBuffer }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> }> };
};
async function readPdf(file: File) {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
  const pdfjs = (window as unknown as { pdfjsLib: PdfLib }).pdfjsLib;
  pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let out = "";
  for (let i = 1; i <= Math.min(doc.numPages, 6); i++) { const pg = await doc.getPage(i), tc = await pg.getTextContent(); out += tc.items.map(x => x.str).join(" ") + "\n"; }
  return out;
}
async function readDocx(file: File) {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js");
  const mammoth = (window as unknown as { mammoth: { extractRawText: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> } }).mammoth;
  const r = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return r.value || "";
}
const readDataUrl = (file: File) => new Promise<string>((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.onerror = rej; fr.readAsDataURL(file); });

/* ---------- AI reviewer (falls back to rules when unreachable) ---------- */
interface Sub { name: string; text?: string; image?: string; noted?: boolean }
interface AiResult { source: string; verdict: "well_done" | "fix"; score: number; notes: string[] }
async function aiReview(st: TaskStep, sub: Sub): Promise<AiResult | null> {
  if (!CONFIG.aiEnabled || getState().aiFails >= 1) return null;
  if ((sub.image || "").length > 4000000) return null;
  const ctrl = new AbortController(), to = setTimeout(() => ctrl.abort(), 18000);
  try {
    const r = await fetch(CONFIG.apiUrl, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
      body: JSON.stringify({ task: st.title + ": " + st.brief, rubric: st.rubric.map(x => ({ label: x.label, keywords: x.keywords })), text: sub.text || "", imageDataUrl: sub.image || "", fileName: sub.name })
    });
    if (!r.ok) throw new Error("bad status");
    const j = (await r.json()) as AiResult;
    if (j.source !== "ai") return null;
    return j;
  } catch { setState(s => ({ aiFails: s.aiFails + 1 })); return null; } finally { clearTimeout(to); }
}

const methodLabel = (m: Method) => m === "ai" ? "Reviewed by the AI reviewer" : m === "rules-note" ? "Reviewed by the rule-based reviewer from your written note" : "Reviewed by the rule-based reviewer (AI is offline)";

type Phase =
  | { k: "pick" }
  | { k: "edit"; prefill: string }
  | { k: "review"; name: string }
  | { k: "note"; sub: Sub }
  | { k: "fix"; name: string; notes: string[]; method: Method }
  | { k: "ok"; name: string; forced: boolean; failedOnce: boolean; notes: string[]; items: ReviewItem[]; method: Method; score: number };

interface Res { verdict: "well_done" | "fix"; pct: number; notes: string[]; items: ReviewItem[]; method: Method }

function TaskCard({ st, onDone }: { st: TaskStep; onDone: (r: TaskResult) => void }) {
  const [phase, setPhase] = useState<Phase>({ k: "pick" });
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const el = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const attempt = useRef(0);
  const last = useRef<Sub | null>(null);
  const failedOnce = useRef(false);
  const mounted = useRef(true);
  const lite = useStore(s => s.lite);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { el.current?.scrollIntoView({ behavior: lite ? "auto" : "smooth", block: "end" }); }, [phase.k, lite]);

  const submit = async (sub: Sub) => {
    attempt.current++; last.current = sub;
    setPhase({ k: "review", name: sub.name });
    const readable = (sub.text || "").trim().length >= 15;
    let res: Res | null = null;
    if (readable || sub.image) {
      const ai = await aiReview(st, sub);
      if (!mounted.current) return;
      if (ai) res = {
        verdict: ai.verdict, pct: clamp(Number(ai.score) || 60, 20, 98),
        notes: ai.notes && ai.notes.length ? ai.notes : ["Review the rubric points and strengthen the weakest one."],
        items: readable ? evaluateTask(sub.text || "", st).items : [], method: "ai"
      };
    }
    if (!res) {
      if (readable) res = evaluateTask(sub.text || "", st, { cap: sub.noted ? 88 : 0, method: sub.noted ? "rules-note" : "rules" });
      else { setPhase({ k: "note", sub }); attempt.current--; return; }
    }
    await new Promise(r => setTimeout(r, getState().lite ? 200 : 1100));
    if (!mounted.current) return;
    showResult(res, sub);
  };

  const showResult = (res: Res, sub: Sub) => {
    const forced = res.verdict === "fix" && attempt.current >= 3;
    if (res.verdict === "fix" && !forced) {
      failedOnce.current = true;
      setPhase({ k: "fix", name: sub.name, notes: res.notes, method: res.method });
      return;
    }
    const score = forced ? Math.min(res.pct, 70) : res.pct;
    setPhase({ k: "ok", name: sub.name, forced, failedOnce: failedOnce.current, notes: res.notes, items: res.items, method: res.method, score });
    onDone({ pct: score, method: res.method, title: st.title, excerpt: String(sub.text || "").trim().slice(0, 220), failedOnce: failedOnce.current, forced });
  };

  const handleFile = async (file: File) => {
    setPhase({ k: "review", name: file.name });
    const ext = file.name.split(".").pop()!.toLowerCase();
    let t = "", image = "";
    try {
      if (["txt", "md", "csv"].includes(ext)) t = await file.text();
      else if (ext === "pdf") t = await readPdf(file);
      else if (ext === "docx") t = await readDocx(file);
      else if (["png", "jpg", "jpeg", "webp"].includes(ext)) image = await readDataUrl(file);
    } catch { /* fall through to note */ }
    if (mounted.current) void submit({ name: file.name, text: t, image });
  };

  const fileChip = (name: string) => (
    <div className="flex items-center gap-2 bg-chip rounded-lg px-3 py-2 text-[14px] font-semibold mt-3.5 w-fit max-w-full [overflow-wrap:anywhere]"><I.file />{name ? <span>{name}</span> : null}</div>
  );
  const upl = "flex gap-3 items-center flex-wrap mt-3.5";
  const ta = cx(inputCls, "min-h-[110px] mt-3 py-2.5 px-3 resize-y min-h-[110px]");
  const link = "text-blue underline font-semibold text-[14px]";
  const fbBase = "rounded-[10px] p-3.5 mt-3.5 [&_p]:text-[15px] [&_p]:text-ink [&_li]:text-[15px] [&_li]:text-ink";
  // The original reused the landing page's .how grid class here, so this caption sits in a quarter-width column on wide screens. Kept as is.
  const how = (m: Method) => <p className="!text-[12px] !text-ink2 mt-2.5 grid gap-3 m720:grid-cols-4">{methodLabel(m)}</p>;

  let body: ReactNode = null;
  if (phase.k === "pick") body = (
    <>
      <div className={upl}>
        <Button onClick={() => fileInput.current?.click()}><I.upload /> Upload a file</Button>
        <Button variant="out" onClick={() => setPhase({ k: "edit", prefill: "" })}>Type your answer</Button>
      </div>
      <div className={cx(upl, "mt-2")}>
        <button className={link} onClick={() => void submit({ name: st.sampleName, text: attempt.current === 0 ? st.sampleBad : st.sampleGood })}>Use a sample file (demo)</button>
      </div>
      <p className="text-[15px] text-ink2 mt-2">PDF, Word, text, PNG or JPG</p>
    </>
  );
  else if (phase.k === "edit") body = (
    <>
      <label className="absolute w-px h-px overflow-hidden [clip:rect(0_0_0_0)]" htmlFor="ans">Your answer</label>
      <textarea id="ans" className={ta} autoFocus value={text || phase.prefill} onChange={e => setText(e.target.value)} placeholder="Type your answer here" />
      <div className={upl}>
        <Button onClick={() => {
          const v = text || phase.prefill;
          if (wordCount(v) < 5) { toast("Write a little more first"); return; }
          void submit({ name: "Typed answer", text: v });
        }}>Submit for review</Button>
        <button className={link} onClick={() => setPhase({ k: "pick" })}>Back</button>
      </div>
    </>
  );
  else if (phase.k === "review") body = (
    <>
      {fileChip(phase.name)}
      <div className="flex gap-2.5 items-center mt-3 text-[14px] text-ink2"><div className="w-[18px] h-[18px] border-[3px] border-line border-t-blue rounded-full animate-turn shrink-0" />Reviewing your work...</div>
    </>
  );
  else if (phase.k === "note") body = (
    <>
      {fileChip(phase.sub.name)}
      <p className="text-[15px] text-ink2 mt-3">We cannot read inside this file right now. Add 2 or 3 lines describing what it shows and what you did, and we will review your note.</p>
      <textarea id="note" className={ta} value={note} onChange={e => setNote(e.target.value)} placeholder="Describe your work" />
      <div className={upl}>
        <Button onClick={() => {
          if (wordCount(note) < 5) { toast("Add a few words describing your work"); return; }
          void submit({ name: phase.sub.name, text: note, image: phase.sub.image, noted: true });
        }}>Submit note</Button>
        <button className={link} onClick={() => setPhase({ k: "pick" })}>Back</button>
      </div>
    </>
  );
  else if (phase.k === "fix") body = (
    <>
      {fileChip(phase.name)}
      <div className={cx(fbBase, "bg-warn-soft")}>
        <h4 className="text-[16px] font-bold flex gap-2 items-center text-warn"><I.sparkle /> Fix this</h4>
        <p>Close, but not ready to send. Please fix:</p>
        <ul className="pl-5 mt-1.5 mb-2.5 list-disc">{phase.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
        <div className={cx(upl, "mt-1.5")}>
          <Button sm onClick={() => setPhase({ k: "edit", prefill: last.current?.text ?? "" })}>Edit and resubmit</Button>
          <Button variant="out" sm onClick={() => fileInput.current?.click()}><I.upload /> Upload new version</Button>
          <button className={link} onClick={() => void submit({ name: st.sampleName, text: attempt.current === 0 ? st.sampleBad : st.sampleGood })}>Use a sample file</button>
        </div>
        {how(phase.method)}
      </div>
    </>
  );
  else body = (
    <>
      {fileChip(phase.name)}
      <div className={cx(fbBase, phase.forced ? "bg-warn-soft" : "bg-green-soft")}>
        <h4 className={cx("text-[16px] font-bold flex gap-2 items-center", phase.forced ? "text-warn" : "text-green")}>
          {phase.forced ? <><I.sparkle /> Good effort, let's move on</> : <><I.check /> Well done</>}
        </h4>
        <p>
          {phase.forced ? "Some points are still missing, but we will keep going. Read the notes and aim higher next time."
            : phase.failedOnce ? "Much better. You acted on the feedback, and that is what great employees do."
            : "Clear, realistic and easy to act on. A manager could use this today."} Score: <b>{phase.score}%</b>
        </p>
        {phase.forced && <ul className="pl-5 mt-1.5 mb-2.5 list-disc">{phase.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
        {phase.items.length > 0 && (
          <Chips className="mt-2.5">{phase.items.map(i => <Chip key={i.label} tone={i.s >= 4 ? "ok" : "warn"}>{i.label} {i.s}/5</Chip>)}</Chips>
        )}
        {how(phase.method)}
      </div>
    </>
  );

  return (
    <div ref={el} className="border border-line rounded-xl bg-surface p-4 ml-[46px] [box-shadow:var(--shadow)]">
      <Chip tone="blue">New task &middot; due {st.due}</Chip>
      <h3 className="mt-2 mb-1">{st.title}</h3>
      <p className="text-[15px] text-ink2">{st.brief}</p>
      <div>{body}</div>
      <input ref={fileInput} type="file" hidden accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt,.md,.csv"
        onChange={e => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }} />
    </div>
  );
}

/* ---------- decision + quiz modals ---------- */
function DecisionModal({ st, onChoose }: { st: DecisionStep; onChoose: (k: "a" | "b" | null) => void }) {
  const [left, setLeft] = useState(60);
  useEffect(() => { const iv = setInterval(() => setLeft(l => l - 1), 1000); return () => clearInterval(iv); }, []);
  useEffect(() => { if (left <= 0) onChoose(null); }, [left, onChoose]);
  return (
    <Sheet>
      <SheetHead>
        <Chip tone="warn">Decision needed</Chip>
        <span className="font-bold tabular-nums text-warn" aria-live="off">{left >= 60 ? "1:00" : "0:" + String(Math.max(left, 0)).padStart(2, "0")}</span>
      </SheetHead>
      <h2>{st.q}</h2>
      <p className="text-ink2 text-[14px]">You cannot do both. Choose what you start with, and decide before the clock runs out.</p>
      <div className="grid gap-2.5 mt-3">
        {(["a", "b"] as const).map(k => (
          <button key={k} className={choiceCls()} onClick={() => onChoose(k)}><b>{st[k].title}</b><span>{st[k].detail}</span></button>
        ))}
      </div>
    </Sheet>
  );
}

function QuizModal({ st, onAnswer, onContinue }: { st: QuizStep; onAnswer: (ok: boolean) => void; onContinue: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const ok = picked === st.correct;
  return (
    <Sheet>
      <SheetHead><Chip tone="blue">Afternoon check-in</Chip><span className="text-[14px] text-ink2">{fmt(st.t)}</span></SheetHead>
      <h2>{st.q}</h2>
      <div className="grid gap-2.5 mt-3">
        {st.options.map((o, i) => (
          <button key={i} className={choiceCls(picked === null ? undefined : i === st.correct ? "right" : i === picked ? "wrong" : undefined)}
            onClick={() => { if (picked !== null) return; setPicked(i); onAnswer(i === st.correct); }}><b>{o}</b></button>
        ))}
      </div>
      {picked !== null && (
        <>
          <p className="mt-3.5 text-[15px]"><b>{ok ? "Correct." : "Not quite."}</b> {st.why}</p>
          <Button block className="mt-3.5" onClick={onContinue}>Continue</Button>
        </>
      )}
    </Sheet>
  );
}

/* ---------- the workday itself ---------- */
export function Work() {
  const go = useGo();
  const enroll = useStore(s => s.enroll)!;
  const day = useStore(s => s.day);
  const r = ROLES[enroll.role];
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [clock, setClockDisp] = useState(540);
  const [modal, setModal] = useState<ModalState | null>(null);
  const feedEl = useRef<HTMLDivElement>(null);

  useEffect(() => { feedEl.current?.lastElementChild?.scrollIntoView({ behavior: getState().lite ? "auto" : "smooth", block: "end" }); }, [feed]);

  useEffect(() => {
    let alive = true, nextId = 1, cur = 540, raf = 0;
    const timers = new Set<number>();
    const { day: d, enroll: en } = getState();
    const role = ROLES[en!.role];
    const mgr = role.manager;
    setFeed([]); setModal(null); setClockDisp(540);

    /* helpers: every one is a no-op once the page has unmounted */
    const wait = (ms: number) => new Promise<void>(res => { const t = window.setTimeout(() => { timers.delete(t); res(); }, ms); timers.add(t); });
    const push = (item: NewItem) => { const id = nextId++; if (alive) setFeed(f => [...f, { ...item, id } as FeedItem]); return id; };
    const remove = (id: number) => { if (alive) setFeed(f => f.filter(x => x.id !== id)); };
    const patchLog = (patch: Partial<LogEntry>) => setState(s => { const log = s.log.slice(); log[s.day] = { ...log[s.day], ...patch }; return { log }; });
    const setClock = (t: string | number) => {
      if (!alive) return;
      const target = typeof t === "number" ? t : toMin(t), from = cur;
      cur = target; cancelAnimationFrame(raf);
      if (getState().lite || matchMedia("(prefers-reduced-motion: reduce)").matches || from === target) { setClockDisp(target); return; }
      const t0 = performance.now();
      const tick = (now: number) => { const p = Math.min(1, (now - t0) / 700); setClockDisp(Math.round(from + (target - from) * p)); if (p < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    };
    const me = (text: string) => push({ kind: "me", text, time: fmtMin(cur) });
    /** typing indicator, then the message */
    const say = async (from: PersonKey, text: string, time: string, typingMs = 1000) => {
      const ty = push({ kind: "typing", from });
      await wait(typingMs); remove(ty);
      push({ kind: "msg", from, text, time });
    };

    const run = async () => {
      const L = getState().log[d];
      if (!L) { go("/clockin"); return; }
      setClock("09:00");
      push({ kind: "sys", node: <>You clocked in at {L.in} &middot; {ARR[L.status].label}</> });
      await wait(700);

      for (const st of role.days[d].steps) {
        if (!alive) return;
        switch (st.type) {
          case "msg":
            setClock(st.t); await say(st.from, st.text, fmt(st.t)); await wait(700); break;
          case "reply": {
            setClock(st.t); await say(st.from, st.text, fmt(st.t));
            const i = await new Promise<number>(res => { const id = push({ kind: "quick", options: st.options, onPick: n => { remove(id); res(n); } }); });
            const o = st.options[i];
            patchLog({ rep: o.score }); me(o.label);
            await say(st.from, o.resp, fmtMin(cur), 900); await wait(700); break;
          }
          case "task": {
            setClock(st.t);
            const res = await new Promise<TaskResult>(resolve => { push({ kind: "task", st, onDone: resolve }); });
            patchLog({ task: res.pct, method: res.method, taskTitle: res.title, excerpt: res.excerpt });
            if (res.failedOnce && !res.forced) setState({ revised: true });
            await wait(1300); break;
          }
          case "followup": {
            setClock(st.t); await say(st.from, st.q, fmt(st.t));
            const v = await new Promise<string>(res => { const id = push({ kind: "fu", onSend: t => { remove(id); res(t); } }); });
            me(v);
            const fu = evaluateFollowup(v, st);
            patchLog({ ex: fu.pct });
            await say(st.from, fu.feedback, fmtMin(cur)); await wait(800); break;
          }
          case "decision": {
            setClock(st.t);
            push({ kind: "sys", node: <><Chip tone="warn">Decision needed</Chip>&nbsp;<span className="text-[14px]">{st.q}</span></> });
            const k = await new Promise<"a" | "b" | null>(res => { if (alive) setModal({ kind: "decision", st, onChoose: res }); });
            if (alive) setModal(null);
            if (k === null) {
              patchLog({ dec: 30 }); me("I ran out of time.");
              await say(mgr, "Time ran out, so I had to decide for you. In real work, hesitation has a cost. Next time, pick the option you can defend.", fmtMin(cur));
            } else {
              const o = st[k];
              patchLog({ dec: o.score }); me(`I'll start with: ${o.title}.`);
              await say(mgr, o.fb, fmtMin(cur));
            }
            await wait(800); break;
          }
          case "break":
            push({ kind: "sys", node: <>Lunch break &middot; 1:00 to 2:00 PM</> }); setClock("14:00"); await wait(900); break;
          case "quiz": {
            setClock(st.t);
            await new Promise<void>(res => { if (alive) setModal({ kind: "quiz", st, onAnswer: ok => patchLog({ quiz: ok }), onContinue: res }); });
            if (alive) setModal(null);
            push({ kind: "sys", node: <>Back to work</> }); await wait(600); break;
          }
        }
      }

      /* finish the day */
      if (!alive) return;
      setClock("16:45");
      const lastDay = d >= en!.days - 1;
      await say(mgr, lastDay ? "That is a wrap on the simulation. Well done, thank you for the hard work." : "Good work today. Finish up and I will see you tomorrow at 9.", fmtMin(cur));
      await wait(600);
      setClock("17:00");
      push({ kind: "clockout", onOut: () => { patchLog({ out: "5:00 PM" }); go("/summary"); } });
    };
    void run();

    return () => { alive = false; timers.forEach(clearTimeout); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="sticky top-0 z-30 bg-bg border-b border-line">
        <div className={wrapCls}>
          <div className="flex items-center gap-2 h-[54px]">
            <IconButton onClick={() => go("/dashboard")} aria-label="Leave workday"><I.back /></IconButton>
            <div className="font-semibold text-[16px] leading-[1.2]">
              {r.title}
              <small className="block font-normal text-ink2 text-[12px]">Day {day + 1} of {enroll.days} &middot; {r.days[day].theme}</small>
            </div>
            <span className="flex-1" />
            <span className="font-bold tabular-nums bg-blue-soft text-blue px-3 py-1.5 rounded-full text-[15px]">{fmtMin(clock)}</span>
          </div>
          <div className="flex items-center gap-2 pb-2 text-[12px] text-ink2">
            <span>9 AM</span>
            <div className="h-2 rounded-[99px] bg-chip overflow-hidden flex-1"><i className="block h-full rounded-[99px] bg-blue" style={{ width: clamp((clock - 540) / 480 * 100, 0, 100) + "%" }} /></div>
            <span>5 PM</span>
          </div>
        </div>
      </div>
      <main className={cx("mx-auto px-4 max-w-[760px]")}>
        <div className="text-[13px] text-ink2 pt-3"># tembea-product &middot; Today</div>
        <div ref={feedEl} className="pt-3 pb-[140px] flex flex-col gap-4" aria-live="polite">
          {feed.map(item => <FeedRow key={item.id} item={item} />)}
        </div>
      </main>
      {modal?.kind === "decision" && <DecisionModal st={modal.st} onChoose={modal.onChoose} />}
      {modal?.kind === "quiz" && <QuizModal st={modal.st} onAnswer={modal.onAnswer} onContinue={modal.onContinue} />}
    </>
  );
}

