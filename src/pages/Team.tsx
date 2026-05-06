import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import avatarBruna from "@/assets/avatar-bruna.png";
import avatarOzzy from "@/assets/avatar-ozzy.png";
import avatarBen from "@/assets/avatar-ben.png";
import avatarHailey from "@/assets/avatar-hailey.png";

const members = [
  {
    name: "Bruna Almeida",
    avatar: avatarBruna,
    tag: "LEAD ANALYST",
    title: "Environmental Data Analyst",
    description:
      "Curated and standardized national-scale environmental datasets from NOAA, EIA, and Circle of Blue — ensuring data quality, consistency, and full source documentation across all five U.S. markets.",
    accent: "teal",
  },
  {
    name: "Ozzy Dominguez",
    avatar: avatarOzzy,
    tag: "QUANTITATIVE ANALYST",
    title: "Scoring & Algorithm Engineer",
    description:
      "Designed the multi-variable scoring framework — developing the normalization methodology, Water Stress Score, Carbon Impact Score, and Total Impact Score with adjustable scenario weights.",
    accent: "green",
  },
  {
    name: "Ben Elick",
    avatar: avatarBen,
    tag: "UX & STRATEGY",
    title: "Usability & Scenario Strategist",
    description:
      "Defined the three decision scenarios and user interaction logic, and ensured the tool communicates complex trade-offs in plain language accessible to non-engineers and policy stakeholders.",
    accent: "amber",
  },
  {
    name: "Hailey Fraser",
    avatar: avatarHailey,
    tag: "VISUALIZATION",
    title: "Dashboard & Visualization Engineer",
    description:
      "Led the design and construction of the interactive dashboard — directing chart architecture, map integration, color logic, and the overall visual communication of the site selection analysis.",
    accent: "coral",
  },
];

const accentMap: Record<string, { stripe: string; title: string; tag: string }> = {
  teal: {
    stripe: "bg-teal",
    title: "text-teal",
    tag: "bg-teal/10 text-teal",
  },
  green: {
    stripe: "bg-risk-green",
    title: "text-risk-green",
    tag: "bg-risk-green/10 text-risk-green",
  },
  amber: {
    stripe: "bg-risk-amber",
    title: "text-risk-amber",
    tag: "bg-risk-amber/10 text-risk-amber",
  },
  coral: {
    stripe: "bg-risk-coral",
    title: "text-risk-coral",
    tag: "bg-risk-coral/10 text-risk-coral",
  },
};

const Team = () => (
  <div className="bg-cream min-h-screen flex flex-col">
    <Navbar />

    {/* Header */}
    <section className="max-w-[1240px] mx-auto px-14 pt-20 pb-12 text-center">
      <h1 className="font-display text-5xl font-bold text-foreground mb-4">
        Meet the <span className="text-teal">Team</span>
      </h1>
      <p className="font-body text-[15px] text-slate leading-[1.75] max-w-2xl mx-auto">
        Four environmental engineers building smarter, more sustainable infrastructure decisions.
      </p>
    </section>

    {/* Cards */}
    <section className="max-w-[1240px] mx-auto px-14 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {members.map((m) => {
        const a = accentMap[m.accent];
        return (
          <div
            key={m.name}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col items-center"
          >
            {/* Accent stripe */}
            <div className={`w-full h-1.5 ${a.stripe}`} />

            {/* Avatar */}
            <div className="mt-6 mb-3">
              <img
                src={m.avatar}
                alt={m.name}
                width={96}
                height={96}
                loading="lazy"
                className="w-24 h-24 rounded-full object-cover border-2 border-cream"
              />
            </div>

            {/* Tag */}
            <span className={`font-mono-code text-[10px] tracking-widest px-3 py-1 rounded-full ${a.tag}`}>
              {m.tag}
            </span>

            {/* Name */}
            <h3 className="font-display text-xl font-bold text-foreground mt-3">{m.name}</h3>

            {/* Title */}
            <p className={`font-body text-sm font-semibold ${a.title} mb-3`}>{m.title}</p>

            {/* Description */}
            <p className="font-body text-[13px] text-slate leading-relaxed px-5 pb-6 text-center">
              {m.description}
            </p>
          </div>
        );
      })}
    </section>

    <Footer />
  </div>
);

export default Team;
