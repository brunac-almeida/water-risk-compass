import { useState, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, LabelList,
} from "recharts";
import DashboardMap from "@/components/DashboardMap";

/* ── raw city data ── */
const BASE_DATA = [
  { city: "Northern Virginia", water_stress: 0.434, carbon_index: 0.419, cooling_cost: 0.249, raw_temp: "55.1°F", raw_water: "$4.95/1k gal", raw_carbon: "235.0 kg CO₂/MWh" },
  { city: "Dallas–Fort Worth", water_stress: 0.251, carbon_index: 1.0, cooling_cost: 1.0, raw_temp: "64.9°F", raw_water: "$4.29/1k gal", raw_carbon: "338.6 kg CO₂/MWh" },
  { city: "Silicon Valley", water_stress: 1.0, carbon_index: 0.0, cooling_cost: 0.45, raw_temp: "57.7°F", raw_water: "$7.00/1k gal", raw_carbon: "160.2 kg CO₂/MWh" },
  { city: "Phoenix", water_stress: 0.0, carbon_index: 0.831, cooling_cost: 0.604, raw_temp: "59.8°F", raw_water: "$3.38/1k gal", raw_carbon: "308.5 kg CO₂/MWh" },
  { city: "Chicago", water_stress: 0.139, carbon_index: 0.294, cooling_cost: 0.0, raw_temp: "51.9°F", raw_water: "$3.88/1k gal", raw_carbon: "212.7 kg CO₂/MWh" },
];

type Weights = { water: number; carbon: number; cooling: number };

const SCENARIOS: { label: string; tag: string; weights: Weights }[] = [
  { label: "Balanced Sustainability", tag: "Water×2.0 · Carbon×1.5 · Cooling×1.0", weights: { water: 2.0, carbon: 1.5, cooling: 1.0 } },
  { label: "Carbon Priority", tag: "Water×1.5 · Carbon×3.0 · Cooling×1.0", weights: { water: 1.5, carbon: 3.0, cooling: 1.0 } },
  { label: "Cost Priority", tag: "Water×1.0 · Carbon×1.0 · Cooling×2.0", weights: { water: 1.0, carbon: 1.0, cooling: 2.0 } },
];

function computeTotal(c: typeof BASE_DATA[0], w: Weights) {
  const raw = c.water_stress * w.water + c.carbon_index * w.carbon + c.cooling_cost * w.cooling;
  return +((raw / (w.water + w.carbon + w.cooling)) * 10).toFixed(2);
}

const DONUT_COLORS = ["hsl(184,100%,26%)", "hsl(148,62%,30%)", "hsl(35,88%,40%)"];
const RISK_COLOR = (score: number) => score < 3 ? "hsl(148,62%,30%)" : score <= 5 ? "hsl(35,88%,40%)" : "hsl(13,65%,47%)";

