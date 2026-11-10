import { useState } from "react";
import { MENTORS } from "../data/data";
import { I } from "../components/icons";
import { useGo } from "../components/layout";
import { Opt } from "../components/shared";
import { Avatar, Button, Card, Chip, CloseButton, Chips, Hello, Ico, Section, Sheet, SheetHead, Src, cx, wrapCls } from "../components/ui";
import { naira } from "../lib/logic";
import { getState, setState, toast, updateUser, useStore } from "../lib/store";
import type { Mentor } from "../lib/types";

export const PRICING = { plus: 2500, campusPerStudent: 1000, sponsored: 100000 }; // pilot pricing, to be validated

const FREE = ["All 1, 2 and 3-day simulations", "Reviewed feedback on every task", "Verified certificate with link and QR", "Badges and your skills profile"];
const PLUS = ["Everything in Free", "2 live mock sessions a month with a professional mentor", "Human review of your final project", "Verified+ badge on your certificate", "Interview practice and CV feedback"];

const Li = ({ items }: { items: string[] }) => (
  <ul className="grid gap-2 flex-1">
    {items.map(x => <li key={x} className="flex gap-2 items-start text-[15px]"><I.check className="text-green shrink-0 mt-[3px]" /><span>{x}</span></li>)}
  </ul>
);

