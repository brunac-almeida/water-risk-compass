import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "About", path: "/about" },
  { label: "Methodology", path: "/methodology" },
  { label: "Team", path: "/team" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-14 h-[66px] bg-card/95 border-b border-border backdrop-blur-md shadow-[0_2px_16px_rgba(26,26,46,0.08)]">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-teal to-[#00b8cc] flex items-center justify-center text-lg shadow-[0_4px_12px_rgba(0,122,135,0.3)]">
          💧
        </div>
        <span className="font-display text-[19px] font-bold text-foreground tracking-tight">
          WaterRisk <span className="text-teal">Explorers</span>
        </span>
      </Link>

      <div className="flex items-center gap-0.5">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`text-[13px] font-medium px-[15px] py-[7px] rounded-[7px] border transition-all ${
                isActive
                  ? "text-teal bg-teal-light border-teal-mid"
                  : "text-slate border-transparent hover:bg-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <Link
        to="/dashboard"
        className="bg-teal text-primary-foreground text-[13px] font-semibold px-[22px] py-[9px] rounded-lg shadow-[0_4px_14px_rgba(0,122,135,0.3)] hover:bg-[#006875] hover:-translate-y-px transition-all"
      >
        Launch Dashboard →
      </Link>
    </nav>
  );
};

export default Navbar;
