import { useParams } from "@tanstack/react-router";
import qrcode from "qrcode-generator";
import { useMemo } from "react";
import { PEOPLE, ROLES } from "../data/data";
import { I } from "../components/icons";
import { Brand, useGo } from "../components/layout";
import { Badge, Button, Card, Chip, Section, narrowCls } from "../components/ui";
import { baseUrl } from "../lib/config";
import {
  ARR, DIM_KEYS, DIM_LABELS, badgesFor, certCode, certFromToken, dimEvidence, payloadScore, prettyDate, pseudoLog, readiness
} from "../lib/logic";
import { toast, useStore } from "../lib/store";
import type { CertPayload, Evidence } from "../lib/types";

const METHOD_TXT = { ai: "AI review", rules: "Rule-based review", "rules-note": "Note-based review" } as const;

function QR({ link }: { link: string }) {
  const svg = useMemo(() => {
    try {
      const q = qrcode(0, "L"); q.addData(link); q.make();
      return q.createSvgTag(3, 0);
    } catch { return ""; }
  }, [link]);
  return <div aria-label="QR code to verify this certificate" dangerouslySetInnerHTML={{ __html: svg }} className="[&_svg]:w-[84px] [&_svg]:h-[84px] [&_svg]:shrink-0" />;
}

const skillCls = "grid gap-1.5 py-3 border-b border-line last:border-b-0";

