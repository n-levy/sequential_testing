# Sequential Testing for A/B Experiments — Documentation

Live site: **https://sequential-testing.vercel.app**

## What This Project Is

An interactive educational web application that explains sequential testing methodology for A/B experiments. All simulations run client-side in the browser — no backend. The site has two parallel learning tracks:

| Track | URL | Target audience | Reading time |
|-------|-----|-----------------|--------------|
| **Focused** | `/focused` | Data scientists who want to implement sequential testing | ~20 min |
| **In-Depth** | `/in-depth` | Readers who want the mathematical foundations | ~60 min |

---

## Focused Track — Five Acts

1. **The Peeking Problem** — Why interim analyses inflate Type I error above the nominal level. Interactive simulation shows false positive rates under repeated peeking.
2. **The Eppo Solution (2022)** — How modern platforms implement sequential confidence intervals using a time-varying multiplier (Howard et al., 2021 / Schmit & Miller, 2022).
3. **The Hybrid Approach** — Monitor guardrail KPIs with a sequential confidence interval; analyse the primary KPI with a standard confidence interval at the planned end date.
4. **Alternative Methods** — Bonferroni, Pocock, O'Brien–Fleming, and guardrail harm detection (3 SD rule) for teams without a dedicated platform.
5. **Caution: Magnitude Error** — Why early stopping in sequential tests inflates estimated effect sizes (winner's curse), and how the hybrid approach avoids this.

---

## In-Depth Track — Fourteen Acts

1. The Peeking Problem (simulation and intuition)
2. Random Walk (foundations)
3. Martingale (fair game property)
4. Likelihood Ratio (evidence accumulation)
5. LR is a Martingale (connection between likelihood ratios and martingales)
6. Ville's Inequality (the cornerstone of sequential testing)
7. Wald's SPRT (Sequential Probability Ratio Test)
8. Mixture / mSPRT (composite alternative via mixture prior)
9. Confidence Sequences (Howard et al., 2021)
10. The Problem Eppo Solves (full pipeline context)
11. The Eppo Pipeline (variance reduction + sequential CI)
12. Variance Reduction (CUPED / pre-experiment covariates)
13. Sequential CI (the final formula and its properties)
14. Alternative Methods (Bonferroni, Pocock, O'Brien–Fleming, hybrid approach)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Charts | D3.js |
| Math | KaTeX |
| Animation | Framer Motion |
| Deployment | Vercel |

---

## Project Structure

```
sequential_testing/
├── site/                        # Next.js web application
│   ├── app/                     # Next.js App Router pages
│   │   ├── page.tsx             # Root landing page (track selector)
│   │   ├── focused/page.tsx     # Focused track (/focused)
│   │   └── in-depth/page.tsx    # In-depth track (/in-depth)
│   ├── components/
│   │   ├── act1/                # Act 1: Peeking problem
│   │   ├── act2/                # Act 2: Eppo sequential CI
│   │   ├── act3/                # Act 4: Alternative methods (Act3.tsx exports Act4)
│   │   ├── act_hybrid/          # Act 3: Hybrid approach + HybridSim
│   │   ├── act5/                # Act 5: Magnitude error
│   │   ├── detailed/            # All in-depth-only components
│   │   │   ├── DetailedAct*.tsx # Acts 1–14 for in-depth track
│   │   │   ├── sims/            # Individual sim components
│   │   │   └── DetailedAppendixCode.tsx  # Source code viewer
│   │   ├── shared/
│   │   │   ├── ABTestSim.tsx    # Shared multi-layer A/B test simulation
│   │   │   └── ShowAllButton.tsx # Expands all collapsible sections
│   │   └── ui/
│   │       ├── DisplayMathBox.tsx  # Collapsible "Show the math" box
│   │       ├── ShowMath.tsx        # Alternative collapsible math wrapper
│   │       └── Math.tsx            # KaTeX InlineMath / BlockMath wrappers
│   └── lib/math/
│       └── statistics.ts        # Statistical engine (sequential CIs, Monte Carlo)
├── docs/                        # Documentation (this folder)
├── plans/                       # Implementation plans and change logs
├── Guidance/                    # Author guidance notes
├── literature/                  # Reference papers
└── README.md                    # Top-level project overview
```

---

## Running Locally

```bash
cd site
npm install
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

No test suite is configured. TypeScript type-checking runs as part of `npm run build`.

---

## Deploying

The site auto-deploys to Vercel on push to `main`. No manual deployment steps needed.

---

## Key Design Decisions

**Two-track design:** The focused track is a practical how-to guide; the in-depth track derives the same conclusions from first principles. They share the `ABTestSim` component but otherwise use separate component trees.

**Client-side simulations:** All Monte Carlo simulations run in the browser using a seeded PRNG (`mulberry32`). This keeps the app fully static and deployable to Vercel without a server.

**Show all content:** A `ShowAllButton` component dispatches a `show-all-content` custom browser event. All collapsible sections (math boxes, FAQ items, simulation notes, code blocks) listen for this event and expand automatically.

**Sequential CI formula:** The implementation follows Howard, Ramdas, McAuliffe & Sekhon (2021) with the Eppo calibration from Schmit & Miller (2022): multiplier m(n) = √((n+ν)/n · log((n+ν)/(ν·α))), where ν = n* / (log(n*/α) − 1).

---

## References

1. Deng, Xu, Kohavi & Walker (2013). *Improving the sensitivity of online controlled experiments by utilizing pre-experiment data.* WSDM. — CUPED.
2. Howard, Ramdas, McAuliffe & Sekhon (2021). *Time-uniform, nonparametric, nonasymptotic confidence sequences.* Annals of Statistics. — The CS framework Eppo adopted.
3. Pocock (1977). *Group sequential methods in the design and analysis of clinical trials.* Biometrika.
4. O'Brien & Fleming (1979). *A multiple testing procedure for clinical trials.* Biometrics.
5. Schmit & Miller (2022). *Sequential confidence intervals for comparing two proportions with variance reduction.* Eppo Technical Report.
