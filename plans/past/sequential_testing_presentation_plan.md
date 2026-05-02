# Presentation Plan: From Random Walks to Sequential Testing

**Target audience:** People with a 12th-grade math background — comfortable with basic algebra, averages, and the idea of probability, but not necessarily familiar with university-level statistics or mathematical notation.

**Format:** Five interactive acts. Each act has a simulation, an intuitive explanation, and a mathematical section. The math sections always define every symbol before using it.

---

## How to Read This Document

Every formula in this plan is accompanied by a plain-language translation. The goal is that a reader who has never seen a Greek letter in a math class should still be able to follow the logic, even if the symbols look unfamiliar at first.

A note on notation that appears throughout:

- **Capital letters** (like *X* or *M*) usually represent quantities that are random — they could take different values depending on what happens.
- **Subscript numbers** (like *X₁*, *X₂*, *Xₙ*) mean "the value of X at step 1, step 2, step n."
- **E[...]** means "the expected value of..." — i.e., the long-run average if you repeated the process many times.
- **P(...)** means "the probability that..." — a number between 0 and 1.
- **Σ (sigma, uppercase)** means "add all of these up." For example, Σ Xᵢ from i=1 to n means "add up X₁ + X₂ + ... + Xₙ."
- **≥** means "greater than or equal to."
- **∞** means infinity — a process that goes on forever.

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

**What to expect — the average outcome:**

When the coin is fair (*p = 0.5*), each individual flip has an expected value of zero:
- Half the time you get +1, half the time −1
- Average = (0.5 × 1) + (0.5 × −1) = 0

Because each step averages to zero, the expected position after any number of steps is also zero:

> **E[Sₙ] = 0**

This says: on average, across many trials, you end up back where you started.

**How spread out the outcomes are — variance and standard deviation:**

Even though the average is zero, any individual run will land somewhere. *How far* from zero should we typically expect? This is measured by the **standard deviation** — the typical distance from the average.

For a fair random walk:

> **SD(Sₙ) = √n**

(Read as: "the standard deviation of S sub n equals the square root of n.")

This is the "spreading funnel" you see in the simulation. After 100 steps, the typical distance from zero is √100 = 10. After 10,000 steps, it is √10,000 = 100. The spread grows, but more and more slowly — it grows with the square root of the number of steps, not the number of steps itself.

The simulation shows the ±√n envelope as two curved lines. Most paths stay inside this envelope most of the time.

**Key concepts introduced:** stochastic process, expected value, standard deviation, the square-root-of-n growth of randomness.

---

## Act 2 — The Gambling Game

### The Simulation

The same random walk, relabeled. The vertical axis now shows "€ profit or loss." The dot's position is your running total of winnings. A bold horizontal line marks zero — the break-even point.

Users can now adjust the probability slider. Setting *p* above 0.5 gives the player an edge; below 0.5 gives the house an edge. The simulation shows what long-run ruin looks like at *p = 0.45*, and what slow steady gain looks like at *p = 0.55*.

A special mode shows the **doubling strategy**: every time you lose, you double your next bet. Watch what happens in the rare cases of a long losing streak.

### Intuitive Explanation

> Now put money on each step. Win €1 for heads, lose €1 for tails. Your cumulative winnings trace exactly the same path we saw in Act 1 — just with a new label on the axis.
>
> Here is the gambler's temptation: "I'll just keep playing until I'm ahead, then quit." This sounds foolproof. Surely, eventually, a run of luck will put you in the green?
>
> Mathematically, this is true in a narrow sense — a fair random walk does eventually return to positive territory. But the catch is brutal: the time it takes can be astronomically long, and while you wait, you might lose everything you have. There is no strategy that improves your *expected* outcome in a fair game. This is not folk wisdom — it is a proven mathematical theorem.

**The doubling strategy, exposed:**

> The doubling strategy (also called the Martingale betting strategy) feels like a guarantee: lose, double the bet, repeat until you win back your losses plus €1 profit. And it does work — most of the time.
>
> But look at the rare cases in the simulation: a long losing streak forces bets of €1, €2, €4, €8, €16, €32, €64... After just 10 consecutive losses, you need to bet €1,024 just to win back €1. The occasional catastrophic loss exactly cancels the frequent small gains. The math is unforgiving.

### Mathematical Formulation

**Defining a martingale:**

A sequence of values *M₀, M₁, M₂, ...* is called a **martingale** if, at every step, your best prediction of the next value is simply the current value. No trend upward, no trend downward — just noise around where you are now.

Formally:

> **E[Mₙ | M₀, M₁, ..., Mₙ₋₁] = Mₙ₋₁**

Breaking this down:
- *E[... | ...]* is called a **conditional expectation**. The vertical bar | means "given that we know." So this reads: "The expected value of Mₙ, *given* that we know everything that happened up to step n−1, equals Mₙ₋₁."
- In plain terms: knowing the full history of the game, your best guess for the next value is just the current value. The past gives you no useful information about the future direction.

For the fair coin-flip game, Mₙ = Sₙ (cumulative winnings) is a martingale. Each new flip adds +1 or −1 with equal probability, so on average it adds zero.

**Doob's Optional Stopping Theorem (1953):**

This theorem, proved by mathematician Joseph Doob, formalizes the idea that you cannot beat a fair game.

*Informal statement:* For any fair game (martingale), no matter how clever your strategy for choosing when to quit, your expected winnings when you stop are equal to your starting wealth.

*Formal statement:* Let *Mₙ* be a martingale and let *τ* (the Greek letter tau) be any **stopping time** — a rule for when to quit that uses only information you have accumulated so far (you are not allowed to look into the future). Then, under reasonable conditions:

> **E[Mτ] = E[M₀]**

This says: "The expected value of M at your stopping time τ equals the expected value of M at the start." For a gambler starting with M₀ = 0, this means expected winnings at stopping = 0, always, for any strategy.

**What is a stopping time?**

A stopping time *τ* is a decision rule of the form: "I will stop after step n if [some condition based on what has happened so far]." Examples:
- Stop after exactly 100 flips (fixed in advance)
- Stop the first time I am ahead by €10
- Stop when I have lost €50
- Stop after 1,000 flips or when I am ahead by €5, whichever comes first

All of these are valid stopping times. Doob's theorem covers all of them. The one thing you cannot do: stop based on what will happen in the future (which is not possible in reality, but has to be ruled out mathematically).

**Why the doubling strategy fails:**

The doubling strategy does guarantee that you will eventually be ahead — but only if you have infinite money and infinite time. In practice:
- If your budget is finite, there is a real probability of ruin before recovery
- The expected time to recovery is infinite (E[τ] = ∞)
- When E[τ] = ∞, Doob's theorem no longer guarantees E[Mτ] = 0 — it can guarantee E[Mτ] ≤ 0

In other words: the strategy seems to work until it catastrophically doesn't.

**Key concepts introduced:** martingale, conditional expectation, stopping time, Doob's Optional Stopping Theorem.

---

## Act 3 — SPRT: Wald's Sequential Probability Ratio Test (1945)

### The Simulation

Two coins are introduced. One is fair (*H₀*: the null hypothesis — "nothing interesting is happening"). The other is slightly biased toward heads (*H₁*: the alternative hypothesis — "something real is going on"). The user does not know which coin they have been given.

Each flip generates a running **score** — the likelihood ratio Λₙ — plotted over time. Two horizontal threshold lines appear:
- An upper line: if the score crosses this, we conclude the coin is biased
- A lower line: if the score falls below this, we conclude the coin is fair

The simulation runs and the score drifts toward one boundary or the other.

Users can adjust: which coin is actually being used, the significance level α (how careful we are about false positives), the acceptable false negative rate β, and the hypothesized bias δ.

### Intuitive Explanation

> You are handed a coin. You suspect it might be unfair, but you are not sure. After each flip, you ask: "How much more likely is this sequence of results if the coin is biased, compared to if it is fair?" You keep a running tally of this ratio. When the tally gets high enough, you are confident the coin is biased. When it gets low enough, you are confident it is fair.
>
> Abraham Wald asked in 1945: what is the most *efficient* way to do this? How few flips do you need, on average, to reach a confident conclusion? His answer — the Sequential Probability Ratio Test — is provably optimal. It reaches a decision faster than any other test that offers the same guarantees against being wrong.
>
> But SPRT has a major practical limitation: you have to specify *in advance* exactly how biased you think the coin might be. If you guess the bias wrong, the test loses much of its power. In real A/B testing, we rarely know this in advance.

### Mathematical Formulation

**Hypotheses:**

In statistics, we frame a question as a competition between two stories:
- *H₀* (the **null hypothesis**): the coin is fair; the probability of heads is p = 0.5. "Nothing is happening."
- *H₁* (the **alternative hypothesis**): the coin is biased; the probability of heads is p = 0.5 + δ, where δ (the Greek letter delta) represents the size of the bias. "Something real is happening."

**The likelihood ratio:**

After n flips, we compute how much more likely our observed sequence of flips is under H₁ compared to H₀. This is the **likelihood ratio**:

> **Λₙ = [Probability of observing these n flips if H₁ is true] ÷ [Probability of observing these n flips if H₀ is true]**

Written more compactly using product notation (∏, the uppercase Greek letter pi, meaning "multiply all of these together"):

> **Λₙ = ∏ᵢ₌₁ⁿ f₁(xᵢ) ÷ ∏ᵢ₌₁ⁿ f₀(xᵢ)**

Here, *f₁(xᵢ)* means "the probability of observing outcome xᵢ if H₁ is true," and *f₀(xᵢ)* means the same under H₀. The ∏ symbol means we multiply together the probabilities for each individual flip.

**Interpreting Λₙ:**
- Λₙ = 1 means the data is equally consistent with both hypotheses
- Λₙ = 10 means the data is 10 times more likely under H₁ than H₀ — evidence for bias
- Λₙ = 0.1 means the data is 10 times more likely under H₀ — evidence for fairness

**Decision rule:**

Choose two error tolerances:
- *α* (the Greek letter alpha): the maximum acceptable probability of concluding "biased" when the coin is actually fair (false positive rate; typically 0.05)
- *β* (the Greek letter beta): the maximum acceptable probability of concluding "fair" when the coin is actually biased (false negative rate; typically 0.2)

Stop and decide when:
- Λₙ ≥ (1 − β) ÷ α → **Reject H₀** (conclude: coin is biased)
- Λₙ ≤ β ÷ (1 − α) → **Accept H₀** (conclude: coin is fair)
- Otherwise: keep flipping

**Why Λₙ is a martingale under H₀:**

This is the key statistical property. When H₀ is true (coin really is fair), each new flip multiplies Λₙ by a factor whose average value is exactly 1. Here is why:

Each new flip contributes a factor *f₁(x) ÷ f₀(x)*. If H₀ is true, x is drawn from f₀. The expected value of this factor is:

> E[f₁(x) ÷ f₀(x)] = Σ f₁(x) = 1

(The sum of all probabilities under H₁ equals 1 — they are, after all, probabilities.) Each new factor averages to 1, so Λₙ neither trends up nor down on average. It is a martingale under H₀.

Under H₁ (coin really is biased), the factors average to more than 1, so Λₙ drifts upward — that is the signal the test detects.

**Introducing Markov's Inequality:**

We need one more tool before we can talk about why SPRT controls error rates.

*Markov's Inequality* is a simple but powerful result. It says: if you know the average value of something, you can limit how often it can be very large.

Formally, for any non-negative quantity X with finite expected value E[X]:

> **P(X ≥ c) ≤ E[X] ÷ c**

In plain language: "The probability that X is at least c can be no larger than the average of X divided by c."

*Example:* If the average income in a town is €50,000, then at most 10% of people can earn €500,000 or more (because 50,000 ÷ 500,000 = 0.10). If more than 10% earned that much, the average would have to be higher.

For our purposes: if Λₙ is a martingale under H₀, then E[Λₙ] = 1. Markov's inequality then says:

> P(Λₙ ≥ 1/α) ≤ α

The probability of a false positive at any single moment n is at most α. Good — but this only applies at one specific moment. What about all the moments combined?

**Introducing Ville's Inequality:**

Jean Ville (1939) proved a remarkable extension of Markov's inequality for stochastic processes — sequences of random values over time.

*Markov* bounds the probability at a single point in time.  
*Ville* bounds the probability across all points in time simultaneously.

Formally, for any non-negative martingale Mₙ starting at M₀ = 1:

> **P(sup Mₙ ≥ c) ≤ 1 ÷ c**

Here, **sup** (short for supremum, the mathematical term for "maximum") means: the highest value the process ever reaches, across any and all steps. Setting c = 1/α:

> **P(Λₙ ever reaches 1/α or higher) ≤ α**

In plain language: the probability that the likelihood ratio ever crosses our rejection threshold — at any point, across all flips, forever — is at most α. Even if you peek at the data after every single flip, the false positive rate stays bounded.

This is the **anytime-valid** guarantee. You cannot inflate your error rate by looking repeatedly.

**The critical weakness of SPRT:**

SPRT requires you to specify *δ* — the exact size of the effect — in advance. This is used to compute f₁(x). If you choose δ = 0.1 but the true bias is 0.05, the test is poorly calibrated. In a laboratory, you might have strong prior knowledge. In an A/B test on a live product, you rarely do.

**Key concepts introduced:** null and alternative hypothesis, likelihood ratio, Markov's inequality, Ville's inequality, anytime-valid testing, Wald 1945.

---

## Act 4 — mSPRT: The Mixture Sequential Probability Ratio Test

### The Simulation

The same setup as Act 3, but the user no longer specifies δ in advance. Instead, a new slider appears: *τ* (the Greek letter tau), which controls the width of a "prior belief" over possible effect sizes.

The mSPRT statistic ΛₙH is plotted over time. Only the upper threshold (1/α) is shown — there is no lower boundary, because mSPRT cannot definitively confirm the null. Users can see multiple runs: some cross the threshold early, some never do within the allotted window.

A comparison mode lets users show SPRT with a wrong δ alongside mSPRT — illustrating how mSPRT degrades more gracefully when the true effect size is unknown.

### Intuitive Explanation

> SPRT's fatal flaw: you must know the effect size in advance. The mSPRT's elegant fix: instead of betting on one specific effect size, you bet on all of them at once.
>
> Imagine you are not sure how biased the coin might be. So you assemble a panel of experts. Expert A thinks the bias is very small (δ = 0.01). Expert B thinks it is moderate (δ = 0.05). Expert C thinks it is large (δ = 0.15). Each expert runs their own SPRT. At each step, you take a weighted average of all their likelihood ratios — weighted by how plausible you think each expert's guess is.
>
> Remarkably, this averaged score is still a martingale under H₀ — just like the individual scores. So Ville's inequality still applies, and the anytime-valid guarantee is preserved. You have gained robustness to effect size uncertainty without giving up any of the mathematical protection.

**Why the average of martingales is a martingale:**

This follows from the linearity of expected value. If A and B are both martingales, then any weighted average w·A + (1−w)·B is also a martingale, because:

> E[w·Aₙ + (1−w)·Bₙ | past] = w·E[Aₙ | past] + (1−w)·E[Bₙ | past] = w·Aₙ₋₁ + (1−w)·Bₙ₋₁

The weighted average of values-equal-to-their-past is still equal-to-its-past. Averaging does not break the martingale property.

### Mathematical Formulation

**The mixing idea:**

Let *H* denote a **prior distribution** over effect sizes. Think of H as a probability distribution describing how plausible each value of δ is. The mSPRT statistic is the expected value of the ordinary SPRT likelihood ratio, averaged over all effect sizes according to H:

> **ΛₙH = ∫ Λₙᵟ dH(δ)**

Breaking this down:
- *Λₙᵟ* means "the likelihood ratio we would have computed if we had assumed effect size δ"
- *dH(δ)* means "weighted by how probable effect size δ is, according to H"
- The integral ∫ (a stretched S, meaning "add up") does this averaging continuously across all possible values of δ

Think of it as: "What is the average likelihood ratio across all the experts on our panel, weighted by their credibility?"

**Closed form for Normal observations:**

In the most common practical case, where:
- Individual observations xᵢ are drawn from a Normal distribution with mean μ and variance σ²
- The mixing distribution H is a Normal distribution with mean 0 and standard deviation τ

The integral has an exact algebraic solution:

> **ΛₙH = √(σ² ÷ (σ² + n·τ²)) × exp(τ² · n² · x̄ₙ² ÷ (2σ²·(σ² + n·τ²)))**

Let's unpack every symbol:

- **σ** (lowercase sigma): the standard deviation of individual observations — how noisy the data is. σ² is the variance (standard deviation squared).
- **n**: the number of observations collected so far
- **τ** (tau): the standard deviation of the prior H — controls how wide a range of effect sizes we consider plausible
- **x̄ₙ** (x-bar sub n): the sample mean after n observations — just the ordinary average of all observed values
- **exp(...)**: the exponential function, e raised to the power of what is inside the parentheses. This grows rapidly when its argument is large.
- **√(...)**: square root of what is inside the parentheses

In plain English, this formula says: "The mSPRT score depends on how large the observed average is (x̄ₙ), how many observations we have (n), how noisy the data is (σ), and how wide a range of effects we consider plausible (τ)."

**Decision rule:**

> Stop and reject H₀ when: **ΛₙH ≥ 1 ÷ α**

There is no lower boundary — you cannot definitively confirm the null. In practice, experiments run for a fixed maximum duration (set in advance), and if the threshold is never crossed, you simply fail to detect an effect.

**The role of τ:**

τ is the most important tuning parameter. It controls the tradeoff between sensitivity and robustness:

| τ is... | The test is... | Best for... |
|---|---|---|
| Small (e.g. 0.01) | Conservative, slow to reject | Detecting very small effects |
| Large (e.g. 0.5) | Aggressive, fast to reject for large effects | Detecting large effects quickly |
| Matched to true δ | Near-optimal | When you have a good prior estimate |

The key insight: there is no universally optimal τ. But calibrating τ from historical experiments — asking "what distribution of effect sizes have we seen before?" — gives a principled answer. This is what Eppo's GAVI approach does.

**Why Ville's inequality still applies:**

The mSPRT statistic ΛₙH is a non-negative martingale under H₀ (because it is a mixture of martingales, each of which is a martingale under H₀). Ville's inequality therefore applies directly:

> **P(ΛₙH ever reaches 1/α) ≤ α**

No matter when you peek, no matter how many times, the probability of a false positive across all time is bounded by α.

**Key concepts introduced:** mixture distribution, prior distribution, the role of τ, robustness to effect size uncertainty, mSPRT (Johari et al. 2017, building on Robbins 1970).

---

## Act 5 — Eppo's Implementation: Sequential Testing with Variance Reduction

### The Simulation

A full A/B test simulation. Two groups: control and treatment. Observations arrive over time — representing, for example, user conversions on a website. The mSPRT statistic is plotted continuously. A toggle switches variance reduction (CUPED) on and off, showing how the confidence sequence tightens when pre-experiment covariates are used.

Users can adjust: sample size, true effect size, τ, and the correlation between the pre-experiment covariate and the outcome (which controls how much variance reduction is achieved).

### Intuitive Explanation

> Eppo's implementation combines two ideas. The first is mSPRT — which gives the always-valid stopping guarantee we have been building toward. The second is **variance reduction**, specifically a technique called CUPED (Controlled-experiment Using Pre-Experiment Data).
>
> Here is the core idea of variance reduction. Suppose you are testing whether a new website feature increases purchases. You know, from pre-experiment data, that some users are just generally heavy purchasers regardless of the feature. This pre-existing difference between users is noise — it has nothing to do with your treatment. CUPED removes this noise before the test runs. A less noisy signal means you need fewer observations to detect a real effect.
>
> The beautiful part: because the noise is removed *before* the test statistic is computed, the anytime-valid guarantee of mSPRT is fully preserved. The two techniques compose cleanly.

### Mathematical Formulation

**CUPED — the variance reduction step:**

Let:
- *Y* (uppercase): the outcome you care about (e.g., whether a user made a purchase)
- *X* (uppercase): a pre-experiment covariate — some measurement from before the experiment started that correlates with Y (e.g., the user's purchase history from last month)
- *E[X]* (expected value of X): the average value of X across all users

The CUPED-adjusted outcome is:

> **Y* = Y − θ · (X − E[X])**

Breaking this down:
- *θ* (the Greek letter theta): a coefficient — a number we choose to make the adjustment as effective as possible
- *(X − E[X])*: the pre-experiment variable, centered so its average is zero (subtracting the mean removes the "typical user" effect)
- *Y − θ · (X − E[X])*: the outcome after removing the component that was predictable from pre-experiment behavior

**Choosing θ optimally:**

We want to choose θ so that Y* is as predictable as possible — i.e., has the lowest possible variance. The optimal value is:

> **θ = Cov(Y, X) ÷ Var(X)**

Where:
- **Cov(Y, X)** (covariance of Y and X): a measure of how strongly Y and X move together. If users who purchased more before the experiment also purchase more during it, this is large and positive.
- **Var(X)** (variance of X): how spread out the pre-experiment variable is across users

This is the same formula as the slope in a linear regression of Y on X — a familiar concept from high school statistics.

**How much variance is reduced:**

The variance of the adjusted outcome Y* is:

> **Var(Y*) = Var(Y) · (1 − ρ²)**

Where *ρ* (the Greek letter rho) is the **correlation coefficient** between Y and X — a number between −1 and +1 that measures how strongly they are linearly related.

- If ρ = 0 (X and Y are uncorrelated): Var(Y*) = Var(Y) — no reduction
- If ρ = 0.5: Var(Y*) = Var(Y) · (1 − 0.25) = 0.75 · Var(Y) — 25% reduction
- If ρ = 0.9: Var(Y*) = Var(Y) · (1 − 0.81) = 0.19 · Var(Y) — 81% reduction

A large correlation between pre-experiment history and the outcome metric produces dramatic variance reduction — meaning you need far fewer observations to detect a real effect.

**Why the mSPRT guarantee is preserved:**

The mSPRT is then applied to Y* (the adjusted outcome) rather than Y. All the same formulas apply, just with a smaller σ² (because the variance of Y* is smaller than the variance of Y). The martingale property is unaffected — we have simply changed the input data to be less noisy. Ville's inequality still holds, and the test is still anytime-valid.

**GAVI — calibrating τ from historical data:**

As discussed in Act 4, τ must be chosen. Eppo's GAVI (Generalized Adjusted Variance Inflation) approach sets τ empirically: by looking at the distribution of effect sizes observed in past experiments on the same platform. If most past experiments showed effects in the range of δ = 0.01 to δ = 0.05, τ is set to match that range. This gives the test near-optimal power for the kinds of effects the platform typically encounters.

**The full picture:**

The complete pipeline is:
1. Collect pre-experiment covariate X for each user
2. Compute θ from historical data
3. Adjust each observation: Y* = Y − θ · (X − E[X])
4. Calibrate τ from historical effect size distribution (GAVI)
5. Run mSPRT on Y*, with parameter τ, stopping threshold 1/α
6. The test is anytime-valid, variance-reduced, and robust to effect size uncertainty

**Key concepts introduced:** CUPED, pre-experiment covariate, variance reduction, correlation, GAVI, τ calibration, the full Eppo sequential testing pipeline.

---

## Navigation and UX Design

### Between Acts

Each transition features a brief interstitial card containing:
- A one-sentence bridge connecting the previous act to the next (e.g., "Now let's put money on each step...")
- A "Key insight so far" box — a single sentence summary of the most important concept just covered
- An optional "Go deeper" toggle that expands a more detailed mathematical treatment for users who want it

### Persistent Controls

A slider panel available throughout all acts:
- **Probability p** (or effect size δ from Act 3 onward)
- **Significance level α** — how careful we are about false positives
- **Number of steps / observations n** — how long to run
- **Simulation speed**
- **Number of simultaneous runs** — showing the distribution of outcomes

### Visual Design Principles

- The same visual object (the path/process) carries through all five acts, relabeled at each stage
- Threshold lines appear gradually — none in Act 1, the ±√n envelope in Act 1, both SPRT thresholds in Act 3, only the upper threshold from Act 4 onward
- Mathematical formula panels slide in/out; they are never shown by default in the first run through
- Formulas are always accompanied by a plain-language translation directly below them

---

## Summary: The Through-Line

| Act | Object | What it represents | Key theorem |
|---|---|---|---|
| 1 | Random walk Sₙ | A person's position | SD grows as √n |
| 2 | Cumulative winnings Mₙ | A gambler's fortune | Doob: E[Mτ] = M₀ |
| 3 | Likelihood ratio Λₙ | Evidence against H₀ | Markov + Ville: P(ever ≥ 1/α) ≤ α |
| 4 | Mixture likelihood ΛₙH | Robust evidence, no δ needed | Ville still holds; τ controls sensitivity |
| 5 | Adjusted statistic (CUPED) | Less noisy evidence | Same guarantee, faster detection |

The core message: all five acts are the same mathematical object — a non-negative martingale — viewed through increasingly powerful lenses. The anytime-valid guarantee flows from a single elegant fact: a fair game cannot be beaten by choosing when to quit.
