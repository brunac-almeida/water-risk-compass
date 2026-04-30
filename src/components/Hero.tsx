import { Link } from "react-router-dom";

const stats = [
  { num: "5", title: "U.S. Cities Analyzed", desc: "From Virginia to Phoenix — top data center markets" },
  { num: "4", title: "Key Variables", desc: "Temp · Rainfall · Water Price · Grid Carbon" },
  { num: "4", title: "Decision Scenarios", desc: "Water Stress · Carbon Intensity · Cooling Costs · Energy Cost" },
];

const Hero = () => (
  <section className="relative overflow-hidden bg-gradient-to-br from-ink to-ink2 px-14 py-[72px] pb-16">
    {/* Decorative circles */}
    <div className="absolute -top-[60px] -right-[80px] w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(0,184,204,0.18)_0%,transparent_70%)] pointer-events-none" />
    <div className="absolute -bottom-[40px] left-[30%] w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(0,122,135,0.12)_0%,transparent_65%)] pointer-events-none" />

    <div className="relative z-10 max-w-[1240px] mx-auto grid grid-cols-[1fr_430px] gap-16 items-center">
      <div>
        <div className="inline-flex items-center gap-[7px] font-mono-code text-[10px] tracking-[1px] text-[#7dd3db] bg-[rgba(0,184,204,0.12)] border border-[rgba(0,184,204,0.25)] px-[13px] py-[5px] rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7dd3db] animate-blink" />
          CIVE 580 · Spring 2026 · Project #3
        </div>

        <h1 className="font-display text-[68px] font-black leading-[0.95] tracking-tight text-primary-foreground mb-[22px] whitespace-pre-line">
          Where Will&nbsp;{"\n"}Your Data Center{"\n"}<em className="not-italic text-[#5dd8e3]">Thrive?</em>
        </h1>

        <p className="text-base text-[rgba(255,255,255,0.65)] leading-[1.75] mb-9 max-w-[480px]">
          A <strong className="text-primary-foreground">data-driven site selection tool</strong> that helps companies compare 5 major U.S. markets on{" "}
          <strong className="text-primary-foreground">water stress</strong>,{" "}
          <strong className="text-primary-foreground">carbon intensity</strong>, and{" "}
          <strong className="text-primary-foreground">cooling costs</strong> — with one actionable score.
        </p>

        <div className="flex gap-3">
          <Link
            to="/dashboard"
            className="bg-gradient-to-br from-[#009eb0] to-teal text-primary-foreground font-bold text-sm px-7 py-[13px] rounded-[9px] shadow-[0_8px_24px_rgba(0,122,135,0.4)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(0,122,135,0.5)] transition-all"
          >
            Launch Dashboard
          </Link>
          <Link
            to="/about"
            className="bg-transparent text-[rgba(255,255,255,0.75)] font-medium text-sm px-7 py-[13px] rounded-[9px] border border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.5)] hover:text-primary-foreground transition-all"
          >
            Learn More ↓
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {stats.map((s) => (
          <div
            key={s.num}
            className="bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.1)] rounded-[14px] px-5 py-[18px] flex items-center gap-4 backdrop-blur-[10px] hover:bg-[rgba(255,255,255,0.11)] transition-colors"
          >
            <span className="font-display text-[40px] font-black leading-none text-[#5dd8e3] shrink-0">
              {s.num}
            </span>
            <div className="text-[13px] text-[rgba(255,255,255,0.65)] leading-[1.4]">
              <strong className="text-primary-foreground block text-sm mb-0.5">{s.title}</strong>
              {s.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Hero;
