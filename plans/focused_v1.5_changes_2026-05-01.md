# Focused Version — Batch Changes Plan
**Date:** 2026-05-01  
**Target:** `https://sequential-testing.vercel.app/focused`

---

## New page structure (5 acts)
| # | Title | Status |
|---|-------|--------|
| Act 1 | The Peeking Problem | existing (edits) |
| Act 2 | The Eppo Solution (2022) | existing (edits) |
| Act 3 | The Hybrid Approach | **new component** |
| Act 4 | Alternative Methods | existing (renamed, edits) |
| Act 5 | Caution: Magnitude Error | **new component** |
| FAQ | Expandable FAQ | **new component** |
| Appendix | Summary, Math Reference, References | existing (edits) |

---

## Change 1 — Binary outcome example text
**File:** `ABTestSim.tsx` simulation assumptions  
**Action:** Add sentence: "For example: making an order in the first visit during the test." after "Binary outcome metric (Bernoulli), modeled as conversion in each arm."

---

## Change 2 — X-axis to days + duration slider
**Files:** `ABTestSim.tsx`

### Logic
- Add `durationWeeks` state (default 2, range 1–8, tick at 2 weeks)
- `daysTotal = durationWeeks * 7`
- x-axis domain: `[0, daysTotal]`
- For user index i: `xDay(i) = (i + 1) * daysTotal / n`
- D3 x-scale maps day values; tick format shows integers
- X-axis label: `"Time (days)"`
- Add tick mark at 14 (2 weeks) using `tickValues`

### Assumptions text additions
- Add: "A constant number of users joins the experiment each day. For example, if n = 1,400 and the experiment lasts 2 weeks (14 days), then 1,400 / 14 = 100 users per group join per day."
- Add: "In reality, the number of unique users entering each day may decrease over time as repeat visitors are excluded. This simplification does not affect the key insights the simulation aims to illustrate."

### Slider UI
- New slider: "Experiment duration (weeks)" — placed after the K slider
- Default mark at 2 weeks shown via tick on slider

---

## Change 3 — Peeking motivation in introduction
**File:** `Hero.tsx`  
**Action:** Add paragraph to the "The problem" section explaining:
- Peeking often happens due to curiosity
- If no decisions are made on interim results, that is fine
- If the motivation is deciding whether to stop early (for benefit or harm), the issues described below arise

---

## Change 4 — Remove independence formula from Act 1 math
**File:** `Act1.tsx`  
**Action:** Remove the two formulas:
- `Pr(at least one false positive in K looks) = 1 − (1−α)^K`
- The approximation `1 − (1−α)^K ≈ Kα`
- Remove the bullet explaining K
- Remove the "A useful approximation for small α" sentence
- Adjust the final sentence (currently references "the independence formula") to read naturally without that reference. E.g.: "Real interim looks are positively correlated. Even so, repeated peeking still substantially inflates the Type I error above α — that is why peeking with standard confidence intervals is problematic."

---

## Change 5 — Explain where 1.96 comes from
**File:** `Act1.tsx`  
**Action:** Expand the 1.96 bullet. After "the critical value for a 95% confidence interval", add:

> For a two-sided test at level α = 0.05, we reject when the test statistic falls in either tail of the standard Normal distribution. We want to leave 2.5% probability in each tail, so we need the 97.5th percentile: Φ⁻¹(0.975) = 1.96. In other words, 95% of the standard Normal distribution lies between −1.96 and +1.96.

---

## Change 6 — FAQ (after Act 5, before Appendix)
**File:** New `components/FAQ.tsx`  
**Content:** Two expandable Q&A entries with "+" toggle:

**Q1: Why does the Type I error of the sequential confidence interval grow slightly after n reaches a certain size?**
- Intuitive answer: More data narrows the CI via the 1/√n effect. But more data also means more peeks, and we must correct for that. The sequential multiplier m(n) eventually grows faster than the data can tighten the CI, so the Type I error fraction rises slowly.
- Mathematical answer: Follow `Guidance/eppo_ci_explanation_prompt.md` — decompose m(n) = √(A(n)·B(n)) where A(n) decreases and B(n) = log(n/...) increases. Late stage: log growth dominates. Note this is required to maintain the time-uniform guarantee.
- Add: "Importantly, the result is robust to misspecifying n* — being off by a factor of two has minimal impact. See Howard et al. (2021) for the theoretical bounds."

