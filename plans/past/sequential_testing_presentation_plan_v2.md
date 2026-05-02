# Presentation Plan: From Random Walks to Sequential Testing (v2)

**Target audience:** People comfortable with algebra and basic probability (e.g., a 12th-grade math background). No calculus is required to follow the main ideas, though some calculus notation (integrals) appears in later acts for completeness — always with plain-language translations.

**Format:** Eight interactive acts — deliberately smaller steps than the original five. Each act has a simulation, an intuitive explanation, and a mathematical section. The math sections always define every symbol before using it. Every formula is accompanied by a plain-language translation immediately below it.

**Design philosophy:** Better to over-explain than under-explain. When in doubt, slow down.

---

## How to Read This Document

Every formula in this plan is accompanied by a plain-language translation. The goal is that a reader who has never seen a Greek letter in a math class should still be able to follow the logic, even if the symbols look unfamiliar at first.

### Notation Cheat Sheet

This cheat sheet should appear as a collapsible sidebar in the actual webpage, accessible from every act.

| Symbol | Name | What it means |
|---|---|---|
| *X*, *M*, *Y* | Capital letters | Quantities that are random — they could take different values depending on what happens |
| *X₁*, *X₂*, *Xₙ* | Subscript numbers | "The value of X at step 1, step 2, step n" |
| *E[...]* | Expected value | The long-run average if you repeated the process many times |
| *E[... \| ...]* | Conditional expectation | The long-run average, *given that you already know* whatever appears after the \| symbol |
| *P(...)* | Probability | A number between 0 and 1 measuring how likely something is |
| *Σ* (uppercase sigma) | Summation | "Add all of these up." Σ Xᵢ from i=1 to n means X₁ + X₂ + ... + Xₙ |
| *∏* (uppercase pi) | Product | "Multiply all of these together." ∏ Xᵢ from i=1 to n means X₁ × X₂ × ... × Xₙ |
| *∫* (integral sign) | Integral | A continuous version of summation — "add up over all possible values." Think of it as a smooth Σ |
| *≥* | Greater than or equal to | |
| *≤* | Less than or equal to | |
| *∞* | Infinity | A process that goes on forever |
| *√* | Square root | √9 = 3, √100 = 10 |
| *exp(x)* or *eˣ* | Exponential function | The number e ≈ 2.718 raised to the power x. Grows very fast for large x |
| *sup* | Supremum (maximum) | The highest value something ever reaches |
| *α* (alpha) | | False positive rate — the maximum chance of wrongly concluding an effect exists |
| *β* (beta) | | False negative rate — the maximum chance of missing a real effect |
| *δ* (delta) | | Effect size — how large the real difference is |
| *σ* (sigma, lowercase) | | Standard deviation — typical spread of individual observations |
| *τ* (tau) | | A tuning parameter; in mSPRT, it controls the width of the prior over effect sizes |
| *θ* (theta) | | A coefficient; in CUPED, it controls the variance reduction adjustment |
| *ρ* (rho) | | Correlation coefficient — how strongly two variables move together (−1 to +1) |
| *Λ* (lambda, uppercase) | | Likelihood ratio — a running score of evidence |

---

## Act 0 — Why Should You Care? The Peeking Problem

### The Motivation

> You work at a company running an A/B test. Half your users see the old website, half see a new design. Every day, you check the dashboard: "Is the new design better?" After a week, the dashboard shows p = 0.03 — that looks significant! You call it: the new design wins.
>
> But here is the dirty secret of traditional statistics: **the more often you check, the more likely you are to see a false positive.** A test designed to have a 5% false positive rate — meaning only a 5% chance of wrongly declaring a winner — can easily reach 20% or 30% if you peek at it repeatedly. One in four or five "winning" experiments might actually be noise.
>
> This is not a theoretical concern. It is the single most common statistical mistake in online experimentation.

### The Simulation

Two groups of observations (control and treatment) are generated from *identical* distributions — there is no real effect. A standard statistical test (a t-test) is computed after every new observation arrives.

A counter shows: "Number of times p < 0.05 so far." The user watches the p-value bounce around. Every time it dips below 0.05, it lights up red — a false positive.

Users can control:
- How many total observations to simulate
- How many independent experiments to run in parallel

A bar chart accumulates: "Fraction of experiments that showed p < 0.05 at *some* point during peaking." For 1,000 simulated experiments with regular peeking, this fraction climbs well above 5% — often to 20–30%.

A second mode runs the same experiments but checks only once, at the very end. This fraction stays near 5%.

### Intuitive Explanation

> Traditional statistical tests make a promise: "If there is no real effect, I will falsely cry wolf at most 5% of the time." But this promise comes with fine print: **you may only look at the result once, at a pre-determined time.**
>
> Every time you peek, you get another chance for randomness to fool you. It is like rolling a die repeatedly — the more rolls, the more likely you are to get a six eventually, even though any single roll has only a 1-in-6 chance.
>
> The rest of this presentation builds a test that does not have this problem. A test where you can peek as often as you like — after every single observation, if you want — and the false positive guarantee still holds.
>
> That promise has a name: **anytime-valid inference**. Getting there requires some beautiful mathematics, which we will build up one step at a time.

### Key Takeaway

> **The peeking problem:** Checking a traditional test repeatedly inflates the false positive rate far beyond its nominal level. We need a fundamentally different kind of test — one that remains valid no matter when or how often we look.

---

## Act 1 — The Random Walk

### The Simulation

A vertical number line appears on screen. A dot (representing a person) starts at position 0 in the middle. Each step, a coin is flipped. Heads: the dot moves up one step. Tails: the dot moves down one step. The path the dot has traced is shown as a graph — position on the vertical axis, number of steps on the horizontal axis.

Users can control:
- How fast the steps happen
- How many steps to take
- The probability of going up (initially fixed at 50/50; after the intro, this becomes a slider)
- How many simultaneous paths to show at once

### Intuitive Explanation

> Imagine you are standing in the middle of a long hallway. You flip a coin. Heads — take one step forward. Tails — take one step back. You repeat this hundreds of times.
>
> Where will you end up? The honest answer is: we don't know exactly. But we can say something precise about the *range* of likely outcomes. Most of the time, you won't wander too far from where you started. Occasionally, a long streak of heads or tails will carry you far in one direction. The longer you walk, the wider the range of possible positions — but the center of that range stays at zero.
>
> Watch what happens when we run many people simultaneously. They all start at the same point, but they fan out over time — like ink dropped into water. This spreading has a precise mathematical shape.

### Mathematical Formulation

**Setting up the notation:**

Let *Xᵢ* represent the outcome of the *i*th coin flip. We assign:
- *Xᵢ = +1* if the flip is heads (step forward)
- *Xᵢ = −1* if the flip is tails (step backward)

The probability of heads is written *p*. For a fair coin, *p = 0.5*.

**Position after n steps:**

The person's position after *n* steps is the sum of all the individual steps:

> **Sₙ = X₁ + X₂ + X₃ + ... + Xₙ**

This is written more compactly using the summation symbol:

> **Sₙ = Σᵢ₌₁ⁿ Xᵢ**

Read this as: "S sub n equals the sum of all Xᵢ, starting from i = 1 and going up to i = n."

*Example:* If the first 5 flips are Heads, Tails, Heads, Heads, Tails, then X₁ = +1, X₂ = −1, X₃ = +1, X₄ = +1, X₅ = −1. The positions are:
- After step 1: S₁ = +1
- After step 2: S₂ = +1 + (−1) = 0
- After step 3: S₃ = 0 + 1 = +1
- After step 4: S₄ = +1 + 1 = +2
- After step 5: S₅ = +2 + (−1) = +1

**What to expect — the average outcome:**

When the coin is fair (*p = 0.5*), each individual flip has an expected value of zero. Let's compute this explicitly:

> E[Xᵢ] = (probability of heads) × (value if heads) + (probability of tails) × (value if tails)
> E[Xᵢ] = 0.5 × (+1) + 0.5 × (−1) = 0.5 − 0.5 = 0

