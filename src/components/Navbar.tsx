import { Link, useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navLinks = [
  { label: "Home", path: "/", tip: "Project overview and key takeaways" },
  { label: "Dashboard", path: "/dashboard", tip: "Interactive city comparison with adjustable weights, charts, and a U.S. map" },
  { label: "Recommender", path: "/recommender", tip: "Answer 4 questions and get a tailored site recommendation" },
  { label: "About", path: "/about", tip: "Why we built this tool and what problem it solves" },
  { label: "Methodology", path: "/methodology", tip: "Data sources, scoring formula, and a glossary of terms" },
  { label: "Team", path: "/team", tip: "Meet the people behind the project" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={250}>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-14 h-[66px] bg-card/95 border-b border-border backdrop-blur-md shadow-[0_2px_16px_rgba(26,26,46,0.08)]">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-teal to-[#00b8cc] flex items-center justify-center shadow-[0_4px_12px_rgba(0,122,135,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              </div>
              <span className="font-display text-[19px] font-bold text-foreground tracking-tight">
                WaterRisk <span className="text-teal">Explorers</span>
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Return to the home page</TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Tooltip key={link.path}>
                <TooltipTrigger asChild>
                  <Link
                    to={link.path}
                    className={`text-[13px] font-medium px-[15px] py-[7px] rounded-[7px] border transition-all ${
                      isActive
                        ? "text-teal bg-teal-light border-teal-mid"
                        : "text-slate border-transparent hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="text-xs max-w-[260px]">{link.tip}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/dashboard"
              className="bg-teal text-primary-foreground text-[13px] font-semibold px-[22px] py-[9px] rounded-lg shadow-[0_4px_14px_rgba(0,122,135,0.3)] hover:bg-[#006875] hover:-translate-y-px transition-all"
            >
              Launch Dashboard →
            </Link>
          </TooltipTrigger>
          <TooltipContent className="text-xs max-w-[260px]">Open the interactive dashboard to compare cities and test your own scenario.</TooltipContent>
        </Tooltip>
      </nav>
    </TooltipProvider>
  );
};

export default Navbar;
