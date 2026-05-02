# Implementation Plan — Changes 2.5 v1

**Date:** 2026-05-02  
**Source guidance:** `Guidance/changes_2.5_v1`  
**Clarifications gathered:** 2026-05-02 (delta method, slider ticks, HybridSim CI, "What if primary KPI" section, math ×100)

---

## Files to modify

### 1. `site/app/layout.tsx`
- Change metadata title from `"Sequential Testing in A/B Experiments"` → `"Sequential Testing in Online Controlled Experiments"`

---

### 2. `site/app/page.tsx` (landing page)
- Prerequisites section: prepend "Familiarity with the statistics of common A/B testing (or randomized controlled trials)" before the existing text
- In-Depth card description: "For those who want to understand" → "For data scientists who want to understand"

---

### 3. `site/components/Hero.tsx` (focused track intro)
- `h1`: "Sequential Testing for A/B Experiments" → "Sequential Testing in Online Controlled Experiments"
- Body text: "In practice, teams routinely monitor experiments" → "In practice, teams routinely monitor A/B tests"
- Act 5 list item: remove ", and how to handle it" from "Why early stopping inflates effect size estimates, and how to handle it."

---

### 4. `site/components/shared/ABTestSim.tsx` (all simulations)

#### Slider ticks — add `<datalist>` + visible labeled tick row below each slider:
| Slider | Tick values |
|--------|-------------|
| Control conversion rate | 1%, 10%, 25%, 50% |
| Number of users | 0 / 1,000 / 5,000 / 10,000 / 50,000 / 100,000 |
| α | 0.01 / 0.05 / 0.10 |
| Effect size | −50% / −25% / 0% / +25% / +50% |
| Number of peeks K | 2 / 10 / 25 / 50 |
| Duration (weeks) | 1 / 2 / 4 / 8 |

#### Decision box
- "In this simulation, would peeking" → "In this instance of the simulation, would peeking"
- Wrap the Yes/No answer in a blue rounded rectangle (`bg-blue-50 border border-blue-400 rounded-lg`) so it is clearly a dynamic result

#### 1000-repetitions box
- Add stronger visual emphasis to the result value — use a filled blue background to make it clearly a "result" (currently has a border but lighter styling)

---

### 5. `site/components/act1/Act1.tsx`

#### Table note (move + extend)
- Move the "Values below are calibrated…" paragraph from **above** the table to **below** it
- Extend the text: add "See 'simulation assumptions and notes' box for additional information on the simulation setup."

#### Math box — delta method
- Keep the "(delta method)" reference; add parenthetical: "(first-order approximation, treating the control mean as approximately fixed)"

#### Math box — formula text
- "A standard 95% confidence interval for the uplift" → "A standard 95% confidence interval for the estimated relative uplift"

#### Math box — remove ×100
- `\hat{u}_n = 100 \cdot \frac{...}` → `\hat{u}_n = \frac{...}` (line 136)
- `\hat{u}_n \pm 100 \cdot \frac{...} \cdot 1.96` → `\hat{u}_n \pm \frac{...} \cdot 1.96` (line 148)

---

### 6. `site/components/act2/Act2.tsx`

#### Math box — remove ×100
- `\hat{u}_n \pm 100\cdot\frac{...}\cdot 1.96` → `\hat{u}_n \pm \frac{...}\cdot 1.96` (line 150)
- `\hat{u}_n \pm 100\cdot\frac{...}\sqrt{...}` → `\hat{u}_n \pm \frac{...}\sqrt{...}` (line 166)

---

### 7. `site/components/act_hybrid/ActHybrid.tsx`

#### Intro paragraph
- Eppo source link: keep the URL but change display text from the full URL to "link to source"
  - Before: `Eppo (source: {' '}<a ...>geteppo.com/blog/comparing-frequentist-vs-bayesian-approaches</a>)`
  - After: `Eppo (<a ...>link to source</a>)`

#### Core idea box — Primary KPI bullet
- "No sequential correction applied, so statistical power is fully preserved." → "No sequential correction applied."

#### Advantages — weekday bullet (2 sentence changes)
- "In many settings it is good practice to run an experiment for a round number of weeks, so that the treatment and control groups are exposed to the same day-of-week distribution." → "In many cases, tests are designed to run for a round number of weeks (e.g. 2 weeks), so that the treatment and control groups are exposed to the same day-of-week distribution."
- "A pre-specified end date naturally satisfies this requirement." → "In these cases, stopping early may create bias by giving some weekdays more weight than others."

