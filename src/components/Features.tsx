import { BarChart3, Map, Scale, type LucideIcon } from "lucide-react";

const features: { Icon: LucideIcon; bg: string; iconColor: string; title: string; desc: string }[] = [
  {
    Icon: BarChart3,
    bg: "bg-teal-light",
    iconColor: "text-teal",
    title: "Interactive Dashboard",
    desc: "Compare all 5 cities with dynamic bar charts, a scatter plot, and a clickable map. Switch scenarios and watch rankings update instantly.",
  },
  {
    Icon: Map,
    bg: "bg-risk-amber-light",
    iconColor: "text-risk-amber",
    title: "Spatial Map View",
    desc: "Click any city on the U.S. map to reveal its full risk profile — water stress, carbon intensity, and total score — in a pop-up card.",
  },
  {
    Icon: Scale,
    bg: "bg-risk-green-light",
    iconColor: "text-risk-green",
    title: "Scenario Planning",
    desc: "Four built-in scenarios with adjustable weights. Shift priorities between water risk, climate load, carbon impact, and energy cost.",
  },
];

const Features = () => (
  <section className="pb-[72px]">
    <div className="max-w-[1240px] mx-auto px-14">
      <h2 className="font-display text-[42px] font-black leading-[1.1] text-foreground mb-2">
        Built for Decision‑Makers
      </h2>

      <div className="grid grid-cols-3 gap-[18px] mt-8">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-card border border-border rounded-[18px] p-[30px] px-[26px] shadow-[0_4px_20px_rgba(26,26,46,0.08)] relative overflow-hidden hover:-translate-y-1 transition-transform"
          >
            <div className={`w-[46px] h-[46px] rounded-xl flex items-center justify-center mb-4 ${f.bg}`}>
              <f.Icon className={`w-5 h-5 ${f.iconColor}`} />
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
