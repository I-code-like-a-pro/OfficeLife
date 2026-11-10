/* Pure functions: no DOM, easy to test. Ported 1:1 from js/logic.js. */
import type {
  ArrivalKey, CertPayload, DimKey, FollowupStep, LogEntry, Method, RoleId, RubricItem, SampleCand, Scores, User
} from "./types";

export const avg = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
export const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export const fmtMin = (m: number) => {
  const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, "0");
  return `${((h + 11) % 12) + 1}:${mm} ${h >= 12 ? "PM" : "AM"}`;
};
export const fmt = (t: string) => fmtMin(toMin(t));
export const wordCount = (s: string | undefined | null) => (String(s || "").trim().match(/\S+/g) || []).length;

/* ---------- clock-in ---------- */
export const ARR: Record<ArrivalKey, { label: string; time: string; min: number }> = {
  early: { label: "Early", time: "8:52", min: 532 },
  on: { label: "On time", time: "9:00", min: 540 },
  late: { label: "Late", time: "9:14", min: 554 }
};
export function clockStatus(arrivalMin: number, shiftMin = 540) {
  const delta = arrivalMin - shiftMin;
  const status: ArrivalKey = delta < -5 ? "early" : delta <= 0 ? "on" : "late";
  const pScore = status === "early" ? 100 : status === "on" ? 95 : Math.max(40, 90 - delta * 2);
  return { delta, status, pScore };
}

/* ---------- rules-based reviewer (used whenever AI is offline) ---------- */
export interface ReviewItem { label: string; s: number; hit: boolean; fix: string }
export interface TaskReview {
  verdict: "well_done" | "fix"; pct: number; items: ReviewItem[]; notes: string[]; words: number; method: Method;
}
export function evaluateTask(
  text: string,
  task: { rubric: RubricItem[]; minWords?: number },
  opts: { cap?: number; method?: Method } = {}
): TaskReview {
  const t = String(text || "").toLowerCase();
  const words = wordCount(text);
  const items = task.rubric.map(r => {
    const hits = r.keywords.filter(k => t.includes(k.toLowerCase())).length;
    const s = hits >= 2 ? 5 : hits === 1 ? 4 : 1;
    return { label: r.label, s, hit: hits > 0, fix: r.fix };
  });
  const miss = items.filter(i => !i.hit);
  const short = words < (task.minWords || 30);
  let pct = Math.round(avg(items.map(i => i.s)) * 20);
  if (short) pct = Math.min(pct, 70);
  if (opts.cap) pct = Math.min(pct, opts.cap);
  pct = clamp(pct, 20, 98);
  const verdict = miss.length === 0 && !short ? "well_done" : "fix";
  const notes = miss.map(m => m.fix);
  if (short) notes.push(`Add more detail. Aim for at least ${task.minWords || 30} words (you wrote ${words}).`);
  return { verdict, pct, items, notes, words, method: opts.method || "rules" };
}

export function evaluateFollowup(text: string, step: FollowupStep) {
  const t = String(text || "").toLowerCase();
  const words = wordCount(text);
  const hits = step.keywords.filter(k => t.includes(k.toLowerCase())).length;
  let pct = words >= step.minWords ? clamp(45 + hits * 18, 45, 100) : 30;
  if (words >= step.minWords && hits === 0) pct = 45;
  const ok = pct >= 60;
  return { pct, ok, feedback: ok ? step.good : step.weak };
}

/* ---------- scoring ---------- */
export function scoreLog(log: LogEntry[]): Scores {
  const n = log.length || 1;
  const punct = avg(log.map(l => l.pScore || 0));
  const task = avg(log.map(l => l.task || 0));
  const dec = avg(log.map(l => l.dec || 0));
  const quizScore = avg(log.map(l => (l.quiz ? 100 : 40)));
  const ex = avg(log.map(l => (l.ex == null ? 60 : l.ex)));
  const crit = avg([quizScore, ex]);
  const rep = avg(log.map(l => l.rep || 0));
  const comm = avg([rep, task]);
  const dims = { punct, task, dec, crit, comm };
  const overall = avg([punct, task, dec, crit, comm]);
  const onTime = log.filter(l => l.status !== "late").length;
  return { n, dims, overall, onTime };
}
export const DIM_LABELS: Record<DimKey, string> = {
  punct: "Punctuality and reliability",
  task: "Task quality",
  dec: "Decision-making",
  crit: "Critical thinking",
  comm: "Communication"
};
export const DIM_KEYS = Object.keys(DIM_LABELS) as DimKey[];

