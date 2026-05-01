# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # production server
npm run lint     # ESLint
```

No test suite is configured.

## What This Is

An interactive educational web app explaining EPPO's sequential testing methodology for A/B experiments. Purely client-side — all simulations run in the browser. No backend.

The site has two parallel tracks:
- `/focused` (also `/short`) — 3-act practical guide (~20 min)
- `/in-depth` (also `/detailed`) — 14-act mathematical deep-dive (~60 min)

## Tech Stack

Next.js 14 App Router · TypeScript (strict) · Tailwind CSS · D3.js (interactive charts) · KaTeX (math rendering) · Framer Motion (transitions)

## Architecture

```
app/           # Next.js App Router — root page, focused/, in-depth/, redirects
components/
  act1/        # "Peeking problem" simulation components
  act2/        # EPPO sequential testing solution components
  act3/        # DIY implementation + alternative methods components
  detailed/    # Components exclusive to the in-depth track
  ui/          # Reusable primitives (Card, DisplayMathBox, etc.)
  layout/      # Navigation and layout wrappers
  shared/      # Components shared across both tracks
lib/math/
  statistics.ts  # Core statistical engine (confidence intervals, sequential
                 # testing, Howard et al. 2021 confidence sequences,
                 # Bonferroni, Pocock/O'Brien-Fleming, Monte Carlo)
past/          # Legacy versions — excluded from TypeScript compilation
```

## Key Conventions

- Statistical computations live in `lib/math/statistics.ts`. Client-side Monte Carlo simulations can be expensive — keep them off the main thread or throttled where possible.
- KaTeX is used for all math rendering; D3 for all charts and simulations.
- Tailwind uses a custom palette: blue (primary), yellow (secondary), purple (accent). Prefer these over arbitrary colors.
- Inter is the body font; JetBrains Mono for code.
