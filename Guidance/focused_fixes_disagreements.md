# focused_fixes.md — Disagreements

This document records fixes from `focused_fixes.md` that were **not applied**, with reasons.

---

## Fix 5 — Hybrid approach: "No peeking penalty"

**Proposed replacement:**
> "No loss of statistical power from sequential monitoring (since it is only analysed once at the end)"

**Not applied because:** The original phrase "No peeking penalty" is a concise, intentional label in a comparison table or bullet list. The proposed replacement is accurate but nearly three times longer and turns a scannable label into a clause. The meaning is already clear in context — the hybrid approach uses a fixed-horizon test for the primary KPI, so by design there is no sequential correction applied to it. Replacing a crisp label with a full explanatory sentence disrupts the layout and readability of that section without adding information that is not already present in the surrounding text.

---

## Fix 6 — "Inflates false positives"

**Proposed replacement:**
> "increases the probability of at least one false positive across repeated looks"

**Not applied because:** "Inflates false positives" is standard statistical terminology used throughout the sequential testing literature (e.g., Pocock 1977, Armitage et al. 1969). Readers familiar with the field will immediately understand it. The proposed replacement is technically more precise but is also longer and less idiomatic. The text already contains detailed mathematical exposition of exactly what "inflates" means (the `1 − (1−α)^K` formula and the correlation caveat), so readers who want precision have it. Replacing a well-understood shorthand with a verbose paraphrase in every instance would make the prose heavier without improving accuracy.

---

## Fix 7 — Simulation wording

**Proposed replacement:**
> "in which at least one statistically significant result occurs across repeated looks"

**Not applied because:** The original phrasing ("would show at least one statistically significant result") is grammatically natural in its context as a relative clause modifying "simulations." The proposed replacement is awkward — it omits the subject of the relative clause in a way that reads like a fragment. The intended meaning is identical. This is a stylistic preference, not a correction of an error, and the proposed version is not an improvement in clarity or precision.

---

## Fix 8 — Confidence interval definition

**Proposed replacement:**
> "Standard confidence intervals achieve their nominal coverage only when evaluated once at a pre-specified sample size"

**Not applied because:** This is a cosmetic rewrite of a sentence that is already correct. The original ("Standard confidence intervals only control the false positive rate if you look once") is plain-language and accurate. The proposed version uses "nominal coverage" — a technical term that adds jargon without adding precision for the intended audience. It also silently changes the framing from false positive control (which is how the problem is introduced throughout Act 1) to coverage probability, which is a slightly different framing. Introducing that shift here, without explanation, could confuse readers who have been thinking in terms of Type I error throughout.

---

## Fix 9 — Append "(in this simulation setup)" to numerical results

**Not applied because:** The simulation results (e.g., "~6%") are already presented inside simulation boxes, under section headings that name the specific setup, and with captions that describe the parameters. The surrounding context makes clear these are simulation-specific figures. Adding "(in this simulation setup)" as a parenthetical after every numerical result would be repetitive and add visual clutter. A single contextualising note in the simulation section — which already exists — is sufficient. Appending the qualifier to every number separately would, if anything, suggest these are the only caveats, when the larger caveat is that all simulations depend on their inputs.

---

## Fix 11 — Insert dependence explanation in Act 1

**Proposed insertion:**
> "Because the same data accumulates over time, test statistics across looks are correlated."

**Not applied because:** This sentence is already present in Act 1, in substance if not word-for-word. The text at line 174 of `Act1.tsx` reads: "Real interim looks are positively correlated, so the exact value is lower than the independence formula, but still substantially above α." This conveys the same information — that looks are correlated because they share the same accumulating data — and does so in a more informative way (explaining the direction of the correlation and its consequence). Inserting another sentence saying the same thing earlier would be redundant.

---

## Summary table

| Fix | Status | Reason category |
|-----|--------|-----------------|
| 5   | Not applied | Label vs. clause — readability |
| 6   | Not applied | Standard terminology already correct |
| 7   | Not applied | Proposed version is grammatically awkward |
| 8   | Not applied | Cosmetic rewrite; introduces unintended framing shift |
| 9   | Not applied | Context already provided; would create repetitive clutter |
| 11  | Not applied | Content already present in the text |
