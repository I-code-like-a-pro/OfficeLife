import { FAQ } from "../data/data";
import { Hero, HeroCta, HeroH1, HeroP, Widget, WidgetLine, useGo } from "../components/layout";
import { DayPlanRail, RoleCard, Table, Td, Th } from "../components/shared";
import { Button, Card, Ico, Lead, LinkButton, Pill, Promo, Section, Src, Stats, wrapCls } from "../components/ui";
import { I } from "../components/icons";

const COMPARE: string[][] = [
  ["A timed workday with clock-in and urgent decisions", "No", "No", "Yes"],
  ["Feedback on your work", "Some", "Often not graded", "Every task"],
  ["Explain-your-thinking questions", "No", "Rarely", "Yes"],
  ["Employer-checkable certificate with scores", "Badge only", "Badge only", "Link and QR with evidence"],
  ["Built around Nigerian workplaces", "Rarely", "Mostly global employers", "Yes"],
  ["Works with little data, and without AI", "No", "No", "Yes"]
];

const HOW = [
  [I.clock, "1. Clock in", "Arrive at 9:00. Early, on time or late is recorded."],
  [I.chat, "2. Do the work", "Chat with your team, finish real tasks, upload or type your work."],
  [I.brief, "3. Decide under pressure", "Two urgent things, one hour. Explain your thinking."],
  [I.shield, "4. Get verified", "A certificate with a link and QR code employers can check."]
] as const;

export function Home() {
  const go = useGo();
  return (
    <main className={wrapCls}>
      <Hero widget={
        <Widget>
          <div className="text-[12px]" style={{ color: "#C9D6FF" }}>Monday &middot; Tembea Logistics</div>
          <div className="text-[38px] font-bold tracking-[-.02em] tabular-nums">8:52 AM</div>
          <WidgetLine>Clocked in &middot; 8 minutes early</WidgetLine>
          <WidgetLine dot="b">9:30 Standup with Chidi</WidgetLine>
          <WidgetLine dot="a">11:30 Decision needed</WidgetLine>
        </Widget>
      }>
        <HeroH1>Prove you can do the job before you apply</HeroH1>
        <HeroP>OfficeLife puts you through a simulated workday at a Nigerian company. Clock in, handle real tasks, make tough calls, and earn a verified certificate that employers can check.</HeroP>
        <HeroCta>
          <Button variant="white" onClick={() => go("/signup")}>Sign up free</Button>
          <Button variant="outWhite" onClick={() => go("/explore")}>See simulations</Button>
        </HeroCta>
      </Hero>

      <Section>
        <h2 className="mb-1.5">The gap is real</h2>
        <Lead>Nigeria's graduates have degrees. Employers say many still are not ready for day one.</Lead>
        <Stats items={[
          ["600,000+", "university graduates every year"],
          ["70%+", "of employers struggle to find job-ready talent"],
          ["9%", "unemployment among people with post-secondary education in Q1 2024, nearly double the national average"],
          ["60%+", "of employers name soft skills as the biggest gap"]
        ]} />
        <Src>Sources: Brunel University London study on Nigerian graduate employability; BusinessDay; TechCabal Insights; a baseline soft-skills study cited on LinkedIn Nigeria. Figures are from these reports and may change.</Src>
      </Section>

      <Section>
        <h2 className="mb-1.5">How OfficeLife works</h2>
        <div className="grid gap-3 m720:grid-cols-4">
          {HOW.map(([Icon, title, text]) => (
            <Card key={title}>
              <Ico><Icon /></Ico>
              <b className="block mt-2 mb-0.5">{title}</b>
              <span className="text-[14px] text-ink2">{text}</span>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="bg-panel rounded-[14px] p-4">
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <h2 className="text-[20px]">Start a simulation</h2>
            <LinkButton onClick={() => go("/explore")}>See all</LinkButton>
          </div>
          <div className="grid gap-3 m720:grid-cols-3">{(["pm", "swe", "da"] as const).map(k => <RoleCard key={k} id={k} />)}</div>
          <div className="flex flex-wrap gap-2 mt-3.5">
            <span className="text-[14px] text-ink2 self-center">Coming soon:</span>
            {["Marketing Associate", "Customer Support", "Accountant", "UI/UX Designer"].map(x => <Pill key={x}>{x}</Pill>)}
          </div>
        </div>
      </Section>

      <Section>
        <h2 className="mb-1.5">What makes it different</h2>
        <Lead>Courses teach. Virtual internships let you practise. OfficeLife shows employers how you behave at work.</Lead>
        <Card pad0 className="overflow-x-auto">
          <Table>
            <tr><Th /><Th>Online courses</Th><Th>Self-paced virtual internships</Th><Th>OfficeLife</Th></tr>
            {COMPARE.map(r => (
              <tr key={r[0]}>
                <Td><b>{r[0]}</b></Td><Td className="text-ink2">{r[1]}</Td><Td className="text-ink2">{r[2]}</Td>
                <Td><b className="text-blue">{r[3]}</b></Td>
              </tr>
            ))}
          </Table>
        </Card>
      </Section>

      <Section>
        <h2 className="mb-1.5">One workday, 10 to 15 minutes</h2>
        <DayPlanRail />
      </Section>

      <Section>
        <div className="grid gap-3 m720:grid-cols-2">
          <Card>
            <Ico><I.uni /></Ico>
            <h3 className="mt-2.5">For universities</h3>
            <p className="text-ink2 mt-1.5 mb-3">See how your students perform on real work scenarios, by department, and find the skills gap before employers do.</p>
            <Button variant="out" onClick={() => go("/universities")}>See the campus dashboard</Button>
          </Card>
          <Card>
            <Ico><I.brief /></Ico>
            <h3 className="mt-2.5">For employers</h3>
            <p className="text-ink2 mt-1.5 mb-3">Search graduates by proven skills. See their clock-in record, scores and how their work was reviewed.</p>
            <Button variant="out" onClick={() => go("/employers")}>See talent search</Button>
          </Card>
        </div>
      </Section>

      <Section id="faq">
        <h2 className="mb-1.5">Questions</h2>
        {FAQ.map(f => (
          <details key={f[0]} className="group border-b border-line py-3.5">
            <summary className="font-semibold cursor-pointer list-none [&::-webkit-details-marker]:hidden flex justify-between gap-3 after:content-['+'] after:text-[22px] after:leading-none after:text-blue group-open:after:content-['\2212']">{f[0]}</summary>
            <p className="mt-2 text-ink2">{f[1]}</p>
          </details>
        ))}
      </Section>

      <Section>
        <Promo>
          <h2 className="text-white">Your first day of work can start tonight</h2>
          <p>Pick a role, clock in, and see what you can do.</p>
          <div><Button variant="white" onClick={() => go("/signup")}>Sign up free</Button></div>
        </Promo>
      </Section>
    </main>
  );
}
