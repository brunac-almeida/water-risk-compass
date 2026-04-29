import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export type ExportCity = {
  city: string;
  state: string;
  water_risk: number;
  climate_load: number;
  carbon: number;
  energy_cost: number;
  avg_annual_precipitation: number;
  total_score: number;
};

export type ExportWeights = { water: number; climate: number; carbon: number; cost: number };

export type ExportPayload = {
  cities: ExportCity[];
  weights: ExportWeights;
  scenarioLabel: string;
  selectedCity: ExportCity;
  scope: "all" | "selected";
};

const stamp = () => {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}_${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
};

const riskLabel = (s: number) => (s < 3 ? "Low" : s <= 5 ? "Moderate" : "High");

function buildRows(p: ExportPayload) {
  const wSum = p.weights.water + p.weights.climate + p.weights.carbon + p.weights.cost;
  const list = p.scope === "selected" ? [p.selectedCity] : p.cities;
  return list.map((c, i) => ({
    Rank: p.scope === "selected" ? "—" : i + 1,
    City: c.city,
    State: c.state,
    "Total Impact (0-10)": c.total_score.toFixed(2),
    "Risk Band": riskLabel(c.total_score),
    "Water (raw)": c.water_risk.toFixed(3),
    "Climate (raw)": c.climate_load.toFixed(3),
    "Carbon (raw)": c.carbon.toFixed(3),
    "Energy Cost (raw)": c.energy_cost.toFixed(3),
    "Water (weighted /10)": ((c.water_risk * p.weights.water) / wSum * 10).toFixed(2),
    "Climate (weighted /10)": ((c.climate_load * p.weights.climate) / wSum * 10).toFixed(2),
    "Carbon (weighted /10)": ((c.carbon * p.weights.carbon) / wSum * 10).toFixed(2),
    "Cost (weighted /10)": ((c.energy_cost * p.weights.cost) / wSum * 10).toFixed(2),
    "Annual Precip (in/yr)": c.avg_annual_precipitation?.toFixed(1) ?? "",
  }));
}

function metaRows(p: ExportPayload) {
  return [
    ["Generated", new Date().toLocaleString()],
    ["Scenario", p.scenarioLabel],
    ["Scope", p.scope === "selected" ? `Selected city (${p.selectedCity.city})` : "All cities"],
    ["Weight: Water", p.weights.water.toFixed(2)],
    ["Weight: Climate", p.weights.climate.toFixed(2)],
    ["Weight: Carbon", p.weights.carbon.toFixed(2)],
    ["Weight: Energy Cost", p.weights.cost.toFixed(2)],
    ["Selected city", `${p.selectedCity.city}, ${p.selectedCity.state}`],
    ["Selected total score", p.selectedCity.total_score.toFixed(2)],
  ];
}

/* ───────── CSV ───────── */
export function exportCSV(p: ExportPayload) {
  const rows = buildRows(p);
  const meta = metaRows(p);
  const escape = (v: any) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  let csv = "# Site Selection Dashboard Export\n";
  meta.forEach(([k, v]) => { csv += `# ${k},${escape(v)}\n`; });
  csv += "\n";
  if (rows.length) {
    csv += Object.keys(rows[0]).map(escape).join(",") + "\n";
    rows.forEach(r => { csv += Object.values(r).map(escape).join(",") + "\n"; });
  }
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `site-selection_${p.scope}_${stamp()}.csv`);
}

/* ───────── XLSX ───────── */
export function exportXLSX(p: ExportPayload) {
  const wb = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["Site Selection Dashboard — Export Summary"],
    [],
    ...metaRows(p),
  ]);
  summarySheet["!cols"] = [{ wch: 24 }, { wch: 36 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  const rows = buildRows(p);
  const dataSheet = XLSX.utils.json_to_sheet(rows);
  dataSheet["!cols"] = Object.keys(rows[0] ?? {}).map(k => ({ wch: Math.max(12, k.length + 2) }));
  XLSX.utils.book_append_sheet(wb, dataSheet, p.scope === "selected" ? "Selected City" : "Rankings");

  XLSX.writeFile(wb, `site-selection_${p.scope}_${stamp()}.xlsx`);
}

/* ───────── PDF ───────── */
export function exportPDF(p: ExportPayload) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const margin = 36;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 75, 80);
  doc.text("Site Selection Dashboard — Results", margin, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Generated ${new Date().toLocaleString()}  •  Scenario: ${p.scenarioLabel}  •  Scope: ${p.scope === "selected" ? `Selected city (${p.selectedCity.city})` : "All cities"}`,
    margin,
    y,
  );
  y += 18;

  // Weights pill row
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  const weightsLine = `Weights — Water: ${p.weights.water.toFixed(1)}  •  Climate: ${p.weights.climate.toFixed(1)}  •  Carbon: ${p.weights.carbon.toFixed(1)}  •  Energy Cost: ${p.weights.cost.toFixed(1)}`;
  doc.text(weightsLine, margin, y);
  y += 14;

  // Selected city callout
  doc.setDrawColor(220);
  doc.setFillColor(245, 249, 250);
  doc.roundedRect(margin, y, 770, 50, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 75, 80);
  doc.text(`Selected: ${p.selectedCity.city}, ${p.selectedCity.state}`, margin + 12, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `Total Impact Score: ${p.selectedCity.total_score.toFixed(2)} / 10  (${riskLabel(p.selectedCity.total_score)} risk)   •   Annual Precipitation: ${p.selectedCity.avg_annual_precipitation?.toFixed(1) ?? "n/a"} in/yr`,
    margin + 12,
    y + 36,
  );
  y += 64;

  // Table
  const rows = buildRows(p);
  const head = [Object.keys(rows[0] ?? {})];
  const body = rows.map(r => Object.values(r) as (string | number)[]);

  autoTable(doc, {
    head,
    body,
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [0, 132, 138], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 251] },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const val = String(data.cell.raw);
        if (val === "Low") data.cell.styles.textColor = [30, 120, 70];
        else if (val === "Moderate") data.cell.styles.textColor = [180, 110, 20];
        else if (val === "High") data.cell.styles.textColor = [180, 60, 50];
      }
    },
  });

  // Footer note
  const finalY = (doc as any).lastAutoTable?.finalY ?? y;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Lower Total Impact Score = more favorable site. Risk bands: Low <3, Moderate 3–5, High >5.",
    margin,
    Math.min(finalY + 16, 560),
  );

  doc.save(`site-selection_${p.scope}_${stamp()}.pdf`);
}

/* ───────── helper ───────── */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
