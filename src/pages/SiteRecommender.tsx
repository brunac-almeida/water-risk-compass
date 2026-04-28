import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Progress } from "@/components/ui/progress";

/* ── City data & scoring (same as Dashboard) ── */
const BASE_DATA = [
  { city: "Northern Virginia", water_stress: 0.434, carbon_index: 0.419, cooling_cost: 0.249, raw_temp: "55.1°F", raw_water: "$4.95/1k gal", raw_carbon: "235.0 kg CO₂/MWh" },
  { city: "Dallas–Fort Worth", water_stress: 0.251, carbon_index: 1.0, cooling_cost: 1.0, raw_temp: "64.9°F", raw_water: "$4.29/1k gal", raw_carbon: "338.6 kg CO₂/MWh" },
  { city: "Silicon Valley", water_stress: 1.0, carbon_index: 0.0, cooling_cost: 0.45, raw_temp: "57.7°F", raw_water: "$7.00/1k gal", raw_carbon: "160.2 kg CO₂/MWh" },
  { city: "Phoenix", water_stress: 0.0, carbon_index: 0.831, cooling_cost: 0.604, raw_temp: "59.8°F", raw_water: "$3.38/1k gal", raw_carbon: "308.5 kg CO₂/MWh" },
  { city: "Chicago", water_stress: 0.139, carbon_index: 0.294, cooling_cost: 0.0, raw_temp: "51.9°F", raw_water: "$3.88/1k gal", raw_carbon: "212.7 kg CO₂/MWh" },
];

const CITY_TAGLINES: Record<string, string> = {
  "Chicago": "Cleanest grid and lowest cooling demand — strong all-around choice",
  "Northern Virginia": "Largest market with moderate risk profile — good infrastructure",
  "Phoenix": "Fast-growing market but high carbon grid — monitor closely",
  "Silicon Valley": "Cleanest electricity grid but highest water price in the dataset",
  "Dallas–Fort Worth": "Strong connectivity hub but highest carbon intensity of all markets",
};

type Weights = { water: number; carbon: number; cooling: number };

function computeTotal(c: typeof BASE_DATA[0], w: Weights) {
  const raw = (c.water_stress * 100) * w.water + (c.carbon_index * 100) * w.carbon + (c.cooling_cost * 100) * w.cooling;
  return +(raw / (w.water + w.carbon + w.cooling)).toFixed(1);
}

const riskLabel = (s: number) => s < 30 ? "Low Risk" : s <= 50 ? "Medium Risk" : "High Risk";
const riskColor = (s: number) => s < 30 ? "text-risk-green" : s <= 50 ? "text-risk-amber" : "text-risk-coral";
const riskBg = (s: number) => s < 30 ? "bg-green-light text-risk-green" : s <= 50 ? "bg-amber-light text-risk-amber" : "bg-coral-light text-risk-coral";

/* ── Wizard steps config ── */
const FACILITY_TYPES = [
  { label: "Cloud / Hyperscale", desc: "Large scale, water-intensive cooling" },
  { label: "Colocation", desc: "Shared facility, moderate footprint" },
  { label: "AI / GPU Cluster", desc: "Very high power density, cooling critical" },
  { label: "Enterprise", desc: "Private facility, balanced needs" },
];