Because each step averages to zero, the expected position after any number of steps is also zero:

> **E[Sₙ] = E[X₁] + E[X₂] + ... + E[Xₙ] = 0 + 0 + ... + 0 = 0**

This says: *on average, across many trials, you end up back where you started.*

**How spread out the outcomes are — variance and standard deviation:**

Even though the average is zero, any individual run will land somewhere. *How far* from zero should we typically expect?

First, we need the concept of **variance** — the average of the squared distance from the mean. For a single fair coin flip:

> Var(Xᵢ) = E[(Xᵢ − 0)²] = E[Xᵢ²]
> = 0.5 × (+1)² + 0.5 × (−1)²
> = 0.5 × 1 + 0.5 × 1 = 1

Because each flip is independent (one flip does not affect the next), the variance of the sum is the sum of the variances:

> Var(Sₙ) = Var(X₁) + Var(X₂) + ... + Var(Xₙ) = 1 + 1 + ... + 1 = n

The **standard deviation** is the square root of the variance — it gives us a number in the same units as the position (steps):

> **SD(Sₙ) = √Var(Sₙ) = √n**

Read as: "the standard deviation of S sub n equals the square root of n."

This is the "spreading funnel" you see in the simulation. After 100 steps, the typical distance from zero is √100 = 10. After 10,000 steps, it is √10,000 = 100. The spread grows, but more and more slowly — it grows with the square root of the number of steps, not the number of steps itself.

The simulation shows the ±√n envelope as two curved lines. Most paths stay inside this envelope most of the time.

**What if the coin is not fair?**

When *p ≠ 0.5*, each step has a non-zero average:

> E[Xᵢ] = p × (+1) + (1 − p) × (−1) = 2p − 1

For example, if *p = 0.6* (60% chance of heads), then E[Xᵢ] = 2(0.6) − 1 = 0.2. On average, you move forward by 0.2 per step. After n steps:

> E[Sₙ] = n × (2p − 1)

This is a systematic drift — the random walk now has a trend. The simulation shows this as a tilted path, wandering but gradually moving in one direction.

**Key concepts introduced:** stochastic process, expected value, variance, standard deviation, the square-root-of-n growth of randomness.

---

## Act 2 — The Gambling Game and the Martingale

### The Simulation

The same random walk, relabeled. The vertical axis now shows "€ profit or loss." The dot's position is your running total of winnings. A bold horizontal line marks zero — the break-even point.

Users can now adjust the probability slider. Setting *p* above 0.5 gives the player an edge; below 0.5 gives the house an edge. The simulation shows what long-run ruin looks like at *p = 0.45*, and what slow steady gain looks like at *p = 0.55*.

**The doubling strategy mode:** A special mode shows the doubling strategy (also called the Martingale betting strategy). Every time you lose, you double your next bet. The simulation runs 10,000 gamblers. A histogram shows the distribution of their final wealth — lots of small winners, a few catastrophic losers. A running counter shows the average profit converging to zero.

**Build your own stopping rule:** Users can define a rule: "Stop when ahead by €K" or "Stop after N flips, or when ahead by €K, whichever comes first." The simulation runs 10,000 gamblers with that rule. A counter shows the average winnings at stopping, converging to zero (or below).

### Intuitive Explanation

> Now put money on each step. Win €1 for heads, lose €1 for tails. Your cumulative winnings trace exactly the same path we saw in Act 1 — just with a new label on the axis.
>
> Here is the gambler's temptation: "I'll just keep playing until I'm ahead, then quit." This sounds foolproof. Surely, eventually, a run of luck will put you in the green?
>
> Mathematically, this is true in a narrow sense — a fair random walk does eventually return to positive territory. But the catch is brutal: the time it takes can be astronomically long, and while you wait, you might lose everything you have.
>
> The central insight of this act: **There is no strategy that improves your expected outcome in a fair game.** This is not folk wisdom — it is a proven mathematical theorem. Try any stopping rule you like in the simulation. The average winnings will always converge to zero.

**The doubling strategy, exposed:**

> The doubling strategy feels like a guarantee: lose, double the bet, repeat until you win back your losses plus €1 profit. And it does work — most of the time.
>
> But look at the histogram: a long losing streak forces bets of €1, €2, €4, €8, €16, €32, €64... After just 10 consecutive losses, you need to bet €1,024 just to win back €1. The occasional catastrophic loss exactly cancels the frequent small gains.
>
> The histogram makes this vivid: a tall bar of people who won €1, and a barely visible bar at the far left of people who lost thousands. When you multiply the heights by the positions and add up, the average is zero.

### Mathematical Formulation

**Defining a martingale:**

A sequence of values *M₀, M₁, M₂, ...* is called a **martingale** if, at every step, your best prediction of the next value is simply the current value. No trend upward, no trend downward — just noise around where you are now.

Formally:

> **E[Mₙ | M₀, M₁, ..., Mₙ₋₁] = Mₙ₋₁**

Let's break this notation down very carefully:

- **E[...]** means "the expected value of..." — the long-run average.
- **The vertical bar |** means "given that we know." Everything after the bar is information we have.
- **M₀, M₁, ..., Mₙ₋₁** is the full history — every value the sequence has taken up to the previous step.
- So the full expression reads: *"The expected value of Mₙ, given that we know everything that happened up to step n−1, equals Mₙ₋₁."*

In even plainer terms: **knowing the full history of the game, your best guess for the next value is just the current value. The past gives you no useful information about the future direction.**

*Why the coin-flip game is a martingale:*

For the fair coin-flip game, Mₙ = Sₙ (cumulative winnings). Let's check the definition:

> E[Mₙ | M₀, M₁, ..., Mₙ₋₁]
> = E[Mₙ₋₁ + Xₙ | M₀, M₁, ..., Mₙ₋₁]    (because Mₙ = Mₙ₋₁ + Xₙ)
> = Mₙ₋₁ + E[Xₙ | M₀, M₁, ..., Mₙ₋₁]    (Mₙ₋₁ is known, so it passes through E)
> = Mₙ₋₁ + 0    (because the next flip is independent of the past, and E[Xₙ] = 0)
> = Mₙ₋₁ ✓

This confirms: the cumulative winnings in a fair coin-flip game form a martingale.

**Doob's Optional Stopping Theorem (1953):**

This theorem, proved by mathematician Joseph Doob, formalizes the profound idea that **you cannot beat a fair game by choosing when to quit.**

*Informal statement:* For any fair game (martingale), no matter how clever your strategy for choosing when to quit, your expected winnings when you stop are equal to your starting wealth.

*Formal statement:* Let *Mₙ* be a martingale and let *τ* (the Greek letter tau) be any **stopping time** — a rule for when to quit that uses only information you have accumulated so far (you are not allowed to look into the future). Then, under reasonable conditions:

> **E[M_τ] = E[M₀]**

Reading this: "The expected value of M at your stopping time τ equals the expected value of M at the start." For a gambler starting with M₀ = 0, this means expected winnings at stopping = 0, always, for any strategy.

**What is a stopping time?**

A stopping time *τ* is a decision rule of the form: "I will stop after step n if [some condition based only on what has happened so far]." Examples:

- Stop after exactly 100 flips (fixed in advance) ✓
- Stop the first time I am ahead by €10 ✓
- Stop when I have lost €50 ✓
- Stop after 1,000 flips or when I am ahead by €5, whichever comes first ✓
- Stop right before the next loss ✗ (this requires knowing the future!)

All of the ✓ examples are valid stopping times. The key rule: at any moment, you must be able to decide "stop or continue" based only on what has happened *so far*, not on what will happen next.

**What are the "reasonable conditions"?**

Doob's theorem requires one of these:
1. The stopping time is bounded: τ ≤ N for some fixed N (you guarantee you will stop within N steps), OR
2. The martingale is bounded: |Mₙ| ≤ C for some fixed C (the values cannot grow without limit), OR
3. E[τ] < ∞ (the expected time to stop is finite)

