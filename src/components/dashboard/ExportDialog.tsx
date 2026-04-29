import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, FileType } from "lucide-react";
import {
  exportCSV, exportPDF, exportXLSX,
  type ExportCity, type ExportWeights,
} from "@/lib/dashboardExport";

interface Props {
  cities: ExportCity[];
  selectedCity: ExportCity;
  weights: ExportWeights;
  scenarioLabel: string;
}

const ExportDialog = ({ cities, selectedCity, weights, scenarioLabel }: Props) => {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<"all" | "selected">("all");

  const handle = (fmt: "csv" | "xlsx" | "pdf") => {
    const payload = { cities, selectedCity, weights, scenarioLabel, scope };
    if (fmt === "csv") exportCSV(payload);
    else if (fmt === "xlsx") exportXLSX(payload);
    else exportPDF(payload);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Export results</DialogTitle>
          <DialogDescription>
            Download the current rankings, weights, and scenario as a file you can share or archive.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Scope */}
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Include</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setScope("all")}
                className={`text-left p-3 rounded-md border text-sm transition-colors ${
                  scope === "all" ? "border-primary bg-accent" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="font-semibold">All cities</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Full ranking ({cities.length} cities) under your current weights.</div>
              </button>
              <button
                onClick={() => setScope("selected")}
                className={`text-left p-3 rounded-md border text-sm transition-colors ${
                  scope === "selected" ? "border-primary bg-accent" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="font-semibold">Selected city</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Deep-dive for {selectedCity.city} only.</div>
              </button>
            </div>
          </div>

          {/* Format */}
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Format</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handle("pdf")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-md border border-border hover:border-primary hover:bg-accent transition-colors"
              >
                <FileType className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold">PDF</span>
                <span className="text-[10px] text-muted-foreground text-center">Formatted report</span>
              </button>
              <button
                onClick={() => handle("xlsx")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-md border border-border hover:border-primary hover:bg-accent transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold">Excel</span>
                <span className="text-[10px] text-muted-foreground text-center">Summary + data</span>
              </button>
              <button
                onClick={() => handle("csv")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-md border border-border hover:border-primary hover:bg-accent transition-colors"
              >
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold">CSV</span>
                <span className="text-[10px] text-muted-foreground text-center">Raw data</span>
              </button>
            </div>
          </div>

          <div className="rounded-md border border-border bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
            Files include your active scenario, weights, and a timestamp so the result is reproducible.
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
