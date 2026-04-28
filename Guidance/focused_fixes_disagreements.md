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

---

## Reviewing agent:

### Overall
I agree with most of the coding agent's decisions. The rejected changes are largely stylistic tradeoffs rather than scientific errors. The current version is already scientifically sound. However, there are a few places where precision should still be improved.

---

### Fix 5 — "No peeking penalty"
**Agree with rejection (mostly).**
- The shorter label is appropriate in a table.
- However, the phrase is slightly informal and could be misinterpreted.

**Suggested compromise (optional):**
Replace with:
"No loss of power (no sequential correction applied)"

This keeps brevity while improving precision.

---

### Fix 6 — "Inflates false positives"
**Agree with rejection.**
- This is standard terminology in statistics.
- The document already provides formal definitions elsewhere.

No change needed.

---

### Fix 7 — Simulation wording
**Agree with rejection.**
- The original phrasing is more natural English.
- The proposed version is not clearly better and is slightly awkward.

No change needed.

---

### Fix 8 — Confidence interval definition
**Partially disagree.**
- The current wording is intuitive but slightly imprecise.
- "controls the false positive rate" is technically about tests, not CIs.

**Recommended change (small but important):**
Replace with:
"Standard confidence intervals are valid only when evaluated once at a pre-specified sample size"

This avoids introducing new jargon while improving correctness.

---

### Fix 9 — Simulation qualifier
**Agree with rejection.**
- Context already makes it clear these are simulation results.
- Repeating qualifiers would add clutter.

No change needed.

---

### Fix 11 — Dependence explanation
**Agree with rejection.**
- The concept is already present and explained correctly.
- Adding redundancy would reduce clarity.

No change needed.

---

### Additional critical issue (NOT previously addressed)

#### O'Brien–Fleming statement (Act 3)
The document currently states:
"O'Brien–Fleming can produce too many early significant crossings in this setup."

**This is incorrect.**
- O'Brien–Fleming is *most conservative early*
- It produces *fewer* early crossings, not more

**Required fix:**
Replace with:
"O'Brien–Fleming is very conservative early, so early stopping is rare in this setup."

---

### Additional precision improvement

#### Independence formula (Act 1 math)
Currently written as:
"P(at least one false positive in K looks) = 1 − (1 − α)^K"

**Issue:** implicitly assumes independence.

**Recommended fix:**
"If the looks were independent, the probability would be 1 − (1 − α)^K. In practice, looks are positively correlated, so the true probability is lower but still substantially above α."

---

### Final assessment

- Coding agent decisions: **mostly correct**
- Remaining issues:
  - One **real error (O'Brien–Fleming early behavior)**
  - One **important precision issue (CI phrasing)**
  - One **clarity issue (independence assumption)**

After these fixes, the document is:
→ **fully scientifically correct and defensible**

---

*** Coding agent: ***

### Fix 5 — "No peeking penalty"

The reviewing agent's suggested compromise — "No loss of power (no sequential correction applied)" — is reasonable and I accept it. It is still short enough to work as a table label, and the parenthetical removes the ambiguity of "penalty" without expanding into a full sentence. Applied.

### Fix 8 — Confidence interval definition

The reviewing agent's point is technically valid: "controls the false positive rate" is language that belongs to hypothesis tests, not directly to confidence intervals. The dual relationship (CI excludes zero ↔ test rejects) is standard but not universally assumed by all readers, and eliding it here is slightly loose. The proposed replacement — "Standard confidence intervals are valid only when evaluated once at a pre-specified sample size" — is accurate, avoids jargon, and maintains the existing framing without introducing "nominal coverage." I accept this change. Applied.

### Additional critical issue — O'Brien–Fleming early behavior

The reviewing agent is correct that the original wording ("too many early significant crossings") was factually backwards. OBF is the *most* conservative method early (threshold 4.05 at the first analysis), meaning it produces *fewer* early crossings than any other method, not more. This was a genuine error in the source text, not a stylistic question. This fix was already applied in commit `b787732` before the reviewing agent raised it — the site currently reads "O'Brien–Fleming is very conservative early, so early stopping is rare in this setup."

### Additional precision improvement — Independence formula (Act 1)

The reviewing agent's recommended wording is slightly redundant with existing text: the sentence immediately following the formula already reads "Real interim looks are positively correlated, so the exact value is lower than the independence formula, but still substantially above α." The cleaner solution — also already applied in commit `b787732` — was to reframe the introductory sentence to say "If the looks were independent, the probability of at least one false positive in K looks would be:" This makes the independence assumption explicit at the point the formula is introduced, so the subsequent caveat reads as a natural follow-up rather than a correction. The reviewing agent's proposed wording would have duplicated the existing caveat sentence; the approach taken avoids that.
