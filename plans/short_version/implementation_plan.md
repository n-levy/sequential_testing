# Implementation Plan: Sequential Testing — Short Version (v2)

## Overview

Build an interactive single-page web application that implements the short
version plan (v2): three acts explaining sequential testing for A/B experiments,
with interactive simulations, animated visuals, and rendered math.

**Source of truth:** `plan/short_version/sequential_testing_short_v2.tex`
**Companion code:** `plan/short_version/sequential_testing_simulations.py`

---

## Tech Stack

| Layer            | Choice                          | Rationale                                        |
|------------------|---------------------------------|--------------------------------------------------|
| Framework        | **Next.js 14** (App Router)     | Static export, React Server Components, fast dev |
| Language         | **TypeScript**                  | Type safety for math-heavy code                  |
| Styling          | **Tailwind CSS**                | Rapid UI, responsive, consistent design tokens   |
| Math rendering   | **KaTeX**                       | Fast client-side LaTeX rendering                 |
| Charts/Viz       | **D3.js**                       | Full control for custom simulations              |
| Animation        | **Framer Motion**               | Pipeline animations, transitions between acts    |
| Hosting          | **Vercel**                      | Zero-config Next.js deployment                   |

**Accounts needed:** GitHub (repo), Vercel (deploy).

---

## Architecture

```
sequential-testing-site/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata, nav shell
│   ├── page.tsx                # Landing / intro (scrolls into acts)
│   ├── globals.css             # Tailwind + custom tokens
│   └── components/
│       ├── ui/                 # Shared primitives
│       │   ├── Card.tsx        # Styled content boxes (intuition, keytakeaway, etc.)
│       │   ├── Slider.tsx      # Parameter sliders
│       │   ├── Toggle.tsx      # Seed toggle, mode switches
│       │   ├── MathBlock.tsx   # KaTeX block equation wrapper
│       │   ├── InlineMath.tsx  # KaTeX inline wrapper
│       │   ├── Table.tsx       # Styled data table
│       │   └── CodeBlock.tsx   # Syntax-highlighted Python snippets
│       ├── layout/
│       │   ├── Nav.tsx         # Sticky top nav (Act 1 / 2 / 3)
│       │   ├── ActSection.tsx  # Section wrapper with scroll anchor
│       │   └── Footer.tsx
│       ├── act1/
│       │   ├── Act1.tsx        # Container: motivation + sim + explanation
│       │   ├── PeekingSim.tsx  # Interactive simulation (D3)
│       │   └── FprTable.tsx    # "How bad is it" table
│       ├── act2/
│       │   ├── Act2.tsx        # Container
│       │   ├── PipelineDiagram.tsx    # Animated Randomise→...→Decide
│       │   ├── PipelineStepDetail.tsx # Step-by-step expansion panels
│       │   ├── EppoPipelineSim.tsx    # Interactive sim (D3)
│       │   ├── ComparisonToggle.tsx   # Side-by-side adjusted/unadjusted
│       │   └── DecisionTable.tsx      # Green/red/grey decision table
│       ├── act3/
│       │   ├── Act3.tsx        # Container
│       │   ├── MethodCard.tsx  # Reusable card for Bonf/Pocock/OBF
│       │   ├── BonferroniImpl.tsx     # Recipe + equations + code snippet
│       │   ├── PocockImpl.tsx         # Recipe + equations + code snippet
│       │   ├── ObfImpl.tsx            # Recipe + equations + code snippet
│       │   ├── ComparisonSim.tsx      # 4-method CI bands (D3)
│       │   ├── FprComparisonSim.tsx   # 10K experiments FPR counters
│       │   └── HeadToHeadTable.tsx    # Comparison table
│       └── summary/
│           ├── SummaryTable.tsx
│           └── PriceOfPeekingTable.tsx
├── lib/
│   ├── math/
│   │   ├── rng.ts             # Seeded PRNG (xoshiro128**)
│   │   ├── distributions.ts   # Normal CDF/PPF, t-test
│   │   ├── bonferroni.ts      # Bonferroni CI logic
│   │   ├── pocock.ts          # Pocock critical value (simulation-based)
│   │   ├── obf.ts             # O'Brien–Fleming critical value
│   │   ├── sequential.ts      # Howard et al. confidence sequence
│   │   └── simulation.ts      # Shared experiment generation
│   ├── constants.ts           # Colour palette, default params
│   └── hooks/
│       ├── useSimulation.ts   # Manages sim state, Web Worker bridge
│       └── useScrollSpy.ts    # Tracks active act for nav highlight
├── workers/
│   └── sim-worker.ts          # Web Worker for heavy sims (10K experiments)
├── public/
│   └── og-image.png           # Social sharing image
├── tailwind.config.ts
├── next.config.ts             # Static export config
├── tsconfig.json
└── package.json
```

