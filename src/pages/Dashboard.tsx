import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Info, MapPin, SlidersHorizontal, BarChart3, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip as ShadTooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import Footer from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, LabelList,
} from "recharts";
import DashboardMap from "@/components/DashboardMap";
import CompareView from "@/components/dashboard/CompareView";
import TrendsView from "@/components/dashboard/TrendsView";
import ExportDialog from "@/components/dashboard/ExportDialog";

const DATA_URL = "https://raw.githubusercontent.com/ozzyd-2/site-selector-dashboard/refs/heads/main/data/dashboard_data.json";

type Weights = { water: number; climate: number; carbon: number; cost: number };

type CityData = {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  water_risk: number;
  climate_load: number;
  carbon: number;
  energy_cost: number;
  avg_annual_precipitation: number;
};

const SCENARIOS: { label: string; weights: Weights; description: string; weightLine: string }[] = [
  { label: "Balanced Sustainability", weights: { water: 2.0, climate: 1.0, carbon: 1.5, cost: 2.0 }, description: "Equal emphasis on water risk, carbon impact, and energy cost, with moderate climate weighting. Good all-around starting point.", weightLine: "Weights: Water×2.0 Climate×1.0 Carbon×1.5 Cost×2.0" },
  { label: "Carbon Priority", weights: { water: 1.5, climate: 1.0, carbon: 3.0, cost: 1.0 }, description: "Grid carbon intensity and state-level emissions dominate the ranking. Best for organizations with net-zero or emissions reduction commitments.", weightLine: "Weights: Water×1.5 Climate×1.0 Carbon×3.0 Cost×1.0" },
  { label: "Cost Priority", weights: { water: 1.0, climate: 2.0, carbon: 1.0, cost: 3.0 }, description: "Industrial electricity price and energy cost drive the ranking. Best for operations where energy spend is the primary site selection constraint.", weightLine: "Weights: Water×1.0 Climate×2.0 Carbon×1.0 Cost×3.0" },
  { label: "Water Priority", weights: { water: 3.0, climate: 1.0, carbon: 1.0, cost: 1.0 }, description: "Water scarcity, drought risk, water pricing, and precipitation patterns carry the heaviest weight. Best for regions where long-term water access is the critical concern.", weightLine: "Weights: Water×3.0 Climate×1.0 Carbon×1.0 Cost×1.0" },
];

function computeTotal(c: CityData, w: Weights) {
  const raw = c.water_risk * w.water + c.climate_load * w.climate + c.carbon * w.carbon + c.energy_cost * w.cost;
  return +((raw / (w.water + w.climate + w.carbon + w.cost)) * 10).toFixed(1);
}

const DONUT_COLORS = ["hsl(184,100%,26%)", "hsl(148,62%,30%)", "hsl(35,88%,40%)", "hsl(280,60%,45%)"];
const RISK_COLOR = (score: number) => score < 3 ? "hsl(148,62%,30%)" : score <= 5 ? "hsl(35,88%,40%)" : "hsl(13,65%,47%)";

