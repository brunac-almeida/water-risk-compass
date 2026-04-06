import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Weights = { water: number; carbon: number; cooling: number };

const MAP_CITIES = [
  { name: "Northern Virginia", coords: [38.9072, -77.0369] as [number, number],
    water_stress: 0.434, carbon_index: 0.419, cooling_cost: 0.249,
    raw_temp: "55.1°F", raw_water: "$4.95/1k gal", raw_carbon: "235.0 kg CO₂/MWh" },
  { name: "Dallas–Fort Worth", coords: [32.7767, -96.7970] as [number, number],
    water_stress: 0.251, carbon_index: 1.000, cooling_cost: 1.000,
    raw_temp: "64.9°F", raw_water: "$4.29/1k gal", raw_carbon: "338.6 kg CO₂/MWh" },
  { name: "Silicon Valley", coords: [37.3861, -122.0839] as [number, number],
    water_stress: 1.000, carbon_index: 0.000, cooling_cost: 0.450,
    raw_temp: "57.7°F", raw_water: "$7.00/1k gal", raw_carbon: "160.2 kg CO₂/MWh" },
  { name: "Phoenix", coords: [33.4484, -112.0740] as [number, number],
    water_stress: 0.000, carbon_index: 0.831, cooling_cost: 0.604,
    raw_temp: "59.8°F", raw_water: "$3.38/1k gal", raw_carbon: "308.5 kg CO₂/MWh" },
  { name: "Chicago", coords: [41.8781, -87.6298] as [number, number],
    water_stress: 0.139, carbon_index: 0.294, cooling_cost: 0.000,
    raw_temp: "51.9°F", raw_water: "$3.88/1k gal", raw_carbon: "212.7 kg CO₂/MWh" },
];

function score(c: typeof MAP_CITIES[0], w: Weights) {
  const raw = c.water_stress * w.water + c.carbon_index * w.carbon + c.cooling_cost * w.cooling;
  return +((raw / (w.water + w.carbon + w.cooling)) * 10).toFixed(1);
}

function riskColor(s: number) {
  return s < 3 ? "#1e7e4a" : s <= 5 ? "#c4780a" : "#c94a2a";
}
function riskLabel(s: number) {
  return s < 3 ? "Low Risk" : s <= 5 ? "Medium Risk" : "High Risk";
}
function riskBadgeBg(s: number) {
  return s < 3 ? "#e6f4ec" : s <= 5 ? "#fdf3e3" : "#fce8e4";
}

function popupHtml(c: typeof MAP_CITIES[0], total: number) {
  const color = riskColor(total);
  const badge = riskLabel(total);
  return `
<div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:220px;padding:4px 0">
  <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:16px;color:${color};margin-bottom:4px">${c.name}</div>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
    <span style="font-size:22px;font-weight:800;color:${color}">${total.toFixed(1)}</span>
    <span style="font-size:11px;color:#6b7c93">/ 10</span>
    <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:99px;background:${riskBadgeBg(total)};color:${color}">${badge}</span>
  </div>
  <div style="border-top:1px solid #e5e0d8;padding-top:6px;margin-bottom:6px">
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#3a4a5c;padding:2px 0"><span>Water Stress</span><span style="font-family:monospace;font-weight:600">${c.water_stress.toFixed(3)}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#3a4a5c;padding:2px 0"><span>Carbon Index</span><span style="font-family:monospace;font-weight:600">${c.carbon_index.toFixed(3)}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#3a4a5c;padding:2px 0"><span>Cooling Cost</span><span style="font-family:monospace;font-weight:600">${c.cooling_cost.toFixed(3)}</span></div>
  </div>
  <div style="border-top:1px solid #e5e0d8;padding-top:6px">
    <div style="display:flex;justify-content:space-between;font-size:11px;color:#6b7c93;padding:2px 0"><span>🌡️ Temperature</span><span>${c.raw_temp}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:#6b7c93;padding:2px 0"><span>💧 Water Price</span><span>${c.raw_water}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:#6b7c93;padding:2px 0"><span>⚡ Carbon</span><span>${c.raw_carbon}</span></div>
  </div>
</div>`;
}

interface DashboardMapProps {
  weights: Weights;
}

const DashboardMap = ({ weights }: DashboardMapProps) => {
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

  // Update markers when weights change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    MAP_CITIES.forEach(c => {
      const total = score(c, weights);
      const radius = Math.max(total * 5, 6);
      const color = riskColor(total);
      const marker = L.circleMarker(c.coords, {
        radius,
        fillColor: color,
        fillOpacity: 0.7,
        color: color,
        weight: 2,
        opacity: 0.9,
      }).addTo(map);
      marker.bindPopup(popupHtml(c, total), {
        maxWidth: 260,
        className: "custom-leaflet-popup",
      });
      markersRef.current.push(marker);
    });
  }, [weights]);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div ref={containerRef} style={{ height: 500, width: "100%" }} />
    </div>
  );
};

export default DashboardMap;
