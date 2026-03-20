# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

Open `index.html` directly in a browser — no build step required. All code is in this single file.

To regenerate PWA icons after editing `icons/icon.svg`:
```
node generate-icons.js
```
(requires Node.js with the `sharp` package)

## Architecture

The entire app is a single file: `index.html`. It contains:

1. **Inline CSS** (~1000 lines) — full design system with CSS variables for theming
2. **HTML** (~200 lines) — structure, including a `<template>` tag used for runner cards
3. **Inline JS** (~360 lines) — all app logic

### State & Data Flow

Unidirectional: `User Action → dispatch(action) → mutate(AppState) → persist() → render()`

```js
AppState = {
  timer: { startTime, elapsed, running },
  runners: [{ id, bib, name, status, finishTime }],
  nextBib: number,
  settings: { darkMode, soundEnabled }
}
```

State is persisted to `localStorage` on every mutation. On load, state is restored from `localStorage`.

### Key Functions

- `dispatch(action, payload)` — central mutation dispatcher; all state changes go through here
- `getElapsed()` — calculates current time from `startTime + accumulated elapsed`
- `render()` — full re-render; calls `renderTheme()`, `renderTimer()`, `renderRunnerList()`, `renderResults()`
- `renderTimer()` — drives the timer display via `requestAnimationFrame`
- `renderRunnerList()` — reuses DOM nodes from `<template>` to avoid full re-renders
- `playBeep()` — Web Audio API double-beep (880Hz + 1100Hz) on runner finish

### PWA

`manifest.json` configures the PWA. Icons live in `icons/`. The app uses Screen Wake Lock API to keep the display on while timing.

## Design System

See `feedback_visual_design_rules.md` in memory — 27 standing UI rules govern all CSS changes. Key points:

- Mobile-first, target Pixel 8 (412×915px), max-width 500px container
- Dark mode default; `--color-accent` is `#00e5ff` (dark) / `#0070c4` (light)
- Timer/bib numbers use Roboto Mono; all other text uses Inter
- All touch targets ≥ 48px
- `clamp()` for fluid typography