function CertificateView({ p, code, link, mine, evidence }: {
  p: CertPayload; code: string; link: string; mine: boolean; evidence: Evidence[] | null;
}) {
  const r = ROLES[p.r] ?? ROLES.pm;
  const m = PEOPLE[r.manager];
  const ps = payloadScore(p);
  const pl = pseudoLog(p);
  const onTime = pl.filter(l => l.status !== "late").length;
  const sc = { n: pl.length, dims: ps.dims, overall: ps.overall, onTime };
  const badges = badgesFor(sc, p.d);
  const y = new Date(p.dt + "T12:00:00");
  const linkedin = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(r.title + " Career Simulation")}&organizationName=OfficeLife&issueYear=${y.getFullYear()}&issueMonth=${y.getMonth() + 1}&certId=${encodeURIComponent(code)}&certUrl=${encodeURIComponent(link)}`;
  const shareText = `I completed a ${p.d}-day ${r.title} work simulation on OfficeLife (${ps.overall}% overall). Verify it here: ${link}`;
  const kicker = "text-[14px] text-[#5B6780]";

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(link); toast("Link copied"); } catch { window.prompt("Copy this link", link); }
  };

  return (
    <>
      <div id="certpaper"
        className="[--ink:#0F1114] [--ink2:#5B6780] [--line:#DAE1ED] [--blue:#0056D2] [--blue-soft:#E5F0FF] bg-white text-[#0F1114] border border-[#DAE1ED] rounded-md px-5 py-[30px] text-center relative [box-shadow:0_2px_10px_rgba(15,17,20,.12)] before:content-[''] before:absolute before:inset-2 before:border before:border-[#DAE1ED] before:rounded-[3px] before:pointer-events-none">
        <Brand size={30} text="text-[22px]" className="justify-center mb-4" />
        <div className={kicker}>Career Simulation Certificate</div>
        <div className="font-serif text-[34px] leading-[1.15] mt-2 mb-3 font-semibold [overflow-wrap:anywhere]">{p.n}</div>
        <div className={kicker}>{p.u}</div>
        <div className={kicker + " mt-3"}>has completed a {p.d}-day work simulation as</div>
        <div className="text-[25px] font-bold mt-1.5 mb-0.5">{r.title}</div>
        <div className={kicker}>at Tembea Logistics (simulated workplace)</div>
        <div className="grid grid-cols-3 gap-2 my-[22px] border-y border-[#DAE1ED] py-3.5">
          <div><b className="block text-[22px] leading-[1.1]">{p.d}</b><span className="text-[12px] text-[#5B6780]">{p.d > 1 ? "workdays" : "workday"}</span></div>
          <div><b className="block text-[22px] leading-[1.1]">{onTime}/{pl.length}</b><span className="text-[12px] text-[#5B6780]">on-time check-ins</span></div>
          <div><b className="block text-[22px] leading-[1.1]">{ps.overall}%</b><span className="text-[12px] text-[#5B6780]">overall score</span></div>
        </div>
        <div className="mb-2.5"><Chip tone="blue">{readiness(ps.overall)}</Chip></div>
        <div className="flex justify-between gap-3 text-left items-end mt-2">
          <div className="flex flex-col items-start min-w-0">
            <img className="h-[58px] w-auto max-w-[190px] block -mb-1" src="/brand/signature-augustine-david.png" alt="Signature of Augustine David" />
            <span className="block w-[190px] max-w-full border-t border-[#0F1114] mb-1" />
            <b className="text-[15px] leading-[1.2]">Augustine David</b>
            <small className="block text-[#5B6780] text-[12px]">CEO, OfficeLife</small>
          </div>
          <div className="w-16 h-16 rounded-full border-2 border-[#0056D2] text-[#0056D2] grid place-items-center text-[10px] font-bold text-center leading-[1.1] shrink-0">VERIFIED<br />BY<br />OFFICELIFE</div>
        </div>
        <div className="mt-3.5 text-[11px] text-[#5B6780]">Simulation manager: {m.name}, {m.role} (simulated character)</div>
        <div className="flex gap-3.5 items-center justify-center mt-[18px] text-left">
          <QR link={link} />
          <div className="text-[12px] text-[#5B6780] [overflow-wrap:anywhere]">Issued {prettyDate(p.dt)}<br />Certificate ID: <b>{code}</b><br />Scan or open the link to verify</div>
        </div>
      </div>

      {mine && (
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <Button className="flex-1" onClick={() => window.open(linkedin, "_blank", "noopener")}>Add to LinkedIn</Button>
          <Button variant="out" className="flex-1" onClick={() => window.print()}>Download PDF</Button>
          <Button variant="out" className="flex-1" onClick={() => window.open("https://wa.me/?text=" + encodeURIComponent(shareText), "_blank", "noopener")}>Share</Button>
          <Button variant="out" className="flex-1" onClick={copyLink}>Copy link</Button>
        </div>
      )}

      <Section>
        <h2 className="mb-1.5">What this certificate proves</h2>
        <Card className="mt-3">
          {DIM_KEYS.map(k => (
            <div key={k} className={skillCls}>
              <div className="flex justify-between font-semibold"><span>{DIM_LABELS[k]}</span><span>{ps.dims[k]}%</span></div>
              <div className="h-2 rounded-[99px] bg-chip overflow-hidden flex-1"><i className="block h-full rounded-[99px] bg-blue" style={{ width: ps.dims[k] + "%" }} /></div>
              <p className="text-[14px] text-ink2">{dimEvidence(k, pl, sc)}</p>
            </div>
          ))}
        </Card>
      </Section>

      {badges.length > 0 && (
        <Section>
          <h2 className="mb-1.5">Badges earned</h2>
          <div className="grid gap-3 mt-3 m720:grid-cols-3">{badges.map(b => <Badge key={b[0]} title={b[0]} sub={b[1]} />)}</div>
        </Section>
      )}

      <Section>
        <h2 className="mb-1.5">Work log</h2>
        <Card className="mt-3">
          {pl.map((l, i) => (
            <div key={i} className="py-3 border-b border-line grid gap-1 last:border-b-0">
              <div className="flex justify-between gap-2 items-center text-[14px] flex-wrap">
                <b>Day {i + 1}: {r.days[i] ? r.days[i].theme : ""}</b>
                <Chip tone={l.status === "late" ? "warn" : "ok"}>{ARR[l.status].label}</Chip>
              </div>
              <div className="flex justify-between gap-2 items-center text-[14px] flex-wrap text-ink2">
                <span>Clock in {l.in} &middot; Clock out 5:00 PM</span>
                <span>Task {l.task}% &middot; Decision {l.dec}% &middot; Check-in {l.quiz ? "correct" : "missed"}</span>
              </div>
              <div className="flex justify-between gap-2 items-center text-[14px] flex-wrap text-ink2">
                <span>{METHOD_TXT[l.method]}</span><span>Explained thinking {l.ex}%</span>
              </div>
            </div>
          ))}
        </Card>
      </Section>

      {evidence && evidence.length > 0 && (
        <Section>
          <h2 className="mb-1.5">Work samples</h2>
          <p className="text-ink2 mb-2 max-w-[62ch]">Only you see these. You can choose to share them with employers.</p>
          {evidence.filter(e => e.excerpt).map(e => (
            <Card key={e.day} className="mb-2.5">
              <b>Day {e.day}: {e.title}</b> <Chip tone="ok" className="ml-1.5">{e.score}%</Chip>
              <p className="text-[14px] text-ink2 mt-1.5">{e.excerpt}{e.excerpt.length >= 220 ? "..." : ""}</p>
            </Card>
          ))}
        </Section>
      )}

      <Section>
        <Card>
          <h3>How this is verified</h3>
          <p className="text-[14px] text-ink2 mt-1.5">Each task is marked <b>AI review</b>, <b>Rule-based review</b> or <b>Note-based review</b>, so employers know how it was checked. This demo link carries the results and a tamper-check code. In the live version, results are stored and signed on OfficeLife's servers, and employers can request full work samples with the student's consent.</p>
        </Card>
      </Section>
    </>
  );
}

export function CertPage() {
  const go = useGo();
  const { code } = useParams({ from: "/cert/{-$code}" });
  const certs = useStore(s => s.certs);
  const user = useStore(s => s.user)!;
  const c = certs.find(x => x.code === code) || certs[certs.length - 1];

  if (!c) {
    return (
      <main className="max-w-[540px] mx-auto px-4 pt-6 pb-14">
        <h1>No certificate yet</h1>
        <p className="text-ink2 mt-2 mb-4">Finish a simulation to earn one.</p>
        <Button onClick={() => go("/explore")}>Explore simulations</Button>
      </main>
    );
  }
  const cf = certFromToken(c.token);
  const link = baseUrl() + "#/verify/" + c.token;
  return (
    <main className={narrowCls + " pt-5"}>
      <Chip tone="ok"><I.check /> Simulation complete</Chip>
      <h1 className="mt-2.5 mb-1">Congratulations, {user.name.split(" ")[0]}</h1>
      <p className="text-ink2 mb-5">Your certificate is ready to share with employers.</p>
      {cf && <CertificateView p={cf.p} code={c.code} link={link} mine evidence={c.evidence} />}
      <Button variant="out" block className="mt-6" onClick={() => go("/dashboard")}>Back to dashboard</Button>
    </main>
  );
}

export function VerifyPage() {
  const go = useGo();
  const { token } = useParams({ from: "/verify/$token" });
  const r = certFromToken(token);
  const box = "rounded-xl p-3.5 flex gap-3 items-start mt-4 [&_b]:block [&_b]:text-ink [&_span]:text-[14px] [&_span]:text-ink2";

  if (!r) {
    return (
      <main className={narrowCls + " pt-5"}>
        <div className={box + " bg-red-soft text-red"}><I.alert /><div><b>We could not read this certificate</b><span>The link may be incomplete. Ask the student to share it again.</span></div></div>
      </main>
    );
  }
  const link = baseUrl() + "#/verify/" + token;
  const code = certCode(r.p);
  return (
    <main className={narrowCls + " pt-5"}>
      <h1>Certificate check</h1>
      <div className={box + (r.ok ? " bg-green-soft text-green" : " bg-red-soft text-red")}>
        {r.ok ? <I.shield /> : <I.alert />}
        <div>
          <b>{r.ok ? "Verified: this record matches its tamper-check code" : "Not verified: the data in this link was changed"}</b>
          <span>{r.ok ? "Issued by OfficeLife. Scores below are the student's recorded results." : "Do not trust this record."}</span>
        </div>
      </div>
      <div className="mt-5"><CertificateView p={r.p} code={code} link={link} mine={false} evidence={null} /></div>
      <Button variant="out" block className="mt-6" onClick={() => go("/employers")}>Back to talent search</Button>
    </main>
  );
}

