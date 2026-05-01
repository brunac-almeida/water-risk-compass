const cities = [
  { name: "Northern Virginia", state: "Virginia", region: "Data Center Alley", color: "teal" as const },
  { name: "Dallas–Fort Worth", state: "Texas", region: "Central U.S. Hub", color: "amber" as const },
  { name: "Silicon Valley", state: "California", region: "West Coast Tech Core", color: "green" as const },
  { name: "Phoenix", state: "Arizona", region: "Southwest Desert", color: "coral" as const },
  { name: "Chicago", state: "Illinois", region: "Midwest Hub", color: "teal" as const },
];

const colorMap = {
  green: { stripe: "from-risk-green to-[#2da362]", name: "text-risk-green" },
  teal: { stripe: "from-teal to-[#00a8b5]", name: "text-teal" },
  amber: { stripe: "from-risk-amber to-[#e89420]", name: "text-risk-amber" },
  coral: { stripe: "from-risk-coral to-[#e0603e]", name: "text-risk-coral" },
};

const CitiesStrip = () => (
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
          return (
            <div
              key={city.name}
              className="bg-card border border-border rounded-2xl p-[22px] px-[18px] shadow-[0_4px_20px_rgba(26,26,46,0.08)] relative overflow-hidden cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(26,26,46,0.08)] transition-all"
            >
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
          );
        })}
      </div>
    </div>
  </section>
);

export default CitiesStrip;
