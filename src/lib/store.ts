import { useSyncExternalStore } from "react";
import type { ArrivalKey, Booking, Cert, LogEntry, Post, RoleId, User } from "./types";

/* ---------- safe storage (works even where localStorage is blocked) ---------- */
const mem: Record<string, unknown> = {};
export const storage = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem("ol_" + k);
      return v ? (JSON.parse(v) as T) : k in mem ? (mem[k] as T) : d;
    } catch { return k in mem ? (mem[k] as T) : d; }
  },
  set(k: string, v: unknown) {
    mem[k] = v;
    try { localStorage.setItem("ol_" + k, JSON.stringify(v)); } catch { /* ignore */ }
  },
  del(k: string) {
    delete mem[k];
    try { localStorage.removeItem("ol_" + k); } catch { /* ignore */ }
  }
};

export interface AppState {
  /* persisted */
  user: User | null;
  certs: Cert[];
  bookings: Booking[];
  shortlist: string[];
  posts: Post[];
  theme: "" | "light" | "dark";
  lite: boolean;
  accounts: Record<string, User>;
  /* session only */
  enroll: { role: RoleId; days: number } | null;
  day: number;
  log: LogEntry[];
  arrival: ArrivalKey;
  revised: boolean;
  aiFails: number;
  next: string;
  googlePrefill: { name: string; email: string } | null;
  mentorRole: string;
  toasts: { id: number; msg: string }[];
}

const PERSISTED = ["user", "certs", "bookings", "shortlist", "posts", "theme", "lite", "accounts"] as const;

let state: AppState = {
  user: storage.get<User | null>("user", null),
  certs: storage.get<Cert[]>("certs", []),
  bookings: storage.get<Booking[]>("bookings", []),
  shortlist: storage.get<string[]>("shortlist", []),
  posts: storage.get<Post[]>("posts", []),
  theme: storage.get<"" | "light" | "dark">("theme", ""),
  lite: storage.get("lite", false),
  accounts: storage.get<Record<string, User>>("accounts", {}),
  enroll: null,
  day: 0,
  log: [],
  arrival: "on",
  revised: false,
  aiFails: 0,
  next: "",
  googlePrefill: null,
  mentorRole: "",
  toasts: []
};

const listeners = new Set<() => void>();
export const getState = () => state;

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  for (const k of PERSISTED) if (k in p) storage.set(k, state[k]);
  listeners.forEach(l => l());
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    cb => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => selector(state),
    () => selector(state)
  );
}

/* ---------- small actions ---------- */
let toastId = 0;
export function toast(msg: string) {
  const id = ++toastId;
  setState(s => ({ toasts: [...s.toasts, { id, msg }] }));
  setTimeout(() => setState(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 2600);
}

/** Update the signed-in user and keep the saved account copy in sync. */
export function updateUser(patch: Partial<User>) {
  const u = state.user;
  if (!u) return;
  const next = { ...u, ...patch };
  setState({ user: next, accounts: { ...state.accounts, [next.email]: next } });
}

export function signOut() {
  setState({ user: null });
  storage.del("user");
}

export function toggleTheme() {
  const dark = state.theme ? state.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  setState({ theme: dark ? "light" : "dark" });
}

/** Apply theme and lite mode to the document, as the original applyTheme() did. */
export function applyTheme() {
  const r = document.documentElement;
  if (state.theme) r.dataset.theme = state.theme; else delete r.dataset.theme;
  document.body.classList.toggle("lite", !!state.lite);
}
