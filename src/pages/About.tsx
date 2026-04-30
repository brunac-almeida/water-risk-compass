import { useState } from "react";
import { RotateCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const problemCards = [
  {
    title: "The Problem",
    color: "text-risk-coral",
    border: "border-risk-coral/30 bg-risk-coral/5",
    text: "Choosing where to build water-intensive infrastructure requires balancing environmental risk, cost, and carbon — a complex trade-off with no easy answer.",
  },
  {
    title: "Our Solution",
    color: "text-teal",
    border: "border-teal/30 bg-teal/5",
    text: "An interactive dashboard that translates raw data into a single Total Impact Score — with adjustable weights so every stakeholder can explore their own priorities.",
  },
  {
    title: "The Outcome",
    color: "text-risk-green",
    border: "border-risk-green/30 bg-risk-green/5",
    text: "A publicly accessible tool any sustainability officer, city planner, or engineer can use — no programming required.",
  },
];

const goals = [
  {
    num: "01",
    title: "Curate Real Data",
    text: "Gather standardized public data from NOAA, EIA, and Circle of Blue — covering temperature, rainfall, water price, and grid carbon intensity for 5 major U.S. cities.",
  },
  {
    num: "02",
    title: "Build a Scoring Model",
    text: "Design a transparent, multi-variable algorithm that converts raw inputs into normalized indices and combines them into a single comparable Total Impact Score.",
  },
  {
    num: "03",
    title: "Enable Scenario Planning",
    text: "Allow users to shift priorities between water sustainability, carbon reduction, and cooling cost — and instantly see how city rankings change.",
  },
  {
    num: "04",
    title: "Visualize the Trade-offs",
    text: "Create clear charts and a clickable map that make complex multi-variable data intuitive at a glance for any audience.",
  },
  {
    num: "05",
    title: "Make it Accessible",
    text: "Plain-language tooltips, clear disclaimers, and a guided interface ensure any stakeholder — not just engineers — can use the tool confidently.",
  },
  {
    num: "06",
    title: "Document the Process",
    text: "Log every AI prompt used to build this app, creating a replicable vibe-coding workflow demonstrating how AI can produce professional engineering tools.",
  },
];

const About = () => {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const toggle = (num: string) =>
    setFlipped((prev) => ({ ...prev, [num]: !prev[num] }));

  return (
    <div className="bg-cream min-h-screen">
      <Navbar />

      {/* Section 1 — Hero split */}
      <section className="max-w-[1240px] mx-auto px-14 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h1 className="font-display text-[42px] leading-[1.15] font-black text-foreground mb-6">
              Why Water Matters for Data Centers
            </h1>
            <p className="text-[15px] text-slate leading-[1.75] mb-4">
              Data centers are among the fastest-growing water consumers in the United States. A single hyperscale facility can use millions of gallons annually for cooling — competing directly with municipal and agricultural demand.
            </p>
            <p className="text-[15px] text-slate leading-[1.75]">
              Yet most siting decisions focus on land cost, power availability, and connectivity — leaving water risk as an afterthought. This tool changes that. By combining real federal data with a transparent scoring algorithm, we make the trade-offs visible and actionable for any decision-maker.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {problemCards.map((card) => (
              <div
                key={card.title}
                className={`bg-card rounded-xl border-2 ${card.border} p-6 transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                <div>
                  <h3 className={`font-display text-lg font-bold ${card.color} mb-1.5`}>
                    {card.title}
                  </h3>
                  <p className="text-[14px] text-slate leading-[1.7]">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 — Goals grid (flip cards) */}
      <section className="bg-cream py-20">
        <div className="max-w-[1240px] mx-auto px-14">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-black text-foreground">
              What We Set Out To Do
            </h2>
            <p className="mt-3 inline-flex items-center gap-2 text-[13px] text-slate">
              <RotateCw className="w-3.5 h-3.5 text-teal" aria-hidden="true" />
              Click any card to reveal the details
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((goal) => (
              <div
                key={goal.num}
                className={`flip-card group cursor-pointer h-[180px] transition-transform duration-200 hover:-translate-y-1 hover:drop-shadow-lg ${flipped[goal.num] ? "flipped" : ""}`}
                onClick={() => toggle(goal.num)}
              >
                <div className="flip-card-inner relative w-full h-full">
                  {/* Front */}
                  <div className="flip-card-front absolute inset-0 bg-card rounded-xl border border-border p-7 flex items-center overflow-hidden">
                    <span className="absolute top-3 right-5 font-display text-[72px] font-black text-teal/[0.08] leading-none select-none pointer-events-none">
                      {goal.num}
                    </span>
                    <h3 className="font-display text-lg font-bold text-teal relative z-10">
                      {goal.title}
                    </h3>
                  </div>

                  {/* Back */}
                  <div className="flip-card-back absolute inset-0 bg-card rounded-xl border border-teal/30 p-7 flex items-center overflow-hidden">
                    <span className="absolute top-3 right-5 font-display text-[72px] font-black text-teal/[0.08] leading-none select-none pointer-events-none">
                      {goal.num}
                    </span>
                    <p className="text-[14px] text-slate leading-[1.7] relative z-10">
                      {goal.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
