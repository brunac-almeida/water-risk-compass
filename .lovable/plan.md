

## Plan: Connect Dashboard to Live GitHub JSON Data

### Data source
Fetch from `https://raw.githubusercontent.com/ozzyd-2/site-selector-dashboard/refs/heads/main/data/dashboard_data.json` on page load.

### Scoring
Keep client-side `computeTotal()` with **4 pillars** (water, climate, carbon, cost) so sliders work dynamically. Do NOT use pre-computed scenario rankings.

```
total = (water_risk×w.water + climate_load×w.climate + carbon×w.carbon + energy_cost×w.cost)
        / (w.water + w.climate + w.carbon + w.cost) × 10
```

Scale: 0–10, lower is better. Thresholds: <3 green, 3–5 amber, >5 red.

### Files to edit

**`src/pages/Dashboard.tsx`**
- Add `useState` for `loading`, `error`, `baseData` (fetched cities)
- `useEffect` fetch on mount → map JSON cities to internal shape
- Update `Weights` type to `{ water, climate, carbon, cost }`
- Update `SCENARIOS` to 4-pillar weights (balanced, carbon_priority, cost_priority, water_priority from JSON)
- Add 4th slider "Climate Load"
- Update bar chart X-axis domain `[0, 10]`, KPI display to 0–10 scale
- Show `<Skeleton>` while loading, error banner on failure
- Pass fetched cities (with lat/lng) to `DashboardMap`

**`src/components/DashboardMap.tsx`**
- Accept cities array as prop instead of hardcoded `MAP_CITIES`
- Use `latitude`/`longitude` from fetched data
- Keep existing popup HTML, legend, styling

### What stays the same
All layout, styling, components, flip cards, scatter plot fixes, progress bar fix — untouched. Only the data source and weight model change.

