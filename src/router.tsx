import {
  Outlet, createHashHistory, createRootRoute, createRoute, createRouter, redirect, useRouterState
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Footer, Header, Toaster, useActiveNav } from "./components/layout";
import { applyTheme, getState, setState, useStore } from "./lib/store";
import { Home } from "./routes/home";
import { Signup, Login } from "./routes/auth";
import { Dashboard, Explore, Sim, Profile } from "./routes/student";
import { Premium } from "./routes/premium";
import { Employers } from "./routes/employers";
import { Universities } from "./routes/universities";
import { ClockIn, Work, Summary } from "./routes/workday";
import { CertPage, VerifyPage } from "./routes/certificate";

/* ---------- root: header, footer, theme, scroll reset ---------- */
function Root() {
  const path = useRouterState({ select: s => s.location.pathname });
  const theme = useStore(s => s.theme);
  const lite = useStore(s => s.lite);
  const active = useActiveNav();
  const inWork = path === "/work";

  useEffect(() => { applyTheme(); }, [theme, lite]);
  useEffect(() => { window.scrollTo(0, 0); }, [path]);

  return (
    <>
      {!inWork && <Header active={active} />}
      <Outlet />
      {!inWork && <Footer />}
      <Toaster />
    </>
  );
}

const rootRoute = createRootRoute({ component: Root });

/* ---------- guards (the original PROTECTED list and enrol check) ---------- */
function requireUser(name: string) {
  return () => {
    if (!getState().user) {
      setState({ next: "/" + name });
      throw redirect({ to: "/signup" });
    }
  };
}
function requireEnroll(name: string) {
  return () => {
    requireUser(name)();
    if (!getState().enroll) throw redirect({ to: "/dashboard" });
  };
}

const route = <P extends string>(path: P, component: () => React.JSX.Element, beforeLoad?: () => void) =>
  createRoute({ getParentRoute: () => rootRoute, path, component, beforeLoad });

const routeTree = rootRoute.addChildren([
  route("/", Home),
  route("/signup", Signup),
  route("/login", Login),
  route("/dashboard", Dashboard, requireUser("dashboard")),
  route("/explore", Explore),
  route("/sim/$id", Sim),
  route("/clockin", ClockIn, requireEnroll("clockin")),
  route("/work", Work, requireEnroll("work")),
  route("/summary", Summary, requireEnroll("summary")),
  route("/cert/{-$code}", CertPage, requireUser("cert")),
  route("/verify/$token", VerifyPage),
  route("/employers", Employers),
  route("/universities", Universities),
  route("/premium", Premium),
  route("/profile", Profile, requireUser("profile"))
]);

// Hash history keeps the original URLs working (#/verify/<token> links already shared).
export const router = createRouter({ routeTree, history: createHashHistory(), defaultNotFoundComponent: Home });

declare module "@tanstack/react-router" {
  interface Register { router: typeof router }
}
