"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteAlert } from "@/lib/actions/alert.actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const AlertsList = ({ alerts }: { alerts: any[] }) => {
  const [deleting, setDeleting] = useState<string | null>(null);

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
    } catch (error) {
      toast.error("Failed to delete alert.");
    } finally {
      setDeleting(null);
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
        <p className="text-lg text-white">No alerts yet</p>
        <p className="mt-2 text-gray-400">
          Set alerts from your watchlist to get notified when prices hit your targets.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-white/10 bg-white/10 text-sm font-medium text-gray-300">
        <div>Symbol</div>
        <div>Company</div>
        <div>Target</div>
        <div>Condition</div>
        <div>Status</div>
        <div className="text-right">Action</div>
      </div>

      {/* Table Rows */}
      {alerts.map((alert) => (
        <div
          key={alert._id}
          className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/5 transition"
        >
          <div className="font-semibold text-white">{alert.symbol}</div>

          <div className="text-gray-400">{alert.company}</div>

          <div className="text-yellow-400 font-medium">
            ${alert.targetPrice.toFixed(2)}
          </div>

          <div className="text-gray-200">
            {alert.condition === "above" ? "↑ Above" : "↓ Below"}
          </div>

          <div
            className={
              alert.isTriggered ? "text-gray-500" : "text-green-400"
            }
          >
            {alert.isTriggered ? "Triggered" : "Active"}
          </div>

          <div className="text-right">
            {!alert.isTriggered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(alert._id)}
                disabled={deleting === alert._id}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertsList;