import { RouterProvider } from "@tanstack/react-router";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { router } from "./router";
import { certFromToken } from "./lib/logic";
import { getState, setState } from "./lib/store";
import type { User } from "./lib/types";

const user: User = { name: "Ada Lovelace", email: "ada@example.com", uni: "Wale University", level: "300 level", course: "", target: "pm", plan: "free", google: false, joined: "2026-11-01" };

/** Advance fake time in small steps so chained timers and promises all get to run. */
const tick = async (ms = 1000) => { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); };
const click = async (el: HTMLElement) => { await act(async () => { fireEvent.click(el); }); };
const textBtn = (t: string | RegExp) => screen.queryByRole("button", { name: t });

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline")))); // AI reviewer offline -> rules fallback
  localStorage.clear();
  setState({ user, accounts: { [user.email]: user }, certs: [], enroll: { role: "pm", days: 1 }, day: 0, log: [], arrival: "on", aiFails: 0, next: "" });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

async function goTo(hash: string) {
  await act(async () => { window.location.hash = hash; });
  await tick(50);
}

describe("full workday flow", () => {
  it("clocks in, plays the day, reaches the summary and issues a verifiable certificate", async () => {
    window.location.hash = "#/clockin";
    render(<RouterProvider router={router} />);
    await tick(50);

    // clock in
    await click(textBtn("Clock in")!);
    expect(screen.getByText("You clocked in on time")).toBeTruthy();
    await click(textBtn("Enter the office")!);
    await tick(50);
    expect(window.location.hash).toBe("#/work");

    // play the day: react to whatever the engine is waiting for
    const seen = new Set<string>();
    for (let i = 0; i < 400 && window.location.hash === "#/work"; i++) {
      await tick(500);
      const dialog = screen.queryByRole("dialog");
      if (dialog) {
        if (dialog.textContent?.includes("Decision needed")) { seen.add("decision"); await click(dialog.querySelectorAll("button")[0] as HTMLElement); }
        else if (dialog.textContent?.includes("Afternoon check-in")) {
          if (!dialog.textContent.includes("Continue")) { seen.add("quiz"); await click(dialog.querySelectorAll("button")[1] as HTMLElement); }
          else await click(textBtn("Continue")!);
        }
        continue;
      }
      const fu = document.getElementById("fu-in") as HTMLInputElement | null;
      if (fu) {
        seen.add("followup");
        fireEvent.change(fu, { target: { value: "Because payments depend on the API, so testing must wait and there is a risk of delay" } });
        await click(textBtn("Send")!);
        continue;
      }
      const sample = textBtn(/^Use a sample file/);
      if (sample) { seen.add("task"); await click(sample); continue; }
      const out = textBtn("Clock out");
      if (out) { seen.add("clockout"); await click(out); continue; }
      const quick = document.querySelector<HTMLElement>(".ml-\\[46px\\] button.text-left");
      if (quick) { seen.add("reply"); await click(quick); }
    }

    expect([...seen].sort()).toEqual(["clockout", "decision", "followup", "quiz", "reply", "task"]);
    expect(window.location.hash).toBe("#/summary");

    // every step wrote to the log
    const L = getState().log[0];
    expect(L.status).toBe("on");
    expect(L.task).toBeGreaterThan(0);
    expect(L.rep).toBeGreaterThan(0);
    expect(L.dec).toBeGreaterThan(0);
    expect(L.ex).not.toBeNull();
    expect(L.out).toBe("5:00 PM");
    expect(L.method).toBe("rules"); // AI offline

    // certificate
    await click(textBtn("Get your certificate")!);
    await tick(100);
    expect(window.location.hash).toMatch(/^#\/cert\/OL-/);
    expect(screen.getByText(/Congratulations, Ada/)).toBeTruthy();
    expect(getState().certs).toHaveLength(1);

    // the shared link verifies, and a tampered one does not
    const { token } = getState().certs[0];
    expect(certFromToken(token)?.ok).toBe(true);
    await goTo("#/verify/" + token);
    expect(screen.getByText(/Verified: this record matches/)).toBeTruthy();
    const [body, sig] = token.split(".");
    await goTo("#/verify/" + body + "x." + sig);
    expect(screen.queryByText(/Verified: this record matches/)).toBeNull();
  }, 60000);

  it("redirects protected pages to sign-up and remembers where to go next", async () => {
    setState({ user: null, enroll: null });
    window.location.hash = "#/dashboard";
    render(<RouterProvider router={router} />);
    await tick(100);
    expect(window.location.hash).toBe("#/signup");
    expect(getState().next).toBe("/dashboard");
  });

  it("signs up with validation and lands on the dashboard", async () => {
    setState({ user: null, enroll: null, accounts: {} });
    window.location.hash = "#/signup";
    render(<RouterProvider router={router} />);
    await tick(100);
    await click(textBtn("Create account")!);
    expect(screen.getByText("Enter your first and last name.")).toBeTruthy();
    expect(screen.getByText("Please accept the terms to continue.")).toBeTruthy();

    fireEvent.change(document.getElementById("f-name")!, { target: { value: "Grace Hopper" } });
    fireEvent.change(document.getElementById("f-email")!, { target: { value: "grace@example.com" } });
    fireEvent.change(document.getElementById("f-pw")!, { target: { value: "longenough" } });
    fireEvent.change(document.getElementById("f-uni")!, { target: { value: "Wale University" } });
    fireEvent.change(document.getElementById("f-level")!, { target: { value: "200 level" } });
    fireEvent.click(document.querySelector("input[type=checkbox]")!);
    await click(textBtn("Create account")!);
    await tick(100);
    expect(window.location.hash).toBe("#/dashboard");
    expect(getState().user?.email).toBe("grace@example.com");
    expect(screen.getByText("Hi Grace")).toBeTruthy();
  });
});
