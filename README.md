# StopWatch

A mobile-first stopwatch web app for tracking finish times of multiple runners in a race or training session. No install, no server — just open `index.html` in your browser.

![Dark sporty theme with electric cyan timer and runner cards](https://placehold.co/600x300/0d0f14/00e5ff?text=StopWatch)

## Features

- **Global race timer** — start, stop, and reset a shared stopwatch
- **Multi-runner tracking** — add any number of runners by name before or during the race
- **One-tap finish capture** — tap FINISH on each runner card to stamp their exact elapsed time
- **Live results table** — auto-sorted by finish time with gap from the leader, medal icons for top 3
- **Undo & DNF** — undo a finish stamp or mark a runner as Did Not Finish
- **Export** — copy results as plain text, download as CSV, or share via Android native share sheet
- **Session persistence** — state saved to `localStorage`; survives page refresh
- **Sound cue** — double-beep on finish via Web Audio API (no external files)
- **Dark / light mode** — toggle in settings, defaults to dark
- **Fullscreen mode** — hides browser chrome for race-day use

## Usage

1. Open `index.html` in Chrome (or any modern browser)
2. Add runners using the **+ Add Runner** panel
3. Tap **START** to begin the race timer
4. Tap **FINISH** on each runner's card as they cross the line
5. View ranked results in the **Results** section
6. Export or share via the Copy / CSV / Share buttons

## Optimized For

- Google Pixel 8 (412 × 915 px) — all tap targets ≥ 48 px
- Chrome on Android
- Works on desktop and iOS Safari too

## Tech Stack

- Pure HTML / CSS / JavaScript — zero dependencies, zero build step
- `requestAnimationFrame` + `performance.now()` for accurate timing
- Web Audio API for finish beep (no audio files)
- Web Share API for native Android sharing
- `localStorage` for session persistence

## File Structure

```
stopwatch/
├── index.html    — entire app (markup, styles, scripts)
├── planning.md   — design decisions, component breakdown, color system
└── README.md     — this file
```

## License

MIT
