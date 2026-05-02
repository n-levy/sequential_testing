# Eppo Sequential Confidence Interval – Explanation Prompt

Please explain why the Eppo sequential confidence interval first gets narrower and then wider again, using the mathematical expression for the multiplier.

Use only simple text math (no LaTeX).

---

## 1. Multiplier definition

m(n) = sqrt( ((n + nu) / n) * log((n + nu) / (nu * alpha)) )

The confidence interval is:

estimate +/- SE(n) * m(n)

---

## 2. Decompose the multiplier

A(n) = (n + nu) / n  
B(n) = log((n + nu) / (nu * alpha))

m(n) = sqrt( A(n) * B(n) )

---

## 3. Behavior of each term

### A(n)
- When n is small: A(n) ≈ nu / n → large
- As n grows: A(n) → 1  
=> A(n) decreases over time

### B(n)
- When n is small: B(n) ≈ log(1 / alpha) → constant
- As n grows: B(n) ≈ log(n) → slowly increasing  
=> B(n) increases over time

---

## 4. Combined behavior of m(n)

- Early (small n): A(n) dominates → m(n) is large  
- Middle: A(n) decreases faster than B(n) grows → m(n) decreases  
- Late: B(n) keeps growing → m(n) increases again  

=> m(n) has a U-shape: high → lower → then slightly higher

---

## 5. Confidence interval width

CI width ∝ (1 / sqrt(n)) * m(n)

Two forces:

(1) 1 / sqrt(n) → always decreases  
(2) m(n) → decreases, then increases  

---

## 6. Combined effect on CI

- Early: variance shrink dominates → CI gets narrower  
- Middle: both effects help → CI is narrowest  
- Late: log growth dominates → CI widens slightly  

---

## 7. Intuition

- Early: little data → wide CI  
- Middle: best balance → tightest CI  
- Late: must stay valid for all future times → thresholds increase  

---

## 8. Key conclusion

The CI narrows first because variance decreases quickly.  
It widens later because the log(n) term grows, which is required to control error over all possible stopping times.

---

## Output requirements

- Step-by-step explanation  
- Keep math in simple text form  
- No LaTeX  
- Focus on intuition + formulas  