const CONSTRAINTS = [
  { label: "Water Availability", desc: "Water scarcity is a deal-breaker", key: "water" as const },
  { label: "Carbon Footprint", desc: "ESG commitments require a clean grid", key: "carbon" as const },
  { label: "Cooling Cost", desc: "Energy cost for cooling dominates OpEx", key: "cooling" as const },
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

  const canAdvance = step === 0 ? facility !== null : step === 1 ? constraint !== null : step === 2 ? riskTol !== null : true;

  /* Compute weights from answers */
  const weights = useMemo<Weights>(() => {
    // Base weights from facility type
    let w: Weights = { water: 1.5, carbon: 1.5, cooling: 1.5 };
    if (facility === 0) w = { water: 2.0, carbon: 1.5, cooling: 1.0 }; // Cloud
    if (facility === 1) w = { water: 1.5, carbon: 1.5, cooling: 1.5 }; // Colo
    if (facility === 2) w = { water: 1.0, carbon: 1.0, cooling: 2.5 }; // AI/GPU
    if (facility === 3) w = { water: 1.5, carbon: 1.5, cooling: 1.5 }; // Enterprise

    // Constraint override
    if (constraint === 0) w.water = 3.0;
    if (constraint === 1) w.carbon = 3.0;
    if (constraint === 2) w.cooling = 3.0;
    if (constraint === 3) { w.water = 1.5; w.carbon = 1.5; w.cooling = 1.5; }

    // Risk tolerance
    if (riskTol === 0) { w.water *= 1.3; w.carbon *= 1.3; w.cooling *= 1.3; }
    if (riskTol === 2) {
      const maxKey = w.water >= w.carbon && w.water >= w.cooling ? "water" : w.carbon >= w.cooling ? "carbon" : "cooling";
      for (const k of ["water", "carbon", "cooling"] as const) {
        if (k !== maxKey) w[k] *= 0.5;
      }
    }

    // Sustainability slider
    if (sustainability >= 4) { w.water += 0.5; w.carbon += 0.5; }
    if (sustainability <= 2) { w.cooling += 0.5; }

    // Round
    w.water = +w.water.toFixed(1);
    w.carbon = +w.carbon.toFixed(1);
    w.cooling = +w.cooling.toFixed(1);
    return w;
  }, [facility, constraint, riskTol, sustainability]);

  const results = useMemo(() =>
    BASE_DATA.map(c => ({ ...c, total_score: computeTotal(c, weights) }))
      .sort((a, b) => a.total_score - b.total_score),
    [weights]
  );

  const reset = () => { setStep(0); setFacility(null); setConstraint(null); setRiskTol(null); setSustainability(3); };

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

  return (
    <div className="bg-background min-h-screen font-body flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="max-w-[800px] mx-auto px-4 pt-16 pb-8 text-center">
        <span className="inline-block font-mono-code text-xs tracking-widest text-primary bg-accent px-3 py-1 rounded-full mb-4">
          // Smart Site Selection
        </span>
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
                <button
                  onClick={() => setStep(s => s - 1)}
                  className={`text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors ${step === 0 ? "invisible" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canAdvance}
                  className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {step === 3 ? "See Results" : "Next →"}
                </button>
              </div>
            </div>
          )}

          {/* ── Results ── */}
          {step === 4 && (
            <div className="space-y-5">
              {/* Winner card */}
              <div className="bg-card rounded-2xl border border-border shadow-lg p-8 text-center">
                <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase block mb-2">Recommended Location</span>
                <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">Recommended Location</span>
                <h2 className={`font-display text-3xl font-bold mt-2 ${riskColor(results[0].total_score)}`}>
                  {results[0].city}
                </h2>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span className="font-display text-4xl font-bold text-foreground">{results[0].total_score.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">/ 100</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${riskBg(results[0].total_score)}`}>
                    {riskLabel(results[0].total_score)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">{CITY_TAGLINES[results[0].city]}</p>
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
                        <p className="text-xs text-muted-foreground truncate">{CITY_TAGLINES[c.city]}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-display font-bold text-lg ${riskColor(c.total_score)}`}>{c.total_score.toFixed(1)}</span>
                        <span className={`block text-[10px] font-semibold ${riskColor(c.total_score)}`}>{riskLabel(c.total_score)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weights summary */}
              <div className="bg-card rounded-2xl border border-border shadow-lg p-6 text-center">
                <span className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">Your Profile</span>
                <p className="font-mono-code text-sm text-foreground mt-2">
                  Water×{weights.water} · Carbon×{weights.carbon} · Cooling×{weights.cooling}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-3 rounded-lg shadow-md hover:opacity-90 transition-all"
                >
                  Explore in Dashboard →
                </button>
                <button
                  onClick={reset}
                  className="border border-border text-foreground text-sm font-semibold px-6 py-3 rounded-lg hover:bg-muted transition-all"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SiteRecommender;
