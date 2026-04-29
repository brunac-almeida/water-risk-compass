import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  { num: "03", title: "Index Calculation", text: "Compute three sub-indices: Cooling Cost Index, Water Stress Score, and Carbon Cost Index." },
  { num: "04", title: "Weighting", text: "Apply scenario weights to each index — adjustable by the user to reflect different planning priorities." },
  { num: "05", title: "Visualization", text: "Render results as interactive charts, a clickable map, and a Total Impact Score. Lower = better." },
];

const inputVars = [
  { label: "Average Temperature (°F)", source: "NOAA Climate at a Glance · 2023 · State-level annual average" },
  { label: "Water Price ($/1,000 gal)", source: "Circle of Blue · 2018 · Standardized 100 gal/person/day scenario" },
  { label: "Grid Carbon Intensity (kg CO₂/MWh)", source: "EIA SEDS + Generation Data · 2023 · State-level" },
];

const outputIndices = [
  { label: "Cooling Cost Index", color: "text-risk-amber", formula: "Normalized Temperature" },
  { label: "Water Stress Score", color: "text-teal", formula: "Normalized Water Price" },
  { label: "Carbon Cost Index", color: "text-risk-green", formula: "Normalized Grid Carbon Intensity" },
  { label: "Total Impact Score", color: "text-foreground", formula: "Weighted sum of all three indices — lower is better" },
];

const Methodology = () => {
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
      <div className="mb-8">
        <span className="inline-block font-mono text-[11px] text-teal bg-teal/10 px-3 py-1 rounded-full tracking-wide">
          // Data Pipeline
        </span>
      </div>

      <div className="flex items-stretch gap-0">
        {pipelineSteps.map((step, i) => (
          <div key={step.num} className="flex items-stretch flex-1 min-w-0">
            <div className="bg-card rounded-xl border border-border p-5 flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg flex-1">
              <span className="font-mono text-[11px] text-teal mb-2">Step {step.num}</span>
              <h3 className="font-display text-[15px] font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-[13px] text-slate leading-[1.65]">{step.text}</p>
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
      <div className="max-w-[1240px] mx-auto px-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Variables */}
        <div className="bg-card rounded-xl border border-border overflow-hidden flex">
          <div className="border-l-4 border-l-teal p-7 flex-1">
            <h3 className="font-display text-xl font-bold text-foreground mb-5">Input Variables</h3>
            <div className="flex flex-col gap-5">
              {inputVars.map((v) => (
                <div key={v.label}>
                  <p className="text-[15px] font-semibold text-foreground">{v.label}</p>
                  <p className="text-[13px] text-slate leading-[1.6] mt-0.5">{v.source}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output Indices */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="border-l-4 border-l-risk-coral p-7">
            <h3 className="font-display text-xl font-bold text-foreground mb-5">Output Indices</h3>
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
    </section>

    {/* Section 4 — Formula box */}
    <section className="max-w-[1240px] mx-auto px-14 pb-20 pt-4">
      <div className="bg-teal-light rounded-xl p-10 text-center border border-border">
        <p className="font-mono text-[15px] leading-[2.2] text-foreground">
          <span className="text-slate">Total Impact Score =</span>
          <br />
          ( <span className="text-teal font-semibold">Water Stress Score</span> × 2.0 ) +
          <br />
          ( <span className="text-risk-green font-semibold">Carbon Cost Index</span> × 1.5 ) +
          <br />
          ( <span className="text-risk-amber font-semibold">Cooling Cost Index</span> × 1.0 )
          <br />
          <span className="text-slate">÷ 4.5 × 10  →  displayed on a 0–10 scale</span>
        </p>
        <p className="font-body text-[13px] text-slate italic mt-6">
          Weights are user-adjustable. Base case prioritizes water sustainability (2.0×). Lower score = more sustainable site.
        </p>
      </div>
    </section>

    {/* Section 5 — Glossary */}
    <section id="glossary" className="bg-background py-20 border-t border-border scroll-mt-24">
      <div className="max-w-[1240px] mx-auto px-14">
        <div className="mb-10 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
          <div>
            <span className="inline-block font-mono text-[11px] text-teal bg-teal/10 px-3 py-1 rounded-full mb-4 tracking-wide">
              // Glossary
            </span>
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
