import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const DATA_URL = "https://raw.githubusercontent.com/ozzyd-2/site-selector-dashboard/refs/heads/main/data/dashboard_data.json";

/* ── Types ── */
type Weights = { water: number; climate: number; carbon: number; cost: number };

type CityData = {
  city: string;
  state: string;
  water_risk: number;
  climate_load: number;
  carbon: number;
  energy_cost: number;
};

const CITY_TAGLINES: Record<string, string> = {
  "Chicago": "Cleanest grid and lowest cooling demand — strong all-around choice",
  "Northern Virginia (NoVA)": "Largest market with moderate risk profile — good infrastructure",
  "Phoenix": "Fast-growing market but high water stress and extreme summer cooling demand — monitor closely.",
  "Silicon Valley": "Cleanest electricity grid but highest water price in the dataset",
  "Dallas–Fort Worth": "Strong connectivity hub but highest carbon intensity of all markets",
};

/* Same formula as Dashboard: 0–10 scale */
function computeTotal(c: CityData, w: Weights) {
  const sum = w.water + w.climate + w.carbon + w.cost;
  if (sum === 0) return 0;
  const raw =
    (c.water_risk ?? 0) * w.water +
    (c.climate_load ?? 0) * w.climate +
    (c.carbon ?? 0) * w.carbon +
    (c.energy_cost ?? 0) * w.cost;
  return +((raw / sum) * 10).toFixed(1);
}

/* Risk bands match Dashboard (0–10 scale) */
const riskLabel = (s: number) => (s < 3 ? "Low Risk" : s <= 5 ? "Medium Risk" : "High Risk");
const riskColor = (s: number) => (s < 3 ? "text-risk-green" : s <= 5 ? "text-risk-amber" : "text-risk-coral");
const riskBg = (s: number) =>
  s < 3 ? "bg-green-light text-risk-green" : s <= 5 ? "bg-amber-light text-risk-amber" : "bg-coral-light text-risk-coral";

/* ── Wizard steps config (UI/copy unchanged) ── */
const FACILITY_TYPES = [
  { label: "Cloud / Hyperscale", desc: "Large scale, water-intensive cooling" },
  { label: "Colocation", desc: "Shared facility, moderate footprint" },
  { label: "AI / GPU Cluster", desc: "Very high power density, cooling critical" },
  { label: "Enterprise", desc: "Private facility, balanced needs" },
];

const CONSTRAINTS = [
  { label: "Water Availability", desc: "Water scarcity is a deal-breaker", key: "water" as const },
  { label: "Carbon Footprint", desc: "ESG commitments require a clean grid", key: "carbon" as const },
  { label: "Cooling Cost", desc: "Energy cost for cooling dominates OpEx", key: "cost" as const },
  { label: "Balanced", desc: "No single factor dominates", key: "balanced" as const },
];

const RISK_TOLERANCE = [
  { label: "Low", desc: "We need the safest, most resilient site" },
  { label: "Medium", desc: "Balanced risk/reward approach" },
  { label: "High", desc: "Cost efficiency matters more than risk" },
];

