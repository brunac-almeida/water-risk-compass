## Refactor SiteRecommender to match Dashboard scoring

Align the Recommender wizard's data, pillars, scale, and formula with the Dashboard so rankings are identical for the same weights.

### 1. Data source
- Remove the hardcoded `BASE_DATA` array.
- Fetch from the same JSON URL as the Dashboard: `https://raw.githubusercontent.com/ozzyd-2/site-selector-dashboard/refs/heads/main/data/dashboard_data.json`
- Map `data.cities[]` → `{ city, state, water_risk, climate_load, carbon, energy_cost }` from `c.scores.*`.
- Add `loading` / `error` state with the same null-safe pattern (`?? 0` before `.toFixed()`).
- Show a `Skeleton`-based loading state inside the wizard card while fetching.

### 2. Pillars + scoring
Replace 3-pillar (water/carbon/cooling) with 4-pillar matching Dashboard:

```text
Weights = { water, climate, carbon, cost }
total = 10 × ( water_risk·Wwater + climate_load·Wclimate
             + carbon·Wcarbon + energy_cost·Wcost )
        ÷ ( Wwater + Wclimate + Wcarbon + Wcost )
```

- Score scale switches from **0–100 → 0–10**.
- Update risk band thresholds to Dashboard's: `<3` Low (green), `3–5` Medium (amber), `>5` High (coral).
- Update visible "/100" → "/10" and the tooltip text accordingly.

### 3. Wizard weight mapping (4 weights)
Same wizard UI/copy/flow. Only the weight derivation changes:

- **Facility type** (base profile, all 4 weights):
  - Cloud / Hyperscale → `{water 2.0, climate 1.0, carbon 1.5, cost 1.5}`
  - Colocation → `{1.5, 1.5, 1.5, 1.5}`
  - AI / GPU Cluster → `{1.0, 1.5, 1.0, 2.5}` (energy-heavy)
  - Enterprise → `{1.5, 1.0, 1.5, 2.0}`
- **Critical constraint** (override one weight to 3.0):
  - Water Availability → `water = 3.0`
  - Carbon Footprint → `carbon = 3.0`
  - Cooling Cost → `cost = 3.0` (relabel intent: maps to Energy Cost pillar)
  - Balanced → reset to `{1.5, 1.5, 1.5, 1.5}`
- **Risk tolerance** (apply to all 4):
  - Low → ×1.3 across all four weights
  - Medium → no change
  - High → keep largest weight, halve the other three
- **Sustainability slider**:
  - `≥4` → `water += 0.5`, `carbon += 0.5`
  - `≤2` → `climate += 0.5`, `cost += 0.5`
- Round each to 1 decimal.

### 4. Explore in Dashboard handoff
Use the Dashboard's existing share-link param schema so weights pre-load exactly:

```ts
navigate(`/dashboard?ww=${w.water}&wc=${w.climate}&wb=${w.carbon}&we=${w.cost}`);
```

(`ww`=water, `wc`=climate, `wb`=carbon, `we`=cost — already parsed in `Dashboard.tsx` lines 80–111.)

### 5. UI text touch-ups (minimal, no layout change)
- "Your Profile" line: `Water×{w.water} · Climate×{w.climate} · Carbon×{w.carbon} · Cost×{w.cost}`
- "/100" → "/10" next to the winner score.
- Update tooltip describing the scale + pillars.

### Files
- `src/pages/SiteRecommender.tsx` — only file changed.

### Verification (manual, post-build)
1. Run wizard with any choices → note the weights shown in "Your Profile" and the city ranking.
2. Open Dashboard, drag sliders to those exact weights.
3. Rankings + scores should match to one decimal. (Both use the same formula and same JSON.)
4. Click "Explore in Dashboard" — sliders should already be set to the wizard's weights.
