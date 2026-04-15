

## Plan: Add Info Tooltips to Scenario Buttons

### What changes

Add a small circle-info icon next to each scenario label in the sidebar. On hover, a tooltip displays a description of what that scenario prioritizes. No layout shifts, no styling changes.

### Implementation

**`src/pages/Dashboard.tsx`**

1. Import `Info` from `lucide-react` and `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` from `@/components/ui/tooltip`.

2. Add a `description` field to the `SCENARIOS` array with the exact tooltip text:
   - Balanced Sustainability → "Equal emphasis on water risk, carbon impact, and energy cost, with moderate climate weighting. Good all-around starting point."
   - Carbon Priority → "Grid carbon intensity and state-level emissions dominate the ranking. Best for organizations with net-zero or emissions reduction commitments."
   - Cost Priority → "Industrial electricity price and energy cost drive the ranking. Best for operations where energy spend is the primary site selection constraint."
   - Water Priority → "Water scarcity, drought risk, water pricing, and precipitation patterns carry the heaviest weight. Best for regions where long-term water access is the critical concern."

3. In the scenario button (lines 221–235), add a `TooltipProvider`/`Tooltip`/`TooltipTrigger`/`TooltipContent` wrapping a small `<Info size={14} />` icon next to the scenario label. The icon sits inline after the label text. The tooltip has `max-w-[240px]` and small text.

4. The icon uses `text-muted-foreground` styling and `onClick` stops propagation so clicking the info icon doesn't trigger the scenario switch.

### No other changes
Layout, colors, tab styling, ranking logic — all untouched. Only one file edited.