**Q2: (space for future questions)**

---

## Change 7 — Rename Act 2 to "The Eppo Solution (2022)"
**Files:** `Act2.tsx`, `References.tsx`, `page.tsx` sidebar  
**Actions:**
- Change heading: "Act 2 — The Eppo Solution (2022)"
- Add intro paragraph at top of act: "This act describes the solution introduced in the 2022 technical report by Schmit & Miller (see reference 5). We do not know whether this is the exact current implementation in Eppo, but it provides a concrete example of how modern A/B testing platforms implement sequential testing."
- Fix reference in `References.tsx`: change "(2024)" to "(2022)"
- Update sidebar label: "Act 2 – Eppo Solution (2022)"

---

## Change 8 — New Act 3: The Hybrid Approach
**Files:** New `components/act_hybrid/ActHybrid.tsx`, new `components/act_hybrid/HybridSim.tsx`

### Content (from Eppo blog + existing page knowledge)
- Intro: "This act explains a popular 'hybrid' approach to sequential testing, as described by Eppo (source: geteppo.com/blog/comparing-frequentist-vs-bayesian-approaches)."
- Explain hybrid approach: apply sequential CI to guardrail KPIs for early abort; apply standard CI to primary KPI at planned end date
- **Pros:**
  - Full statistical power on the primary KPI (no sequential penalty)
  - Continuous guardrail protection
  - Simpler to implement and explain than full sequential
  - Running the test for a round number of weeks accounts for weekday effects — a common practical reason to prefer a pre-specified end date