const Dashboard = () => {
  const [baseData, setBaseData] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCity, setSelectedCity] = useState("");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [weights, setWeights] = useState<Weights>(SCENARIOS[0].weights);
  const manualSelect = useRef(false);
  const [showGuide, setShowGuide] = useState(() => {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem("dashboard_guide_seen") !== "1";
  });

  const dismissGuide = useCallback(() => {
    sessionStorage.setItem("dashboard_guide_seen", "1");
    setShowGuide(false);
  }, []);

  /* fetch data on mount */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(DATA_URL)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(json => {
        if (cancelled) return;
        const cities: CityData[] = json.cities.map((c: any) => ({
          city: c.city,
          state: c.state,
          latitude: parseFloat(c.latitude),
          longitude: parseFloat(c.longitude),
          water_risk: c.scores.water_risk,
          climate_load: c.scores.climate_load,
          carbon: c.scores.carbon,
          energy_cost: c.scores.energy_cost,
          avg_annual_precipitation: c.inputs?.avg_annual_precipitation ?? 0,
        }));
        setBaseData(cities);
        if (json.default_weights) {
          const dw: Weights = {
            water: json.default_weights.water ?? 2.0,
            climate: json.default_weights.climate ?? 1.0,
            carbon: json.default_weights.carbon ?? 1.5,
            cost: json.default_weights.cost ?? 2.0,
          };
          setWeights(dw);
        }
        setLoading(false);
      })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const applyScenario = useCallback((idx: number) => {
    setScenarioIdx(idx);
    setWeights({ ...SCENARIOS[idx].weights });
    manualSelect.current = false;
  }, []);

  /* computed city scores */
  const cities = useMemo(() =>
    baseData.map(c => ({ ...c, total_score: computeTotal(c, weights) }))
      .sort((a, b) => a.total_score - b.total_score),
    [baseData, weights]
  );

  /* auto-select best city when weights/scenario change */
  useEffect(() => {
    if (!manualSelect.current && cities.length > 0) {
      setSelectedCity(cities[0].city);
    }
    manualSelect.current = false;
  }, [cities]);

  const handleCitySelect = useCallback((city: string) => {
    manualSelect.current = true;
    setSelectedCity(city);
  }, []);

  const selected = cities.find(c => c.city === selectedCity) ?? cities[0];

  /* chart data */
  const barData = cities.map(c => ({
    city: c.city.length > 14 ? c.city.slice(0, 14) + "…" : c.city,
    fullCity: c.city,
    score: c.total_score,
    fill: c.city === selectedCity ? "hsl(184,100%,26%)" : "hsl(218,26%,90%)",
  }));

  const donutData = selected ? [
    { name: "Water Risk", value: +(selected.water_risk * weights.water).toFixed(3) },
    { name: "Climate Load", value: +(selected.climate_load * weights.climate).toFixed(3) },
    { name: "Carbon", value: +(selected.carbon * weights.carbon).toFixed(3) },
    { name: "Energy Cost", value: +(selected.energy_cost * weights.cost).toFixed(3) },
  ] : [];

  const scatterData = cities.map(c => ({
    x: c.energy_cost * 100,
    y: c.water_risk * 100,
    z: c.total_score,
    city: c.city.length > 14 ? c.city.slice(0, 14) + "…" : c.city,
    fill: RISK_COLOR(c.total_score),
  }));

  /* KPI helper */
  const KPI = ({ label, value, color, tooltip }: { label: string; value: string; color?: string; tooltip?: string }) => (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-col gap-1">
      <span className="text-xs font-body text-muted-foreground inline-flex items-center gap-1">
        {label}
        {tooltip && (
          <ShadTooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex text-muted-foreground/70 hover:text-foreground transition-colors cursor-help">
                <Info size={12} />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px] text-xs">{tooltip}</TooltipContent>
          </ShadTooltip>
        )}
      </span>
      <span className={`text-2xl font-display font-bold ${color ?? "text-foreground"}`}>{value}</span>
    </div>
  );

  const totalColor = selected ? (selected.total_score < 3 ? "text-risk-green" : selected.total_score <= 5 ? "text-risk-amber" : "text-risk-coral") : "";
  const wSum = weights.water + weights.climate + weights.carbon + weights.cost;

  /* loading skeleton */
  if (loading) {
    return (
      <div className="bg-background min-h-screen font-body">
        <Navbar />
        <div className="max-w-[1320px] mx-auto px-4 py-8 flex gap-6">
          <aside className="w-[280px] shrink-0 flex flex-col gap-5">
            <Skeleton className="h-[260px] rounded-lg" />
            <Skeleton className="h-[200px] rounded-lg" />
            <Skeleton className="h-[240px] rounded-lg" />
          </aside>
          <main className="flex-1 min-w-0 space-y-6">
            <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
            <Skeleton className="h-[260px] rounded-lg" />
            <Skeleton className="h-[340px] rounded-lg" />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  /* error state */
  if (error) {
    return (
      <div className="bg-background min-h-screen font-body">
        <Navbar />
        <div className="max-w-[1320px] mx-auto px-4 py-16 text-center">
          <p className="text-destructive font-semibold mb-4">Failed to load dashboard data: {error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold">Retry</button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!selected) return null;

  return (
    <div className="bg-background min-h-screen font-body">
      <Navbar />
      <TooltipProvider delayDuration={200}>
      <Dialog open={showGuide} onOpenChange={(o) => { if (!o) dismissGuide(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Welcome to the Site Selection Dashboard</DialogTitle>
            <DialogDescription>
              Compare candidate U.S. data center locations across water, climate, carbon, and energy cost dimensions — then test your own scenario.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-md bg-accent flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-foreground">1. Pick a city</h4>
                <p className="text-sm text-muted-foreground">Select any candidate city from the left sidebar (or click a marker on the map) to see its full risk breakdown.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-md bg-accent flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-foreground">2. Choose a scenario or set your own weights</h4>
                <p className="text-sm text-muted-foreground">Try Balanced, Carbon-, Cost-, or Water-Priority presets — or drag the sliders to model your own priorities. Rankings update live.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-md bg-accent flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-foreground">3. Compare and validate</h4>
                <p className="text-sm text-muted-foreground">Use the bar chart, donut, and scatter plot to compare your chosen city against the field. Lower scores indicate lower combined risk.</p>
              </div>
            </div>

            <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              Tip: Scores are weighted composites scaled 0–10. Color tags (green / amber / red) indicate Low, Moderate, and High risk.
            </div>
          </div>

          <DialogFooter>
            <Button onClick={dismissGuide} className="w-full sm:w-auto">Explore the dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-[1320px] mx-auto px-4 py-8 flex gap-6">
        {/* ── SIDEBAR ── */}
        <aside className="w-[280px] shrink-0 flex flex-col gap-5">
          {/* cities */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-foreground">Select City</h3>
              <ShadTooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowGuide(true)}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Open quick start guide"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Guide
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs">Reopen the welcome guide explaining how to use the dashboard.</TooltipContent>
              </ShadTooltip>
            </div>
            <div className="flex flex-col gap-1">
              {cities.map(c => (
                <ShadTooltip key={c.city}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleCitySelect(c.city)}
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
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Select {c.city} to see its full risk breakdown. Score: {c.total_score.toFixed(1)}/10 (lower is better).</TooltipContent>
                </ShadTooltip>
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
                  <span className="font-semibold flex items-center gap-1.5">
                    {s.label}
                    <ShadTooltip>
                      <TooltipTrigger asChild>
                        <span onClick={(e) => e.stopPropagation()} className="inline-flex text-muted-foreground hover:text-foreground transition-colors cursor-help">
                          <Info size={14} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[260px] text-xs">{s.description}<br /><br />{s.weightLine}</TooltipContent>
                    </ShadTooltip>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* sliders */}
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-1 mb-3">
              <h3 className="font-display text-sm font-bold text-foreground">Adjust Weights</h3>
              <ShadTooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex text-muted-foreground/70 hover:text-foreground transition-colors cursor-help">
                    <Info size={12} />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px] text-xs">
                  Drag any slider (0–5) to change how much that factor contributes to the Total Impact Score. Higher weight = more influence on the ranking.
                </TooltipContent>
              </ShadTooltip>
            </div>
            {([
              { key: "water" as const, label: "Water Risk", tip: "How much water scarcity, drought risk, and water price influence the score. Higher = water sustainability matters more." },
              { key: "climate" as const, label: "Climate Load", tip: "How much hot-climate cooling demand and temperature stress influence the score." },
              { key: "carbon" as const, label: "Carbon", tip: "How much grid carbon intensity (kg CO₂/MWh) influences the score. Higher = clean energy matters more." },
              { key: "cost" as const, label: "Energy Cost", tip: "How much industrial electricity price influences the score. Higher = OpEx matters more." },
            ]).map(s => (
              <div key={s.key} className="mb-4 last:mb-0">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground inline-flex items-center gap-1">
                    {s.label}
                    <ShadTooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex text-muted-foreground/70 hover:text-foreground transition-colors cursor-help">
                          <Info size={11} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[240px] text-xs">{s.tip}</TooltipContent>
                    </ShadTooltip>
                  </span>
                  <span className="font-mono font-semibold text-foreground">{weights[s.key].toFixed(1)}</span>
                </div>
                <Slider
                  min={0} max={5} step={0.1}
                  value={[weights[s.key]]}
                  onValueChange={([v]) => { manualSelect.current = false; setWeights(prev => ({ ...prev, [s.key]: v })); }}
                />
              </div>
            ))}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 min-w-0">
          <Tabs defaultValue="overview">
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              <TabsList className="bg-card border border-border flex-wrap h-auto">
                <ShadTooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs max-w-[240px]">KPIs, city rankings, score breakdown, and the risk landscape scatter plot for the selected city.</TooltipContent>
                </ShadTooltip>
                <ShadTooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="compare" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Compare</TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs max-w-[240px]">Pick up to 4 cities and compare them side-by-side across every dimension.</TooltipContent>
                </ShadTooltip>
                <ShadTooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="trends" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Trends</TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs max-w-[240px]">Modeled 12-month seasonal trend for any metric across multiple cities.</TooltipContent>
                </ShadTooltip>
                <ShadTooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="map" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Map</TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs max-w-[240px]">All candidate cities plotted on a U.S. map, color-coded by risk level.</TooltipContent>
                </ShadTooltip>
              </TabsList>
              <ShadTooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ExportDialog
                      cities={cities}
                      selectedCity={selected}
                      weights={weights}
                      scenarioLabel={SCENARIOS[scenarioIdx]?.label ?? "Custom"}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="text-xs max-w-[240px]">Download the current rankings as PDF, Excel, or CSV — including your scenario and weights.</TooltipContent>
              </ShadTooltip>
            </div>

            <TabsContent value="overview" className="space-y-6">
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-4">
                <KPI label="Water Risk" value={(selected.water_risk * weights.water / wSum * 10).toFixed(1)} tooltip="Weighted water risk contribution to the Total Impact Score (0–10). Reflects scarcity, drought risk, water price, and rainfall." />
                <KPI label="Climate Load" value={(selected.climate_load * weights.climate / wSum * 10).toFixed(1)} tooltip="Weighted climate/cooling burden contribution (0–10). Hotter climates score higher because cooling equipment runs harder." />
                <KPI label="Carbon" value={(selected.carbon * weights.carbon / wSum * 10).toFixed(1)} tooltip="Weighted carbon contribution (0–10). Reflects grid carbon intensity (kg CO₂/MWh) at this location." />
                <KPI label="Total Impact Score" value={selected.total_score.toFixed(1)} color={totalColor} tooltip="The single 0–10 composite score combining water, climate, carbon, and energy cost using your weights. Lower = more favorable site." />
              </div>

              {/* Precipitation & Variability detail */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-lg border border-border p-4 flex flex-col gap-1">
                  <span className="text-xs font-body text-muted-foreground">Annual Precipitation</span>
                  <span className="text-2xl font-display font-bold text-foreground">
                    {selected?.avg_annual_precipitation != null
                      ? `${selected.avg_annual_precipitation.toFixed(1)}`
                      : "N/A"}{" "}
                    <span className="text-sm font-normal text-muted-foreground">in/yr</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-1 leading-tight">
                    Lower annual precipitation increases water risk. Seasonal rainfall variability across all 12 months is also factored into the Water Risk score.
                  </span>
                </div>
                <div className="bg-card rounded-lg border border-border p-4 flex flex-col gap-1">
                  <span className="text-xs font-body text-muted-foreground">Rainfall Variability</span>
                  <span className={`text-2xl font-display font-bold ${
                    (selected?.water_risk ?? 0) < 0.35 ? "text-risk-green" : (selected?.water_risk ?? 0) <= 0.65 ? "text-risk-amber" : "text-risk-coral"
                  }`}>
                    {(selected?.water_risk ?? 0) < 0.35 ? "Low" : (selected?.water_risk ?? 0) <= 0.65 ? "Moderate" : "High"}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-1 leading-tight">
                    Derived from water risk score as a proxy for seasonal rainfall variability.
                  </span>
                </div>
              </div>

              {/* bar + donut */}
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3 bg-card rounded-lg border border-border p-5">
                  <h4 className="font-display text-sm font-bold text-foreground mb-4">City Rankings</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(218,26%,90%)" />
                      <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11, fill: "hsl(213,18%,49%)" }} />
                      <YAxis type="category" dataKey="city" width={120} tick={{ fontSize: 11, fill: "hsl(213,18%,49%)" }} />
                      <Tooltip
                        formatter={(v: number) => [v.toFixed(1), "Score"]}
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
                        formatter={(v: number, name: string) => [v.toFixed(3), name]}
                        contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(218,26%,90%)", borderRadius: 8, fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-3 text-[11px] text-muted-foreground -mt-2 flex-wrap">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: DONUT_COLORS[0] }} />Water</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: DONUT_COLORS[1] }} />Climate</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: DONUT_COLORS[2] }} />Carbon</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: DONUT_COLORS[3] }} />Cost</span>
                  </div>
                </div>
              </div>

              {/* scatter */}
              <div className="bg-card rounded-lg border border-border p-5">
                <h4 className="font-display text-sm font-bold text-foreground mb-4">Risk Landscape — Energy Cost vs Water Risk</h4>
                <div className="scatter-no-clip" style={{ overflow: "visible" }}>
                  <ResponsiveContainer width="100%" height={320}>
                    <ScatterChart margin={{ top: 40, right: 30, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(218,26%,90%)" />
                      <XAxis type="number" dataKey="x" name="Energy Cost" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(213,18%,49%)" }} label={{ value: "Energy Cost Index", position: "bottom", offset: 0, style: { fontSize: 11, fill: "hsl(213,18%,49%)" } }} />
                      <YAxis type="number" dataKey="y" name="Water Risk" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(213,18%,49%)" }} label={{ value: "Water Risk", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "hsl(213,18%,49%)" } }} />
                      <ZAxis dataKey="z" range={[200, 400]} />
                      <Tooltip
                        formatter={(v: number, name: string) => [v.toFixed(1), name]}
                        contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(218,26%,90%)", borderRadius: 8, fontSize: 12 }}
                      />
                      <Scatter data={scatterData}>
                        {scatterData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                        <LabelList dataKey="city" position="top" dy={-12} style={{ fontSize: 10, fill: "hsl(213,18%,49%)" }} />
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="compare">
              <CompareView cities={cities} weights={weights} initialSelection={[selected.city]} />
            </TabsContent>

            <TabsContent value="trends">
              <TrendsView cities={cities} weights={weights} />
            </TabsContent>

            <TabsContent value="map">
              <DashboardMap weights={weights} cities={cities} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      </TooltipProvider>
      <Footer />
    </div>
  );
};

export default Dashboard;
