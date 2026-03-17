# StopWatch — Multi-Runner Finish Time Tracker

## Project Overview

A single-file pure frontend web application for tracking finish times of multiple runners in a race or training session. Designed mobile-first for the Google Pixel 8 (412x915px viewport), with a sporty, high-energy visual design. No backend, no dependencies — runs entirely in the browser.

---

## 1. Feature List

### Core Features

- **Global race timer** — one shared stopwatch that starts/stops/resets the entire session
- **Runner registration** — add runners by name (or auto-numbered bib numbers) before or during a race
- **Finish time capture** — tap a "Finish" button per runner to record their exact elapsed time at that moment
- **Finish order ranking** — automatically display runners sorted by finish time (fastest first)
- **DNF / DNS marking** — mark a runner as "Did Not Finish" or "Did Not Start"
- **Results table** — display bib, name, finish time (MM:SS.ms), rank, and gap from leader
- **Reset session** — clear all runners and times to start fresh
- **Persist session** — save state to `localStorage` so a page refresh does not lose data
- **Export results** — copy results as plain text or download as a `.csv` file

### Secondary Features

- **Edit runner name** — rename a runner before or after finishing
- **Undo last finish** — remove the most recently recorded finish time
- **Sound cue** — short audio beep on finish capture (using Web Audio API, no external file)
- **Dark / light mode** — toggle, defaulting to dark (sporty look)
- **Fullscreen mode** — hide browser chrome for race-day use

---

## 2. UI/UX Layout Design (Mobile-First)

### Viewport Target

- Google Pixel 8: 412px wide × 915px tall, device-pixel-ratio 2.625
- All tap targets minimum 48×48px
- Font sizes use `clamp()` or `rem` so they scale gracefully to tablet/desktop

### Screen Sections (top to bottom, single scrollable page)

```
┌─────────────────────────────┐  ← 412px wide
│  HEADER (fixed, 64px tall)  │
│  [App name]  [Settings ⚙]  │
├─────────────────────────────┤
│                             │
│   RACE TIMER (hero block)   │  ← ~200px tall
│      00 : 23 . 41           │
│  [START]  [RESET]           │
│                             │
├─────────────────────────────┤
│                             │
│   ADD RUNNER (collapsible)  │  ← ~80px collapsed, ~140px open
│  [Name input] [+ Add]       │
│                             │
├─────────────────────────────┤
│                             │
│   ACTIVE RUNNERS LIST       │  ← scrollable, fills remaining viewport
│  ┌───────────────────────┐  │
│  │ #1 Alice     [FINISH] │  │  ← runner card ~72px tall
│  ├───────────────────────┤  │
│  │ #2 Bob       [FINISH] │  │
│  ├───────────────────────┤  │
│  │ #3 Carol     [FINISH] │  │
│  └───────────────────────┘  │
│                             │
├─────────────────────────────┤
│                             │
│   RESULTS (collapsible)     │  ← expands when ≥1 finish recorded
│  Rank  Name   Time    Gap   │
│   1    Alice  0:23.4  —     │
│   2    Bob    0:25.1  +1.7s │
│                             │
│  [Copy] [Download CSV]      │
│                             │
└─────────────────────────────┘
```

### Interaction Flow

1. User opens app → sees empty state with big timer at 00:00.00
2. User adds runners by typing name and tapping "+ Add" (or pressing Enter)
3. User taps **START** → global timer begins counting up, button changes to **STOP**
4. As each runner finishes, user taps their **FINISH** button → time is frozen for that runner, card moves to "finished" state (greyed out + shows time), results section updates
5. After all runners finish (or session is over), user taps **STOP** then views Results
6. User can **Export** or **Reset**

### States per Runner Card

- `pending` — waiting to start (only visible if timer not started)
- `running` — timer is active, FINISH button is prominent
- `finished` — shows recorded time, FINISH button replaced by time badge + undo icon
- `dnf` — greyed with "DNF" badge, long-press or swipe-action on card

### Animations

- Runner card slides up into "finished" zone on tap (subtle translateY + opacity)
- Results table rows animate in with a stagger
- Timer digits use a monospace font with a slight numeric flip effect via CSS `@keyframes`
- Pulse ring on FINISH button while runner is active

---

## 3. Technical Approach

### File Structure (minimal)

```
stopwatch/
├── index.html      ← all markup, inline CSS (<style>), inline JS (<script>)
└── planning.md     ← this file
```

Or as a two-file option:

```
stopwatch/
├── index.html
└── app.js          ← if JS grows beyond ~400 lines
```

The single-file approach is preferred for portability (share via AirDrop, USB, email).

### HTML

- Semantic structure: `<header>`, `<main>`, `<section>`, `<article>` per runner card
- `<template>` element for runner card cloning (avoids innerHTML string hacks)
- `aria-live="polite"` region on the timer display for accessibility
- `aria-label` on all icon-only buttons
- `inputmode="text"` on name field, `autocomplete="off"`, `autocorrect="off"`

### CSS

- CSS custom properties (variables) for the entire design system (colors, spacing, radii, fonts)
- `display: grid` for the overall page layout (header / timer / add-runner / runner-list / results)
- `display: flex` for individual runner cards
- `position: sticky` for the timer hero block so it stays visible while scrolling the runner list
- CSS `clamp()` for fluid typography
- `@media (prefers-color-scheme: dark)` as the default; light mode via `.theme-light` class on `<body>`
- Smooth transitions via `transition: all 0.2s ease` on state changes
- `touch-action: manipulation` on buttons to eliminate 300ms tap delay
- No CSS framework — pure vanilla CSS

### JavaScript

- Vanilla ES2020+, no build step, no npm
- `requestAnimationFrame` loop for the timer display — more accurate and battery-friendly than `setInterval`
- `performance.now()` for high-resolution elapsed time (sub-millisecond precision)
- State stored in a plain JS object, serialized to `localStorage` on every meaningful mutation
- Event delegation on the runner list container (one listener, not one per card)
- Web Audio API for the finish beep: programmatically create a short 880Hz sine wave oscillator — no audio file needed
- `navigator.share` (Web Share API) for native sharing on Android if available, fallback to clipboard copy
- `URL.createObjectURL` + `<a download>` trick for CSV export

---

## 4. Component Breakdown

### AppState (plain object)

Central truth. All UI reads from this; all interactions write to this then re-render.

```
AppState {
  timer: {
    startTime: number | null,   // performance.now() value when started
    elapsed: number,            // ms accumulated from previous start/stop cycles
    running: boolean
  },
  runners: Runner[],
  nextBib: number,
  settings: {
    darkMode: boolean,
    soundEnabled: boolean
  }
}

Runner {
  id: string,           // crypto.randomUUID or Date.now() fallback
  bib: number,
  name: string,
  status: 'pending' | 'running' | 'finished' | 'dnf',
  finishTime: number | null,  // ms elapsed at finish
}
```

### TimerDisplay
- Reads `AppState.timer`
- Renders `MM:SS.ms` (switches to `HH:MM:SS.ms` when >1 hour)
- `requestAnimationFrame` loop; cancels when `timer.running === false`

### RunnerCard
- Rendered from `<template id="runner-card-tpl">`
- Cloned and inserted into `#runner-list`
- Data-attributes: `data-runner-id`, `data-status`
- CSS class changes drive all visual state transitions

### ResultsTable
- Hidden until at least one runner has `status === 'finished'`
- Reads only `finished` runners sorted by `finishTime` ascending
- Computes gap column: `finishTime - runners[0].finishTime`

### AddRunnerForm
- Collapsible `<details>` / `<summary>` element
- On submit: creates Runner, pushes to `AppState.runners`, re-renders runner list, re-focuses input

### ExportButtons
- **Copy**: builds text table, calls `navigator.clipboard.writeText()`
- **CSV Download**: `Blob` → `URL.createObjectURL` → programmatic `<a>` click
- **Share** (Android): `navigator.share()` if available

### SettingsPanel
- Slide-in drawer triggered by the settings icon in the header
- Contains: dark/light toggle, sound toggle, "Clear Session" danger button

---

## 5. Data Flow / State Management

### Principle

Unidirectional data flow: **Action → Mutation → Persist → Re-render**

```javascript
function dispatch(action, payload) {
  mutate(AppState, action, payload);   // pure mutation of AppState
  persist(AppState);                   // JSON.stringify to localStorage
  render(AppState);                    // sync DOM to state
}
```

### Key Actions

