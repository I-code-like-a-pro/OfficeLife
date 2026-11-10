/* OfficeLife settings. Override with VITE_* env vars at build time. */
export const CONFIG = {
  // Google OAuth client ID. Leave empty to run the Google button in demo mode.
  googleClientId: (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)
    ?? "396281881741-3t8dbaasombvcp48r6glnglrip27vrhm.apps.googleusercontent.com",
  // Serverless AI reviewer. If it is unreachable, the built-in rules reviewer is used.
  apiUrl: "/api/review",
  aiEnabled: true,
  hackathonUni: "Wale University",
  // Used for share links when the app runs from a blob/file/srcdoc URL.
  fallbackBaseUrl: "https://office-life-simulation-chi.vercel.app/"
};

export const baseUrl = () => {
  const u = location.href.split("#")[0];
  return u.startsWith("blob:") || u.startsWith("file:") || u === "about:srcdoc" ? CONFIG.fallbackBaseUrl : u;
};

const loaded: Record<string, Promise<void> | undefined> = {};
/** Load a third-party script once (pdf.js, mammoth, Google sign-in). */
export function loadScript(url: string): Promise<void> {
  const hit = loaded[url];
  if (hit) return hit;
  const p = new Promise<void>((res, rej) => {
    const s = document.createElement("script");
    s.src = url; s.onload = () => res(); s.onerror = () => rej(new Error("load " + url));
    document.head.appendChild(s);
  });
  loaded[url] = p;
  return p;
}