#### Limitations — remove bullet
- Remove entire "Point estimates are still biased when a guardrail triggers early stopping. Winner's curse applies…" bullet

#### Limitations — extend No-early-stopping bullet
- After "you must still wait until the planned end date to declare success." add: "This could have a considerable effect on experiments that were designed to run for a long time, in which the treatment has a larger effect than expected."

#### Limitations — CI-narrows bullet → Note
- Remove the "The confidence interval switches width at the end of the test…" bullet from the Limitations list
- Add a standalone Note callout **after** the Limitations section with new text:
  > "Usually some of the guardrail metrics are also outcome metrics. That is, we do not only wish to monitor them for harm during the experiment. We also wish to estimate the effect on them at the end of the experiment. During the experiment their sequential confidence intervals will be wider than the standard one; at the planned end date it will narrow abruptly. This can be confusing to stakeholders following results in real time."

#### Comparison table
- "Wider (~10–40%)" → "Wider" (all occurrences)

#### Simulation + chart reading box (after HybridSim)
- No change needed here; the red CI bar will be made more prominent in HybridSim.tsx

#### One-tailed section — Primary KPI bullet
- "Primary KPI — ship for benefit only. You ship the feature only if the standard confidence interval at the end of the experiment is entirely above zero (i.e., a beneficial effect is confirmed). This is a one-tailed test at α/2 on the benefit side."
- → "Primary KPI — test for benefit only. You ship the feature only if the standard confidence interval at the end of the experiment is entirely above zero (i.e., a beneficial effect is confirmed) or includes zero in case of a 'no harm' test, but you are not interested in testing whether it has a statistically significant negative effect. This is a one-tailed test at α/2 on the benefit side."

#### "Total false positive rate" box
- Change from yellow (`bg-yellow-50 border-yellow-300`) → blue (`bg-blue-50 border-blue-200`)

#### "What if primary KPI is also a guardrail?" section (targeted edits, NOT full removal)
- Change: "waiting until the planned end date for the primary KPI is not acceptable.  
  Eppo describes a hybrid sequential solution for this scenario (source: geteppo.com/…). The approach splits the significance budget between two tests:"  
  → "the same approach described above applies:"
- Remove the Eppo quote paragraph ("According to Eppo, this approach 'provides a balance…'")
- Keep the bullet list, the math, and the comparison table

#### Math box — remove ×100
- ActHybrid math box has no `100\cdot` occurrences (confirmed by grep) — no change needed

#### Key Takeaway — remove sentence label
- Remove "**The hybrid approach in one sentence:**" (the bold label/prefix), keeping the sentence itself

---

### 8. `site/components/act_hybrid/HybridSim.tsx`

#### Make red CI bar more prominent
- Increase vertical line stroke-width from 2.5 → 4
- Extend cap half-width from 7 → 14
- Increase cap stroke-width from 2.5 → 4
- Increase fill-opacity of the shaded rect from 0.2 → 0.35
- Increase center dot radius from 4 → 5

#### Slider ticks — same approach as ABTestSim
- Add `<datalist>` + labeled tick row to all five sliders in HybridSim

---

## ×100 removal summary (all occurrences)

| File | Line | Before | After |
|------|------|--------|-------|
| act1/Act1.tsx | 136 | `100 \cdot \frac{...}` | `\frac{...}` |
| act1/Act1.tsx | 148 | `100 \cdot \frac{...} \cdot 1.96` | `\frac{...} \cdot 1.96` |
| act2/Act2.tsx | 150 | `100\cdot\frac{...}\cdot 1.96` | `\frac{...}\cdot 1.96` |
| act2/Act2.tsx | 166 | `100\cdot\frac{...}\sqrt{...}` | `\frac{...}\sqrt{...}` |

No ×100 occurrences found in: act3, act5, act_hybrid/ActHybrid, or any detailed components.

---

## Notes

- All slider tick changes go through the two simulation components (ABTestSim + HybridSim) — no other component uses `<input type="range">` for simulation parameters.
- The "In this instance of the simulation" and blue decision box changes are in ABTestSim only — they automatically apply to all acts that use it (Acts 1, 2, 4, 5).
- The HybridSim is used only in ActHybrid.
- No changes to the in-depth track components.