| Action | Payload | Effect |
|---|---|---|
| `START_TIMER` | — | `timer.startTime = perf.now(), timer.running = true` |
| `STOP_TIMER` | — | `timer.elapsed += delta, timer.running = false` |
| `RESET_TIMER` | — | reset timer to zero |
| `ADD_RUNNER` | `{name}` | push new Runner to `runners[]` |
| `FINISH_RUNNER` | `{id}` | `status='finished'`, `finishTime=elapsed` |
| `UNDO_FINISH` | `{id}` | `status='running'`, `finishTime=null` |
| `DNF_RUNNER` | `{id}` | `status='dnf'` |
| `REMOVE_RUNNER` | `{id}` | filter runner out of array |
| `RENAME_RUNNER` | `{id, name}` | update `runner.name` |
| `RESET_SESSION` | — | reset entire AppState to defaults |

### Persistence

- `localStorage.setItem('stopwatch_state', JSON.stringify(AppState))` on every dispatch
- On app load: hydrate from localStorage if valid
- Guard: if hydrated state has `timer.running === true` (page refreshed mid-race), pause timer and show recovery toast

---

## 6. Color Scheme and Design System

### Palette — Dark Mode (Default)

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0d0f14` | Page background |
| `--color-surface` | `#161b24` | Cards, panels |
| `--color-surface-alt` | `#1e2535` | Elevated cards, hover states |
| `--color-border` | `#2a3347` | Dividers, card borders |
| `--color-accent` | `#00e5ff` | Primary — timer, CTA buttons (electric cyan) |
| `--color-success` | `#00c853` | Finish state, recorded times |
| `--color-danger` | `#ff3d00` | DNF badge, danger actions |
| `--color-warning` | `#ffd600` | Stop button active state |
| `--color-text-primary` | `#f0f4ff` | Main text |
| `--color-text-secondary` | `#8899bb` | Labels, metadata |

### Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Timer display | `'Roboto Mono', monospace` | `clamp(48px, 14vw, 72px)` | 700 |
| Runner name | `'Inter', system-ui, sans-serif` | `clamp(16px, 4vw, 20px)` | 500 |
| Bib number | `'Roboto Mono', monospace` | `14px` | 700 |
| Results table | `'Inter', system-ui, sans-serif` | `14px` | 400/600 |

### Spacing Scale (4px base grid)

```
--space-1:  4px    --space-4: 16px
--space-2:  8px    --space-6: 24px
--space-3: 12px    --space-8: 32px
```

### Button Styles

- **Primary (START / FINISH)**: filled accent color, pill shape, `height: 48px`, bold label
- **Secondary (STOP / RESET)**: outlined with accent border, transparent fill
- **Danger (DNF / Clear)**: filled `--color-danger`
- **Ghost (Undo, Settings)**: no border, no fill, icon only

### Runner Card Left Accent Bar (4px, full height)

- `--color-accent` when running
- `--color-success` when finished
- `--color-danger` when DNF
- `--color-border` when pending

---

## 7. Implementation Sequencing

### Phase 1 — Skeleton and Timer
1. `index.html` boilerplate with CSS variables and layout grid
2. Timer hero section with `requestAnimationFrame` loop
3. START / STOP / RESET controls wired to AppState

### Phase 2 — Runner Management
4. Add Runner form
5. Runner card template and rendering
6. FINISH button → captures elapsed time
7. State persistence to localStorage

### Phase 3 — Results and Export
8. Results table with rank + gap calculation
9. Copy and CSV export
10. Web Share API integration

### Phase 4 — Polish
11. Animations and transitions
12. Sound cue via Web Audio API
13. Dark/light mode toggle
14. Settings panel
15. Empty states and error handling
16. Fullscreen mode
17. Manual QA on Pixel 8 Chrome

---

## 8. Edge Cases

| Scenario | Handling |
|---|---|
| FINISH tapped before START | Button disabled; toast: "Start the timer first" |
| FINISH tapped when timer stopped mid-race | Warn: timer is paused, confirm or resume |
| Page refresh mid-race | Timer auto-pauses, state restored, toast shown |
| Very long runner name (>30 chars) | Truncated with `text-overflow: ellipsis`; full name in `title` attribute |
| Offline use | Fully offline — no network requests after initial load |
| iOS Safari | Web Audio context must be resumed after user gesture; handle with `audioCtx.resume()` in START handler |

---

## 9. Accessibility Checklist

- All interactive elements reachable by keyboard
- Timer display wrapped in `<output aria-live="off">` (live only on finish events)
- FINISH button: `aria-label="Record finish time for [name]"`
- Results table uses `<table>` with `<thead>`, `<th scope="col">`, `<caption>`
- Color never the sole differentiator (icons + text labels accompany color states)
- Focus ring visible: `outline: 3px solid var(--color-accent)` on `:focus-visible`
- `@media (prefers-reduced-motion: reduce)` disables animations
