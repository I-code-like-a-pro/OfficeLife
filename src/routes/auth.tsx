import { useEffect, useState } from "react";
import { LEVELS, UNIS } from "../data/data";
import { GoogleIcon, I } from "../components/icons";
import { useGo } from "../components/layout";
import { UniField } from "../components/shared";
import { Button, Card, ErrMsg, Field, LinkButton, Sheet, SheetHead, CloseButton, inputCls, cx } from "../components/ui";
import { CONFIG, loadScript } from "../lib/config";
import { b64d, canonUni, isEmail, today } from "../lib/logic";
import { getState, setState, toast, useStore } from "../lib/store";
import type { User } from "../lib/types";

const mainCls = "max-w-[540px] mx-auto px-4 pt-7 pb-14";
const googleBtn = "flex items-center justify-center gap-2.5 w-full min-h-12 border border-line rounded-lg font-semibold bg-surface hover:bg-chip";
const orCls = "flex items-center gap-2.5 text-ink2 text-[13px] mt-4 before:content-[''] before:flex-1 before:h-px before:bg-line after:content-[''] after:flex-1 after:h-px after:bg-line";

export const CAREERS: [string, string][] = [["", "Choose one"], ["pm", "Project Manager"], ["swe", "Software Engineer"], ["da", "Data Analyst"], ["unsure", "Not sure yet"]];

/* ---------- google sign-in: real when a client ID is set, demo otherwise ---------- */
function useGoogleSignIn() {
  const go = useGo();
  const [demo, setDemo] = useState(false);

  const start = async () => {
    if (!CONFIG.googleClientId) { setDemo(true); return; }
    try {
      await loadScript("https://accounts.google.com/gsi/client");
      const g = (window as unknown as { google: { accounts: { id: { initialize: (o: object) => void; prompt: () => void } } } }).google;
      g.accounts.id.initialize({
        client_id: CONFIG.googleClientId,
        callback: (resp: { credential: string }) => {
          const p = JSON.parse(b64d(resp.credential.split(".")[1])) as { name?: string; email?: string };
          setState({ googlePrefill: { name: p.name || "", email: p.email || "" } });
          const known = getState().accounts[(p.email || "").toLowerCase()];
          if (known) { setState({ user: known }); go("/dashboard"); } else go("/signup");
        }
      });
      g.accounts.id.prompt();
    } catch { toast("Could not reach Google. Use email for now."); }
  };

  const sheet = demo && (
    <Sheet onClose={() => setDemo(false)}>
      <SheetHead><h2>Choose an account</h2><CloseButton onClick={() => setDemo(false)} /></SheetHead>
      <p className="text-[14px] text-ink2">Demo mode. Real Google sign-in turns on when a Google client ID is added to the config.</p>
      <div className="grid gap-2.5 mt-3">
        <button className="border border-line rounded-xl p-3.5 text-left bg-surface w-full hover:border-blue"
          onClick={() => { setDemo(false); setState({ googlePrefill: { name: "Demo Student", email: "demo.student@gmail.com" } }); go("/signup"); }}>
          <b className="block">Demo Student</b><span className="text-[14px] text-ink2">demo.student@gmail.com</span>
        </button>
      </div>
    </Sheet>
  );
  return { start, sheet };
}

/* ---------- sign up ---------- */
interface SignupForm { name: string; email: string; pw: string; uni: string; level: string; course: string; target: string; terms: boolean }

