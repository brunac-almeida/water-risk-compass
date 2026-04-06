const Footer = () => (
  <footer className="bg-ink px-14 py-3 flex items-center justify-between" style={{ minHeight: 52 }}>
    <span className="font-display text-[13px] font-bold text-teal">WaterRisk Explorers</span>
    <span className="font-mono-code text-[11px] text-slate">
      Sources: NOAA · EIA · Circle of Blue · Brightlio
    </span>
    <span className="font-mono-code text-[11px] text-slate">
      Comparative tool only — not a forecast
    </span>
  </footer>
);

export default Footer;