/** Minimal shape that dimEvidence needs, so it works for live logs and decoded certificates. */
export interface EvidenceRow { status: ArrivalKey; task: number; dec: number; quiz: boolean; rep: number; ex: number | null; method: Method }
export function dimEvidence(key: DimKey, log: EvidenceRow[], sc: Scores): string {
  const n = log.length;
  switch (key) {
    case "punct": return `Clocked in on time or early on ${sc.onTime} of ${n} days.`;
    case "task": {
      const ai = log.filter(l => l.method === "ai").length;
      return `${n} deliverable${n > 1 ? "s" : ""} reviewed${ai ? " (" + ai + " by AI)" : " by the rule-based reviewer"}.`;
    }
    case "dec": return `Chose the stronger option in ${log.filter(l => l.dec >= 80).length} of ${n} urgent trade-offs.`;
    case "crit": return `Answered ${log.filter(l => l.quiz).length} of ${n} check-ins correctly and explained ${log.filter(l => (l.ex || 0) >= 70).length} of ${n} decisions well.`;
    case "comm": return `Gave clear, constructive replies in ${log.filter(l => l.rep >= 80).length} of ${n} team messages.`;
  }
}
export function badgesFor(sc: Scores, days: number): [string, string][] {
  const b: [string, string][] = [];
  if (sc.onTime === sc.n) b.push(["Always on time", "Never late"]);
  if (sc.dims.dec >= 90) b.push(["Sharp decider", "Strong calls under pressure"]);
  if (sc.dims.crit >= 85) b.push(["Deep thinker", "Explains the why"]);
  if (sc.dims.task >= 88) b.push(["Quality maker", "High-scoring work"]);
  if (sc.dims.comm >= 88) b.push(["Clear communicator", "Constructive and clear"]);
  if (days >= 3) b.push(["Full shift", "Completed 3 workdays"]);
  return b;
}
export function readiness(overall: number) {
  return overall >= 90 ? "Interview-ready" : overall >= 80 ? "Strong candidate" : overall >= 65 ? "Developing" : "Keep practising";
}

/* ---------- certificate encoding (demo verification, no server) ---------- */
export const b64e = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
export const b64d = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));
export function fnv(str: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36).padStart(7, "0");
}
export function certPayload(user: Pick<User, "name" | "uni">, roleId: RoleId, days: number, log: LogEntry[], dateISO: string): CertPayload {
  const sc = scoreLog(log);
  const d = sc.dims;
  return {
    n: user.name, u: user.uni, r: roleId, d: days, dt: dateISO,
    s: [d.punct, d.task, d.dec, d.crit, d.comm], ot: sc.onTime,
    lg: log.map(l => [
      l.status === "early" ? "e" : l.status === "on" ? "o" : "l", l.in, l.task || 0, l.dec || 0, l.quiz ? 1 : 0, l.rep || 0,
      l.ex == null ? 60 : l.ex, l.method === "ai" ? "a" : l.method === "rules-note" ? "n" : "r"
    ])
  };
}
export function certCode(p: CertPayload) {
  const a = fnv(JSON.stringify(p) + "|code-a"), b = fnv(JSON.stringify(p) + "|code-b");
  return "OL-" + a.slice(-4).toUpperCase() + "-" + b.slice(-4).toUpperCase();
}
export function certToken(p: CertPayload) {
  const body = b64e(JSON.stringify(p));
  return body + "." + fnv(body + "|officelife-demo");
}
export function certFromToken(tok: string): { p: CertPayload; ok: boolean } | null {
  try {
    const [body, sig] = String(tok).split(".");
    if (!body || !sig) return null;
    const ok = fnv(body + "|officelife-demo") === sig;
    const p = JSON.parse(b64d(body)) as CertPayload;
    if (!p || !Array.isArray(p.s) || p.s.length !== 5) return null;
    return { p, ok };
  } catch { return null; }
}
export function payloadScore(p: CertPayload) {
  const dims: Record<DimKey, number> = { punct: p.s[0], task: p.s[1], dec: p.s[2], crit: p.s[3], comm: p.s[4] };
  return { dims, overall: avg(Object.values(dims)) };
}
export function sampleToPayload(c: Pick<SampleCand, "name" | "uni" | "role" | "days" | "s">, dateISO: string): CertPayload {
  const d = c.s;
  const lg: CertPayload["lg"] = [];
  for (let i = 0; i < c.days; i++) {
    lg.push([
      d.punct >= 95 ? "e" : d.punct >= 80 ? "o" : "l", d.punct >= 95 ? "8:55 AM" : d.punct >= 80 ? "9:00 AM" : "9:12 AM",
      d.task, d.dec, d.crit >= 80 ? 1 : 0, d.comm, d.crit, i % 2 ? "r" : "a"
    ]);
  }
  return { n: c.name, u: c.uni, r: c.role, d: c.days, dt: dateISO, s: [d.punct, d.task, d.dec, d.crit, d.comm], ot: lg.filter(x => x[0] !== "l").length, lg };
}
/** Rebuild a log from a certificate payload so the same display code serves live and shared certificates. */
export function pseudoLog(p: CertPayload): (EvidenceRow & { in: string })[] {
  return p.lg.map(x => ({
    status: x[0] === "e" ? "early" : x[0] === "o" ? "on" : "late",
    in: x[1], task: x[2], dec: x[3], quiz: !!x[4], rep: x[5], ex: x[6],
    method: x[7] === "a" ? "ai" : x[7] === "n" ? "rules-note" : "rules"
  }));
}

/* ---------- csv ---------- */
export function toCSV(rows: (string | number)[][]) {
  return rows.map(r => r.map(c => {
    const s = String(c == null ? "" : c);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(",")).join("\n");
}

/* ---------- university search ---------- */
export function searchUnis(q: string, list: string[]) {
  const s = String(q || "").trim().toLowerCase();
  if (!s) return list.slice(0, 8);
  const starts = list.filter(u => u.toLowerCase().startsWith(s));
  const has = list.filter(u => !u.toLowerCase().startsWith(s) && u.toLowerCase().includes(s));
  return starts.concat(has).slice(0, 8);
}
export const canonUni = (v: string, list: string[]) => list.find(u => u.toLowerCase() === String(v || "").trim().toLowerCase()) || "";
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || "").trim());

/* ---------- small display helpers ---------- */
export const today = () => new Date().toISOString().slice(0, 10);
export const prettyDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
export const initials = (n: string) => String(n || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
export const naira = (n: number) => "₦" + Number(n).toLocaleString("en-NG");