---

## Colour Palette (matching v2 LaTeX environments)

| Environment     | Background       | Border / Accent      | CSS variable            |
|-----------------|------------------|----------------------|-------------------------|
| Intuition       | `#F0F8FF` (blue) | `#3366AA`            | `--colour-intuition`    |
| Simulation      | `#FFFAF0` (warm) | `#CC8833`            | `--colour-simulation`   |
| Key Takeaway    | `#F5F5DC` (beige)| `#6B8E23`            | `--colour-keytakeaway`  |
| Plain Language   | `#FFFFFF`        | `#888888`            | `--colour-plain`        |
| Code            | `#F8F8F8`        | `#C8C8C8`            | `--colour-code`         |
| Decision green  | —                | `#2E8B57`            | `--colour-ship`         |
| Decision red    | —                | `#DC3545`            | `--colour-revert`       |
| Decision grey   | —                | `#888888`            | `--colour-inconclusive` |
| Bonferroni line | —                | `#DC3545` (red)      | `--colour-bonf`         |
| Pocock line     | —                | `#E08030` (orange)   | `--colour-pocock`       |
| OBF line        | —                | `#2266CC` (blue)     | `--colour-obf`          |
| Eppo line       | —                | `#2E8B57` (green)    | `--colour-eppo`         |

---

## Phase Plan

### Phase 0: Project Scaffold (Day 1)

| #  | Task                                  | Detail                                              |
|----|---------------------------------------|------------------------------------------------------|
| 0a | Create Next.js project                | `npx create-next-app@latest --ts --tailwind --app`   |
| 0b | Install dependencies                  | `katex`, `d3`, `framer-motion`, types                |
| 0c | Configure Tailwind theme              | Extend with colour palette above                     |
| 0d | Set up layout + nav                   | Sticky nav with Act 1/2/3 anchors, scroll spy        |
| 0e | Build shared UI primitives            | `Card`, `MathBlock`, `InlineMath`, `Slider`, `Toggle`, `Table`, `CodeBlock` |
| 0f | Init Git repo, push to GitHub         | —                                                    |
| 0g | Connect Vercel                        | Auto-deploy on push to `main`                        |

**Exit criteria:** Empty site deploys with nav, styled cards, and one KaTeX equation rendering.

---

### Phase 1: Static Content (Days 2–3)

Port all non-interactive content from the LaTeX document.

| #  | Task                              | Source (v2 LaTeX)                  |
|----|-----------------------------------|------------------------------------|
| 1a | Introduction section              | Lines 100–130                      |
| 1b | Act 1 — Motivation (intuition)    | Lines 142–160                      |
| 1c | Act 1 — "Why Does This Happen"    | Lines 196–207                      |
| 1d | Act 1 — "How Bad Is It" table     | Lines 209–234                      |
| 1e | Act 1 — Key Takeaway              | Lines 236–246                      |
| 1f | Act 2 — Big Idea (intuition)      | Lines 255–266                      |
| 1g | Act 2 — Pipeline Steps 1–7        | Lines 310–430 (all math + plain language) |
| 1h | Act 2 — Decision table            | Lines 410–430                      |
| 1i | Act 2 — Key Takeaway              | Lines 434–448                      |
| 1j | Act 3 — Intuition ("budget")      | Lines 560–580                      |
| 1k | Act 3 — Bonferroni (recipe + table + implementation + pros/cons) | Lines 585–670 |
| 1l | Act 3 — Pocock (recipe + table + implementation)                | Lines 675–740 |
| 1m | Act 3 — OBF (recipe + table + implementation + practical tip)   | Lines 745–830 |
| 1n | Act 3 — Head-to-Head table        | Lines 835–870                      |
| 1o | Act 3 — Key Takeaway              | Lines 872–890                      |
| 1p | Summary section (both tables)     | Lines 895–930                      |
| 1q | References section                | Lines 935–970                      |
| 1r | Python code display (Appendix)    | Lines 975–end (rendered as CodeBlock with syntax highlighting) |

