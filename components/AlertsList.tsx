"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteAlert, updateAlert } from "@/lib/actions/alert.actions"; // <-- add editAlert
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
import { SquarePen, Trash2 } from "lucide-react";

const AlertsList = ({ alerts }: { alerts: any[] }) => {
  const [deleting, setDeleting] = useState<string | null>(null);

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
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setPendingEdit(true);
    try {
      const price = parseFloat(editTargetPrice);
      if (isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price.");
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
          Set alerts from your watchlist to get notified when prices hit your targets.
        </p>
      </div>
    );
  }

  return (
    <>
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

            <div className={alert.isTriggered ? "text-gray-500" : "text-green-400"}>
              {alert.isTriggered ? "Triggered" : "Active"}
            </div>

            <div className="text-right flex items-center justify-end gap-2">
              {/* ✅ Edit */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEdit(alert)}
                disabled={deleting === alert._id}
                className="text-blue-400 hover:text-blue-300 hover:bg-red-500/10"
              >
                <SquarePen className="h-4 w-4" />
              </Button>

              {/* ✅ Delete */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(alert._id)}
                disabled={deleting === alert._id}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="bg-gray-800 border-gray-600 text-gray-400 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Edit Alert {editingAlert ? `for ${editingAlert.symbol}` : ""}
            </DialogTitle>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCondition" className="text-gray-400">
                Condition
              </Label>
              <Select value={editCondition} onValueChange={(v) => setEditCondition(v as any)}>
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
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as any)}>
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

            <Button type="submit" disabled={pendingEdit} className="yellow-btn w-full">
              {pendingEdit ? "Updating..." : "Update Alert"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertsList;