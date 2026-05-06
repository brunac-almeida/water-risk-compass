import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const pillarFormulas = [
  { name: "Water Risk Score", formula: "0.34×stress + 0.28×drought + 0.22×price + 0.11×(1−precip) + 0.05×rain_std" },
  { name: "Climate Load Index", formula: "0.34×summer_temp + 0.30×CDD + 0.18×annual_temp + 0.18×HDD" },
  { name: "Carbon Impact Score", formula: "mean of available normalized carbon signals" },
  { name: "Energy Cost Score", formula: "0.5×elec_price + 0.5×industrial_USD (or 100% elec_price if no merge)" },
];

const glossary = [
  {
    term: "Total Impact Score",
    definition:
      "A single 0–10 number summarizing how favorable a city is for siting a water-intensive data center. It blends water, carbon, and cooling factors using user-adjustable weights. Lower is better.",
  },
  {
    term: "Water Stress",
    definition:
      "A measure of how scarce or contested local water supply is. Higher water stress means competition with farms, residents, and industry — and a greater long-term sustainability risk for water-hungry cooling systems.",
  },
  {
    term: "Water Price",
    definition:
      "The cost per 1,000 gallons of municipal water, used here as a real-world proxy for water scarcity. Cities with stressed supplies typically charge more, making price a practical signal of long-term water risk.",
  },
  {
    term: "Carbon Intensity",
    definition:
      "The amount of CO₂ emitted per unit of electricity generated on the local power grid (kg CO₂ per MWh). Lower carbon intensity means cleaner electricity and a smaller climate footprint per server hour.",
  },
  {
    term: "Cooling Cost Index",
    definition:
      "A normalized estimate of how much energy and water a data center will need to stay cool in a given climate. Hotter cities score higher (worse) because cooling equipment must work harder year-round.",
  },
  {
    term: "Normalization (Min–Max Scaling)",
    definition:
      "A statistical step that rescales each variable to a 0–1 range so different units (°F, $/gal, kg CO₂) can be fairly combined into one score without one variable dominating the others.",
  },
  {
    term: "Scenario Weighting",
    definition:
      "The multiplier applied to each index (water, carbon, cooling) to reflect a stakeholder's priorities. Increasing the water weight, for example, makes water-stressed cities rank worse in the final score.",
  },
  {
    term: "Hyperscale Data Center",
    definition:
      "A very large facility (typically 100,000+ sq ft) operated by major cloud providers. These sites can consume millions of gallons of water and hundreds of megawatts of power annually.",
  },
  {
    term: "Grid Mix",
    definition:
      "The combination of energy sources (coal, gas, nuclear, hydro, wind, solar) that supplies a region's electricity. The grid mix directly determines carbon intensity in that location.",
  },
  {
    term: "Site Selection",
    definition:
      "The process of choosing where to build infrastructure based on multiple criteria. This tool focuses on environmental criteria — water, carbon, and cooling — that are often underweighted in traditional siting decisions.",
  },
];

const pipelineSteps = [
  { num: "01", title: "Data Collection", text: "Gather temperature, water price, and carbon intensity from NOAA, EIA, and Circle of Blue for 5 U.S. cities." },
  { num: "02", title: "Normalization", text: "Apply min-max scaling to convert all variables to a 0–1 scale for fair cross-variable comparison." },
  { num: "03", title: "Index Calculation", text: "Compute four sub-indices: Water Risk Score, Climate Load Index, Carbon Impact Score, and Energy Cost Score." },
  { num: "04", title: "Weighting", text: "Apply scenario weights to each index — adjustable by the user to reflect different planning priorities." },
  { num: "05", title: "Visualization", text: "Render results as interactive charts, a clickable map, and a Total Impact Score. Lower = better." },
];

