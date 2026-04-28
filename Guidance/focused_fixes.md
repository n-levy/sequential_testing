# Focused Version – Final Exact Fixes (Prompt Format)

Apply ALL fixes exactly as specified. Do not rewrite structure. Only replace or insert.

---

## 1. Independence formula

Find:
P(at least one false positive in K looks) = 1 - (1 - α)^K

Replace with:
"If the looks were independent, the probability of at least one false positive in K looks would be:
P(at least one false positive) = 1 - (1 - α)^K.
In practice, looks are positively correlated, so the true probability is lower but still substantially above α."

---

## 2. Sequential CI formula clarity

Define explicitly:

m(n) = sqrt(((n + ν)/n) * log((n + ν)/(ν * α)))

Replace CI formula with:

u_hat_n ± 100 * (SE_n / X_bar_A_n) * m(n)

Add sentence:

"This is a practical approximation of a time-uniform confidence sequence; exact forms vary slightly depending on derivation."

---

## 3. O'Brien–Fleming efficiency claim

Find:
"This makes it the most efficient method"

Replace with:
"This makes it highly efficient when the experiment runs to completion, since the final analysis is only minimally penalized."

---

## 4. O'Brien–Fleming early behavior

Find:
"O'Brien–Fleming can produce too many early significant crossings in this setup."

Replace with:
"O'Brien–Fleming is very conservative early, so early stopping is rare in this setup."

---

## 5. Hybrid approach wording

Find:
"No peeking penalty"

Replace with:
"No loss of statistical power from sequential monitoring (since it is only analysed once at the end)"

---

## 6. False positive phrasing

Replace all:
"inflates false positives"

With:
"increases the probability of at least one false positive across repeated looks"

---

## 7. Simulation wording

Replace all:
"would show at least one statistically significant result"

With:
"in which at least one statistically significant result occurs across repeated looks"

---

## 8. Confidence interval definition

Find:
"Standard confidence intervals only control the false positive rate if you look once"

Replace with:
"Standard confidence intervals achieve their nominal coverage only when evaluated once at a pre-specified sample size"

---

## 9. Simulation qualification

Where numerical results like "~6%" are shown, append:
"(in this simulation setup)"

---

## 10. Pocock formula indexing

Replace:
P(max |Z_k| > c_P) = α

With:
P(max_{1 ≤ k ≤ K} |Z_k| > c_P) = α

---

## 11. Add dependence explanation

Insert once in Act 1:

"Because the same data accumulates over time, test statistics across looks are correlated."

---

## 12. Optional equivalence clarification

Insert:

"A confidence interval excluding zero is equivalent to rejecting the null hypothesis at level α."

---

## Output

Return revised text only.