- **Cons:**
  - No early stopping for success on the primary KPI
  - Point estimates are biased when guardrail triggers early stopping (winner's curse still applies)
  - Confidence intervals switch width at the end of the test, which can be confusing to stakeholders
- **What you gain** table (from current Act2): move here

### Sub-section: What if the Primary KPI is also a Guardrail?
- Fetch Eppo blog at implementation time for specific Eppo guidance
- Describe Eppo's "hybrid sequential" approach: monitor with sequential CI throughout AND run a final t-test at end, each at α/2
- This balances early-stopping power with statistical power at the end
- Cite the Eppo blog source

### Simulation (HybridSim.tsx)
- Option (a): static display
- Show trajectory + both CI layers: sequential CI (blue, wide) for the full duration, and standard CI (red, narrow) at the end-of-test marker
- Vertical dashed line at x = durationWeeks*7 labeled "End of test"
- Use same slider set as ABTestSim (including new duration slider)
- Annotation near end: "Primary KPI decided here with standard confidence interval"
- The visual contrast between wide sequential band and the narrower standard CI at the final day makes the concept tangible

### Key Takeaway box
"The hybrid approach in one sentence: Monitor guardrail KPIs with a sequential confidence interval for early abort; analyse the primary KPI with a standard confidence interval at the planned end-date."

---

## Change 9 — Remove mean |effect| columns; add Act 5
### Part A: ABTestSim.tsx
- Add `showMeanEffects?: boolean` prop (default `false`)
- When `false`: remove the two mean columns from the multi-method table
- Keep tracking mean estimates internally (Act 5 needs them)
- When `true`: show all three columns (used only by Act 5 simulation)
- Act 5 calls ABTestSim with `layers={['fixed-ci', 'sequential-ci']}` and `showMeanEffects={true}`

### Part B: New `components/act5/ActMagnitudeError.tsx`
- Explain: Sequential testing conditions on high values when stopping early → systematically overestimates effect sizes → "magnitude error" / winner's curse
- This is especially pronounced vs fixed-horizon because early stopping in sequential tests requires very strong evidence, which by chance tends to coincide with large sample variation
- Therefore, if stopping early, do not rely on the point estimate for decisions
- This is another reason to prefer the hybrid approach (which never stops the primary KPI early)
- Show the 1000-repetitions simulation (Standard 95% CI vs Sequential CI Eppo) **with** mean effect columns (move from Act 2)
- Source: search for "sequential testing magnitude error winner's curse" at implementation time

---

## Change 10 — Eppo's primary-KPI-as-guardrail sub-section
**Location:** Act 3 (Hybrid), sub-section after main pros/cons  
**Action:** Fetch Eppo blog at implementation for full content; describe Eppo's hybrid-sequential approach

---

## Change 11 — Legend labels: replace "CI" with "confidence interval"
**File:** `ABTestSim.tsx`, `LAYER_STYLE`  
**Changes:**
- `'fixed-ci'`: `'Standard 95% CI'` → `'Standard 95% confidence interval'`
- `'sequential-ci'`: `'Sequential CI (Eppo)'` → `'Sequential confidence interval (Eppo)'`
- All other labels (Pocock, OBF, Bonferroni, harm-detect) leave as-is

---

## Change 12 — Harm detection method (replaces two-sided 3 SD rule)
**Files:** `ABTestSim.tsx`, `Act3.tsx` (now Act 4), delete `ThreeSdImpl.tsx`, new `HarmDetectionImpl.tsx`

### SimLayer change
- Remove `'three-sd'` from `SimLayer` type
- Add `'harm-detect'`
- `LAYER_STYLE['harm-detect']`: color `#dc2626` (red), label `'Guardrail harm detection (3 SD)'`

### Stopping logic (one-sided)
- Crossing condition: `est + w < 0` ONLY (CI upper bound below zero = harm detected)
- NOT `est - w > 0` (benefit detection is ignored)
- `w = 100 * ses[i] * 3.0 / denom`

### D3 visualization
- Show full ±3·SE band (symmetric) for visual consistency
- Red color signals "harm monitoring"
- One-sidedness explained in text + comparison table

### HarmDetectionImpl.tsx content
- "The idea": monitor a guardrail metric; stop the experiment only if the effect is more than 3 standard deviations in the harmful direction
- "The recipe": at each peek, compute effect + 3·SE. If this upper bound is below zero, harm is detected — abort.
- Table comparing harm-detect threshold to OBF, Pocock, classical (same format as ThreeSdImpl)
- "Caveats": no formal FWER guarantee; very conservative (will rarely trigger); power to detect harm requires large harmful effects or long run
- A well-calibrated alternative: use OBF with one-sided α for guardrail monitoring

### Act 4 comparison table
- Replace "3 SD rule" column with "Harm detection" column
- "Threshold type": One-sided (z = 3.0)
- "Formal FWER control?": No
- "Pre-specify K?": No
- "Purpose": Guardrail only

---

## Structural / navigation changes
**Files:** `Hero.tsx`, `Summary.tsx`, `app/focused/page.tsx`

### Hero.tsx
- "A Focused Guide in Five Acts"
- Add curiosity/motivation paragraph to The Problem section
- Update act list:
  1. The Peeking Problem
  2. The Eppo Solution (2022)
  3. The Hybrid Approach
  4. Alternative Methods
  5. Caution: Magnitude Error

### Summary.tsx
- Update act table: rows 1–5 with new messages, remove rows 4–13 (those belong to in-depth version)

### page.tsx FOCUSED_ITEMS sidebar
- Add: `{ id: 'act3-hybrid', label: 'Act 3 – Hybrid Approach' }`
- Update: `{ id: 'act4', label: 'Act 4 – Alternative Methods' }`
- Add: `{ id: 'act5', label: 'Act 5 – Magnitude Error' }`
- Add: `{ id: 'faq', label: 'FAQ' }`
- Fix: `{ id: 'act2', label: 'Act 2 – Eppo Solution (2022)' }`

---

## Implementation order
1. `ABTestSim.tsx` — duration slider, x-axis, harm-detect layer, legend labels, `showMeanEffects` prop
2. `Act1.tsx` — remove independence formula, explain 1.96
3. `Act2.tsx` — rename, add intro, remove hybrid section, remove mean columns from table
4. New `components/act_hybrid/HybridSim.tsx`
5. New `components/act_hybrid/ActHybrid.tsx`
6. New `components/act4/HarmDetectionImpl.tsx`
7. `Act3.tsx` → rename to Act4, swap 3SD for harm-detect, update ids/headings
8. New `components/act5/ActMagnitudeError.tsx`
9. New `components/FAQ.tsx`
10. `Hero.tsx`, `Summary.tsx`, `References.tsx`
11. `app/focused/page.tsx` — wire everything together
12. Delete `ThreeSdImpl.tsx`
13. Build check + verify
