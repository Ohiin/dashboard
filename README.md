# Canvas — Modular Dashboard

A blank-canvas, fully customizable, drag-and-resize productivity dashboard.
100% client-side — no backend, no accounts. Everything is stored in your
browser via `localStorage` (widget configs/content) and `IndexedDB` (file
blobs).

## Stack
React 18 + TypeScript, Vite, Tailwind CSS, react-grid-layout, Zustand,
lucide-react, date-fns, idb.

## Getting started
```bash
npm install
npm run dev       # local dev server
npm run build     # production build -> dist/
npm run preview   # preview the production build
```

## Widgets
Calendar, Pomodoro Timer, Notepad, To-Do List, Daily Schedule, Money
Tracker (single goal), Money Tracker (multi-goal), Monthly Habit Tracker,
Expenditure Calculator, Analog/Digital Clock, Time Tracker (clock in/out),
and a Custom Widget slot for pasting your own code.

## Password-protecting a widget
Click the padlock icon in any widget's header. Passwords are hashed with
PBKDF2 (Web Crypto `SubtleCrypto`) — only a salt + hash are ever stored,
never the raw password.

## Custom widgets
The "+ Add Custom Widget" option in the Add Widget modal lets you paste
React/TSX code or a JSON schema. It's stored locally per-widget and shown
in an editable reference pane. Wiring up a live, sandboxed renderer (e.g.
an iframe with `React.lazy` + dynamic import) is the natural next step if
you want pasted code to actually execute.

## Deployment
A `netlify.toml` is included — connect the repo to Netlify and it will run
`npm run build` and publish `dist/` with SPA redirects already configured.

## Data & privacy
Nothing leaves your browser. Deleting a widget purges its localStorage
keys and any IndexedDB file blobs associated with it.