const Dashboard = () => {
  const [selectedCity, setSelectedCity] = useState("Chicago");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [weights, setWeights] = useState<Weights>({ water: 2.0, carbon: 1.5, cooling: 1.0 });

  const applyScenario = useCallback((idx: number) => {
    setScenarioIdx(idx);
    setWeights({ ...SCENARIOS[idx].weights });
  }, []);

  /* computed city scores */
  const cities = useMemo(() =>
    BASE_DATA.map(c => ({ ...c, total_score: computeTotal(c, weights) }))
      .sort((a, b) => a.total_score - b.total_score),
    [weights]
  );

  const selected = cities.find(c => c.city === selectedCity) ?? cities[0];

  /* chart data */
  const barData = cities.map(c => ({
    city: c.city.length > 12 ? c.city.slice(0, 12) + "…" : c.city,
    fullCity: c.city,
    score: c.total_score,
    fill: c.city === selectedCity ? "hsl(184,100%,26%)" : "hsl(218,26%,90%)",
  }));

  const donutData = [
    { name: "Water Stress", value: +(selected.water_stress * weights.water).toFixed(2) },
    { name: "Carbon Index", value: +(selected.carbon_index * weights.carbon).toFixed(2) },
    { name: "Cooling Cost", value: +(selected.cooling_cost * weights.cooling).toFixed(2) },
  ];

  const scatterData = cities.map(c => ({
    x: c.cooling_cost * 10,
    y: c.water_stress * 10,
    z: c.total_score,
    city: c.city,
    fill: RISK_COLOR(c.total_score),
  }));

  /* KPI helper */
  const KPI = ({ icon, label, value, color }: { icon: string; label: string; value: string; color?: string }) => (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-col gap-1">
      <span className="text-xs font-body text-muted-foreground flex items-center gap-1.5">{icon} {label}</span>
      <span className={`text-2xl font-display font-bold ${color ?? "text-foreground"}`}>{value}</span>
    </div>
  );

  const totalColor = selected.total_score < 3 ? "text-risk-green" : selected.total_score <= 5 ? "text-risk-amber" : "text-risk-coral";

  return (
    <div className="bg-background min-h-screen font-body">
      <Navbar />

      <div className="max-w-[1320px] mx-auto px-4 py-8 flex gap-6">
        {/* ── SIDEBAR ── */}
        <aside className="w-[280px] shrink-0 flex flex-col gap-5">
          {/* cities */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-display text-sm font-bold text-foreground mb-3">Select City</h3>
            <div className="flex flex-col gap-1">
              {cities.map(c => (
                <button
                  key={c.city}
                  onClick={() => setSelectedCity(c.city)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    c.city === selectedCity
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "hover:bg-muted/60 text-foreground"
                  }`}
                >
                  <span>{c.city}</span>
                  <span className={`font-mono text-xs ${c.city === selectedCity ? "text-primary" : "text-muted-foreground"}`}>
                    {c.total_score.toFixed(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* scenarios */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-display text-sm font-bold text-foreground mb-3">Scenario</h3>
            <div className="flex flex-col gap-2">
              {SCENARIOS.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => applyScenario(i)}
                  className={`text-left px-3 py-2.5 rounded-md border text-sm transition-colors ${
                    scenarioIdx === i
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border hover:border-primary/40 text-foreground"
                  }`}
                >
                  <span className="font-semibold block">{s.label}</span>
                  <span className="text-xs text-muted-foreground">{s.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* sliders */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-display text-sm font-bold text-foreground mb-3">Adjust Weights</h3>
            {([
              { key: "water" as const, icon: "💧", label: "Water Stress" },
              { key: "carbon" as const, icon: "🌿", label: "Carbon Index" },
              { key: "cooling" as const, icon: "🌡️", label: "Cooling Cost" },
            ]).map(s => (
              <div key={s.key} className="mb-4 last:mb-0">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{s.icon} {s.label}</span>
                  <span className="font-mono font-semibold text-foreground">{weights[s.key].toFixed(1)}</span>
                </div>
                <Slider
                  min={0} max={4} step={0.1}
                  value={[weights[s.key]]}
                  onValueChange={([v]) => setWeights(prev => ({ ...prev, [s.key]: v }))}
                />
              </div>
            ))}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 min-w-0">
          <Tabs defaultValue="charts">
            <TabsList className="mb-6 bg-card border border-border">
              <TabsTrigger value="charts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">📊 Charts View</TabsTrigger>
              <TabsTrigger value="map" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">🗺️ Map View</TabsTrigger>
            </TabsList>

            <TabsContent value="charts" className="space-y-6">
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-4">
                <KPI icon="💧" label="Water Stress" value={selected.water_stress.toFixed(3)} />
                <KPI icon="🌿" label="Carbon Index" value={selected.carbon_index.toFixed(3)} />
                <KPI icon="🌡️" label="Cooling Cost" value={selected.cooling_cost.toFixed(3)} />
                <KPI icon="📊" label="Total Impact Score" value={selected.total_score.toFixed(1)} color={totalColor} />
              </div>

              {/* bar + donut */}
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3 bg-card rounded-lg border border-border p-5">
                  <h4 className="font-display text-sm font-bold text-foreground mb-4">City Rankings</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(218,26%,90%)" />
                      <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11, fill: "hsl(213,18%,49%)" }} />
                      <YAxis type="category" dataKey="city" width={100} tick={{ fontSize: 11, fill: "hsl(213,18%,49%)" }} />
                      <Tooltip
                        formatter={(v: number) => [v.toFixed(2), "Score"]}
                        labelFormatter={(l: string) => barData.find(d => d.city === l)?.fullCity ?? l}
                        contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(218,26%,90%)", borderRadius: 8, fontSize: 12 }}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
                        {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="col-span-2 bg-card rounded-lg border border-border p-5">
                  <h4 className="font-display text-sm font-bold text-foreground mb-2">Score Breakdown — {selected.city}</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={donutData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3} cx="50%" cy="50%">
                        {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                      </Pie>
                      <Tooltip
                        formatter={(v: number, name: string) => [v.toFixed(2), name]}
                        contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(218,26%,90%)", borderRadius: 8, fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 text-[11px] text-muted-foreground -mt-2">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: DONUT_COLORS[0] }} />Water</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: DONUT_COLORS[1] }} />Carbon</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: DONUT_COLORS[2] }} />Cooling</span>
                  </div>
                </div>
              </div>

              {/* scatter */}
              <div className="bg-card rounded-lg border border-border p-5">
                <h4 className="font-display text-sm font-bold text-foreground mb-4">Risk Landscape — Cooling Cost vs Water Stress</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(218,26%,90%)" />
                    <XAxis type="number" dataKey="x" name="Cooling Cost" domain={[0, 10]} tick={{ fontSize: 11, fill: "hsl(213,18%,49%)" }} label={{ value: "Cooling Cost Index", position: "bottom", offset: 0, style: { fontSize: 11, fill: "hsl(213,18%,49%)" } }} />
                    <YAxis type="number" dataKey="y" name="Water Stress" domain={[0, 10]} tick={{ fontSize: 11, fill: "hsl(213,18%,49%)" }} label={{ value: "Water Stress", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "hsl(213,18%,49%)" } }} />
                    <ZAxis dataKey="z" range={[200, 400]} />
                    <Tooltip
                      formatter={(v: number, name: string) => [v.toFixed(1), name]}
                      contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(218,26%,90%)", borderRadius: 8, fontSize: 12 }}
                    />
                    <Scatter data={scatterData}>
                      {scatterData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      <LabelList dataKey="city" position="top" style={{ fontSize: 10, fill: "hsl(213,18%,49%)" }} />
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="map">
              <DashboardMap weights={weights} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
