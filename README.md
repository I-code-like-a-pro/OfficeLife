# OfficeLife

Simulated workdays at a Nigerian company. Students clock in, do real tasks, make decisions under pressure
and earn a certificate that employers can verify.

Built with React, TanStack Router (hash history) and Tailwind CSS v4.

## Develop

```
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check and production build into dist/
npx vitest run     # end-to-end flow tests
```

## Files

```
index.html               Vite entry
src/main.tsx             mounts the router
src/router.tsx           routes, route guards, root layout
src/index.css            design tokens (light and dark) exposed to Tailwind
src/lib/                 logic (scoring, reviewer, certificates), store, config, types
src/data/data.ts         universities, roles, scenarios, mentors, sample data
src/components/          layout (header, footer, hero), ui primitives, icons, shared pieces
src/routes/              one file per area: home, auth, student, premium, employers,
                         universities, workday, certificate
api/review.js            optional AI reviewer (hides your token, falls back to built-in rules)
public/brand/            logos (SVG and PNG) and the CEO signature used on certificates
```

## Deploy (free)

1. Push the repo to GitHub.
2. On vercel.com choose **Add New, then Project**, pick the repo. Vercel detects Vite and builds it.
3. The app works with no AI. To switch the AI reviewer on, go to **Settings, then Environment Variables**,
   add `HF_TOKEN` with your Hugging Face token (permission: "Make calls to Inference Providers"), then **Redeploy**.
4. Optional: add `HF_MODEL` to change the model. Default is `Qwen/Qwen3-VL-8B-Instruct`.

Never paste the token into any file.

## Real Google sign-in (optional)

Create a Web OAuth client ID in Google Cloud Console, add your site URL as an authorised origin, and set
`VITE_GOOGLE_CLIENT_ID` at build time. Without it the Google button runs in demo mode.

## What is real and what is demo

Real: clock-in logic, all scenarios, the rules-based reviewer, PDF and Word text reading, certificate with QR
code and tamper-check link, print to PDF, LinkedIn add link, CSV report.

Demo: accounts live on the user's device, Paystack payment, mentor booking, employer and university dashboards
use sample data. The certificate check is not secure against forgery; production needs a database (for example
Supabase) for accounts, signed certificates and real dashboards.