const inputGroups = [
  {
    label: "Water",
    accent: "border-l-teal",
    tagColor: "text-teal",
    vars: [
      { label: "Water Stress Index", source: "WRI Aqueduct · 2023 · Baseline water stress ratio" },
      { label: "Water Price ($/1,000 gal)", source: "Circle of Blue · 2018 · Standardized 100 gal/person/day scenario" },
      { label: "Annual Precipitation (in)", source: "NOAA Climate at a Glance · 2023 · State-level annual total" },
      { label: "Monthly Rainfall Variability", source: "NOAA NCEI · 2023 · Coefficient of variation across monthly totals" },
    ],
  },
  {
    label: "Climate",
    accent: "border-l-risk-amber",
    tagColor: "text-risk-amber",
    vars: [
      { label: "Temperature (°F)", source: "NOAA Climate at a Glance · 2023 · Annual average and June–August mean" },
      { label: "Cooling Degree Days (CDD)", source: "NOAA NCEI · 2023 · Annual state-level totals" },
      { label: "Heating Degree Days (HDD)", source: "NOAA NCEI · 2023 · Annual state-level totals" },
    ],
  },
  {
    label: "Energy & Carbon",
    accent: "border-l-risk-green",
    tagColor: "text-risk-green",
    vars: [
      { label: "Grid Carbon Intensity (kg CO₂/MWh)", source: "EIA SEDS + Generation Data · 2023 · State-level" },
      { label: "Energy Cost Index", source: "EIA Electric Power Monthly · 2023 · Industrial rate" },
    ],
  },
];

const outputIndices = [
  { label: "Water Risk Score", color: "text-teal", formula: "Normalized Water Price, Drought Risk, and Water Stress Index" },
  { label: "Climate Load Index", color: "text-risk-amber", formula: "Normalized Temperature, CDD, HDD, and Precipitation" },
  { label: "Carbon Impact Score", color: "text-risk-green", formula: "Normalized Grid Carbon Intensity" },
  { label: "Energy Cost Score", color: "text-foreground", formula: "Normalized electricity and industrial cost proxy" },
  { label: "Total Impact Score", color: "text-foreground", formula: "Combines the four pillar scores using user-adjustable weights. Scale 0–10. Lower = better site." },
];