**Exit criteria:** All text, equations, and tables from v2 are rendered and styled. No interactivity yet. Readable on mobile.

---

### Phase 2: Math Engine (Days 4–5)

Implement the statistical computations in TypeScript, mirroring `sequential_testing_simulations.py`.

| #  | Task                              | Detail                                             |
|----|-----------------------------------|----------------------------------------------------|
| 2a | Seeded PRNG (`rng.ts`)            | xoshiro128** or similar; deterministic replay       |
| 2b | Normal distribution helpers       | `normalCdf`, `normalPpf`, `normalPdf`              |
| 2c | Data generation (`simulation.ts`) | `generateExperiment(n, delta, sigma, seed)` → control/treatment arrays |
| 2d | T-test (`distributions.ts`)       | Two-sample t-test returning p-value                |
| 2e | Bonferroni (`bonferroni.ts`)      | `bonferroniTest(ctrl, trt, K, alpha)` → `{reject, ci, tauHat, zStar}` |
| 2f | Pocock (`pocock.ts`)              | `pocockCriticalValue(K, alpha, nSim)` + `pocockTest(...)` |
| 2g | OBF (`obf.ts`)                    | `obfCriticalValue(k, K, alpha)` + `obfTest(...)`  |
| 2h | Sequential CI (`sequential.ts`)   | Howard et al. multiplier: `sequentialCI(tauHat, se, n, nu, alpha)` |
| 2i | Web Worker wrapper                | Offload `nSim ≥ 1000` experiments to worker thread  |
| 2j | Unit tests                        | Compare TS outputs against Python reference values  |

**Exit criteria:** All math functions pass unit tests. Python and TS agree on critical values and CI bounds to 3 decimal places.

---

### Phase 3: Act 1 Simulation (Days 6–7)

**Component:** `PeekingSim.tsx`

| #  | Task                              | Detail                                             |
|----|-----------------------------------|----------------------------------------------------|
| 3a | Single experiment view            | D3 line chart: p-value over time, red highlight when p < 0.05 |
| 3b | Counter overlay                   | "False positives so far: X / N"                    |
| 3c | Batch mode (1,000 experiments)    | Bar chart showing fraction that hit p < 0.05 at some point |
| 3d | Single-check comparison mode      | Second bar showing ~5% for end-only check          |
| 3e | Controls panel                    | Sliders: n_obs (100–2000), n_experiments (100–10000), peek_interval (5–100) |
| 3f | Fixed seed toggle                 | Deterministic replay for presentations             |
| 3g | Animation                         | Observations arrive one-by-one; p-value updates live |
| 3h | Progressive disclosure            | "Run" button starts; can pause/step                |

**Exit criteria:** User can see p-value bouncing, false positive counter climbing. Batch mode shows ~25% FPR with frequent peeking vs ~5% single check.

---

### Phase 4: Act 2 Simulation — Eppo Pipeline (Days 8–10)

**Components:** `PipelineDiagram.tsx`, `EppoPipelineSim.tsx`, `ComparisonToggle.tsx`

