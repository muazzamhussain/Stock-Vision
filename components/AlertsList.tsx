"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteAlert, updateAlert } from "@/lib/actions/alert.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SquarePen, Trash2, Loader2 } from "lucide-react";

const AlertsList = ({ alerts }: { alerts: any[] }) => {
  const [deleting, setDeleting] = useState<string | null>(null);

  // Current prices state
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTargetPrice, setEditTargetPrice] = useState<string>("");
  const [editCondition, setEditCondition] = useState<"above" | "below">("above");
  const [editStatus, setEditStatus] = useState<"active" | "triggered">("active");
  const [pendingEdit, setPendingEdit] = useState(false);

  const editingAlert = useMemo(
    () => alerts.find((a) => a._id === editingId) || null,
    [alerts, editingId]
  );

  // Fetch current prices via our own API route
  useEffect(() => {
    if (alerts.length === 0) {
      setLoadingPrices(false);
      return;
    }

    const uniqueSymbols = [...new Set(alerts.map((a) => a.symbol))];

    const fetchPrices = async () => {
      setLoadingPrices(true);
      const prices: Record<string, number> = {};

      // Fetch sequentially with a small delay to avoid rate limits
      for (const symbol of uniqueSymbols) {
        try {
          const res = await fetch(
            `/api/stock-quote?symbol=${encodeURIComponent(symbol)}`
          );
          const data = await res.json();

          if (res.ok && data.currentPrice) {
            prices[symbol] = data.currentPrice;
          } else {
            console.warn(`No price for ${symbol}:`, data.error);
          }
        } catch (e) {
          console.error(`Failed to fetch quote for ${symbol}:`, e);
        }

        // Small delay between requests to respect rate limits
        if (uniqueSymbols.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      setCurrentPrices(prices);
      setLoadingPrices(false);
    };

    fetchPrices();

    // Refresh prices every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [alerts]);

  // Helper to determine price color relative to target
  const getPriceColor = (alert: any, currentPrice: number | undefined) => {
    if (!currentPrice) return "text-gray-400";

    if (alert.condition === "above") {
      return currentPrice >= alert.targetPrice ? "text-green-400" : "text-red-400";
    } else {
      return currentPrice <= alert.targetPrice ? "text-green-400" : "text-red-400";
    }
  };

  // Helper to calculate price difference
  const getPriceDiff = (alert: any, currentPrice: number | undefined) => {
    if (!currentPrice) return null;

    const diff = currentPrice - alert.targetPrice;
    const percentage = (diff / alert.targetPrice) * 100;

    return {
      diff: Math.abs(diff).toFixed(2),
      percentage: Math.abs(percentage).toFixed(2),
      isPositive: diff >= 0,
    };
  };

  const handleDelete = async (alertId: string) => {
    setDeleting(alertId);
    try {
      const result = await deleteAlert(alertId);
      if (result.success) {
        toast.success("Alert deleted successfully.");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to delete alert.");
      }
    } catch {
      toast.error("Failed to delete alert.");
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (alert: any) => {
    setEditingId(alert._id);
    setEditTargetPrice(String(alert.targetPrice ?? ""));
    setEditCondition(alert.condition === "below" ? "below" : "above");
    setEditStatus(alert.isTriggered ? "triggered" : "active");
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setPendingEdit(true);
    try {
      const price = parseFloat(editTargetPrice);
      if (isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price.");
        setPendingEdit(false);
        return;
      }

      const result = await updateAlert(editingId, price, editCondition, editStatus);
      if (result.success) {
        toast.success("Alert updated successfully.");
        setEditingId(null);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to update alert.");
      }
    } catch {
      toast.error("Failed to update alert.");
    } finally {
      setPendingEdit(false);
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
        <p className="text-lg text-white">No alerts yet</p>
        <p className="mt-2 text-gray-400">
          Set alerts from your watchlist to get notified when prices hit your
          targets.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden overflow-x-auto">
        {/* Table Header */}
        <div className="grid grid-cols-8 gap-4 px-6 py-4 border-b border-white/10 bg-white/10 text-sm font-medium text-gray-300 min-w-[800px]">
          <div>Symbol</div>
          <div>Company</div>
          <div>Current</div>
          <div>Target</div>
          <div>Diff</div>
          <div>Condition</div>
          <div>Status</div>
          <div className="text-right">Action</div>
        </div>

        {/* Table Rows */}
        {alerts.map((alert) => {
          const currentPrice = currentPrices[alert.symbol];
          const priceDiff = getPriceDiff(alert, currentPrice);

          return (
            <div
              key={alert._id}
              className="grid grid-cols-8 gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/5 transition min-w-[800px]"
            >
              {/* Symbol */}
              <div className="font-semibold text-white">{alert.symbol}</div>

              {/* Company */}
              <div className="text-gray-400 truncate">{alert.company}</div>

              {/* Current Price */}
              <div
                className={`font-medium ${getPriceColor(alert, currentPrice)}`}
              >
                {loadingPrices ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                ) : currentPrice !== undefined ? (
                  `$${currentPrice.toFixed(2)}`
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </div>

              {/* Target Price */}
              <div className="text-yellow-400 font-medium">
                ${alert.targetPrice.toFixed(2)}
              </div>

              {/* Difference */}
              <div className="text-sm">
                {loadingPrices ? (
                  <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                ) : priceDiff ? (
                  <span
                    className={
                      priceDiff.isPositive ? "text-green-400" : "text-red-400"
                    }
                  >
                    {priceDiff.isPositive ? "+" : "-"}${priceDiff.diff}
                    <br />
                    <span className="text-xs opacity-70">
                      {priceDiff.isPositive ? "+" : "-"}
                      {priceDiff.percentage}%
                    </span>
                  </span>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </div>

              {/* Condition */}
              <div className="text-gray-200">
                {alert.condition === "above" ? "↑ Above" : "↓ Below"}
              </div>

              {/* Status */}
              <div
                className={
                  alert.isTriggered ? "text-gray-500" : "text-green-400"
                }
              >
                {alert.isTriggered ? "Triggered" : "Active"}
              </div>

              {/* Actions */}
              <div className="text-right flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(alert)}
                  disabled={deleting === alert._id}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 cursor-pointer"
                >
                  <SquarePen className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(alert._id)}
                  disabled={deleting === alert._id}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                >
                  {deleting === alert._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingId}
        onOpenChange={(open) => !open && setEditingId(null)}
      >
        <DialogContent className="bg-gray-800 border-gray-600 text-gray-400 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Edit Alert {editingAlert ? `for ${editingAlert.symbol}` : ""}
            </DialogTitle>

            {/* Current price in edit dialog */}
            {editingAlert && currentPrices[editingAlert.symbol] !== undefined && (
              <p className="text-sm text-gray-400 mt-1">
                Current price:{" "}
                <span className="text-green-400 font-medium">
                  ${currentPrices[editingAlert.symbol].toFixed(2)}
                </span>
              </p>
            )}
          </DialogHeader>

          <form onSubmit={submitEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTargetPrice" className="text-gray-400">
                Target Price ($)
              </Label>
              <Input
                id="editTargetPrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter target price"
                value={editTargetPrice}
                onChange={(e) => setEditTargetPrice(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                required
              />

              {/* Live difference preview */}
              {editingAlert &&
                currentPrices[editingAlert.symbol] !== undefined &&
                editTargetPrice && (
                  <p className="text-xs text-gray-500">
                    {(() => {
                      const cp = currentPrices[editingAlert.symbol];
                      const tp = parseFloat(editTargetPrice);
                      if (isNaN(tp) || tp <= 0) return null;
                      const diff = cp - tp;
                      const pct = ((diff / tp) * 100).toFixed(2);
                      return (
                        <span
                          className={
                            diff >= 0 ? "text-green-400" : "text-red-400"
                          }
                        >
                          Current is {diff >= 0 ? "+" : ""}${diff.toFixed(2)} (
                          {diff >= 0 ? "+" : ""}
                          {pct}%) from target
                        </span>
                      );
                    })()}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCondition" className="text-gray-400">
                Condition
              </Label>
              <Select
                value={editCondition}
                onValueChange={(v) => setEditCondition(v as any)}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white">
                  <SelectItem value="above" className="focus:bg-gray-600">
                    Price goes above target
                  </SelectItem>
                  <SelectItem value="below" className="focus:bg-gray-600">
                    Price drops below target
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editStatus" className="text-gray-400">
                Status
              </Label>
              <Select
                value={editStatus}
                onValueChange={(v) => setEditStatus(v as any)}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white">
                  <SelectItem value="active" className="focus:bg-gray-600">
                    Active
                  </SelectItem>
                  <SelectItem value="triggered" className="focus:bg-gray-600">
                    Non active (triggered)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={pendingEdit}
              className="yellow-btn w-full"
            >
              {pendingEdit ? "Updating..." : "Update Alert"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertsList;