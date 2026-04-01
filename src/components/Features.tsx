const features = [
  {
    icon: "📊",
    bg: "bg-teal-light",
    title: "Interactive Dashboard",
    desc: "Compare all 5 cities with dynamic bar charts, a scatter plot, and a clickable map. Switch scenarios and watch rankings update instantly.",
  },
  {
    icon: "🗺️",
    bg: "bg-risk-amber-light",
    title: "Spatial Map View",
    desc: "Click any city on the U.S. map to reveal its full risk profile — water stress, carbon intensity, and total score — in a pop-up card.",
  },
  {
    icon: "⚖️",
    bg: "bg-risk-green-light",
    title: "Scenario Planning",
    desc: "Three built-in scenarios with adjustable weights. Shift priorities between water sustainability, carbon reduction, and operational cost.",
  },
];

const Features = () => (
  <section className="pb-[72px]">
    <div className="max-w-[1240px] mx-auto px-14">
      <span className="font-mono-code text-[10px] tracking-[1.5px] uppercase text-teal bg-teal-light border border-teal-mid px-3 py-1 rounded-full inline-block mb-3.5">
        // What You Can Do
      </span>
      <h2 className="font-display text-[42px] font-black leading-[1.1] text-foreground mb-2">
        Built for Decision‑Makers
      </h2>

      <div className="grid grid-cols-3 gap-[18px] mt-8">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-card border border-border rounded-[18px] p-[30px] px-[26px] shadow-[0_4px_20px_rgba(26,26,46,0.08)] relative overflow-hidden hover:-translate-y-1 transition-transform"
          >
            <div className="absolute -bottom-5 -right-5 text-[80px] opacity-5 leading-none pointer-events-none">
              {f.icon}
            </div>
            <div className={`w-[46px] h-[46px] rounded-xl flex items-center justify-center text-xl mb-4 ${f.bg}`}>
              {f.icon}
            </div>
            <h3 className="font-display text-xl font-bold mb-2.5">{f.title}</h3>
            <p className="text-[13px] text-slate leading-[1.65]">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