| #  | Task                              | Detail                                             |
|----|-----------------------------------|----------------------------------------------------|
| 4a | Pipeline diagram (static)         | Six connected boxes: Randomise→Collect→Adjust→Estimate→CI→Decide |
| 4b | Pipeline animation                | Framer Motion: boxes light up sequentially          |
| 4c | "Step through pipeline" button    | Pauses at each stage; shows stage-specific visual   |
| 4d | Stage 1 (Randomise)               | D3 scatter: dots appear, coloured blue/green       |
| 4e | Stage 2 (Collect)                 | Dots acquire (X, Y) labels; tooltip on hover       |
| 4f | Stage 3 (Adjust)                  | Animate Y→Y*: regression line, dots shift vertically, spread decreases |
| 4g | Stage 4 (Estimate)                | Group means as horizontal lines; lift label        |
| 4h | Stage 5 (CI)                      | CI band draws around lift; shrinks as n grows      |
| 4i | Stage 6 (Decide)                  | CI colour-coded green/red/grey; verdict label      |
| 4j | Side-by-side comparison           | Split view: with adjustment vs without (same data) |
| 4k | Controls panel                    | δ (0–10%), n (100–100K), ρ (0–0.95), seed toggle   |
| 4l | "Run 1,000 experiments" mode      | Batch stats: average CI width, power, FPR          |

**Exit criteria:** User can step through the Eppo pipeline and see each transformation. Side-by-side mode visually shows the benefit of CUPED.

---

### Phase 5: Act 3 Simulation — Method Comparison (Days 11–13)

**Components:** `ComparisonSim.tsx`, `FprComparisonSim.tsx`

| #  | Task                              | Detail                                             |
|----|-----------------------------------|----------------------------------------------------|
| 5a | Panel 1: Four CI bands            | D3 line chart, 4 coloured CI bands over time        |
| 5b | Vertical dashed lines             | Mark K planned analysis times                       |
| 5c | Between-peek gap rendering        | Group-sequential bands undefined between peeks; Eppo continuous |
| 5d | Panel 2: 10,000 experiments       | FPR counters for naive/Bonf/Pocock/OBF/Eppo (via Web Worker) |
| 5e | Animated counters                 | Numbers tick up as experiments complete              |
| 5f | Panel 3: Efficiency               | Under true effect: avg stopping time bar chart      |
| 5g | Controls panel                    | K (2–20), δ (0–10%), α, seed toggle, batch mode    |
| 5h | Code snippet tabs                 | For each method: show Python implementation alongside the sim |

**Exit criteria:** User sees all four methods side-by-side. Naive peeking clearly exceeds 5%. All corrected methods stay ≤ 5%.

---

### Phase 6: Polish & Responsive Design (Days 14–15)

| #  | Task                              | Detail                                             |
|----|-----------------------------------|----------------------------------------------------|
| 6a | Mobile responsiveness             | All sims readable at 375px; controls stack vertically |
| 6b | Dark mode support                 | Tailwind `dark:` variants for all card types       |
| 6c | Print stylesheet                  | Clean print layout (hide controls, show static sims) |
| 6d | Smooth scrolling                  | Nav links scroll to act sections                    |
| 6e | Scroll-triggered animations       | Content fades in on scroll (Framer Motion viewport) |
| 6f | Loading states                    | Skeleton loaders while sims compute                |
| 6g | Performance audit                 | Lighthouse: target ≥90 on all scores               |
| 6h | Accessibility audit               | a11y for all controls, ARIA labels on charts       |
| 6i | Meta tags / OG image              | Social sharing preview                              |
| 6j | Favicon                           | Simple σ or CI icon                                 |

---

### Phase 7: Testing & Deploy (Day 16)

| #  | Task                              | Detail                                             |
|----|-----------------------------------|----------------------------------------------------|
| 7a | Cross-browser test                | Chrome, Safari, Firefox, mobile Safari             |
| 7b | Math rendering check              | All KaTeX equations render correctly               |
| 7c | Sim accuracy check                | Compare web sim outputs to Python reference         |
| 7d | Vercel production deploy          | `main` branch auto-deploys                         |
| 7e | Custom domain (optional)          | If desired, configure in Vercel                    |

---

## Content–Component Mapping