When none of these hold — as with the doubling strategy — the theorem's guarantee can break down. This is exactly the loophole the doubling strategy exploits (and why it ultimately fails in practice).

**Why the doubling strategy fails:**

The doubling strategy does guarantee that you will eventually be ahead — but only if you have infinite money and infinite time. In practice:
- If your budget is finite, there is a real probability of ruin before recovery
- The expected time to recovery is infinite: E[τ] = ∞
- When E[τ] = ∞, Doob's theorem no longer guarantees E[M_τ] = 0 — instead it only guarantees E[M_τ] ≤ 0

In other words: the strategy seems to work until it catastrophically doesn't. The "reasonable conditions" are not just technicalities — they are the reason the strategy fails.

**Why this matters for what is coming:**

The martingale concept will reappear in every subsequent act. The likelihood ratio in Act 4 is a martingale. The mSPRT statistic in Act 6 is a martingale. The reason sequential tests can control false positives — even with peeking — is that they exploit the same mathematical structure we just saw: **a fair game cannot be beaten by choosing when to stop.**

**Key concepts introduced:** martingale, conditional expectation, stopping time, Doob's Optional Stopping Theorem, the "reasonable conditions."

---

## Act 3 — Hypothesis Testing: Telling Two Coins Apart

### The Simulation

A new simulation appears. The user is presented with a coin and must decide whether it is fair or biased, one flip at a time.

Two scenarios are always running side by side:
- **Left panel:** The coin is actually fair (p = 0.5). Label: "Reality: fair coin."
- **Right panel:** The coin is actually biased (p = 0.5 + δ). Label: "Reality: biased coin."

After each flip, a running tally shows the number of heads and tails so far, and the current proportion of heads.

The user tries to decide: fair or biased? The simulation highlights the difficulty — for small δ, the sequences look nearly identical for many flips.

Users can adjust:
- The true bias δ (how different the biased coin is from fair)
- How many flips to watch before deciding

### Intuitive Explanation

> You are handed a coin. You suspect it might be unfair, but you are not sure. How do you find out? You flip it many times and look at the results.
>
> If you flip 10 times and get 6 heads, is the coin biased? Maybe — but you could easily get 6 heads out of 10 with a fair coin. If you flip 1,000 times and get 600 heads, that is much stronger evidence — it would be very unusual for a fair coin to land heads 60% of the time over 1,000 flips.
>
> To make this rigorous, statisticians set up a framework with two competing stories:
>
> - **The null hypothesis (H₀):** "The coin is fair. Nothing interesting is happening."
> - **The alternative hypothesis (H₁):** "The coin is biased. Something real is going on."
>
> The goal of a statistical test is to decide which story the data supports, with controlled error rates.

**Two types of mistakes:**

> There are exactly two ways to be wrong:
>
> 1. **False positive (Type I error):** You conclude the coin is biased, but it is actually fair. You cried wolf.
> 2. **False negative (Type II error):** You conclude the coin is fair, but it is actually biased. You missed the signal.
>
> We want to keep both error rates small. Traditionally:
> - **α** (alpha) = maximum false positive rate = 0.05 (5%)
> - **β** (beta) = maximum false negative rate = 0.20 (20%)
>
> The complement of β is called **power** = 1 − β = 0.80 (80%). It is the probability of correctly detecting a real effect.

### Mathematical Formulation

**The likelihood — measuring how well a hypothesis explains the data:**

After observing a sequence of n flips, we can compute how likely that specific sequence is under each hypothesis. This number is called the **likelihood.**

Suppose we observe n flips, and k of them are heads.

Under H₀ (fair coin, p = 0.5):

> Likelihood₀ = (0.5)ᵏ × (0.5)ⁿ⁻ᵏ = (0.5)ⁿ

(Every sequence of n flips has the same probability under a fair coin — because each flip has probability 0.5 regardless of the outcome.)

Under H₁ (biased coin, p = 0.5 + δ):

> Likelihood₁ = (0.5 + δ)ᵏ × (0.5 − δ)ⁿ⁻ᵏ

Here, heads are more likely (probability 0.5 + δ) and tails are less likely (probability 0.5 − δ = 1 − (0.5 + δ)).

**The likelihood ratio — comparing the two explanations:**

The **likelihood ratio** is simply the ratio of these two likelihoods:

> **Λₙ = Likelihood₁ ÷ Likelihood₀**

In words: "How many times more likely is our observed data under the biased-coin story compared to the fair-coin story?"

For the coin-flip case:

> **Λₙ = [(0.5 + δ)ᵏ × (0.5 − δ)ⁿ⁻ᵏ] ÷ (0.5)ⁿ**

*Worked example:* Suppose δ = 0.1 (biased coin has p = 0.6). After n = 10 flips, we observe k = 7 heads.

> Likelihood₁ = (0.6)⁷ × (0.4)³ = 0.0279936 × 0.064 = 0.001792
> Likelihood₀ = (0.5)¹⁰ = 0.000977
> Λ₁₀ = 0.001792 ÷ 0.000977 ≈ 1.83

The data is about 1.83 times more likely if the coin is biased than if it is fair. This is evidence for bias, but not overwhelming — we might need more flips.

**Interpreting Λₙ:**

- Λₙ = 1 means the data is equally consistent with both hypotheses — no evidence either way
- Λₙ = 10 means the data is 10 times more likely under H₁ than H₀ — moderate evidence for bias
- Λₙ = 100 means the data is 100 times more likely under H₁ — strong evidence for bias
- Λₙ = 0.1 means the data is 10 times more likely under H₀ — evidence for fairness

**The likelihood ratio grows (or shrinks) one flip at a time:**

A crucial property: we can compute Λₙ *incrementally.* After each new flip, we multiply the current ratio by one new factor:

> **Λₙ = Λₙ₋₁ × [f₁(xₙ) ÷ f₀(xₙ)]**

where *f₁(xₙ)* is the probability of the n-th flip's outcome under H₁, and *f₀(xₙ)* the same under H₀.

- If the n-th flip is heads: multiply by (0.5 + δ) ÷ 0.5
- If the n-th flip is tails: multiply by (0.5 − δ) ÷ 0.5

This incremental structure is what makes *sequential* testing possible — we can update our evidence after every single observation.

**Note on Λ₀ — the starting value:**

Before any data is observed, neither hypothesis is favored, so:

> **Λ₀ = 1**

This will be important when we connect the likelihood ratio to the martingale theory from Act 2.

**Key concepts introduced:** null hypothesis, alternative hypothesis, likelihood, likelihood ratio, false positive, false negative, power, incremental evidence updating.

---

## Act 4 — The Likelihood Ratio Is a Martingale

### The Simulation

The simulation from Act 3 continues, but now the likelihood ratio Λₙ is plotted as a path over time — exactly like the random walk from Act 1.

Two panels:
- **Left:** 100 paths of Λₙ when the coin is truly *fair* (H₀ true). The paths wander but show no systematic trend.
- **Right:** 100 paths of Λₙ when the coin is truly *biased* (H₁ true). The paths drift upward over time.

The user can see that the left panel looks like the random walks from Act 1. This is not a coincidence — we will now prove why.

### Intuitive Explanation

> Look at the left panel — where the coin is actually fair. The likelihood ratio wanders up and down, sometimes getting large, sometimes small, but it never develops a consistent trend. On average, it stays at 1.
>
> Does this remind you of something? It should. The likelihood ratio under the null hypothesis is a **martingale** — exactly like the gambler's cumulative winnings in a fair game.
>
> This means everything we learned in Act 2 applies. Doob's theorem tells us: no matter when you choose to stop and check the likelihood ratio, its expected value is 1. You cannot systematically make it large by choosing clever peeking times. The test is, in a deep sense, "unpeckable."

### Mathematical Formulation

**Proving that Λₙ is a martingale under H₀:**

We need to show that, when the coin is truly fair (H₀ is true), the expected value of the next likelihood ratio equals the current one:

> E[Λₙ | Λ₀, Λ₁, ..., Λₙ₋₁] = Λₙ₋₁

We showed in Act 3 that Λₙ = Λₙ₋₁ × [f₁(xₙ) ÷ f₀(xₙ)]. So:

> E[Λₙ | past] = E[Λₙ₋₁ × (f₁(xₙ) ÷ f₀(xₙ)) | past]

Since Λₙ₋₁ is already known (it is part of the past), it passes through the expectation:

> = Λₙ₋₁ × E[f₁(xₙ) ÷ f₀(xₙ) | past]

Now the key step. Under H₀, xₙ is distributed according to f₀. So the expectation is:

> E[f₁(xₙ) ÷ f₀(xₙ)] = **Σ over all possible outcomes x:** f₀(x) × [f₁(x) ÷ f₀(x)]

Notice what happens: the f₀(x) in the numerator and the f₀(x) in the denominator *cancel each other out*:

> = Σ over all possible outcomes x: **f₁(x)**

And this sum equals 1 — because f₁ is a probability distribution, and all probabilities must add up to 1:

> = **1**

Therefore:

> E[Λₙ | past] = Λₙ₋₁ × 1 = Λₙ₋₁ ✓

**Λₙ is a martingale under H₀.**

Let's also spell out the key cancellation with actual numbers for the coin-flip case (δ = 0.1, so the biased coin has p = 0.6):

For a heads flip:
- f₀(heads) = 0.5, f₁(heads) = 0.6
- Contribution to the sum: f₀(heads) × [f₁(heads) / f₀(heads)] = 0.5 × (0.6 / 0.5) = 0.6

For a tails flip:
- f₀(tails) = 0.5, f₁(tails) = 0.4
- Contribution to the sum: f₀(tails) × [f₁(tails) / f₀(tails)] = 0.5 × (0.4 / 0.5) = 0.4

Total: 0.6 + 0.4 = 1.0 ✓

The cancellation is the "aha" moment: when we compute the expected ratio under H₀, the H₀ probabilities cancel out, and we are just left summing H₁ probabilities — which must add to 1.

**Additionally, Λₙ is non-negative:**

Since Λₙ is a product of non-negative ratios (probabilities divided by probabilities), it is always ≥ 0. Also, Λ₀ = 1. So Λₙ is a **non-negative martingale starting at 1.** Remember these two properties — they are exactly what we need for the next act.

**Under H₁, Λₙ drifts upward:**

When the coin really is biased, the same calculation gives:

> E[f₁(xₙ) ÷ f₀(xₙ)] under H₁ = Σ f₁(x) × [f₁(x) / f₀(x)] > 1

(This is greater than 1 because the biased coin produces outcomes that f₁ predicts better than f₀.) So Λₙ tends to grow over time — and this upward drift is the signal the test detects.

**Key concepts introduced:** the likelihood ratio is a martingale under H₀, the cancellation that makes it work, non-negative martingale, the drift under H₁.

---

## Act 5 — Markov, Ville, and the Anytime-Valid Guarantee

### The Simulation

This is the pivotal simulation of the entire presentation.

**Panel 1 — Markov (single time):** 10,000 fair-coin paths of Λₙ are generated. A vertical line is drawn at step n = 200. A threshold is drawn at Λ = 1/α = 20 (for α = 0.05). The simulation counts: "How many paths are above the threshold *at step 200*?" This fraction should be close to α = 5% (and often less).

**Panel 2 — Ville (any time):** The same 10,000 paths. Now the question is: "How many paths *ever* crossed the threshold at *any* step from 1 to infinity?" This count is also at most α — but it requires a stronger theorem to prove.

**Panel 3 — Comparison:** A third panel shows 10,000 paths of a standard test statistic (like a z-score) checked at every step, counting how many *ever* show significance. This count is much higher than α — illustrating the peeking problem from Act 0.

The user can see:
- Markov: controls false positives at a *single* time point ✓
- Ville: controls false positives across *all* time points simultaneously ✓
- Standard test with peeking: does NOT control false positives ✗

### Intuitive Explanation

> We are about to prove the most important result in this entire presentation: the **anytime-valid guarantee.** This is the mathematical theorem that makes it safe to peek.
>
> We will get there in two steps:
>
> 1. **Markov's inequality** — a simple, intuitive bound that works at one point in time
> 2. **Ville's inequality** — a deeper result that extends the bound to all points in time simultaneously
>
> Ville's inequality is the reason sequential testing works. It is what converts the martingale property of the likelihood ratio into a practical guarantee: you can check your test after every single observation, and the false positive rate stays controlled.

### Mathematical Formulation

#### Step 1: Markov's Inequality

**Statement:**

For any non-negative random quantity X with a finite expected value E[X]:

> **P(X ≥ c) ≤ E[X] ÷ c**

In plain language: *"The probability that X is at least c can be no larger than the average of X divided by c."*

**Why is this true? An intuitive proof:**

Suppose X can only be non-negative (zero or positive). Think of E[X] as the average height of all possible values of X. Now imagine that a fraction q of those values are at or above the level c. Those values contribute *at least* q × c to the average (because each of them is at least c). The remaining values contribute at least 0 (because X is non-negative). Therefore:

> E[X] ≥ q × c + (1 − q) × 0 = q × c

Rearranging:

> q ≤ E[X] ÷ c

And q is exactly P(X ≥ c). Done.

**A concrete example:**

If the average income in a town is €50,000, then:
- At most 50,000 ÷ 100,000 = 50% of people can earn ≥ €100,000
- At most 50,000 ÷ 500,000 = 10% of people can earn ≥ €500,000
- At most 50,000 ÷ 5,000,000 = 1% of people can earn ≥ €5,000,000

If more than 10% earned €500,000+, the average would have to be higher than €50,000. The bound is often loose (in reality, far fewer than 50% earn ≥ €100,000), but it always holds.

**Applying Markov to the likelihood ratio:**

We proved in Act 4 that, under H₀, Λₙ is a martingale with E[Λₙ] = Λ₀ = 1. Since Λₙ is non-negative, Markov's inequality gives:

> P(Λₙ ≥ 1/α) ≤ E[Λₙ] ÷ (1/α) = 1 × α = α

In words: *"At any single, pre-specified step n, the probability of a false positive is at most α."*

This is reassuring, but limited. It only applies at one moment. We want a guarantee that holds across all moments simultaneously — because peeking means checking many times.

#### Step 2: Ville's Inequality (1939)

**The breakthrough:**

Jean Ville proved a remarkable extension of Markov's inequality that applies to stochastic processes — sequences of random values that evolve over time.

**Statement:**

For any **non-negative martingale** Mₙ starting at M₀:

> **P(Mₙ ever reaches c or higher, at any step n = 0, 1, 2, ...) ≤ M₀ ÷ c**

Written with mathematical notation:

> **P(sup_{n ≥ 0} Mₙ ≥ c) ≤ M₀ ÷ c**

Here, **sup** (short for "supremum") means "the highest value the process ever reaches, across all steps, including if it runs forever."

**Why this is remarkable:**

Markov says: "at any single fixed moment, the probability of being above c is small."

Ville says: "the probability of **ever** being above c, at **any** moment across all of time, is *also* small."

This is a much stronger statement. Markov would allow the process to briefly spike above c at different times, as long as it is rarely there at any single pre-specified time. Ville says even those brief spikes are collectively rare.

**Why is Ville's inequality true? The intuition:**

The key insight is that for a **non-negative** martingale, the value cannot spike high without "using up" the available expected value. If the process reaches a high value at some point, it must stay high on average from that point forward (because it is a martingale — no expected trend). But it also cannot go below zero (because it is non-negative). These two constraints together limit how often it can reach high values.

A formal proof uses a technique called Doob's maximal inequality, which we will not derive here. The key point is: the non-negative martingale property is doing all the heavy lifting.

**Applying Ville to the likelihood ratio:**

Setting Mₙ = Λₙ (our likelihood ratio under H₀), with M₀ = Λ₀ = 1, and c = 1/α:

> **P(Λₙ ever reaches 1/α or higher) ≤ 1 ÷ (1/α) = α**

In plain language: *"The probability that the likelihood ratio ever crosses our rejection threshold — at any point, across all flips, even if you run the experiment forever — is at most α."*

**This is the anytime-valid guarantee.** You can peek at the data after every single observation. You can check the likelihood ratio a million times. The probability of a false positive, across all of those checks combined, is still at most α.

**Connecting back to Act 0:**

The peeking problem we demonstrated in Act 0 arises because standard test statistics (like p-values from a t-test) are not martingales. Checking a p-value repeatedly gives you many independent chances to be fooled.

The likelihood ratio *is* a martingale under H₀. Ville's inequality converts this mathematical property into a practical guarantee: peeking is safe.

**Key concepts introduced:** Markov's inequality (with proof), Ville's inequality, the anytime-valid guarantee, why martingale + non-negative = peek-safe.

---

## Act 6 — SPRT: Wald's Sequential Probability Ratio Test (1945)

### The Simulation

We now combine everything: the likelihood ratio from Act 3/4, and the anytime-valid guarantee from Act 5, into a practical decision procedure.

Two coins are introduced. One is fair (H₀). The other is slightly biased toward heads (H₁). The user does not know which coin they have been given.

Each flip generates a running score — the likelihood ratio Λₙ — plotted as a path over time. Two horizontal threshold lines appear:
- An **upper line** at Λₙ = B: if the score crosses this, we conclude the coin is biased
- A **lower line** at Λₙ = A: if the score falls below this, we conclude the coin is fair

The simulation runs and the score drifts toward one boundary or the other, eventually crossing.

Users can adjust: which coin is actually being used, α, β, and the hypothesized bias δ.

### Intuitive Explanation

> Abraham Wald asked a deceptively simple question during World War II (1943, published 1945): given that we can peek at the data anytime, what is the most *efficient* way to decide between two hypotheses?
>
> His answer: compute the likelihood ratio after each observation. If it gets high enough, conclude H₁. If it gets low enough, conclude H₀. Otherwise, keep collecting data.
>
> The brilliant part: Wald proved this is *optimal*. No other sequential test with the same error guarantees requires fewer observations on average. You literally cannot do better.

### Mathematical Formulation

**The decision rule:**

Choose two error tolerances:
- *α*: maximum false positive rate (typically 0.05)
- *β*: maximum false negative rate (typically 0.20)

Compute two thresholds (these are Wald's approximations — see the note below):

> **Upper threshold B = (1 − β) ÷ α**
> **Lower threshold A = β ÷ (1 − α)**

*Example with α = 0.05 and β = 0.20:*
> B = (1 − 0.20) ÷ 0.05 = 0.80 ÷ 0.05 = 16
> A = 0.20 ÷ (1 − 0.05) = 0.20 ÷ 0.95 ≈ 0.21

After each flip, check:

| Condition | Decision | Meaning |
|---|---|---|
| Λₙ ≥ B (= 16 in our example) | **Reject H₀** | "The coin is biased" |
| Λₙ ≤ A (≈ 0.21 in our example) | **Accept H₀** | "The coin is fair" |
| A < Λₙ < B | **Keep flipping** | "Not enough evidence yet" |

**A note on the thresholds:**

The thresholds B = (1−β)/α and A = β/(1−α) are Wald's approximations, not exact values. Wald showed that these approximations are very close to the true optimal boundaries and are slightly conservative (they provide error rates that are at or below the nominal α and β). For most practical purposes, the approximation is excellent. Exact boundaries can be computed numerically but rarely differ meaningfully.

**Why SPRT is optimal:**

Wald and Wolfowitz (1948) proved that among all sequential tests that achieve error rates ≤ α (for false positives) and ≤ β (for false negatives), the SPRT minimizes the expected number of observations under both H₀ and H₁. You cannot build a faster test with the same guarantees.

**The critical weakness of SPRT:**

SPRT requires specifying *δ* — the exact effect size — in advance. This is baked into the likelihood ratio through f₁(x):
- f₁(heads) = 0.5 + δ
- f₁(tails) = 0.5 − δ

If you specify δ = 0.1 but the true bias is 0.03, the likelihood ratio is computed against the wrong alternative. The test may take much longer to decide, or may fail to detect the effect entirely.

In a laboratory experiment, you might have good reasons to choose δ in advance. In an A/B test on a website — where you typically do not know how large the effect will be — this is a serious limitation.

**Key concepts introduced:** SPRT decision rule, Wald's approximations, optimality of SPRT, its critical dependence on a pre-specified effect size.

---

## Act 7 — mSPRT: The Mixture Sequential Probability Ratio Test

### The Simulation

The setup from Act 6, but now the user no longer specifies δ in advance. Instead, a new slider appears: *τ*, which controls the width of a "prior belief" over possible effect sizes.

The mSPRT statistic Λₙᴴ is plotted over time. Only the upper threshold (1/α) is shown — there is no lower boundary for reasons we explain below. Users can see multiple runs: some cross the threshold early, some never do within the allotted window.

**Comparison mode:** SPRT (with a wrong δ) is shown alongside mSPRT, illustrating how mSPRT degrades more gracefully when the true effect size is unknown. Additionally, a **power curve** and **average stopping time chart** are displayed alongside the paths, showing aggregate performance rather than just individual runs.

### Intuitive Explanation

> SPRT's fatal flaw: you must know the effect size in advance. The mSPRT's elegant fix: instead of betting on one specific effect size, you **bet on all of them at once**.
>
> Imagine you are not sure how biased the coin might be. So you assemble a panel of experts:
> - Expert A thinks the bias is very small (δ = 0.01)
> - Expert B thinks it is moderate (δ = 0.05)
> - Expert C thinks it is large (δ = 0.15)
>
> Each expert runs their own SPRT, computing their own likelihood ratio. At each step, you take a **weighted average** of all their likelihood ratios — weighted by how plausible you think each expert's guess is.
>
> Remarkably, this averaged score is still a martingale under H₀ — just like each individual score. So Ville's inequality still applies, and the anytime-valid guarantee is preserved. You have gained robustness to effect size uncertainty without giving up any of the mathematical protection.

**Why does averaging preserve the martingale property?**

> This follows from a simple fact about averages: the average of "no trends" is still "no trend."
>
> If Expert A's score has no trend (martingale), and Expert B's score has no trend (martingale), then the average of their scores also has no trend. You cannot create a trend by averaging together things that have no trend.

### Mathematical Formulation

**Why the average of martingales is a martingale — the formal proof:**

If Aₙ and Bₙ are both martingales, and w is any fixed weight between 0 and 1, then the weighted average Cₙ = w·Aₙ + (1−w)·Bₙ is also a martingale. Here is why:

> E[Cₙ | past]
> = E[w·Aₙ + (1−w)·Bₙ | past]
> = w·E[Aₙ | past] + (1−w)·E[Bₙ | past]    (linearity of expectation)
> = w·Aₙ₋₁ + (1−w)·Bₙ₋₁    (because A and B are martingales)
> = Cₙ₋₁ ✓

The step labeled "linearity of expectation" uses the fact that E[a + b] = E[a] + E[b] and E[c·a] = c·E[a]. These are basic properties of expectation that hold universally. The weighted average of values-equal-to-their-past is still equal-to-its-past. Averaging does not break the martingale property.

This extends to any number of experts, and even to a *continuous* mixture (which is what we use in practice).

**The mixing idea:**

Let *H* denote a **prior distribution** over effect sizes — a probability distribution describing how plausible each value of δ is. Instead of a finite panel of experts, imagine an infinitely large panel, one expert for every possible value of δ.

The mSPRT statistic is the expected value of the ordinary SPRT likelihood ratio, averaged over all effect sizes according to H:

> **Λₙᴴ = ∫ Λₙᵟ dH(δ)**

Breaking this down symbol by symbol:
- *Λₙᵟ* means "the likelihood ratio we would have computed if we had assumed effect size δ"
- *dH(δ)* means "weighted by how probable effect size δ is, according to H"
- The integral ∫ is a continuous version of summation — it averages Λₙᵟ across all possible values of δ, weighted by the prior H

Think of it as: *"What is the average likelihood ratio across all the experts on our infinitely large panel, weighted by their credibility?"*

**Closed form for Normal observations:**

In the most common practical case (which is what Eppo uses), we assume:
- Individual observations xᵢ are drawn from a **Normal (bell-curve) distribution** with mean μ and known variance σ²
- The mixing distribution H is a Normal distribution centered at 0, with standard deviation τ

With these assumptions, the integral has an exact algebraic solution — we do not need to compute it numerically:

> **Λₙᴴ = √(σ² ÷ (σ² + n·τ²)) × exp(τ² · n² · x̄ₙ² ÷ (2σ²·(σ² + n·τ²)))**

Let's unpack every symbol and sub-expression:

- **σ²** (sigma squared): the **variance** of individual observations — how noisy the data is. σ is the standard deviation (σ² = σ × σ).
- **n**: the number of observations collected so far.
- **τ²** (tau squared): the variance of the prior H — controls how wide a range of effect sizes we consider plausible. Large τ means "we think large effects are plausible"; small τ means "we only expect small effects."
- **x̄ₙ** (pronounced "x-bar sub n"): the **sample mean** after n observations — the ordinary average of all observed values. x̄ₙ = (x₁ + x₂ + ... + xₙ) ÷ n.
- **n² · x̄ₙ²**: this is (n × x̄ₙ)², which equals (x₁ + x₂ + ... + xₙ)² — the square of the total sum of observations. This grows when the cumulative sum is large.
- **σ² + n·τ²**: a combination of the data noise (σ²) and the prior width scaled by sample size (n·τ²). As n grows, the n·τ² term dominates.
- **√(σ² ÷ (σ² + n·τ²))**: a shrinkage factor that slowly decreases as n grows. It prevents the statistic from growing simply because more data is collected.
- **exp(...)**: the exponential function, e ≈ 2.718 raised to the power of what is inside. This grows rapidly when its argument is large — i.e., when the sample mean x̄ₙ is far from zero.

In plain English: *"The mSPRT score is large when the observed average is far from zero (strong signal), when we have many observations (more data), and when the noise is low relative to the prior width."*

**Important practical note on σ²:**  The closed-form formula assumes σ² is known. In practice, σ² must be estimated from the data. Eppo handles this by using a running estimate of σ² that is updated as data accumulates. For reasonably large sample sizes (n ≥ 100, which is almost always true in A/B testing), the estimation uncertainty in σ² has negligible impact on the test's properties.

**Decision rule:**

> Stop and reject H₀ when: **Λₙᴴ ≥ 1 ÷ α**

For α = 0.05, this means: stop when Λₙᴴ ≥ 20.

There is **no lower boundary** — unlike SPRT, you cannot definitively confirm the null hypothesis with mSPRT. Why? Because the mSPRT averages over all effect sizes, including very small ones. A very small effect would make the data look almost identical to the null, so the statistic hovers near 1 indefinitely. You can never accumulate enough evidence to confidently say "there is no effect of any size."

In practice, experiments run for a fixed maximum duration (set in advance), and if the threshold is never crossed, you simply conclude: *"We did not detect a statistically significant effect within the allotted time."*

**The role of τ:**

τ is the most important tuning parameter. It controls the tradeoff between sensitivity and speed:

| τ is... | Effect on the test | Best for... |
|---|---|---|
| Small (e.g. 0.01) | Conservative, slow to reject, sensitive to small effects | Detecting very small effects (but requires patience) |
| Large (e.g. 0.5) | Aggressive, fast to reject for large effects, poor at detecting small ones | Detecting large effects quickly |
| Well-matched to true δ | Near-optimal efficiency | When you have a good prior estimate of the effect size |

The key insight: **there is no universally optimal τ.** But if you have data from past experiments — a record of what effect sizes your platform typically produces — you can use that history to calibrate τ. This is what Eppo calls the GAVI approach (discussed in Act 8).

**Why Ville's inequality still applies:**

Λₙᴴ is a non-negative martingale under H₀ (because it is a weighted average of martingales, each of which is non-negative and starts at 1). Λ₀ᴴ = 1 (before any data, every expert's likelihood ratio is 1, and their average is 1). Ville's inequality therefore applies directly:

> **P(Λₙᴴ ever reaches 1/α) ≤ α**

*No matter when you peek, no matter how many times, the probability of a false positive across all of time is bounded by α.* The anytime-valid guarantee from Act 5 carries through unchanged.

**Key concepts introduced:** mixture distribution, prior distribution, the role of τ, robustness to effect size uncertainty, the closed-form formula, practical considerations (estimated σ², no lower boundary).

---

## Act 8 — Eppo's Implementation: CUPED, GAVI, and Confidence Sequences

This act has three independent sections. Each builds on the mSPRT from Act 7 but addresses a different practical concern: reducing noise (CUPED), calibrating the prior (GAVI), and reporting results (confidence sequences).

### The Simulation

A full A/B test simulation. Two groups: control and treatment. Observations arrive over time — representing, for example, user conversions on a website.

**Panel 1 — CUPED toggle:** The mSPRT statistic is plotted continuously. A toggle switches variance reduction (CUPED) on and off. With CUPED on, the path is less noisy and reaches the threshold sooner.

**Panel 2 — Confidence sequence:** Instead of just a threshold, a **confidence band** is plotted around the estimated treatment effect. The band starts wide and narrows over time. A toggle shows how CUPED tightens the band further.

**Panel 3 — τ calibration:** The user can see the effect of different τ values on average stopping time and power, displayed as curves. A "GAVI" button auto-calibrates τ from a simulated distribution of past experiments.

Users can adjust: sample size, true effect size, τ, and the correlation between the pre-experiment covariate and the outcome (which controls how much variance reduction is achieved).

### Section 8A — CUPED: Variance Reduction

#### Intuitive Explanation

> Suppose you are testing whether a new website feature increases purchases. You know, from last month's data, that some users are just generally heavy purchasers regardless of any feature. This pre-existing difference between users is noise — it has nothing to do with your treatment.
>
> CUPED (Controlled-experiment Using Pre-Experiment Data) removes this noise before the test runs. Think of it like weighing yourself before and after a meal: you don't care about your baseline weight, only the change. By subtracting out each user's baseline behavior, you get a cleaner signal.
>
> A less noisy signal means you need fewer observations to detect a real effect — sometimes dramatically fewer.

#### Mathematical Formulation

**Setting up the variables:**

Let:
- *Y*: the outcome you care about for a given user (e.g., purchase amount during the experiment)
- *X*: a **pre-experiment covariate** — a measurement from *before* the experiment started that correlates with Y (e.g., the same user's purchase amount from last month)
- *E[X]*: the average value of X across all users

**The CUPED-adjusted outcome:**

> **Y* = Y − θ · (X − E[X])**

Breaking this down:
- *θ* (the Greek letter theta): a coefficient we choose to make the adjustment as effective as possible
- *(X − E[X])*: the pre-experiment variable, **centered** so its average is zero. This centering ensures that the adjustment does not change the average value of Y — it only removes noise.
- The subtraction *Y − θ · (X − E[X])* removes the component of Y that was predictable from pre-experiment behavior

*Example:* Suppose a user purchased €80 during the experiment (Y = 80), and their purchase history from last month was €100 (X = 100), while the average across all users was €70 (E[X] = 70). If θ = 0.5:

> Y* = 80 − 0.5 × (100 − 70) = 80 − 0.5 × 30 = 80 − 15 = 65

This user's adjusted outcome is €65 instead of €80. We have "subtracted out" the fact that they are a heavy purchaser.

**Choosing θ optimally:**

We want to choose θ so that Y* has the lowest possible variance — the most noise is removed. The optimal value is:

> **θ = Cov(Y, X) ÷ Var(X)**

Where:
- **Cov(Y, X)** (covariance of Y and X): a measure of how strongly Y and X move together. Positive covariance means users who purchased more before the experiment also tend to purchase more during it.
- **Var(X)** (variance of X): how spread out the pre-experiment variable is across users.

This is the same formula as the **slope in a linear regression** of Y on X.

**Important practical note:** θ is estimated from data — specifically, from the pre-experiment period, *not* from the experiment itself. Because the estimation uses only pre-experiment data, it is independent of the experimental treatment assignment. This independence is why CUPED does not compromise the validity of the subsequent test.

**How much variance is reduced:**

The variance of the adjusted outcome Y* is:

> **Var(Y*) = Var(Y) · (1 − ρ²)**

Where *ρ* (the Greek letter rho) is the **correlation coefficient** between Y and X — a number between −1 and +1 that measures how strongly they are linearly related.

| ρ (correlation) | ρ² | 1 − ρ² | Variance remaining | Interpretation |
|---|---|---|---|---|
| 0 | 0 | 1.00 | 100% | No reduction (X is unrelated to Y) |
| 0.3 | 0.09 | 0.91 | 91% | Modest reduction |
| 0.5 | 0.25 | 0.75 | 75% | 25% variance reduction |
| 0.7 | 0.49 | 0.51 | 51% | Nearly half the variance removed |
| 0.9 | 0.81 | 0.19 | 19% | 81% variance reduction — dramatic |

A large correlation between pre-experiment history and the outcome metric produces dramatic variance reduction — meaning you need far fewer observations to detect a real effect.

*Why this formula works:* Y* = Y − θ(X − E[X]). The variance of a difference is Var(Y) + θ²·Var(X) − 2θ·Cov(Y,X). Substituting the optimal θ = Cov(Y,X)/Var(X) and simplifying yields Var(Y)·(1 − ρ²), where ρ = Cov(Y,X) / (SD(Y)·SD(X)).

### Section 8B — GAVI: Calibrating τ from History

#### Intuitive Explanation

> In Act 7, we introduced τ — the tuning parameter that controls which effect sizes the mSPRT is most sensitive to. But how do we choose τ?
>
> Eppo's approach is pragmatic: look at past experiments. If your platform has run 100 A/B tests before, and the observed effect sizes ranged from δ = 0.005 to δ = 0.10, with most around δ = 0.02, then set τ to match that distribution.
>
> This is the GAVI (Generalized Adjusted Variance Inflation) approach: calibrate the prior from empirical data. It gives the test near-optimal power for the kinds of effects your platform typically encounters.

#### Mathematical Formulation

GAVI sets the prior distribution H (used in the mSPRT mixing integral) to match the empirical distribution of effect sizes from past experiments. Concretely:

1. Collect the estimated effect sizes δ₁, δ₂, ..., δₖ from k past experiments
2. Compute the standard deviation of these effect sizes
3. Set τ equal to (or proportional to) this standard deviation

If past effects were mostly small, τ will be small — making the test most sensitive to small effects. If past effects varied widely, τ will be larger — giving the test broader coverage.

### Section 8C — Confidence Sequences

#### Intuitive Explanation

> When we run a standard (non-sequential) test, we report a **confidence interval** — a range of plausible values for the treatment effect. For example: "The new design increased purchases by 3% ± 2%."
>
> With mSPRT, we get something even better: a **confidence sequence.** This is a confidence band that updates after every new observation and is valid at every point in time — not just at the end.
>
> The band starts wide (when we have little data) and narrows over time (as data accumulates). At any moment you peek, the band covers the true treatment effect with at least (1 − α) probability. This is the reporting counterpart to the anytime-valid guarantee: not just "can we reject H₀?" but "what range of effects is consistent with the data?"

#### Mathematical Formulation

The confidence sequence is derived by inverting the mSPRT rejection rule. At time n, the (1 − α) confidence set is:

> **C(n) = { μ : Λₙᴴ(μ) < 1/α }**

In words: the confidence set at time n is the set of all parameter values μ for which the mSPRT statistic, computed as if μ were the null, does not exceed the threshold.

For the Normal case with the closed-form mSPRT, this can be solved algebraically to give an interval of the form:

> **x̄ₙ ± margin(n)**

where the margin depends on n, σ², τ², and α. The margin decreases as n grows (the interval tightens), but never reaches zero.

The guarantee is:

> **P(true μ ∈ C(n) for all n simultaneously) ≥ 1 − α**

This is the confidence sequence counterpart of Ville's inequality: the band covers the true parameter at all times, not just one pre-specified time.

### Section 8D — The Full Pipeline

> The complete Eppo sequential testing pipeline is:
>
> 1. **Before the experiment:** Collect pre-experiment covariate X for each user. Estimate θ from historical data.
> 2. **During the experiment:** As each observation Y arrives, compute the adjusted outcome Y* = Y − θ · (X − E[X]).
> 3. **Calibrate τ** from historical effect sizes (GAVI).
> 4. **Run mSPRT** on Y* (the CUPED-adjusted outcomes), with parameter τ and stopping threshold 1/α.
> 5. **Monitor the confidence sequence** — a narrowing band around the estimated treatment effect.
> 6. **Decide:** If Λₙᴴ ≥ 1/α, reject H₀ and conclude there is a real effect. If the maximum planned sample size is reached without crossing the threshold, conclude "no significant effect detected."
>
> The test is **anytime-valid** (peek whenever you want), **variance-reduced** (CUPED makes the signal clearer), and **robust to effect size uncertainty** (mSPRT does not require pre-specifying δ).

**Why CUPED does not break the mSPRT guarantee:**

The mSPRT is applied to Y* (the adjusted outcome) rather than Y. All the same formulas apply, just with a smaller σ² (because the variance of Y* is smaller than the variance of Y). Crucially:

1. θ is estimated from pre-experiment data, independent of the experiment
2. The CUPED adjustment is applied *before* the mSPRT statistic is computed
3. The martingale property of the likelihood ratio depends only on the observations being correctly modeled — which they are, with the reduced-variance Y*

Ville's inequality still holds. The test is still anytime-valid. We have simply replaced a noisy input signal with a cleaner one.

**Key concepts introduced:** CUPED, pre-experiment covariate, variance reduction, correlation, GAVI, τ calibration, confidence sequences, the full Eppo sequential testing pipeline.

---

## Navigation and UX Design

### Between Acts

Each transition features a brief interstitial card containing:
- A one-sentence bridge connecting the previous act to the next (e.g., "Now let's put money on each step...")
- A **"Key insight so far"** box — a single sentence summary of the most important concept just covered
- An optional **"Go deeper"** toggle that expands a more detailed mathematical treatment for users who want it

Suggested transitions:

| From → To | Bridge sentence |
|---|---|
| Act 0 → Act 1 | "To build a peek-safe test, we first need the right mathematical building block. It starts with a coin flip." |
| Act 1 → Act 2 | "Now let's put money on each step — and learn why no gambling strategy can beat a fair game." |
| Act 2 → Act 3 | "The gambler's lesson was: fair games can't be beaten. Now let's use that to build a detective — a tool for telling two coins apart." |
| Act 3 → Act 4 | "We can measure evidence with a likelihood ratio. But here's the surprise: that evidence score is itself a random walk — a martingale." |
| Act 4 → Act 5 | "The likelihood ratio is a martingale. Now let's see why that single fact gives us the peeking guarantee we've been after." |
| Act 5 → Act 6 | "We have the theory: peeking is safe for martingales. Now let's turn it into a practical decision procedure." |
| Act 6 → Act 7 | "SPRT is optimal but inflexible. What if we don't know the effect size? We'll average over all possibilities." |
| Act 7 → Act 8 | "The mSPRT gives us a robust, peek-safe test. Now let's add Eppo's practical enhancements: noise reduction and calibration." |

### Persistent Controls

A slider panel available throughout all acts:
- **Probability p** (or effect size δ from Act 3 onward)
- **Significance level α** — how careful we are about false positives
- **Number of steps / observations n** — how long to run
- **Simulation speed**
- **Number of simultaneous runs** — showing the distribution of outcomes

### Persistent Sidebar

The notation cheat sheet from the top of this document should be accessible as a collapsible sidebar from every act.

### Visual Design Principles

- The same visual object (the path/process) carries through all eight acts, relabeled at each stage
- Threshold lines appear gradually — none in Act 0/1, the ±√n envelope in Act 1, both SPRT thresholds in Act 6, only the upper threshold from Act 7 onward, confidence bands in Act 8
- Mathematical formula panels slide in/out; they are never shown by default in the first reading
- Formulas are always accompanied by a plain-language translation directly below them
- Key terms on first use are bolded and briefly defined in-line

---

## Summary: The Through-Line

| Act | Object | What it represents | Key idea |
|---|---|---|---|
| 0 | Repeated p-values | The peeking problem | Checking repeatedly inflates false positives |
| 1 | Random walk Sₙ | A person's position | SD grows as √n |
| 2 | Cumulative winnings Mₙ | A gambler's fortune | Martingale; Doob: E[M_τ] = M₀ |
| 3 | Likelihood ratio Λₙ | Evidence against H₀ | Comparing two hypotheses, one flip at a time |
| 4 | Λₙ under H₀ | The LR is a martingale | The cancellation proof; Λ₀ = 1, Λₙ ≥ 0 |
| 5 | Markov + Ville | The anytime-valid guarantee | P(Λₙ ever ≥ 1/α) ≤ α |
| 6 | SPRT | Wald's decision rule | Optimal but requires known δ |
| 7 | Mixture likelihood Λₙᴴ | Robust evidence, no δ needed | Mixture of martingales is still a martingale |
| 8 | CUPED + confidence sequence | Less noisy, fully reported evidence | Same guarantee, faster detection, richer output |

**The core message:** All eight acts build on the same mathematical object — a non-negative martingale — viewed through increasingly powerful lenses. The anytime-valid guarantee flows from a single elegant fact: **a fair game cannot be beaten by choosing when to quit.**

---

## References

1. **Ville, J.** (1939). *Étude critique de la notion de collectif.* Gauthier-Villars, Paris. — The original proof of Ville's inequality, establishing that non-negative supermartingales cannot cross a threshold too often.

2. **Wald, A.** (1945). Sequential tests of statistical hypotheses. *Annals of Mathematical Statistics*, 16(2), 117–186. — The foundational paper on the Sequential Probability Ratio Test (SPRT) and its optimality properties.

3. **Wald, A. & Wolfowitz, J.** (1948). Optimum character of the sequential probability ratio test. *Annals of Mathematical Statistics*, 19(3), 326–339. — The proof that SPRT minimizes the expected number of observations among all sequential tests with the same error guarantees.

4. **Doob, J.L.** (1953). *Stochastic Processes.* Wiley, New York. — The definitive treatment of martingale theory, including the Optional Stopping Theorem.

5. **Robbins, H.** (1970). Statistical methods related to the law of the iterated logarithm. *Annals of Mathematical Statistics*, 41(5), 1397–1409. — Early work on mixture sequential tests, laying the groundwork for the mSPRT.

6. **Deng, A., Xu, Y., Kohavi, R., & Walker, T.** (2013). Improving the sensitivity of online controlled experiments by utilizing pre-experiment data. *Proceedings of the 6th ACM International Conference on Web Search and Data Mining (WSDM)*, 123–132. — The original CUPED paper: variance reduction using pre-experiment covariates.

7. **Johari, R., Pekelis, L., & Walsh, D.** (2017). Always valid inference: Continuous monitoring of A/B tests. *Operations Research*, 65(6), 1651–1667. — The paper that introduced the mSPRT for A/B testing, connecting Robbins' mixture approach to practical online experimentation.

8. **Schmit, M. & Miller, T.** (2024). Sequential confidence intervals for comparing two proportions with variance reduction. Eppo. — The paper detailing Eppo's implementation of sequential testing with CUPED-based variance reduction, confidence sequences, and the GAVI approach for calibrating the mixing distribution. Available in the literature folder of this project.

9. **Howard, S.R., Ramdas, A., McAuliffe, J., & Sekhon, J.** (2021). Time-uniform, nonparametric, nonasymptotic confidence sequences. *Annals of Statistics*, 49(2), 1055–1080. — Rigorous theory of confidence sequences and their connection to e-processes and anytime-valid inference.

---

## Appendix: What Changed from v1

This is version 2 of the plan. The following changes were made relative to the original (now in the `past/` folder):

1. **Added Act 0 (The Peeking Problem):** A motivational opener showing *why* sequential testing matters, using a simulation of repeated peeking inflating false positive rates with standard tests.

2. **Split the original Act 3 into three acts (Acts 3, 4, 5):** The original plan went from coin flips to likelihood ratios, the martingale proof, and Ville's inequality in a single act. This was the steepest conceptual cliff. The revised plan introduces hypothesis testing and the likelihood ratio (Act 3), then proves the martingale property separately (Act 4), then addresses Markov and Ville's inequalities in their own act (Act 5) with a dedicated simulation.

3. **Added a dedicated Ville's inequality simulation (Act 5):** Shows 10,000 paths, comparing "how many are above the threshold at one fixed time" (Markov) vs. "how many ever cross" (Ville) vs. "how many show significance with a standard test" (peeking problem). This makes the Markov-vs-Ville distinction visceral.

4. **Separated CUPED and GAVI (Act 8, Sections A and B):** These are independent concepts and were previously interleaved. CUPED is about reducing noise in the input data; GAVI is about calibrating the mixing prior.

5. **Added confidence sequences (Act 8, Section C):** The mSPRT rejection region implies an anytime-valid confidence interval. Showing the confidence band narrowing over time connects to how Eppo actually reports results.

6. **Spelled out the martingale proof for Λₙ more carefully (Act 4):** The original had a subtle hand-wave in the E[f₁(x)/f₀(x)] = Σ f₁(x) = 1 step. The revised version explicitly shows the cancellation f₀(x) × [f₁(x)/f₀(x)] = f₁(x) and works a numerical example.

7. **Explicitly stated Λ₀ = 1 (Act 3/4):** This is required for Ville's inequality (which needs M₀ = 1). The original did not state this.

8. **Added a note that SPRT thresholds are Wald's approximations (Act 6):** Prevents sharp readers from getting stuck trying to derive exact boundaries.

9. **Added a note that σ² is estimated in practice (Act 7):** Acknowledges that the closed-form mSPRT assumes known σ², and explains how this is handled.

10. **Added a note that θ (in CUPED) is estimated from pre-experiment data (Act 8A):** Explains why this does not break the test's validity.

11. **Added a "build your own stopping rule" widget (Act 2):** Lets users discover Doob's theorem empirically.

12. **Added distribution histograms for the doubling strategy (Act 2):** Shows the "frequent small wins, rare catastrophic losses" pattern visually.

13. **Added power curves and average stopping time charts alongside SPRT-vs-mSPRT comparison (Act 7):** Individual sample paths can be misleading; aggregate metrics tell the real story.

14. **Made the notation cheat sheet a persistent sidebar:** Accessible from every act, not just the introduction.

15. **Updated the audience description:** "Comfortable with algebra and basic probability; no calculus required but some is shown for completeness" — more accurately reflects the content.

16. **Added a references section** with all key papers, including the Eppo paper from the literature folder.

17. **Added explicit transition sentences** between all acts in the Navigation section.
