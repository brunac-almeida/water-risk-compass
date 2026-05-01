import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { Tooltip as ShadTooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type CityRow = {
  city: string;
  water_risk: number;
  climate_load: number;
  carbon: number;
  energy_cost: number;
  total_score: number;
};

type Weights = { water: number; climate: number; carbon: number; cost: number };

const SERIES_COLORS = [
  "hsl(184,100%,26%)",
  "hsl(13,65%,47%)",
  "hsl(35,88%,40%)",
  "hsl(280,60%,45%)",
  "hsl(148,62%,30%)",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const METRIC_OPTIONS = [
  { key: "total" as const, label: "Total Impact Score" },
  { key: "water" as const, label: "Water Risk" },
  { key: "climate" as const, label: "Climate Load" },
  { key: "carbon" as const, label: "Carbon" },
  { key: "cost" as const, label: "Energy Cost" },
];

// Deterministic pseudo-random based on city+month so values are stable across renders
function seasonal(cityHash: number, monthIdx: number, base: number, kind: "water" | "climate" | "carbon" | "cost") {
  const phase = (cityHash % 12) / 12;
  const t = (monthIdx / 12) * Math.PI * 2;
  let amp = 0.15;
  let shift = 0;
  if (kind === "water") { amp = 0.25; shift = Math.PI; }      // higher in summer
  if (kind === "climate") { amp = 0.30; shift = 0; }           // peaks summer
  if (kind === "carbon") { amp = 0.08; shift = Math.PI / 2; }  // mild seasonal
  if (kind === "cost") { amp = 0.12; shift = 0; }              // peak summer demand
  const seasonal = Math.sin(t + shift + phase * Math.PI * 2) * amp;
  // Tiny deterministic noise
  const noise = (Math.sin(cityHash * (monthIdx + 1) * 12.9898) * 43758.5453) % 1;
  const v = base * (1 + seasonal + noise * 0.04);
  return Math.max(0, Math.min(1, v));
}

function hashCity(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface Props {
  cities: CityRow[];
  weights: Weights;
}

const TrendsView = ({ cities, weights }: Props) => {
  const [selectedCities, setSelectedCities] = useState<string[]>(
    cities.slice(0, 3).map(c => c.city)
  );
  const [metric, setMetric] = useState<typeof METRIC_OPTIONS[number]["key"]>("total");

  const wSum = weights.water + weights.climate + weights.carbon + weights.cost;

  const data = useMemo(() => {
    return MONTHS.map((m, i) => {
      const row: any = { month: m };
      selectedCities.forEach(name => {
        const c = cities.find(x => x.city === name);
        if (!c) return;
        const h = hashCity(name);
        const w = seasonal(h, i, c.water_risk, "water");
        const cl = seasonal(h, i, c.climate_load, "climate");
        const ca = seasonal(h, i, c.carbon, "carbon");
        const co = seasonal(h, i, c.energy_cost, "cost");
        let v = 0;
        if (metric === "total") {
          v = ((w * weights.water + cl * weights.climate + ca * weights.carbon + co * weights.cost) / wSum) * 10;
        } else if (metric === "water") v = w * 10;
        else if (metric === "climate") v = cl * 10;
        else if (metric === "carbon") v = ca * 10;
        else if (metric === "cost") v = co * 10;
        row[name] = +v.toFixed(2);
      });
      return row;
    });
  }, [selectedCities, cities, metric, weights, wSum]);

  const toggleCity = (name: string) => {
    setSelectedCities(prev =>
      prev.includes(name)
        ? prev.filter(c => c !== name)
        : prev.length >= 5 ? prev : [...prev, name]
    );
  };

  // Yearly average per selected city for current metric.
  // For Total Impact Score we display the canonical total_score (rounded the same way as
  // the Select City list and Overview KPI) so all three panels agree exactly.
  const averages = useMemo(() => {
    return selectedCities.map(name => {
      if (metric === "total") {
        const c = cities.find(x => x.city === name);
        const total = c ? c.total_score : 0;
        return { city: name, avg: Math.round(total * 10) / 10 };
      }
      const vals = data.map(d => d[name]).filter(v => typeof v === "number");
      const raw = vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
      return { city: name, avg: Math.round(raw * 10) / 10 };
    });
  }, [data, selectedCities, metric, cities]);

  return (
    <div className="space-y-6">
      {/* Disclosure banner */}
      <div className="rounded-md border border-border bg-muted/40 p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Modeled monthly projection.</span>{" "}
          Source data is annual; trends below are deterministic seasonal models derived from each city's annual values
          (e.g. water risk peaks in summer, cooling demand peaks in heat months). Use them to compare relative seasonal pressure between sites,
          not as ground-truth time-series data.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-card rounded-lg border border-border p-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <h3 className="font-display text-sm font-bold text-foreground mb-2">Metric</h3>
          <div className="flex flex-wrap gap-1.5">
            {METRIC_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setMetric(opt.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                  metric === opt.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-foreground mb-2">
            Cities <span className="font-normal text-muted-foreground text-xs">(up to 5)</span>
          </h3>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {cities.map(c => {
              const active = selectedCities.includes(c.city);
              return (
                <button
                  key={c.city}
                  onClick={() => toggleCity(c.city)}
                  disabled={!active && selectedCities.length >= 5}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors disabled:opacity-40 ${
                    active
                      ? "bg-accent text-accent-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {c.city}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h4 className="font-display text-sm font-bold text-foreground mb-4">
          {METRIC_OPTIONS.find(o => o.key === metric)?.label} — 12-Month Modeled Trend
        </h4>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(218,26%,90%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(213,18%,49%)" }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "hsl(213,18%,49%)" }} />
            <Tooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(218,26%,90%)", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {/* Risk band reference lines */}
            <ReferenceLine y={3} stroke="hsl(148,62%,30%)" strokeDasharray="2 4" strokeOpacity={0.4} />
            <ReferenceLine y={5} stroke="hsl(35,88%,40%)" strokeDasharray="2 4" strokeOpacity={0.4} />
            {selectedCities.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-muted-foreground mt-2">
          Dashed lines mark Low (≤3) and Moderate (≤5) risk thresholds.
        </p>
      </div>

      {/* Yearly averages summary */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h4 className="font-display text-sm font-bold text-foreground mb-3">Annual Average ({METRIC_OPTIONS.find(o => o.key === metric)?.label})</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {averages.map((a, i) => (
            <div key={a.city} className="rounded-md border border-border p-3">
              <div className="text-[11px] text-muted-foreground truncate">{a.city}</div>
              <div className="font-display text-xl font-bold" style={{ color: SERIES_COLORS[i % SERIES_COLORS.length] }}>
                {a.avg.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendsView;
