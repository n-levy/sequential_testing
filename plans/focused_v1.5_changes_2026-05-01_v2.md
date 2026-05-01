# Focused Version Additional Changes v1.5 (v2)

Date: 2026-05-01

## Changes to implement

### 1. Line spacing in math/notes boxes
- Add `leading-relaxed` to the content wrapper of `ui/DisplayMathBox.tsx`
- Add `leading-relaxed` to the open-content wrapper of `ui/ShowMath.tsx`
- Add `leading-relaxed` to the simulation notes box in `shared/ABTestSim.tsx`
- Increase list item spacing from `space-y-1` to `space-y-2` in the ABTestSim notes box

### 2. Replace "CI" acronym with "confidence intervals" in plain English text
Files to update (not math notation):
- `act_hybrid/ActHybrid.tsx`: "Sequential CI throughout the experiment" → "Sequential confidence interval throughout the experiment"
- `act5/ActMagnitudeError.tsx`: "For the CI to exclude zero" → "For the confidence interval to exclude zero"
- Navigation/hero items for in-depth page (minor, keep short where space is limited)

### 3. Add "Show the math" section to ActHybrid
Insert a `<DisplayMathBox>` at the end of ActHybrid (before Key Takeaway) covering:
- Standard hybrid: independent tests, no correction needed for primary KPI
- Sequential CI formula (guardrails): time-varying multiplier m(n)
- Standard CI formula (primary KPI): fixed multiplier z_{α/2} = 1.96 at planned end date
- Union bound (Bonferroni) for the hybrid sequential variant:
  - P(any false positive) ≤ α/2 + α/2 = α
  - Shows why splitting the budget between sequential (α/2) and final (α/2) controls overall error at α

### 4. Move Act4 simulation intro text
In `act3/Act3.tsx`:
- Remove the "Simulation" intro block (h3 + paragraph) from above the four method cards
- Replace the `<h4>How methods compare in simulation</h4>` heading with the same intro block
  (h3 "Simulation" + paragraph about extending Act 1/2 simulation)

### 5. Magnitude error simulation: clarify shared settings
In `act5/ActMagnitudeError.tsx`, add a note before the ABTestSim component clarifying that
the 1000-repetition simulation below uses the same settings as the chart above (they are
the same component — the sliders apply to both).

### 6. Fix hybrid simulation annotation display
In `act_hybrid/HybridSim.tsx`:
- Increase SVG width from 700 to 800, increase margin.right from 20 to 120 (innerW stays 624)
- Update viewBox to "0 0 800 380"
- Move the "Primary KPI" annotation from left side (xEnd - 10) to right side (xEnd + 8)
- Add a white background rect behind the annotation text for readability
- Make the annotation use `text-anchor: start` (left-aligned from xEnd + 8)

### 7. Create docs/README.md
Comprehensive README covering:
- Project purpose and live URL
- Two tracks: focused (/focused) and in-depth (/in-depth)
- Tech stack
- Project structure
- Running locally and deploying

### 8. Update site/CLAUDE.md
- Correct track descriptions (focused is 5 acts, not 3 as currently implied)
- Keep under 200 lines
- Add notes about the shared event system (show-all-content)

### 9. Commit and push