export function Premium() {
  const go = useGo();
  const user = useStore(s => s.user);
  const mentorRole = useStore(s => s.mentorRole);
  const [sheet, setSheet] = useState<"" | "pay" | "book">("");
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [slot, setSlot] = useState("");
  const ms = MENTORS.filter(m => !mentorRole || m.role === mentorRole);

  const buyPlus = () => {
    if (!user) { setState({ next: "/premium" }); go("/signup"); return; }
    if (user.plan === "plus") { toast("You are already on Premium"); return; }
    setSheet("pay");
  };
  const openBooking = (m: Mentor) => {
    if (!user) { setState({ next: "/premium" }); toast("Sign up to book a mentor"); go("/signup"); return; }
    setMentor(m); setSlot(""); setSheet("book");
  };
  const confirmBooking = () => {
    if (!mentor) return;
    if (!slot) { toast("Choose a time slot first"); return; }
    updateUser({ plan: "plus" });
    setState(s => ({ bookings: [...s.bookings, { mentor: mentor.name, title: mentor.title, slot }] }));
    setSheet(""); toast("Session booked. A calendar invite would be sent."); go("/dashboard");
  };

  return (
    <main className={wrapCls}>
      <Hello>
        <h1>Learn from people who do the job</h1>
        <p className="text-ink2 mt-1.5 max-w-[60ch]">The simulation is free. Premium adds real professionals: live practice, human review, and a stronger certificate.</p>
      </Hello>

      <Section className="mt-3">
        <div className="grid gap-3 m720:grid-cols-2">
          <div className="border border-line rounded-[14px] p-[18px] bg-surface flex flex-col gap-2.5">
            <h3>Free</h3>
            <div className="text-[32px] font-bold tracking-[-.02em]">{naira(0)}<small className="text-[14px] text-ink2 font-normal"> forever</small></div>
            <Li items={FREE} />
            <Button variant="out" block onClick={() => go(user ? "/explore" : "/signup")}>{user ? "Browse simulations" : "Sign up free"}</Button>
          </div>
          <div className="border border-blue [box-shadow:0_0_0_1px_var(--blue)] rounded-[14px] p-[18px] bg-surface flex flex-col gap-2.5">
            <Chip tone="blue" className="w-fit">Most popular</Chip>
            <h3>Premium</h3>
            <div className="text-[32px] font-bold tracking-[-.02em]">{naira(PRICING.plus)}<small className="text-[14px] text-ink2 font-normal"> / month</small></div>
            <Li items={PLUS} />
            <Button block onClick={buyPlus}>{user && user.plan === "plus" ? "You are on Premium" : "Start Premium"}</Button>
          </div>
        </div>
        <Src>Pilot pricing, subject to change. Payments use Paystack in the live version; here the payment step is a demo.</Src>
      </Section>

      <Section>
        <h2 className="mb-1.5">Book a mentor</h2>
        <p className="text-ink2 mb-4 max-w-[62ch]">Sample mentor profiles. In the live version these are vetted professionals from partner companies.</p>
        <Chips className="mb-3">
          {([["", "All"], ["pm", "Project Manager"], ["swe", "Software"], ["da", "Data"]] as const).map(r => (
            <button key={r[0]} aria-pressed={mentorRole === r[0]} onClick={() => setState({ mentorRole: r[0] })}
              className={cx("border rounded-full px-3.5 py-2 text-[14px] font-semibold bg-surface", mentorRole === r[0] ? "border-blue text-blue" : "border-line")}>{r[1]}</button>
          ))}
        </Chips>
        <div className="grid gap-3 m720:grid-cols-3">
          {ms.map(m => (
            <Card key={m.id}>
              <div className="flex items-center gap-2">
                <Avatar color={m.color} ini={m.ini} />
                <div><b>{m.name}</b><div className="text-[14px] text-ink2">{m.title}</div></div>
              </div>
              <p className="text-[14px] text-ink2 my-2.5">Next slots: {m.slots.join(", ")}</p>
              <Button variant="out" block onClick={() => openBooking(m)}>Book a session</Button>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <h2 className="mb-1.5">For universities and employers</h2>
        <div className="grid gap-3 mt-3 m720:grid-cols-2">
          <Card>
            <Ico><I.uni /></Ico>
            <h3 className="mt-2.5">Campus license</h3>
            <p className="text-ink2 my-1.5">Every student gets Premium, and your career office gets a live cohort dashboard.</p>
            <b>From {naira(PRICING.campusPerStudent)} per student per year</b>
            <div className="mt-3"><Button variant="out" onClick={() => go("/universities")}>See the dashboard</Button></div>
          </Card>
          <Card>
            <Ico><I.brief /></Ico>
            <h3 className="mt-2.5">Sponsored simulations</h3>
            <p className="text-ink2 my-1.5">Turn your real entry-level tasks into a simulation and meet candidates who already did them.</p>
            <b>From {naira(PRICING.sponsored)} per simulation</b>
            <div className="mt-3"><Button variant="out" onClick={() => go("/employers")}>See talent search</Button></div>
          </Card>
        </div>
      </Section>

      {sheet === "pay" && (
        <Sheet onClose={() => setSheet("")}>
          <SheetHead><h2>Start Premium</h2><CloseButton onClick={() => setSheet("")} /></SheetHead>
          <p className="text-ink2">{naira(PRICING.plus)} per month. Cancel any time.</p>
          <p className="text-[14px] text-ink2 mt-2">Demo payment. The live version uses Paystack.</p>
          <Button block className="mt-3.5" onClick={() => { updateUser({ plan: "plus" }); setSheet(""); toast("Welcome to Premium"); }}>Pay {naira(PRICING.plus)} (demo)</Button>
        </Sheet>
      )}
      {sheet === "book" && mentor && (
        <Sheet onClose={() => setSheet("")}>
          <SheetHead><h2>Book {mentor.name}</h2><CloseButton onClick={() => setSheet("")} /></SheetHead>
          <p className="text-[14px] text-ink2">{mentor.title} &middot; 45-minute live session</p>
          <div className="grid gap-2.5 mt-3" role="radiogroup">
            {mentor.slots.map(s => <Opt key={s} checked={slot === s} onClick={() => setSlot(s)} title={s} />)}
          </div>
          <p className="text-[14px] mt-3.5">{getState().user?.plan === "plus" ? "Included in your Premium plan." : "Premium is " + naira(PRICING.plus) + " a month and includes 2 sessions."}</p>
          <Button block className="mt-3.5" onClick={confirmBooking}>{getState().user?.plan === "plus" ? "Confirm booking" : "Pay with Paystack (demo) and book"}</Button>
        </Sheet>
      )}
    </main>
  );
}
