import { useState } from "react";
import { RotateCw } from "lucide-react";

const cities = [
  {
    name: "Northern Virginia",
    state: "Virginia",
    region: "Data Center Alley",
    color: "teal" as const,
    back: "Ashburn hosts an estimated 70% of global internet traffic — the highest data center density of any market in the world.",
  },
  {
    name: "Dallas–Fort Worth",
    state: "Texas",
    region: "Central U.S. Hub",
    color: "amber" as const,
    back: "One of the fastest-growing US markets — low power costs and central connectivity with minimal natural disaster exposure.",
  },
  {
    name: "Silicon Valley",
    state: "California",
    region: "West Coast Tech Core",
    color: "green" as const,
    back: "Highest infrastructure density in the cohort but also the highest water stress and land costs — premium location, premium risk.",
  },
  {
    name: "Phoenix",
    state: "Arizona",
    region: "Southwest Desert",
    color: "coral" as const,
    back: "High cooling demand and the most acute water stress in the cohort — a high-risk, high-growth market.",
  },
  {
    name: "Chicago",
    state: "Illinois",
    region: "Midwest Hub",
    color: "teal" as const,
    back: "Great Lakes water access and the lowest cooling demand in the cohort — the most balanced risk profile of the five markets.",
  },
];

const colorMap = {
  green: { stripe: "from-risk-green to-[#2da362]", name: "text-risk-green", border: "border-risk-green/30" },
  teal: { stripe: "from-teal to-[#00a8b5]", name: "text-teal", border: "border-teal/30" },
  amber: { stripe: "from-risk-amber to-[#e89420]", name: "text-risk-amber", border: "border-risk-amber/30" },
  coral: { stripe: "from-risk-coral to-[#e0603e]", name: "text-risk-coral", border: "border-risk-coral/30" },
};

const CitiesStrip = () => {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const toggle = (name: string) =>
    setFlipped((prev) => ({ ...prev, [name]: !prev[name] }));

  return (
    <section className="py-14 pb-16">
      <div className="max-w-[1240px] mx-auto px-14">
        <h2 className="font-display text-[42px] font-black leading-[1.1] text-foreground mb-2">
          5 Cities. One Comparison.
        </h2>
        <p className="text-[15px] text-slate leading-[1.7]">
          The top U.S. markets featured in this analysis
        </p>
        <p className="mt-3 inline-flex items-center gap-2 text-[13px] text-slate">
          <RotateCw className="w-3.5 h-3.5 text-teal" aria-hidden="true" />
          Click any card to reveal the details
        </p>

        <div className="grid grid-cols-5 gap-3.5 mt-8">
          {cities.map((city) => {
            const c = colorMap[city.color];
            const isFlipped = !!flipped[city.name];
            return (
              <div
                key={city.name}
                className={`flip-card cursor-pointer transition-transform duration-200 hover:-translate-y-1.5 hover:drop-shadow-lg ${isFlipped ? "flipped" : ""}`}
                onClick={() => toggle(city.name)}
              >
                <div className="flip-card-inner grid w-full" style={{ gridTemplateAreas: '"stack"' }}>
                  {/* Front */}
                  <div className={`flip-card-front [grid-area:stack] relative w-full bg-card border border-border rounded-2xl p-[22px] px-[18px] shadow-[0_4px_20px_rgba(26,26,46,0.08)] overflow-hidden`}>
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.stripe}`} />
                    <div className={`font-display text-lg font-bold leading-tight mb-1.5 ${c.name}`}>
                      {city.name}
                    </div>
                    <div className="font-mono-code text-[10px] text-slate uppercase tracking-[1px] mb-2">
                      {city.state}
                    </div>
                    <div className="text-[12px] text-slate leading-snug">
                      {city.region}
                    </div>
                  </div>

                  {/* Back */}
                  <div className={`flip-card-back [grid-area:stack] relative w-full bg-card border ${c.border} rounded-2xl p-[18px] shadow-[0_4px_20px_rgba(26,26,46,0.08)] overflow-hidden flex items-center`}>
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.stripe}`} />
                    <p className="text-[11px] text-slate leading-[1.55]">
                      {city.back}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CitiesStrip;
