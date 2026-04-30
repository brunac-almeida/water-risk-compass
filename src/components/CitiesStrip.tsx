const cities = [
  {
    rank: 1, name: "Northern Virginia", capacity: "3,000+ MW", region: "Data Center Alley",
    risk: "Medium Risk", riskPercent: 40, color: "green" as const,
  },
  {
    rank: 2, name: "Dallas–Fort Worth", capacity: "500+ MW", region: "Central U.S. Hub",
    risk: "Med-High Risk", riskPercent: 60, color: "teal" as const,
  },
  {
    rank: 3, name: "Silicon Valley", capacity: "400+ MW", region: "West Coast Tech Core",
    risk: "High Risk", riskPercent: 72, color: "amber" as const,
  },
  {
    rank: 4, name: "Phoenix", capacity: "350+ MW", region: "Fastest Growing",
    risk: "Very High Risk", riskPercent: 94, color: "coral" as const,
  },
  {
    rank: 5, name: "Chicago", capacity: "250+ MW", region: "Midwest Hub",
    risk: "Low Risk", riskPercent: 20, color: "green" as const,
  },
];

const colorMap = {
  green: {
    stripe: "from-risk-green to-[#2da362]",
    name: "text-risk-green",
    badge: "bg-risk-green-light text-risk-green",
    bar: "bg-risk-green",
  },
  teal: {
    stripe: "from-teal to-[#00a8b5]",
    name: "text-teal",
    badge: "bg-teal-light text-teal",
    bar: "bg-teal",
  },
  amber: {
    stripe: "from-risk-amber to-[#e89420]",
    name: "text-risk-amber",
    badge: "bg-risk-amber-light text-risk-amber",
    bar: "bg-risk-amber",
  },
  coral: {
    stripe: "from-risk-coral to-[#e0603e]",
    name: "text-risk-coral",
    badge: "bg-risk-coral-light text-risk-coral",
    bar: "bg-risk-coral",
  },
};

const CitiesStrip = () => (
  <section className="py-14 pb-16">
    <div className="max-w-[1240px] mx-auto px-14">
      <h2 className="font-display text-[42px] font-black leading-[1.1] text-foreground mb-2">
        5 Cities. One Comparison.
      </h2>
      <p className="text-[15px] text-slate leading-[1.7]">
        Top U.S. data center markets ranked by installed power capacity
      </p>

      <div className="grid grid-cols-5 gap-3.5 mt-8">
        {cities.map((city) => {
          const c = colorMap[city.color];
          return (
            <div
              key={city.name}
              className={`bg-card border rounded-2xl p-[22px] px-[18px] shadow-[0_4px_20px_rgba(26,26,46,0.08)] relative overflow-hidden cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(26,26,46,0.08)] transition-all ${
                city.color === "coral" ? "border-risk-coral-light" : "border-border"
              }`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.stripe}`} />
              <div className="font-mono-code text-[9px] text-slate tracking-[1px] mb-2.5">
                #{city.rank} · {city.capacity}
              </div>
              <div className={`font-display text-lg font-bold leading-tight mb-1.5 ${c.name}`}>
                {city.name}
              </div>
              <div className="font-mono-code text-[10px] text-slate mb-3.5">{city.region}</div>
              <div className={`text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block mb-3 ${c.badge}`}>
                {city.risk}
              </div>
              <div className="h-[5px] bg-border rounded-full">
                <div
                  className={`h-full rounded-full ${c.bar}`}
                  style={{ width: `${city.riskPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default CitiesStrip;
