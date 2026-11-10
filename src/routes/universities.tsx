import { ROLES, SAMPLE_CANDS } from "../data/data";
import { I } from "../components/icons";
import { Hero, HeroCta, HeroH1, HeroP, Widget, useGo } from "../components/layout";
import { Table, Td, Th } from "../components/shared";
import { Bar, Button, Card, Ico, Sample, Section, Stats, wrapCls } from "../components/ui";
import { CONFIG } from "../lib/config";
import { DIM_KEYS, DIM_LABELS, avg, naira, toCSV } from "../lib/logic";
import { toast, useStore } from "../lib/store";
import { PRICING } from "./premium";

const COHORT = { enrolled: 248, started: 211, completed: 152, avg: 84, minutes: 36, weekly: [12, 28, 41, 53, 67, 74] };
const DEPTS: [string, number][] = [["Computer Science", 88], ["Business Administration", 84], ["Accounting", 81], ["Mass Communication", 79], ["Engineering", 86], ["Economics", 83]];

function downloadCSV() {
  const rows: (string | number)[][] = [
    ["Name", "University", "Role", "Days", "Punctuality", "Task quality", "Decision-making", "Critical thinking", "Communication", "Overall"],
    ...SAMPLE_CANDS.map(c => [c.name, c.uni, ROLES[c.role].title, c.days, c.s.punct, c.s.task, c.s.dec, c.s.crit, c.s.comm, avg(Object.values(c.s))])
  ];
  const blob = new Blob([toCSV(rows)], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "officelife-cohort-sample.csv";
  document.body.appendChild(a); a.click(); a.remove();
  toast("Sample report downloaded");
}

export function Universities() {
  const go = useGo();
  const user = useStore(s => s.user);
  const uni = user && user.uni && !user.uni.startsWith("Not a student") ? user.uni : CONFIG.hackathonUni;
  const dimAvg = Object.fromEntries(DIM_KEYS.map(k => [k, avg(SAMPLE_CANDS.map(c => c.s[k]))])) as Record<(typeof DIM_KEYS)[number], number>;
  const lowest = [...DIM_KEYS].sort((a, b) => dimAvg[a] - dimAvg[b])[0];
  const completion = Math.round(COHORT.completed / COHORT.enrolled * 100);
  const max = Math.max(...COHORT.weekly);
  const top = SAMPLE_CANDS.slice().sort((a, b) => avg(Object.values(b.s)) - avg(Object.values(a.s))).slice(0, 5);
  const hbar = "flex items-center gap-2.5 text-[14px] my-2";

  return (
    <main className={wrapCls}>
      <Hero widget={
        <Widget>
          <div className="text-[12px]" style={{ color: "#C9D6FF" }}>{uni}</div>
          <div className="text-[38px] font-bold tracking-[-.02em] tabular-nums">{completion}%</div>
          <div className="flex gap-2.5 items-center text-[14px] text-[#E8EEFF] mt-2"><span className="w-2 h-2 rounded-full shrink-0 bg-[#52E0A0]" />of enrolled students completed a simulation</div>
        </Widget>
      }>
        <HeroH1>See job-readiness before graduation day</HeroH1>
        <HeroP>OfficeLife gives your career office a live view of how students handle real work scenarios, by department, so you can fix the gap while there is still time.</HeroP>
        <HeroCta>
          <Button variant="white" onClick={() => document.getElementById("cohort")?.scrollIntoView({ behavior: "smooth" })}>See the dashboard</Button>
          <Button variant="outWhite" onClick={() => go("/premium")}>Campus license</Button>
        </HeroCta>
      </Hero>

      <Section id="cohort">
        <h2 className="mb-1.5">Cohort dashboard: {uni}</h2>
        <Sample>Sample data to show the layout. Real numbers appear once students at your campus sign up.</Sample>
        <Stats items={[
          [COHORT.enrolled, "students enrolled"], [completion + "%", "completed a simulation"],
          [COHORT.avg + "%", "average overall score"], [COHORT.minutes + " min", "average time on task"]
        ]} />
        <div className="grid gap-3 mt-3.5 m720:grid-cols-2">
          <Card>
            <h3>Average score by skill</h3>
            {DIM_KEYS.map(k => (
              <div key={k} className={hbar}>
                <span className="w-[140px] shrink-0">{DIM_LABELS[k].split(" and ")[0]}</span>
                <Bar pct={dimAvg[k]} green={k !== lowest} />
                <span className="w-11 text-right font-semibold">{dimAvg[k]}</span>
              </div>
            ))}
            <p className="text-[14px] text-ink2 mt-2.5">Lowest skill: <b>{DIM_LABELS[lowest].split(" and ")[0]}</b>. A workshop here would help most.</p>
          </Card>
          <Card>
            <h3>Average score by department</h3>
            {DEPTS.map(d => (
              <div key={d[0]} className={hbar}>
                <span className="w-[140px] shrink-0">{d[0]}</span><Bar pct={d[1]} green /><span className="w-11 text-right font-semibold">{d[1]}</span>
              </div>
            ))}
          </Card>
        </div>
        <Card className="mt-3.5">
          <h3>Students starting a simulation, last 6 weeks</h3>
          <div className="flex items-end gap-2 h-[120px] mt-2.5 mb-[26px]">
            {COHORT.weekly.map((v, i) => (
              <div key={i} className="flex-1 bg-blue rounded-t-md min-h-1 relative" style={{ height: Math.round(v / max * 100) + "%" }}>
                <span className="absolute -bottom-5 inset-x-0 text-center text-[11px] text-ink2">W{i + 1}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card pad0 className="mt-3.5 overflow-x-auto">
          <div className="px-4 pt-4"><h3>Top students (sample)</h3></div>
          <Table>
            <tr><Th>Student</Th><Th>Role</Th><Th>Overall</Th><Th>Punctuality</Th></tr>
            {top.map(c => (
              <tr key={c.name}><Td>{c.name}</Td><Td>{ROLES[c.role].title}</Td><Td><b>{avg(Object.values(c.s))}%</b></Td><Td>{c.s.punct}%</Td></tr>
            ))}
          </Table>
        </Card>
        <div className="mt-3.5"><Button variant="out" onClick={downloadCSV}>Download cohort report (CSV)</Button></div>
      </Section>

      <Section>
        <div className="grid gap-3 m720:grid-cols-3">
          <Card><Ico><I.chart /></Ico><h3 className="mt-2.5">Find the skills gap</h3><p className="text-[14px] text-ink2">See which skills students lack before employers tell you.</p></Card>
          <Card><Ico><I.brief /></Ico><h3 className="mt-2.5">Link to employers</h3><p className="text-[14px] text-ink2">Verified results help your graduates get noticed for internships and jobs.</p></Card>
          <Card><Ico><I.shield /></Ico><h3 className="mt-2.5">Accreditation evidence</h3><p className="text-[14px] text-ink2">Show real employability outcomes in your reports.</p></Card>
        </div>
        <p className="mt-4"><b>Campus license from {naira(PRICING.campusPerStudent)} per student per year</b> <span className="text-ink2">(pilot pricing)</span></p>
      </Section>
    </main>
  );
}