| v2 Section                        | Component(s)                          | Interactive? |
|-----------------------------------|---------------------------------------|:------------:|
| Introduction                      | Intro text in `page.tsx`              | No           |
| Act 1 — Motivation                | `Card` (intuition)                    | No           |
| Act 1 — Simulation                | `PeekingSim.tsx`                      | **Yes**      |
| Act 1 — Why / How Bad / Takeaway  | `Card` + `FprTable.tsx`               | No           |
| Act 2 — Big Idea                  | `Card` (intuition)                    | No           |
| Act 2 — Simulation                | `PipelineDiagram` + `EppoPipelineSim` | **Yes**      |
| Act 2 — Steps 1–7                 | `PipelineStepDetail.tsx` (expandable) | Expand/collapse |
| Act 2 — Decision table            | `DecisionTable.tsx`                   | No           |
| Act 2 — Side-by-side              | `ComparisonToggle.tsx`                | **Yes**      |
| Act 3 — Intuition                 | `Card` (intuition)                    | No           |
| Act 3 — Bonferroni                | `BonferroniImpl.tsx`                  | No (+ code tab) |
| Act 3 — Pocock                    | `PocockImpl.tsx`                      | No (+ code tab) |
| Act 3 — OBF                       | `ObfImpl.tsx`                         | No (+ code tab) |
| Act 3 — Simulation (4 bands)      | `ComparisonSim.tsx`                   | **Yes**      |
| Act 3 — FPR (10K experiments)     | `FprComparisonSim.tsx`                | **Yes**      |
| Act 3 — Head-to-Head table        | `HeadToHeadTable.tsx`                 | No           |
| Summary                           | `SummaryTable` + `PriceOfPeekingTable` | No         |
| References                        | Static list                           | No           |
| Python code (Appendix)            | `CodeBlock.tsx` with tabs             | Copy button  |

---

## Simulation Specifications

### Sim 1: Peeking Problem (Act 1)

- **Input:** `n_obs` (per group), `n_experiments`, `peek_interval`, `alpha`, `seed`
- **Computation:** For each experiment, generate null data, compute t-test at each peek
- **Output:** FPR with peeking, FPR single check
- **Visual:** p-value trajectory (single) + FPR bar chart (batch)
- **Reference:** `simulate_peeking()` in Python companion

### Sim 2: Eppo Pipeline (Act 2)

- **Input:** `delta`, `n`, `rho`, `seed`
- **Computation:** Generate correlated (X, Y) pairs, regression adjust, compute sequential CI
- **Output:** Raw vs adjusted data, group means, lift, CI band, decision
- **Visual:** Pipeline stages with animated transitions
- **Reference:** Steps 1–7 in v2 LaTeX

### Sim 3: Method Comparison (Act 3)

- **Input:** `K`, `delta`, `alpha`, `n_per_group`, `seed`
- **Computation:** All four CI methods on same data stream
- **Output:** CI bands at each peek, FPR counters, stopping times
- **Visual:** Panel 1 (4 CI lines), Panel 2 (FPR counters), Panel 3 (efficiency bars)
- **Reference:** `compare_methods()` in Python companion

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "katex": "^0.16",
    "d3": "^7",
    "framer-motion": "^11"
  },
  "devDependencies": {
    "@types/d3": "^7",
    "@types/katex": "^0.16",
    "typescript": "^5",
    "tailwindcss": "^3",
    "@testing-library/react": "^14",
    "vitest": "^1"
  }
}
```

---

## Risk Register

| Risk                                    | Mitigation                                              |
|-----------------------------------------|---------------------------------------------------------|
| Heavy sims block main thread            | Web Worker for batch sims (≥1K experiments)             |
| KaTeX rendering flash                   | Pre-render static math at build time; lazy-load dynamic |
| D3 + React conflicts                    | Use D3 for math only, React for DOM; `useRef` pattern  |
| Pocock critical value slow (200K sims)  | Pre-compute for K=2..20 at build time; cache            |
| Mobile chart readability                | Responsive SVG viewBox; touch-friendly controls         |
| Browser compat for Web Workers          | Fallback to main thread with smaller n_sim              |

---

## Timeline Summary

| Phase | Description               | Days | Cumulative |
|-------|---------------------------|------|------------|
| 0     | Scaffold + deploy         | 1    | 1          |
| 1     | Static content            | 2    | 3          |
| 2     | Math engine               | 2    | 5          |
| 3     | Act 1 simulation          | 2    | 7          |
| 4     | Act 2 simulation          | 3    | 10         |
| 5     | Act 3 simulation          | 3    | 13         |
| 6     | Polish + responsive       | 2    | 15         |
| 7     | Testing + deploy          | 1    | 16         |
