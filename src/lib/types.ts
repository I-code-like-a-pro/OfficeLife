export type PersonKey = "chidi" | "tunde" | "amina" | "bisi" | "ngozi" | "femi";
export type RoleId = "pm" | "swe" | "da";
export type DimKey = "punct" | "task" | "dec" | "crit" | "comm";
export type ArrivalKey = "early" | "on" | "late";
export type Method = "ai" | "rules" | "rules-note";

export interface Person { name: string; role: string; color: string; ini: string }
export interface ReplyOption { label: string; score: number; resp: string }
export interface RubricItem { label: string; keywords: string[]; fix: string }
export interface Choice { title: string; detail: string; score: number; fb: string }

export interface MsgStep { t: string; type: "msg"; from: PersonKey; text: string }
export interface ReplyStep { t: string; type: "reply"; from: PersonKey; text: string; options: ReplyOption[] }
export interface TaskStep {
  t: string; type: "task"; title: string; brief: string; due: string; minWords: number;
  rubric: RubricItem[]; sampleName: string; sampleBad: string; sampleGood: string;
}
export interface FollowupStep {
  t: string; type: "followup"; from: PersonKey; q: string; keywords: string[]; minWords: number; good: string; weak: string;
}
export interface DecisionStep { t: string; type: "decision"; q: string; a: Choice; b: Choice }
export interface BreakStep { t: string; type: "break" }
export interface QuizStep { t: string; type: "quiz"; q: string; options: string[]; correct: number; why: string }
export type Step = MsgStep | ReplyStep | TaskStep | FollowupStep | DecisionStep | BreakStep | QuizStep;

export interface Day { theme: string; steps: Step[] }
export interface Role {
  id: RoleId; title: string; short: string; manager: PersonKey; cls: "" | "v" | "g";
  blurb: string; learn: string[]; skills: string[]; jobs: string; days: Day[];
}
export interface Mentor { id: string; name: string; title: string; role: RoleId; slots: string[]; color: string; ini: string }
export interface SampleCand { name: string; uni: string; role: RoleId; days: number; s: Record<DimKey, number> }

/** One clocked-in day. */
export interface LogEntry {
  in: string; status: ArrivalKey; delta: number; pScore: number;
  task: number; dec: number; quiz: boolean; rep: number; ex: number | null;
  method: Method; taskTitle: string; excerpt: string; out?: string;
}

export interface Scores { n: number; dims: Record<DimKey, number>; overall: number; onTime: number }

export interface Evidence { day: number; title: string; excerpt: string; method: Method; score: number }
export interface Cert {
  code: string; token: string; role: RoleId; n: number; date: string; overall: number; onTime: number;
  sc: Scores; evidence: Evidence[];
}

export interface User {
  name: string; email: string; uni: string; level: string; course: string; target: string;
  plan: "free" | "plus"; google: boolean; joined: string;
}
export interface Booking { mentor: string; title: string; slot: string }
export interface Post { co: string; role: string }

/** Compact certificate payload carried in the verification link. */
export interface CertPayload {
  n: string; u: string; r: RoleId; d: number; dt: string; s: number[]; ot: number;
  lg: [string, string, number, number, number, number, number, string][];
}
