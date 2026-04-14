import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Weights = { water: number; climate: number; carbon: number; cost: number };

type CityEntry = {
  city: string;
  latitude: number;
  longitude: number;
  water_risk: number;
  climate_load: number;
  carbon: number;
  energy_cost: number;
  total_score: number;
};

function riskColor(s: number) {
  return s < 3 ? "#1e7e4a" : s <= 5 ? "#c4780a" : "#c94a2a";
}
function riskLabel(s: number) {
  return s < 3 ? "Low Risk" : s <= 5 ? "Medium Risk" : "High Risk";
}
function riskBadgeBg(s: number) {
  return s < 3 ? "#e6f4ec" : s <= 5 ? "#fdf3e3" : "#fce8e4";
}

function popupHtml(c: CityEntry) {
  const color = riskColor(c.total_score);
  const badge = riskLabel(c.total_score);
  return `
<div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:220px;padding:4px 0">
  <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:16px;color:${color};margin-bottom:4px">${c.city}</div>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
    <span style="font-size:22px;font-weight:800;color:${color}">${c.total_score.toFixed(1)}</span>
    <span style="font-size:11px;color:#6b7c93">/ 10</span>
    <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:99px;background:${riskBadgeBg(c.total_score)};color:${color}">${badge}</span>
  </div>
  <div style="border-top:1px solid #e5e0d8;padding-top:6px">
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#3a4a5c;padding:2px 0"><span>💧 Water Risk</span><span style="font-family:monospace;font-weight:600">${c.water_risk.toFixed(3)}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#3a4a5c;padding:2px 0"><span>🌡️ Climate Load</span><span style="font-family:monospace;font-weight:600">${c.climate_load.toFixed(3)}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#3a4a5c;padding:2px 0"><span>🌿 Carbon</span><span style="font-family:monospace;font-weight:600">${c.carbon.toFixed(3)}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#3a4a5c;padding:2px 0"><span>⚡ Energy Cost</span><span style="font-family:monospace;font-weight:600">${c.energy_cost.toFixed(3)}</span></div>
  </div>
</div>`;
}

interface DashboardMapProps {
  weights: Weights;
  cities: CityEntry[];
}

const DashboardMap = ({ weights, cities }: DashboardMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [39.5, -98.35],
      zoom: 4,
      scrollWheelZoom: false,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    // Legend
    const legend = new L.Control({ position: "bottomleft" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div");
      div.innerHTML = `
<div style="background:white;border-radius:8px;padding:10px 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,.12);line-height:1.8">
  <div style="font-weight:700;margin-bottom:2px;color:#3a4a5c">Risk Level</div>
  <div><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#1e7e4a;margin-right:6px;vertical-align:middle"></span>Low (< 3)</div>
  <div><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#c4780a;margin-right:6px;vertical-align:middle"></span>Medium (3–5)</div>
  <div><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#c94a2a;margin-right:6px;vertical-align:middle"></span>High (> 5)</div>
</div>`;
      return div;
    };
    legend.addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update markers when cities or weights change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || cities.length === 0) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    cities.forEach(c => {
      const radius = Math.max(c.total_score * 5, 6);
      const color = riskColor(c.total_score);
      const marker = L.circleMarker([c.latitude, c.longitude], {
        radius,
        fillColor: color,
        fillOpacity: 0.7,
        color: color,
        weight: 2,
        opacity: 0.9,
      }).addTo(map);
      marker.bindPopup(popupHtml(c), {
        maxWidth: 260,
        className: "custom-leaflet-popup",
      });
      markersRef.current.push(marker);
    });
  }, [cities]);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div ref={containerRef} style={{ height: 500, width: "100%" }} />
    </div>
  );
};

export default DashboardMap;
