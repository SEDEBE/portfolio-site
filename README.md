# Portfolio site

My personal landing page, in Spanish: who I am, my projects, experience and contact. The left
half is a stage that never moves; it starts with my project's **real API answering on the page**
and changes to the project's own screens as you scroll.

![Screenshot](docs/screenshot.png)

## What it does

- **Live API console.** "Pedir el resumen de este mes" calls the expense tracker API from the
  browser: it creates a throwaway demo account (`POST /auth/demo/`) and shows the real JSON of
  `GET /expenses/summary/` with each request's status and time. Without JavaScript, or if the API
  is down or rate-limited, it shows a sample response and says so.
- **The stage follows the reading.** Projects bring a short screen recording of the app, the
  experience section the phone view; hovering a project previews its screen.
- **The app opens on its login page**, where visitors register, log in or enter the demo account.
- **Contact without a backend.** The single field opens the visitor's email with the message
  already written.

## Design

Built with the taste-skill page process: a dealt "split stage" direction, the same typeface
(Geist) and blue as the app, a dark single theme, no gradients, eyebrows or card grids, and every
section with its own composition. Checked with its real-browser inspector at 1440, 768 and 390px.
Motion is one scroll-linked move on the name, staggered entrances and the recording on stage, all
off under `prefers-reduced-motion`; content is visible without JavaScript.

## Stack

HTML, Tailwind CSS 4, a few lines of TypeScript, Vite, Docker (Nginx), GitHub Actions.

## Run it

```bash
npm ci
npm run dev       # http://localhost:5174
npm run build     # static files in dist/
```

The live console calls the API in `VITE_API_URL`, so that API must allow this site's origin in
`CORS_ALLOWED_ORIGINS`. Public URLs (site, app, API, LinkedIn) live in `.env.production` and
`.env.development`; they are public values, not secrets.
