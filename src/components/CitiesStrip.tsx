import { useState } from "react";

const cities = [
  {
    name: "Northern Virginia",
    state: "Virginia",
    region: "Data Center Alley",
    color: "teal" as const,
    description:
      "Home to Data Center Alley in Ashburn — the largest concentration of data centers in the world. Hosts an estimated 70% of global internet traffic. Anchor tenants include AWS, Microsoft, and Google.",
  },
  {
    name: "Dallas–Fort Worth",
    state: "Texas",
    region: "Central U.S. Hub",
    color: "amber" as const,
    description:
      "One of the fastest-growing US data center markets driven by affordable power and central connectivity. Major hub for financial services and enterprise colocation. Low natural disaster risk relative to coastal markets.",
  },
  {
    name: "Silicon Valley",
    state: "California",
    region: "West Coast Tech Core",
    color: "green" as const,
    description:
      "Birthplace of the modern data center industry with premium infrastructure density. Faces significant water stress and highest land and power costs in the cohort. Home to hyperscale campuses for Meta, Google, and Apple.",
  },
  {
    name: "Phoenix",
    state: "Arizona",
    region: "Southwest Desert",
    color: "coral" as const,
    description:
      "Rapidly expanding Sun Belt market with low land costs and strong solar potential. Faces the most severe long-term water risk in this cohort due to Colorado River constraints. Major Microsoft and Google investment despite sustainability concerns.",
  },
  {
    name: "Chicago",
    state: "Illinois",
    region: "Midwest Hub",
    color: "teal" as const,
    description:
      "Midwest hub with access to Great Lakes water, a diversifying grid, and moderate climate load. Lowest cooling demand in the cohort. Strong fiber density and growing colocation market.",
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

        <div className="grid grid-cols-5 gap-3.5 mt-8">
          {cities.map((city) => {
            const c = colorMap[city.color];
            const isFlipped = !!flipped[city.name];
            return (
              <div
                key={city.name}
                className={`flip-card cursor-pointer h-[180px] transition-transform duration-200 hover:-translate-y-1.5 hover:drop-shadow-lg ${isFlipped ? "flipped" : ""}`}
                onClick={() => toggle(city.name)}
              >
                <div className="flip-card-inner relative w-full h-full">
                  {/* Front */}
                  <div className="flip-card-front absolute inset-0 bg-card border border-border rounded-2xl p-[22px] px-[18px] shadow-[0_4px_20px_rgba(26,26,46,0.08)] overflow-hidden">
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
                  <div className={`flip-card-back absolute inset-0 bg-card border ${c.border} rounded-2xl p-[18px] shadow-[0_4px_20px_rgba(26,26,46,0.08)] overflow-hidden flex items-center`}>
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.stripe}`} />
                    <p className="text-[11.5px] text-slate leading-[1.55]">
                      {city.description}
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
