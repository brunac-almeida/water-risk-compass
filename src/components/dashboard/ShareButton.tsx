import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover";
import { toast } from "sonner";

type Weights = { water: number; climate: number; carbon: number; cost: number };

interface Props {
  weights: Weights;
  scenarioIdx: number;
  selectedCity: string;
}

const ShareButton = ({ weights, scenarioIdx, selectedCity }: Props) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const buildUrl = () => {
    const params = new URLSearchParams({
      s: String(scenarioIdx),
      ww: weights.water.toFixed(2),
      wc: weights.climate.toFixed(2),
      wb: weights.carbon.toFixed(2),
      we: weights.cost.toFixed(2),
    });
    if (selectedCity) params.set("city", selectedCity);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const url = buildUrl();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — please copy manually");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Share2 className="w-3.5 h-3.5" />
          Share view
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-4">
        <h4 className="font-display text-sm font-bold text-foreground mb-1">Share this view</h4>
        <p className="text-[11px] text-muted-foreground mb-3">
          Anyone opening this link will see the dashboard with your current scenario, weights, and selected city.
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 text-[11px] font-mono px-2 py-1.5 rounded-md border border-border bg-muted/40 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button size="sm" onClick={copy} className="gap-1 shrink-0">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareButton;