const SiteRecommender = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0-3 = wizard, 4 = results
  const [facility, setFacility] = useState<number | null>(null);
  const [constraint, setConstraint] = useState<number | null>(null);
  const [riskTol, setRiskTol] = useState<number | null>(null);
  const [sustainability, setSustainability] = useState(3);

  /* fetched data */
  const [baseData, setBaseData] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(DATA_URL)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(json => {
        if (cancelled) return;
        const cities: CityData[] = (json.cities ?? []).map((c: any) => ({
          city: c.city,
          state: c.state,
          water_risk: c.scores?.water_risk ?? 0,
          climate_load: c.scores?.climate_load ?? 0,
          carbon: c.scores?.carbon ?? 0,
          energy_cost: c.scores?.energy_cost ?? 0,
        }));
        setBaseData(cities);
        setLoading(false);
      })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const canAdvance = step === 0 ? facility !== null : step === 1 ? constraint !== null : step === 2 ? riskTol !== null : true;

  /* Compute 4 weights from answers */
  const weights = useMemo<Weights>(() => {
    // Base weights from facility type — 4 pillars
    let w: Weights = { water: 1.5, climate: 1.5, carbon: 1.5, cost: 1.5 };
    if (facility === 0) w = { water: 2.0, climate: 1.0, carbon: 1.5, cost: 1.5 }; // Cloud
    if (facility === 1) w = { water: 1.5, climate: 1.5, carbon: 1.5, cost: 1.5 }; // Colo
    if (facility === 2) w = { water: 1.0, climate: 1.5, carbon: 1.0, cost: 2.5 }; // AI/GPU
    if (facility === 3) w = { water: 1.5, climate: 1.0, carbon: 1.5, cost: 2.0 }; // Enterprise

    // Constraint override → completely replace base: dominant=3.0, others=1.0
    let dominant: keyof Weights | null = null;
    if (constraint === 0) dominant = "water";
    if (constraint === 1) dominant = "carbon";
    if (constraint === 2) dominant = "cost";
    if (constraint === 3) {
      w = { water: 1.5, climate: 1.5, carbon: 1.5, cost: 1.5 };
    }
    if (dominant) {
      w = { water: 1.0, climate: 1.0, carbon: 1.0, cost: 1.0 };
      w[dominant] = 3.0;
    }

    // Sustainability slider — continuous: (level-1) * 0.2 added to water + carbon
    const sustainBonus = (sustainability - 1) * 0.2;
    w.water += sustainBonus;
    w.carbon += sustainBonus;

    // Risk tolerance
    if (riskTol === 0) {
      // Low: boost dominant (or highest) weight, reduce cost
      const domKey = dominant ?? (["water", "climate", "carbon", "cost"] as const)
        .reduce((a, b) => (w[b] > w[a] ? b : a));
      w[domKey] += 0.5;
      w.cost -= 0.3;
    }
    if (riskTol === 2) {
      // High: shift toward cost efficiency
      w.cost += 0.8;
      w.water -= 0.4;
      w.carbon -= 0.4;
    }

    // Floor at 0.1 to avoid zero/negative weights
    (["water", "climate", "carbon", "cost"] as const).forEach(k => {
      w[k] = Math.max(0.1, w[k]);
    });

    // Round to 1 decimal
    w.water = +w.water.toFixed(1);
    w.climate = +w.climate.toFixed(1);
    w.carbon = +w.carbon.toFixed(1);
    w.cost = +w.cost.toFixed(1);
    return w;
  }, [facility, constraint, riskTol, sustainability]);

  const results = useMemo(() =>
    baseData.map(c => ({ ...c, total_score: computeTotal(c, weights) }))
      .sort((a, b) => a.total_score - b.total_score),
    [baseData, weights]
  );

  const reset = () => { setStep(0); setFacility(null); setConstraint(null); setRiskTol(null); setSustainability(3); };

  const goToDashboard = () => {
    const params = new URLSearchParams({
      ww: weights.water.toFixed(2),
      wc: weights.climate.toFixed(2),
      wb: weights.carbon.toFixed(2),
      we: weights.cost.toFixed(2),
    });
    navigate(`/dashboard?${params.toString()}`);
  };

  const OptionCard = ({ label, desc, selected, onClick }: { label: string; desc: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`text-left w-full p-4 rounded-xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${
        selected ? "border-primary bg-accent shadow-md" : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div>
        <span className="font-display font-bold text-[15px] text-foreground block">{label}</span>
        <span className="text-sm text-muted-foreground leading-relaxed">{desc}</span>
      </div>
    </button>
  );

  const stepTitles = [
    "What type of data center are you planning?",
    "What is your single most critical operational constraint?",
    "How much environmental risk can your organization absorb?",
    "How important is environmental sustainability to your stakeholders?",
  ];

  const sustainLabels = ["Not a priority", "Low", "Moderate", "Important", "Core to our mission"];

  const winner = results[0];
  const winnerScore = winner?.total_score ?? 0;

  return (
    <div className="bg-background min-h-screen font-body flex flex-col">
      <Navbar />
      <TooltipProvider delayDuration={200}>

      {/* Header */}
      <div className="max-w-[800px] mx-auto px-4 pt-16 pb-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          Find Your <span className="text-primary">Ideal Location</span>
        </h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xl mx-auto">
          Answer four questions and we'll identify the best U.S. market for your data center based on your specific priorities.
        </p>
      </div>

      {/* Wizard card */}
      <div className="flex-1 flex justify-center px-4 pb-20">
        <div className="w-full max-w-[680px]">
          {step < 4 && (
            <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
              {/* Progress */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground">Step {step + 1} of 4</span>
                <span className="text-xs text-muted-foreground font-mono-code">{Math.round((step / 4) * 100)}%</span>
              </div>
              <Progress value={(step / 4) * 100} className="h-1.5 mb-8" />

              {/* Question */}
              <h2 className="font-display text-xl font-bold text-foreground mb-6">{stepTitles[step]}</h2>

              {/* Step content */}
              {step === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FACILITY_TYPES.map((f, i) => (
                    <OptionCard key={i} label={f.label} desc={f.desc} selected={facility === i} onClick={() => setFacility(i)} />
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONSTRAINTS.map((c, i) => (
                    <OptionCard key={i} label={c.label} desc={c.desc} selected={constraint === i} onClick={() => setConstraint(i)} />
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-3">
                  {RISK_TOLERANCE.map((r, i) => (
                    <OptionCard key={i} label={r.label} desc={r.desc} selected={riskTol === i} onClick={() => setRiskTol(i)} />
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <input
                    type="range" min={1} max={5} step={1} value={sustainability}
                    onChange={e => setSustainability(+e.target.value)}
                    className="w-full accent-[hsl(184,100%,26%)] h-2 rounded-full cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {sustainLabels.map((l, i) => (
                      <span key={i} className={`text-center ${sustainability === i + 1 ? "text-primary font-bold" : ""}`}>{l}</span>
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="inline-block bg-accent text-primary font-display font-bold text-2xl px-6 py-3 rounded-xl">
                      {sustainability} / 5
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setStep(s => s - 1)}
                      className={`text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors ${step === 0 ? "invisible" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    >
                      ← Back
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Return to the previous question. Your selection is preserved.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setStep(s => s + 1)}
                      disabled={!canAdvance}
                      className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {step === 3 ? "See Results" : "Next →"}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs max-w-[260px]">
                    {step === 3
                      ? "Compute your tailored ranking based on all four answers."
                      : !canAdvance
                        ? "Choose an option above to continue."
                        : "Continue to the next question."}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* ── Results ── */}
          {step === 4 && (
            <div className="space-y-5">
              {loading && (
                <div className="space-y-5">
                  <Skeleton className="h-[200px] rounded-2xl" />
                  <Skeleton className="h-[260px] rounded-2xl" />
                  <Skeleton className="h-[80px] rounded-2xl" />
                </div>
              )}

              {error && !loading && (
                <div className="bg-card rounded-2xl border border-border shadow-lg p-8 text-center">
                  <p className="text-destructive font-semibold mb-4">Failed to load city data: {error}</p>
                  <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold">Retry</button>
                </div>
              )}

              {!loading && !error && winner && (
                <>
                  {/* Winner card */}
                  <div className="bg-card rounded-2xl border border-border shadow-lg p-8 text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase block mb-2 inline-flex items-center gap-1 cursor-help">
                          Recommended Location <Info size={11} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-[280px]">The city with the lowest combined risk score given your answers. Adjust priorities in the Dashboard for deeper exploration.</TooltipContent>
                    </Tooltip>
                    <h2 className={`font-display text-3xl font-bold mt-2 ${riskColor(winnerScore)}`}>
                      {winner.city}
                    </h2>
                    <div className="flex items-center justify-center gap-3 mt-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-display text-4xl font-bold text-foreground cursor-help">{winnerScore.toFixed(1)}</span>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs max-w-[260px]">Composite risk score on a 0–10 scale. Lower = better. Combines water risk, climate load, carbon impact, and energy cost weighted by your priorities.</TooltipContent>
                      </Tooltip>
                      <span className="text-muted-foreground text-sm">/ 10</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full cursor-help ${riskBg(winnerScore)}`}>
                            {riskLabel(winnerScore)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs max-w-[240px]">Low Risk &lt; 3 · Medium 3–5 · High &gt; 5. Bands reflect overall sustainability and operational risk.</TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">{CITY_TAGLINES[winner.city] ?? `${winner.state} — see the dashboard for full breakdown.`}</p>
                  </div>

                  {/* Rankings */}
                  <div className="bg-card rounded-2xl border border-border shadow-lg p-6">
                    <h3 className="font-display text-lg font-bold text-foreground mb-4">Full Rankings</h3>
                    <div className="space-y-3">
                      {results.map((c, i) => (
                        <div key={c.city} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${i === 0 ? "border-primary/30 bg-accent" : "border-border"}`}>
                          <span className="font-display font-bold text-xl text-muted-foreground/40 w-8 text-center">#{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <span className="font-display font-bold text-[15px] text-foreground">{c.city}</span>
                            <p className="text-xs text-muted-foreground truncate">{CITY_TAGLINES[c.city] ?? c.state}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`font-display font-bold text-lg ${riskColor(c.total_score ?? 0)}`}>{(c.total_score ?? 0).toFixed(1)}</span>
                            <span className={`block text-[10px] font-semibold ${riskColor(c.total_score ?? 0)}`}>{riskLabel(c.total_score ?? 0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weights summary */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-card rounded-2xl border border-border shadow-lg p-6 text-center cursor-help">
                        <span className="text-xs text-muted-foreground font-semibold tracking-wide uppercase inline-flex items-center gap-1">
                          Your Profile <Info size={11} />
                        </span>
                        <p className="font-mono-code text-sm text-foreground mt-2">
                          Water×{weights.water} · Climate×{weights.climate} · Carbon×{weights.carbon} · Cost×{weights.cost}
                        </p>
                        <p className="text-xs text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
                          Weights are derived from your four answers. The highest weight indicates your dominant priority. You can fine-tune these exact values using the Dashboard sliders for deeper scenario exploration.
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); goToDashboard(); }}
                          className="mt-4 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md hover:opacity-90 transition-all"
                        >
                          Open in Dashboard with these weights →
                        </button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs max-w-[280px]">The four scoring weights derived from your answers. Higher values mean that pillar pulled more influence in the ranking. You can fine-tune these in the Dashboard.</TooltipContent>
                  </Tooltip>

                  {/* Actions */}
                  <div className="flex gap-3 justify-center pt-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={goToDashboard}
                          className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-3 rounded-lg shadow-md hover:opacity-90 transition-all"
                        >
                          Explore in Dashboard →
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-[260px]">Open the full dashboard pre-loaded with your weights to dive deeper into the data.</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={reset}
                          className="border border-border text-foreground text-sm font-semibold px-6 py-3 rounded-lg hover:bg-muted transition-all"
                        >
                          Start Over
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">Reset all answers and run the wizard again.</TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      </TooltipProvider>

      <Footer />
    </div>
  );
};

export default SiteRecommender;