const Methodology = () => {
  const [showFormulas, setShowFormulas] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [showOutputs, setShowOutputs] = useState(false);
  const [showNormFormula, setShowNormFormula] = useState(false);
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);
  return (
  <div className="bg-cream min-h-screen">
    <Navbar />

    {/* Section 1 — Page header */}
    <section className="max-w-[1240px] mx-auto px-14 pt-20 pb-14">
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
        <h1 className="font-display text-[42px] leading-[1.15] font-black text-foreground">
          How It <span className="text-teal">Works</span>
        </h1>
        <p className="text-[15px] text-slate leading-[1.75] max-w-[520px] lg:text-right">
          A transparent, step-by-step breakdown of how raw environmental data becomes an actionable site-selection score.
        </p>
      </div>
    </section>

    {/* Section 2 — Data Pipeline */}
    <section className="max-w-[1240px] mx-auto px-14 pb-20">

      <div className="flex items-stretch gap-0">
        {pipelineSteps.map((step, i) => (
          <div key={step.num} className="flex items-stretch flex-1 min-w-0">
            <div className="bg-card rounded-xl border border-border p-5 flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg flex-1">
              <span className="font-mono text-[11px] text-teal mb-2">Step {step.num}</span>
              <h3 className="font-display text-[15px] font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-[13px] text-slate leading-[1.65]">{step.text}</p>
              {step.num === "02" && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowNormFormula((v) => !v)}
                    className="font-mono text-[11px] text-teal hover:text-teal/80 inline-flex items-center gap-1 transition-colors"
                    aria-expanded={showNormFormula}
                  >
                    <span className="text-[10px]">{showNormFormula ? "▾" : "▸"}</span>
                    {showNormFormula ? "Hide formula" : "Show formula"}
                  </button>
                  {showNormFormula && (
                    <div className="mt-2 border border-border rounded-md bg-muted/40 p-3 font-mono text-[10.5px] leading-[1.55] flex flex-col gap-2">
                      <div className="text-foreground font-semibold">norm(x) = (x − min) / (max − min)</div>
                      <div className="text-slate">0 = best in group — 1 = worst in group</div>
                      <div className="text-slate">Exception: annual precipitation uses 1 − norm(x) so less rain = higher risk score</div>
                    </div>
                  )}
                </div>
              )}
              {step.num === "03" && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowFormulas((v) => !v)}
                    className="font-mono text-[11px] text-teal hover:text-teal/80 inline-flex items-center gap-1 transition-colors"
                    aria-expanded={showFormulas}
                  >
                    <span className="text-[10px]">{showFormulas ? "▾" : "▸"}</span>
                    {showFormulas ? "Hide pillar formulas" : "Show pillar formulas"}
                  </button>
                  {showFormulas && (
                    <div className="mt-2 border border-border rounded-md bg-muted/40 p-3 font-mono text-[10.5px] leading-[1.55] grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                      {pillarFormulas.map((p) => (
                        <div key={p.name} className="contents">
                          <span className="text-teal whitespace-nowrap font-semibold">{p.name}</span>
                          <span className="text-slate break-words">{p.formula}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {i < pipelineSteps.length - 1 && (
              <div className="flex items-center px-2 text-teal/40 text-xl font-bold shrink-0">→</div>
            )}
          </div>
        ))}
      </div>
    </section>

    {/* Section 3 — Input Variables & Output Indices */}
    <section className="bg-background py-20">
      <div className="max-w-[1240px] mx-auto px-14 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        {/* Raw Input Variables */}
        <div className="bg-card rounded-xl border border-border overflow-hidden flex">
          <div className="border-l-4 border-l-teal p-7 flex-1">
            <button
              type="button"
              onClick={() => setShowInputs((v) => !v)}
              aria-expanded={showInputs}
              className="w-full flex items-start justify-between gap-4 text-left"
            >
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-1">Raw Input Variables</h3>
                <p className="text-[12.5px] text-slate leading-[1.6]">
                  Public datasets used as inputs for the scoring model.
                </p>
              </div>
              <ChevronDown
                className={`text-teal shrink-0 mt-1 transition-transform duration-300 ${showInputs ? "rotate-180" : ""}`}
                size={20}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${showInputs ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-6">
                  {inputGroups.map((g) => (
                    <div key={g.label} className={`border-l-2 ${g.accent} pl-4`}>
                      <p className={`font-mono text-[11px] uppercase tracking-wider ${g.tagColor} mb-3`}>{g.label}</p>
                      <div className="flex flex-col gap-4">
                        {g.vars.map((v) => (
                          <div key={v.label}>
                            <p className="text-[15px] font-semibold text-foreground">{v.label}</p>
                            <p className="text-[13px] text-slate leading-[1.6] mt-0.5">{v.source}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scoring Steps (middle) */}
        <div className="bg-card rounded-xl border border-border overflow-hidden lg:w-[260px]">
          <div className="border-l-4 border-l-risk-amber p-7">
            <button
              type="button"
              onClick={() => setShowSteps((v) => !v)}
              aria-expanded={showSteps}
              className="w-full flex items-start justify-between gap-4 text-left"
            >
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-1">Scoring Steps</h3>
                <p className="text-[12.5px] text-slate leading-[1.6]">
                  Read, normalize, compute.
                </p>
              </div>
              <ChevronDown
                className={`text-risk-amber shrink-0 mt-1 transition-transform duration-300 ${showSteps ? "rotate-180" : ""}`}
                size={20}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${showSteps ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-1">
                  {[
                    { n: "1", title: "Read raw data", sub: "CSV input files" },
                    { n: "2", title: "Normalize", sub: "Min-max 0–1 per variable" },
                    { n: "3", title: "Compute pillars", sub: "Fixed inner weights" },
                  ].map((s, i, arr) => (
                    <div key={s.n} className="flex flex-col items-center">
                      <div className="bg-card border border-border rounded-xl px-4 py-3 text-center w-full shadow-sm">
                        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate/70 mb-1">Step {s.n}</p>
                        <p className="font-display text-[15px] font-bold text-foreground leading-tight">{s.title}</p>
                        <p className="text-[12px] text-risk-amber leading-tight mt-1">{s.sub}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="text-slate/40 text-base leading-none my-1">↓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculated Pillar Scores */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="border-l-4 border-l-risk-coral p-7">
            <button
              type="button"
              onClick={() => setShowOutputs((v) => !v)}
              aria-expanded={showOutputs}
              className="w-full flex items-start justify-between gap-4 text-left"
            >
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-1">Calculated Pillar Scores</h3>
                <p className="text-[12.5px] text-slate leading-[1.6]">
                  Normalized pillar scores used in the final site ranking.
                </p>
              </div>
              <ChevronDown
                className={`text-risk-coral shrink-0 mt-1 transition-transform duration-300 ${showOutputs ? "rotate-180" : ""}`}
                size={20}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${showOutputs ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-5">
                  {outputIndices.map((v) => (
                    <div key={v.label}>
                      <p className={`text-[15px] font-semibold ${v.color}`}>{v.label}</p>
                      <p className="text-[13px] text-slate leading-[1.6] mt-0.5">{v.formula}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Section 4 — Formula box */}
    <section className="max-w-[1240px] mx-auto px-14 pb-20 pt-4 space-y-6">
      {/* Section 1 — Three layer bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 border border-border rounded-xl overflow-hidden bg-card">
        {[
          {
            label: "INPUTS — FIXED",
            tagColor: "text-teal",
            title: "Pillar scores (0–1)",
            text: "Generated by the Python scoring engine. Not affected by sliders.",
          },
          {
            label: "USER-CONTROLLED",
            tagColor: "text-risk-amber",
            title: "Dynamic weights (W1–W4)",
            text: "Controlled by dashboard sliders. Range 0–5. Only ratios matter.",
          },
          {
            label: "RESULT",
            tagColor: "text-risk-green",
            title: "Final output (0–10)",
            text: "Lower score = lower risk = better site for your priorities.",
          },
        ].map((row, i, arr) => (
          <div
            key={row.label}
            className={`p-5 ${i < arr.length - 1 ? "md:border-r border-b md:border-b-0 border-border" : ""}`}
          >
            <p className={`font-mono text-[11px] uppercase tracking-wider ${row.tagColor} mb-1`}>{row.label}</p>
            <p className="font-display text-[15px] font-bold text-foreground mb-2">{row.title}</p>
            <p className="text-[13px] text-slate leading-[1.65]">{row.text}</p>
          </div>
        ))}
      </div>

      {/* Section 2 — Formula block */}
      <div className="bg-teal-light rounded-xl p-10 border border-border">
        <div className="font-mono text-[15px] text-foreground">
          {/* Line 1 — single unwrapped line, scrollable */}
          <div className="overflow-x-auto">
            <div className="inline-flex items-center gap-2 whitespace-nowrap min-w-full justify-center px-2">
              <span className="text-slate">Total Impact Score =</span>
              <span className="text-foreground font-semibold">10</span>
              <span className="text-slate">×</span>
              <span className="text-slate">[</span>
              {[
                { abbr: "WR", weight: "2.0", textClass: "text-teal", pillClass: "bg-teal/15 text-teal border-teal/30" },
                { abbr: "CL", weight: "1.0", textClass: "text-risk-amber", pillClass: "bg-risk-amber/15 text-risk-amber border-risk-amber/30" },
                { abbr: "CB", weight: "1.5", textClass: "text-risk-green", pillClass: "bg-risk-green/15 text-risk-green border-risk-green/30" },
                { abbr: "EC", weight: "2.0", textClass: "text-risk-coral", pillClass: "bg-risk-coral/15 text-risk-coral border-risk-coral/30" },
              ].map((p, i, arr) => (
                <span key={p.abbr} className="inline-flex items-center gap-2">
                  <span className="text-slate">(</span>
                  <span className={`font-bold ${p.textClass}`}>{p.abbr}</span>
                  <span className="text-slate">×</span>
                  <span className={`inline-flex items-center justify-center min-w-[40px] px-2.5 py-0.5 rounded-full border text-[12px] font-bold ${p.pillClass}`}>
                    {p.weight}
                  </span>
                  <span className="text-slate">)</span>
                  {i < arr.length - 1 && <span className="text-slate">+</span>}
                </span>
              ))}
              <span className="text-slate">]</span>
            </div>
          </div>

          {/* Line 2 — denominator with subtle top divider */}
          <div className="mt-5 pt-4 border-t border-border/60">
            <div className="overflow-x-auto">
              <div className="inline-flex items-center gap-2 whitespace-nowrap min-w-full justify-center px-2 text-foreground/70">
                <span>÷ (W1 + W2 + W3 + W4)</span>
                <span className="text-slate">=</span>
                <span>÷</span>
                <span className="font-semibold text-teal">6.5</span>
              </div>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-teal text-center mt-2">
              sum of weights — updates automatically as sliders move
            </p>
          </div>
        </div>

        <p className="font-body text-[13px] text-slate italic mt-6 text-center">
          Weights are user-adjustable. Base case prioritizes water and energy cost (2.0×). Lower score = more sustainable site.
        </p>
      </div>

      {/* Why lower is better callout — moved above note cards */}
      <div className="bg-teal-light rounded-xl border border-border border-l-4 border-l-teal p-7">
        <p className="font-display text-[16px] font-bold text-teal mb-2">Why lower is better</p>
        <p className="text-[13.5px] text-slate leading-[1.7]">
          Each pillar score represents relative risk within this city cohort. A score of 0 means best in group, 1 means worst in group. The total score aggregates those risks — a site scoring 2.5/10 has consistently low risk across your priority dimensions.
        </p>
      </div>

      {/* Section 3 — Four note cards (2x2 grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            title: "Why ÷ sum of weights?",
            body: "Keeps the output on 0–10 regardless of slider values. Doubling all four weights produces the same result — only the ratios between them matter.",
          },
          {
            title: "Why × 10?",
            body: "Converts the 0–1 weighted average into a 0–10 scale. Purely cosmetic — 3.2 out of 10 is more readable than 0.32 out of 1 for a planning conversation.",
          },
          {
            title: "What are WR, CL, CB, EC?",
            body: "Water Risk, Climate Load, Carbon Impact, Energy Cost. Each is a 0–1 score from the Python engine. Fixed — the user cannot change these, only the weights.",
          },
          {
            title: "Lower is better",
            body: "Each pillar score represents relative risk within the city cohort. 0 = best in group, 1 = worst in group. Total Score aggregates those risks — lower means less risk on your priorities.",
          },
        ].map((note, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <p className="font-mono text-[11px] text-teal mb-2">Note {String(i + 1).padStart(2, "0")}</p>
            <p className="font-display text-[14px] font-bold text-foreground mb-2">{note.title}</p>
            <p className="text-[13px] text-slate leading-[1.65]">{note.body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Section 5 — Glossary */}
    <section id="glossary" className="bg-background py-20 border-t border-border scroll-mt-24">
      <div className="max-w-[1240px] mx-auto px-14">
        <div className="mb-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-black text-foreground">
              Common Terms & Definitions
            </h2>
          </div>
          <p className="text-[14px] text-slate leading-[1.7] max-w-[480px]">
            Plain-language definitions of the technical terms used throughout this tool — written for planners, executives, and policy makers, not just engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {glossary.map((item) => (
            <div
              key={item.term}
              className="bg-card rounded-xl border border-border p-6 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-teal/40"
            >
              <h3 className="font-display text-[16px] font-bold text-teal mb-2">
                {item.term}
              </h3>
              <p className="text-[13.5px] text-slate leading-[1.7]">
                {item.definition}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Footer />
  </div>
  );
};

export default Methodology;
