# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Commands

```bash
npm run dev      # development server at localhost:3000
npm run build    # production build (also runs TypeScript)
npm run start    # production server
npm run lint     # ESLint
```

No test suite is configured. TypeScript checking runs inside `npm run build`.

## What This Is

An interactive educational web app explaining sequential testing methodology for A/B experiments. Purely client-side — all simulations run in the browser. No backend. Deployed at https://sequential-testing.vercel.app.

Two parallel tracks:
- `/focused` — 5-act practical guide (~20 min): peeking problem, Eppo solution, hybrid approach, alternative methods, magnitude error
- `/in-depth` — 14-act mathematical deep-dive (~60 min): random walks → martingales → SPRT → confidence sequences → Eppo pipeline

## Tech Stack

Next.js 14 App Router · TypeScript (strict) · Tailwind CSS · D3.js (charts) · KaTeX (math) · Framer Motion (transitions)

## Architecture

```
app/           # Next.js App Router — root page, focused/, in-depth/, redirects
components/
  act1/        # Act 1: Peeking problem
  act2/        # Act 2: Eppo sequential CI
  act_hybrid/  # Act 3: Hybrid approach + HybridSim
  act3/        # Act 4: Alternative methods (Act3.tsx exports Act4)
  act5/        # Act 5: Magnitude error
  detailed/    # All in-depth-only components (DetailedAct1–14, sims/)
  shared/      # Shared across both tracks: ABTestSim, ShowAllButton
  ui/          # Primitives: DisplayMathBox, ShowMath, Card, Math wrappers
lib/math/
  statistics.ts  # Statistical engine: sequential CIs, Howard 2021, Bonferroni,
                 # Pocock, O'Brien–Fleming, Monte Carlo
```

## Key Conventions

- All statistical computations live in `lib/math/statistics.ts`.
- Client-side Monte Carlo: seeded PRNG (`mulberry32`) for reproducibility. Computationally expensive sims (1000 repetitions) only run on explicit user action.
- KaTeX for all math; D3 for all charts/simulations.
- Tailwind palette: blue (primary), yellow (secondary), purple (accent).
- Inter body font; JetBrains Mono for code.

## Collapsible Sections and "Show All Content"

Many sections are collapsible (math boxes, FAQ items, sim notes, appendix code). They all listen for a custom browser event:

```typescript
window.dispatchEvent(new CustomEvent('show-all-content'))
```

`components/shared/ShowAllButton.tsx` dispatches this event. All collapsible components add a `useEffect` listener that sets their open state to `true`.

Components that respond to this event:
- `ui/DisplayMathBox.tsx` — "Show the math" toggle
- `ui/ShowMath.tsx` — "Show me the math" toggle
- `components/FAQ.tsx` — `FAQItem` accordion
- `act1/Act1.tsx`, `act2/Act2.tsx` — local `DisplayMathBox` copies
- `act3/Act3.tsx` — "Show the code of the simulations" toggle
- `shared/ABTestSim.tsx` — expands simulation notes AND triggers 1000-rep run
- `detailed/DetailedAppendixCode.tsx` — `CodeBlock` source code toggles

## ABTestSim

`shared/ABTestSim.tsx` is the primary simulation component, used by acts 1, 2, 4, and 5 (focused track) and act 14 (in-depth). Props:
- `layers` — which CI methods to display (fixed-ci, sequential-ci, pocock, obf, bonferroni, harm-detect)
- `showPeekStats` — enables the "Run 1000 repetitions" section at the bottom
- `showMeanEffects` — adds mean effect columns to the 1000-rep table
- `K` — default number of peeks (slider)
- `defaultEffect` — initial effect size

The single-run chart and the 1000-repetition section share the same component state (same sliders apply to both).

## HybridSim

`act_hybrid/HybridSim.tsx` shows a sequential CI (guardrail monitoring) as a blue band across the full experiment, plus a standard CI error bar at the planned end date. SVG viewBox is 820×380 (right margin reserved for the end-of-test annotation).
