"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createAlert } from "@/lib/actions/alert.actions";
import { Siren } from "lucide-react";

const AddAlertButton = ({ symbol, company }: { symbol: string; company: string }) => {
  const [open, setOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState<string>("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);

    try {
      const price = parseFloat(targetPrice);
      if (isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price.");
        return;
      }

      const result = await createAlert(symbol, company, price, condition);
      if (result.success) {
        toast.success(`Alert set for ${symbol} at $${price.toFixed(2)}`);
        setOpen(false);
        setTargetPrice("");
      } else {
        toast.error(result.error || "Failed to create alert.");
      }
    } catch (error) {
      toast.error("Failed to create alert.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 cursor-pointer"
        >
          <Siren className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-600 text-gray-400 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Set Price Alert for {symbol}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetPrice" className="text-gray-400">
              Target Price ($)
            </Label>
            <Input
              id="targetPrice"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter target price"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition" className="text-gray-400">
              Condition
            </Label>
            <Select
              value={condition}
              onValueChange={(value) => setCondition(value as "above" | "below")}
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
          <Button
            type="submit"
            disabled={pending}
            className="yellow-btn w-full"
          >
            {pending ? "Creating..." : "Create Alert"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlertButton;