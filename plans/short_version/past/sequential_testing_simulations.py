"""
Sequential Testing for A/B Experiments — Simulations & Implementations

Companion code for the short version plan (v2).
Requires: numpy, scipy
    pip install numpy scipy
"""

import numpy as np
from scipy import stats


# ═══════════════════════════════════════════════════════════════════════════════
# 1. SIMULATION: THE PEEKING PROBLEM
# ═══════════════════════════════════════════════════════════════════════════════

def simulate_peeking(
    n_experiments: int = 10_000,
    n_obs_per_group: int = 500,
    peek_interval: int = 10,
    alpha: float = 0.05,
    seed: int = 42,
) -> dict:
    """Simulate the peeking problem under the null hypothesis.

    Returns a dict with false positive rates for:
      - 'naive_peeking': check every peek_interval observations
      - 'single_check':  check only at the end
    """
    rng = np.random.default_rng(seed)
    peek_times = list(range(peek_interval,
                            n_obs_per_group + 1,
                            peek_interval))

    false_pos_peek = 0
    false_pos_end = 0

    for _ in range(n_experiments):
        # Generate data from identical distributions (null)
        control = rng.normal(0, 1, n_obs_per_group)
        treatment = rng.normal(0, 1, n_obs_per_group)

        # --- Naive peeking ---
        ever_significant = False
        for t in peek_times:
            ctrl_t = control[:t]
            trt_t = treatment[:t]
            _, p_value = stats.ttest_ind(ctrl_t, trt_t)
            if p_value < alpha:
                ever_significant = True
                break  # stop at first significance
        if ever_significant:
            false_pos_peek += 1

        # --- Single check at the end ---
        _, p_value_end = stats.ttest_ind(control, treatment)
        if p_value_end < alpha:
            false_pos_end += 1

    return {
        "naive_peeking": false_pos_peek / n_experiments,
        "single_check": false_pos_end / n_experiments,
        "n_experiments": n_experiments,
        "n_peeks": len(peek_times),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 2. IMPLEMENTATION: BONFERRONI CORRECTION
# ═══════════════════════════════════════════════════════════════════════════════

def bonferroni_test(
    control: np.ndarray,
    treatment: np.ndarray,
    K: int,
    alpha: float = 0.05,
) -> dict:
    """Run a single-peek Bonferroni-corrected test.

    Call this function at each of the K scheduled peeks
    with the data collected so far.

    Returns:
      - 'reject': whether to reject the null
      - 'ci': the confidence interval for tau_hat
      - 'tau_hat': estimated treatment effect
      - 'z_star': adjusted critical value
    """
    n0, n1 = len(control), len(treatment)
    tau_hat = treatment.mean() - control.mean()
    se = np.sqrt(control.var(ddof=1) / n0
                 + treatment.var(ddof=1) / n1)

    # Bonferroni-adjusted critical value
    z_star = stats.norm.ppf(1 - alpha / (2 * K))

    ci_lower = tau_hat - z_star * se
    ci_upper = tau_hat + z_star * se
    reject = ci_lower > 0 or ci_upper < 0

    return {
        "reject": reject,
        "ci": (ci_lower, ci_upper),
        "tau_hat": tau_hat,
        "z_star": z_star,
        "se": se,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 3. IMPLEMENTATION: POCOCK BOUNDARIES
# ═══════════════════════════════════════════════════════════════════════════════

def pocock_critical_value(
    K: int, alpha: float = 0.05, n_sim: int = 200_000,
    seed: int = 42,
) -> float:
    """Find the Pocock boundary c_P by simulation.

    Simulates the multivariate Normal distribution of
    (Z_1, ..., Z_K) under the null and finds c_P such that
    P(max |Z_k| > c_P) = alpha.

    For production use, replace with exact multivariate
    Normal integration (e.g. mvnorm from R or PyMVPA).
    """
    rng = np.random.default_rng(seed)

    # Build the correlation matrix: Cor(Z_j, Z_k) = sqrt(min/max)
    fracs = np.arange(1, K + 1) / K
    corr = np.zeros((K, K))
    for j in range(K):
        for k in range(K):
            corr[j, k] = np.sqrt(
                min(fracs[j], fracs[k])
                / max(fracs[j], fracs[k])
            )

    # Simulate Z vectors
    samples = rng.multivariate_normal(
        np.zeros(K), corr, size=n_sim
    )
    max_abs_z = np.abs(samples).max(axis=1)

    # Find c_P: the (1 - alpha) quantile of max|Z|
    c_P = np.quantile(max_abs_z, 1 - alpha)
    return float(c_P)


def pocock_test(
    control: np.ndarray,
    treatment: np.ndarray,
    c_P: float,
) -> dict:
    """Test at a single peek using the Pocock boundary."""
    n0, n1 = len(control), len(treatment)
    tau_hat = treatment.mean() - control.mean()
    se = np.sqrt(control.var(ddof=1) / n0
                 + treatment.var(ddof=1) / n1)
    z_stat = tau_hat / se
    reject = abs(z_stat) > c_P

    ci_lower = tau_hat - c_P * se
    ci_upper = tau_hat + c_P * se

    return {
        "reject": reject,
        "z_stat": z_stat,
        "ci": (ci_lower, ci_upper),
        "tau_hat": tau_hat,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 4. IMPLEMENTATION: O'BRIEN–FLEMING BOUNDARIES
# ═══════════════════════════════════════════════════════════════════════════════

def obf_critical_value(k: int, K: int,
                       alpha: float = 0.05) -> float:
    """O'Brien-Fleming critical value at peek k of K.

    Uses the Lan-DeMets spending function approximation:
        c_k = z_{alpha/2} / sqrt(k / K)
    """
    z_alpha2 = stats.norm.ppf(1 - alpha / 2)
    t_k = k / K  # information fraction
    return z_alpha2 / np.sqrt(t_k)


def obf_test(
    control: np.ndarray,
    treatment: np.ndarray,
    k: int,
    K: int,
    alpha: float = 0.05,
) -> dict:
    """Test at peek k of K using O'Brien-Fleming."""
    n0, n1 = len(control), len(treatment)
    tau_hat = treatment.mean() - control.mean()
    se = np.sqrt(control.var(ddof=1) / n0
                 + treatment.var(ddof=1) / n1)
    z_stat = tau_hat / se
    c_k = obf_critical_value(k, K, alpha)
    reject = abs(z_stat) > c_k

    ci_lower = tau_hat - c_k * se
    ci_upper = tau_hat + c_k * se

    return {
        "reject": reject,
        "z_stat": z_stat,
        "c_k": c_k,
        "ci": (ci_lower, ci_upper),
        "tau_hat": tau_hat,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 5. SIMULATION: COMPARING ALL METHODS
# ═══════════════════════════════════════════════════════════════════════════════

def compare_methods(
    n_experiments: int = 10_000,
    n_obs_per_group: int = 2000,
    K: int = 4,
    alpha: float = 0.05,
    seed: int = 42,
) -> dict:
    """Compare false positive rates of all methods."""
    rng = np.random.default_rng(seed)
    peek_every = n_obs_per_group // K

    # Pre-compute critical values
    z_bonf = stats.norm.ppf(1 - alpha / (2 * K))
    c_P = pocock_critical_value(K, alpha)

    counts = {
        "naive": 0,
        "bonferroni": 0,
        "pocock": 0,
        "obf": 0,
    }

    for _ in range(n_experiments):
        ctrl = rng.normal(0, 1, n_obs_per_group)
        trt = rng.normal(0, 1, n_obs_per_group)

        rej = {m: False for m in counts}

        for k in range(1, K + 1):
            n = k * peek_every
            c, t = ctrl[:n], trt[:n]
            tau = t.mean() - c.mean()
            se = np.sqrt(c.var(ddof=1) / n + t.var(ddof=1) / n)
            z = abs(tau / se)

            # Naive: standard z > 1.96
            if z > stats.norm.ppf(1 - alpha / 2):
                rej["naive"] = True

            # Bonferroni
            if z > z_bonf:
                rej["bonferroni"] = True

            # Pocock
            if z > c_P:
                rej["pocock"] = True

            # O'Brien-Fleming
            c_k = stats.norm.ppf(1 - alpha / 2) / np.sqrt(k / K)
            if z > c_k:
                rej["obf"] = True

        for m, rejected in rej.items():
            if rejected:
                counts[m] += 1

    return {m: c / n_experiments for m, c in counts.items()}


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN: RUN ALL DEMOS
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 60)
    print("1. PEEKING PROBLEM SIMULATION")
    print("=" * 60)
    results = simulate_peeking()
    print(f"False positive rate (single check): "
          f"{results['single_check']:.1%}")
    print(f"False positive rate (peeking every "
          f"10 obs, {results['n_peeks']} peeks): "
          f"{results['naive_peeking']:.1%}")

    print()
    print("=" * 60)
    print("2. BONFERRONI CORRECTION")
    print("=" * 60)
    rng = np.random.default_rng(0)
    K = 4
    N_total = 2000
    peek_every = N_total // K
    control_all = rng.normal(10, 3, N_total)
    treatment_all = rng.normal(10.3, 3, N_total)  # small effect

    for k in range(1, K + 1):
        n = k * peek_every
        result = bonferroni_test(
            control_all[:n], treatment_all[:n], K=K
        )
        ci = result["ci"]
        status = "REJECT" if result["reject"] else "continue"
        print(f"Peek {k}/{K} (n={n}): "
              f"tau={result['tau_hat']:.3f}, "
              f"CI=[{ci[0]:.3f}, {ci[1]:.3f}], "
              f"z*={result['z_star']:.3f} -> {status}")

    print()
    print("=" * 60)
    print("3. POCOCK BOUNDARIES")
    print("=" * 60)
    c_P = pocock_critical_value(K)
    print(f"Pocock critical value for K={K}: {c_P:.3f}")

    rng = np.random.default_rng(0)
    control_all = rng.normal(10, 3, N_total)
    treatment_all = rng.normal(10.3, 3, N_total)

    for k in range(1, K + 1):
        n = k * peek_every
        result = pocock_test(
            control_all[:n], treatment_all[:n], c_P=c_P
        )
        ci = result["ci"]
        status = "REJECT" if result["reject"] else "continue"
        print(f"Peek {k}/{K} (n={n}): "
              f"Z={result['z_stat']:.3f}, "
              f"CI=[{ci[0]:.3f}, {ci[1]:.3f}] -> {status}")

    print()
    print("=" * 60)
    print("4. O'BRIEN-FLEMING BOUNDARIES")
    print("=" * 60)
    rng = np.random.default_rng(0)
    control_all = rng.normal(10, 3, N_total)
    treatment_all = rng.normal(10.3, 3, N_total)

    for k in range(1, K + 1):
        n = k * peek_every
        result = obf_test(
            control_all[:n], treatment_all[:n], k=k, K=K
        )
        ci = result["ci"]
        status = "REJECT" if result["reject"] else "continue"
        print(f"Peek {k}/{K} (n={n}): "
              f"Z={result['z_stat']:.3f}, "
              f"c_k={result['c_k']:.3f}, "
              f"CI=[{ci[0]:.3f}, {ci[1]:.3f}] -> {status}")

    print()
    print("=" * 60)
    print("5. COMPARING ALL METHODS (false positive rates)")
    print("=" * 60)
    rates = compare_methods(K=4)
    print(f"{'Method':<15} {'FPR':>8}")
    print("-" * 25)
    for method, fpr in rates.items():
        label = method.upper().replace("_", " ")
        marker = " ***" if fpr > 0.06 else ""
        print(f"{label:<15} {fpr:>7.1%}{marker}")
