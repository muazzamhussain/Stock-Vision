"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { saveChartConfig, getChartConfig } from "@/lib/actions/chart.actions";
import { Save, X } from "lucide-react";

const INDICATORS = [
  { value: "RSI", label: "RSI" },
  { value: "MACD", label: "MACD" },
  { value: "BB", label: "Bollinger Bands" },
  { value: "EMA", label: "EMA" },
  { value: "SMA", label: "SMA" },
  { value: "VWAP", label: "VWAP" },
];

const ChartConfigPanel = ({ symbol }: { symbol: string }) => {
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getChartConfig(symbol);
        if (config) {
          setSelectedIndicators(config.indicators || []);
          setNotes(config.notes || "");
        }
      } catch (error) {
        console.error("Failed to load chart config:", error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [symbol]);

  const toggleIndicator = (indicator: string) => {
    setSelectedIndicators((prev) =>
      prev.includes(indicator)
        ? prev.filter((i) => i !== indicator)
        : [...prev, indicator]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveChartConfig(symbol, selectedIndicators, notes);
      if (result.success) {
        toast.success("Chart configuration saved.");
      } else {
        toast.error(result.error || "Failed to save configuration.");
      }
    } catch (error) {
      toast.error("Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-700 rounded mb-4"></div>
          <div className="h-10 bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Technical Indicators & Notes</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="text-sm text-gray-400 mb-2 block">
            Select Indicators
          </Label>
          <div className="flex flex-wrap gap-2">
            {INDICATORS.map((indicator) => {
              const isSelected = selectedIndicators.includes(indicator.value);
              return (
                <Button
                  key={indicator.value}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleIndicator(indicator.value)}
                  className={`border-gray-600 ${
                    isSelected
                      ? "text-yellow-500 hover:bg-yellow-400"
                      : "text-gray-400 hover:bg-gray-600"
                  }`}
                >
                  {indicator.label}
                  {isSelected && <X className="h-3 w-3 ml-1" />}
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="text-sm text-gray-400 mb-2 block">
            Personal Notes / Annotations
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your notes about this stock..."
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 min-h-[100px] resize-y"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="yellow-btn w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
};

export default ChartConfigPanel;