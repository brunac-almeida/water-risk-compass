import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell,
} from "recharts";
import { X, Plus } from "lucide-react";
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tooltip as ShadTooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type CityRow = {
  city: string;
  state: string;
  water_risk: number;
  climate_load: number;
  carbon: number;
  energy_cost: number;
  avg_annual_precipitation: number;
  total_score: number;
};

type Weights = { water: number; climate: number; carbon: number; cost: number };

const SERIES_COLORS = [
  "hsl(184,100%,26%)",
  "hsl(13,65%,47%)",
  "hsl(35,88%,40%)",
  "hsl(280,60%,45%)",
];

const RISK_COLOR = (s: number) =>
  s < 3 ? "text-risk-green" : s <= 5 ? "text-risk-amber" : "text-risk-coral";

interface Props {
  cities: CityRow[];
  weights: Weights;
  initialSelection: string[];
}

const CompareView = ({ cities, weights, initialSelection }: Props) => {
  const [selected, setSelected] = useState<string[]>(
    initialSelection.length > 0 ? initialSelection.slice(0, 4) : cities.slice(0, 3).map(c => c.city)
  );

  const rows = useMemo(
    () => selected.map(name => cities.find(c => c.city === name)).filter(Boolean) as CityRow[],
    [selected, cities]
  );

  const wSum = weights.water + weights.climate + weights.carbon + weights.cost;

  const addCity = (city: string) => {
    if (selected.includes(city) || selected.length >= 4) return;
    setSelected(prev => [...prev, city]);
  };
  const removeCity = (city: string) => setSelected(prev => prev.filter(c => c !== city));

  // Grouped bar: each city is a series across the 4 weighted dimensions
  const barData = [
    { dim: "Water", ...Object.fromEntries(rows.map(r => [r.city, +(r.water_risk * weights.water / wSum * 10).toFixed(2)])) },
    { dim: "Climate", ...Object.fromEntries(rows.map(r => [r.city, +(r.climate_load * weights.climate / wSum * 10).toFixed(2)])) },
    { dim: "Carbon", ...Object.fromEntries(rows.map(r => [r.city, +(r.carbon * weights.carbon / wSum * 10).toFixed(2)])) },
    { dim: "Energy Cost", ...Object.fromEntries(rows.map(r => [r.city, +(r.energy_cost * weights.cost / wSum * 10).toFixed(2)])) },
  ];

  const radarData = [
    { axis: "Water", ...Object.fromEntries(rows.map(r => [r.city, +r.water_risk.toFixed(3)])) },
    { axis: "Climate", ...Object.fromEntries(rows.map(r => [r.city, +r.climate_load.toFixed(3)])) },
    { axis: "Carbon", ...Object.fromEntries(rows.map(r => [r.city, +r.carbon.toFixed(3)])) },
    { axis: "Energy Cost", ...Object.fromEntries(rows.map(r => [r.city, +r.energy_cost.toFixed(3)])) },
  ];

  const available = cities.filter(c => !selected.includes(c.city));

  return (
    <div className="space-y-6">
      {/* Selection chips */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-bold text-foreground">
            Comparing {rows.length} {rows.length === 1 ? "city" : "cities"}{" "}
            <span className="font-normal text-muted-foreground">(up to 4)</span>
          </h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" disabled={selected.length >= 4 || available.length === 0}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add city
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-1 max-h-72 overflow-auto">
              {available.map(c => (
                <button
                  key={c.city}
                  onClick={() => addCity(c.city)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-muted text-left"
                >
                  <span>{c.city}</span>
                  <span className="font-mono text-xs text-muted-foreground">{c.total_score.toFixed(1)}</span>
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-wrap gap-2">
          {rows.map((r, i) => (
            <span
              key={r.city}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
              style={{ borderColor: SERIES_COLORS[i], color: SERIES_COLORS[i] }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: SERIES_COLORS[i] }} />
              {r.city}
              <button
                onClick={() => removeCity(r.city)}
                className="ml-1 opacity-60 hover:opacity-100"
                aria-label={`Remove ${r.city}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Side-by-side metric table */}
      <div className="bg-card rounded-lg border border-border p-5 overflow-x-auto">
        <h4 className="font-display text-sm font-bold text-foreground mb-1">Side-by-Side Metrics</h4>
        <p className="text-[11px] text-muted-foreground mb-4">
          Raw pillar scores and Annual Precipitation are fixed values from the Python engine. Only Total Impact Score updates as weights change.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="py-2 pr-4 font-semibold">Metric</th>
              {rows.map((r, i) => (
                <th key={r.city} className="py-2 px-3 font-semibold" style={{ color: SERIES_COLORS[i] }}>
                  {r.city}
                  <div className="text-[10px] font-normal text-muted-foreground">{r.state}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {[
              { label: "Total Impact Score", get: (r: CityRow) => r.total_score, color: true, lowerBetter: true, suffix: " /10" },
              { label: "Water Risk (raw)", get: (r: CityRow) => r.water_risk, lowerBetter: true },
              { label: "Climate Load (raw)", get: (r: CityRow) => r.climate_load, lowerBetter: true },
              { label: "Carbon (raw)", get: (r: CityRow) => r.carbon, lowerBetter: true },
              { label: "Energy Cost (raw)", get: (r: CityRow) => r.energy_cost, lowerBetter: true },
              { label: "Annual Precipitation", get: (r: CityRow) => r.avg_annual_precipitation, suffix: " in/yr", lowerBetter: false },
            ].map((m) => {
              const vals = rows.map(m.get);
              const best = m.lowerBetter ? Math.min(...vals) : Math.max(...vals);
              return (
                <tr key={m.label} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-4 font-body text-muted-foreground">{m.label}</td>
                  {rows.map((r, i) => {
                    const v = m.get(r);
                    const isBest = v === best && rows.length > 1;
                    const colorCls = m.color ? RISK_COLOR(v as number) : "text-foreground";
                    return (
                      <td key={r.city} className={`py-2 px-3 ${colorCls} ${isBest ? "font-bold" : ""}`}>
                        {typeof v === "number" ? v.toFixed(2) : v}
                        {m.suffix ?? ""}
                        {isBest && <span className="ml-1 text-[10px] text-risk-green">★</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-[11px] text-muted-foreground mt-3">★ marks the best value in the row (lower is better for risk metrics; higher for precipitation).</p>
        <p className="text-[11px] text-muted-foreground mt-1">
          Energy Cost raw score of 0.00 indicates this city normalized to the lowest energy cost in the cohort — not missing data.
        </p>
      </div>

      {/* Grouped bar + radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border p-5">
          <h4 className="font-display text-sm font-bold text-foreground mb-1">Weighted Contribution by Dimension</h4>
          <p className="text-[11px] text-muted-foreground mb-3">
            Each bar shows (pillar score × user weight) ÷ sum of weights × 10 — the pillar's proportional contribution to the Total Impact Score. Bars sum to the Total Impact Score.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(218,26%,90%)" />
              <XAxis dataKey="dim" tick={{ fontSize: 11, fill: "hsl(213,18%,49%)" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(213,18%,49%)" }}
                label={{
                  value: "Contribution to score (0–10)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 11, fill: "hsl(213,18%,49%)", textAnchor: "middle" },
                }}
              />
              <Tooltip
                contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(218,26%,90%)", borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {rows.map((r, i) => (
                <Bar key={r.city} dataKey={r.city} fill={SERIES_COLORS[i]} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border border-border p-5">
          <ShadTooltip>
            <TooltipTrigger asChild>
              <h4 className="font-display text-sm font-bold text-foreground mb-1 cursor-help inline-block">Risk Profile (Radar)</h4>
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px] text-xs">
              Each axis shows the raw 0–1 pillar score. A smaller, more contained shape = lower overall environmental risk.
            </TooltipContent>
          </ShadTooltip>
          <p className="text-[11px] text-muted-foreground mb-3">
            Raw pillar scores from Python engine (0–1, fixed). Shows each city's environmental profile independent of weight preferences.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} outerRadius={90}>
              <PolarGrid stroke="hsl(218,26%,90%)" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "hsl(213,18%,49%)" }} />
              <PolarRadiusAxis angle={90} domain={[0, 1]} tick={{ fontSize: 10, fill: "hsl(213,18%,49%)" }} />
              {rows.map((r, i) => (
                <Radar
                  key={r.city}
                  name={r.city}
                  dataKey={r.city}
                  stroke={SERIES_COLORS[i]}
                  fill={SERIES_COLORS[i]}
                  fillOpacity={0.18}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(218,26%,90%)", borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CompareView;