export function Signup() {
  const go = useGo();
  const prefill = useStore(s => s.googlePrefill);
  const google = !!prefill;
  const [f, setF] = useState<SignupForm>({ name: prefill?.name ?? "", email: prefill?.email ?? "", pw: "", uni: "", level: "", course: "", target: "", terms: false });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupForm, string>>>({});
  const gs = useGoogleSignIn();
  const set = <K extends keyof SignupForm>(k: K, v: SignupForm[K]) => setF(p => ({ ...p, [k]: v }));

  useEffect(() => { if (prefill) setF(p => ({ ...p, name: prefill.name, email: prefill.email })); }, [prefill]);

  const submit = () => {
    const e: typeof errors = {};
    const name = f.name.trim();
    if (name.length < 3 || !name.includes(" ")) e.name = "Enter your first and last name.";
    if (!isEmail(f.email)) e.email = "Enter a valid email address.";
    if (!google && f.pw.length < 8) e.pw = "Use at least 8 characters.";
    const uni = canonUni(f.uni, UNIS);
    if (!uni) e.uni = "Choose your university from the list. If it is not listed, choose Other.";
    if (!f.level) e.level = "Choose your level.";
    if (!f.terms) e.terms = "Please accept the terms to continue.";
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-err] input, [data-err] select")?.focus());
      return;
    }
    const user: User = { name, email: f.email.trim().toLowerCase(), uni, level: f.level, course: f.course || "", target: f.target || "", plan: "free", google, joined: today() };
    const s = getState();
    const next = s.next || "/dashboard";
    setState({ user, accounts: { ...s.accounts, [user.email]: user }, googlePrefill: null, next: "" });
    toast("Welcome to OfficeLife, " + user.name.split(" ")[0]);
    go(next);
  };

  const err = (k: keyof SignupForm) => errors[k];
  return (
    <main className={mainCls}>
      <h1>Create your free account</h1>
      <p className="text-ink2 mt-1.5">Build your proof of work. It takes a minute.</p>
      <Card className="mt-[18px]">
        <button className={googleBtn} onClick={gs.start}><GoogleIcon /><span>Continue with Google</span></button>
        <div className={orCls}>or use your email</div>
        <div data-err={err("name") ? "" : undefined}>
          <Field label="Full name (as on your certificate)" htmlFor="f-name" err={err("name")}>
            <input id="f-name" className={inputCls} value={f.name} onChange={e => set("name", e.target.value)} autoComplete="name" readOnly={google} />
          </Field>
        </div>
        <div data-err={err("email") ? "" : undefined}>
          <Field label="Email" htmlFor="f-email" err={err("email")}>
            <input id="f-email" type="email" className={inputCls} value={f.email} onChange={e => set("email", e.target.value)} autoComplete="email" readOnly={google} />
          </Field>
        </div>
        {google
          ? <p className="text-[14px] text-ink2 mt-2.5 flex items-center gap-2"><I.check /> Signed in with Google. No password needed.</p>
          : <div data-err={err("pw") ? "" : undefined}>
              <Field label="Password" htmlFor="f-pw" hint="At least 8 characters." err={err("pw")}>
                <input id="f-pw" type="password" className={inputCls} value={f.pw} onChange={e => set("pw", e.target.value)} autoComplete="new-password" />
              </Field>
            </div>}
        <div data-err={err("uni") ? "" : undefined}><UniField id="f-uni" value={f.uni} onChange={v => set("uni", v)} err={err("uni")} /></div>
        <div data-err={err("level") ? "" : undefined}>
          <Field label="Level" htmlFor="f-level" err={err("level")}>
            <select id="f-level" className={inputCls} value={f.level} onChange={e => set("level", e.target.value)}>
              <option value="">Choose one</option>{LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </Field>
        </div>
        <Field label={<>Course of study <span className="text-ink2">(optional)</span></>} htmlFor="f-course">
          <input id="f-course" className={inputCls} value={f.course} onChange={e => set("course", e.target.value)} placeholder="e.g. Computer Science" />
        </Field>
        <Field label={<>Career you want <span className="text-ink2">(optional)</span></>} htmlFor="f-target">
          <select id="f-target" className={inputCls} value={f.target} onChange={e => set("target", e.target.value)}>
            {CAREERS.map(c => <option key={c[0]} value={c[0]}>{c[1]}</option>)}
          </select>
        </Field>
        <label className="flex gap-2.5 items-start mt-3.5 text-[14px]">
          <input type="checkbox" className="w-5 h-5 mt-0.5 shrink-0" checked={f.terms} onChange={e => set("terms", e.target.checked)} />
          <span>I agree to the terms and to my results being visible to my university and to employers I choose to share them with.</span>
        </label>
        {errors.terms && <ErrMsg>{errors.terms}</ErrMsg>}
        <Button block className="mt-[18px]" onClick={submit}>Create account</Button>
        <p className="text-[14px] text-ink2 text-center mt-3">Already have an account? <LinkButton onClick={() => go("/login")}>Log in</LinkButton></p>
      </Card>
      <p className="text-[12px] text-ink2 mt-3">Demo build: accounts are saved on this device only. The live version uses secure server accounts.</p>
      {gs.sheet}
    </main>
  );
}

/* ---------- log in ---------- */
export function Login() {
  const go = useGo();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const gs = useGoogleSignIn();

  const submit = () => {
    const s = getState();
    const u = s.accounts[email.trim().toLowerCase()];
    if (!u) { setErr("No account with that email on this device. Sign up first."); return; }
    setState({ user: u, next: "" });
    toast("Welcome back, " + u.name.split(" ")[0]);
    go(s.next || "/dashboard");
  };
  return (
    <main className={mainCls}>
      <h1>Log in</h1>
      <Card className="mt-[18px]">
        <button className={googleBtn} onClick={gs.start}><GoogleIcon /><span>Continue with Google</span></button>
        <div className={orCls}>or</div>
        <Field label="Email" htmlFor="l-email">
          <input id="l-email" type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
        </Field>
        <Field label="Password" htmlFor="l-pw">
          <input id="l-pw" type="password" className={inputCls} value={pw} onChange={e => setPw(e.target.value)} autoComplete="current-password" />
        </Field>
        {err && <p className={cx("text-red text-[13px] font-semibold", "mt-2.5")}>{err}</p>}
        <Button block className="mt-[18px]" onClick={submit}>Log in</Button>
        <p className="text-[14px] text-ink2 text-center mt-3">New here? <LinkButton onClick={() => go("/signup")}>Create an account</LinkButton></p>
      </Card>
      <p className="text-[12px] text-ink2 mt-3">Demo build: only accounts created on this device can log in.</p>
      {gs.sheet}
    </main>
  );
}
