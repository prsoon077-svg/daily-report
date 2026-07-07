# Daily Report Tracker (static, no backend)

A rebuild of the Intercom teammate-performance dashboard as a pure static
site — no database, no server. Manually-edited fields (Inprogress Meta/Tech)
save to the browser's localStorage, same as the original app.

## Local development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
This produces a `dist/` folder — plain HTML/CSS/JS, ready to upload anywhere,
including Cloudflare Pages' "Direct Upload" (drag-and-drop, no CLI needed).

## Deploying to Cloudflare Pages (direct upload, no code paste, no CLI)
1. Run `npm run build` locally to produce `dist/`.
2. Cloudflare Dashboard → Workers & Pages → Create → **Pages** → **Upload assets** (this is the "Looking to deploy Pages? Get started" link, NOT the Workers "paste code" screen).
3. Drag the `dist` folder in, give the project a name, click Deploy.
4. You get a live `*.pages.dev` URL immediately. Re-deploy by repeating step 3 with a fresh `dist` after any code change.

## Google Calendar ("Meeting aligned")
Needs your own Google Cloud OAuth Client ID — the in-app "Check Google
Calendar" button walks through the 7 setup steps. Client ID stays in the
browser only.

## Note on manual fields
Because there's no backend, Inprogress Meta/Tech values are saved per
browser (localStorage) — same as the original Replit app. If you want them
shared across devices/teammates later, that needs a small database again
(D1, or similar) — happy to add it back if that becomes useful.
