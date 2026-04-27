# Sequential Testing – Exact Alignment & Correction Prompt

Please revise the “in-depth” and “focused” versions by applying ONLY the exact changes below.

Important:
- Do NOT restructure the acts
- Do NOT expand content
- Only apply the specified replacements, insertions, or deletions
- Preserve tone and pedagogy
- Ensure consistency between both versions

---

## PART 1 — IN-DEPTH VERSION

1. Replace p-value phrasing with fixed-analysis framing.

2. Replace random walk sentence with martingale-aligned phrasing.

3. Replace:
“You cannot beat a fair game by choosing when to quit.”
With:
“You cannot increase your expected winnings by choosing when to quit.”

4. Clarify doubling strategy assumptions (finite vs infinite).

5. Replace:
“The more data you collect, the easier it is to tell the difference.”
With:
“As more data is collected, the signal becomes easier to distinguish from noise.”

6. Ensure:
“The likelihood ratio is a non-negative martingale that starts at 1 under the null hypothesis.”

7. Ville’s inequality:
“For any non-negative martingale that starts at 1, the probability that it ever exceeds a threshold c is at most 1/c.”

8. Replace equality with bound:
“at most α”

9. Replace p-value statement:
“p-values are not martingales and do not provide guarantees that hold under repeated checking.”

10. Soften simulation claims.

11. Replace “average” with “weighted average (mixture)”.

12. Delete any incorrect martingale claims about sums or averages.

---

## PART 4 — SIMULATION CONSISTENCY in both focused and in-depth versions

13. Use:
“Share of simulations in which at least one statistically significant result occurs”

14. Replace:
“false positive rate from simulation”
With:
“estimated probability of at least one false positive across repeated looks”

15. Ensure all simulations state:
“under the null hypothesis (no true effect)”

---

## OUTPUT

Return the fully revised text for both versions.
Do not include commentary.

## Github
Commit and push when you are done.