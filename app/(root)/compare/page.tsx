"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { searchStocks, getStockMetrics } from "@/lib/actions/finnhub.actions";
import { addToWatchlist } from "@/lib/actions/watchlist.actions";
import { Search, X, Plus, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getHistoricalPricesBatch } from "@/lib/actions/finnhub.actions";

const ComparePage = () => {
  const [selectedStocks, setSelectedStocks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<any[]>([]);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchStocks(searchQuery.trim());
      setSearchResults(results.slice(0, 10));
    } catch (error) {
      toast.error("Failed to search stocks.");
    } finally {
      setSearching(false);
    }
  };

  const addStock = async (stock: any) => {
    if (selectedStocks.length >= 5) {
      toast.error("Maximum 5 stocks can be compared.");
      return;
    }
    if (selectedStocks.some((s) => s.symbol === stock.symbol)) {
      toast.error(`${stock.symbol} is already in the comparison.`);
      return;
    }

    setLoading(true);
    try {
      const metrics = await getStockMetrics(stock.symbol);
      if (metrics) {
        setSelectedStocks([...selectedStocks, { ...stock, ...metrics }]);
        setSearchQuery("");
        setSearchResults([]);
        toast.success(`${stock.symbol} added to comparison.`);
      } else {
        toast.error(`Failed to load data for ${stock.symbol}.`);
      }
    } catch (error) {
      toast.error(`Failed to load data for ${stock.symbol}.`);
    } finally {
      setLoading(false);
    }
  };

  const removeStock = (symbol: string) => {
    setSelectedStocks(selectedStocks.filter((s) => s.symbol !== symbol));
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  const handleAddToWatchlist = async (symbol: string, company: string) => {
    const result = await addToWatchlist(symbol, company);
    if (result.success) {
      toast.success(`${symbol} added to watchlist.`);
    } else {
      toast.error(result.error || "Failed to add to watchlist.");
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      if (selectedStocks.length > 0) {
        const symbols = selectedStocks.map((s) => s.symbol);
        const data = await getHistoricalPricesBatch(symbols, 30);
        setHistoryData(data);
      }
    };
    loadHistory();
  }, [selectedStocks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Stock Comparison</h1>
        <p className="mt-2 text-gray-400">
          Compare up to 5 stocks side by side.
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for stocks to compare..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 max-w-md py-6 "
        />
        <Button
          onClick={handleSearch}
          disabled={searching}
          className="yellow-btn"
        >
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-white/10 p-4 max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {searchResults.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-2 hover:bg-gray-700 rounded transition-colors"
              >
                <div>
                  <span className="font-medium text-white">{stock.symbol}</span>
                  <span className="text-sm text-gray-400 ml-2">
                    {stock.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addStock(stock)}
                  className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Stocks */}
      {selectedStocks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStocks.map((stock) => (
            <Badge
              key={stock.symbol}
              className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 flex items-center gap-2"
            >
              {stock.symbol}
              <button
                onClick={() => removeStock(stock.symbol)}
                className="hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Comparison Table */}
      {selectedStocks.length > 0 && (
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-800 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-400 min-w-[150px]">
                    Metric
                  </th>
                  {selectedStocks.map((stock) => (
                    <th
                      key={stock.symbol}
                      className="px-4 py-3 text-sm font-medium text-white text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/stocks/${stock.symbol}`}
                          className="hover:text-yellow-400 transition-colors"
                        >
                          {stock.symbol}
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleAddToWatchlist(stock.symbol, stock.company)
                          }
                          className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 p-1"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stock.company}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    key: "price",
                    label: "Current Price",
                    format: (v: number) => `$${v?.toFixed(2) || "N/A"}`,
                  },
                  {
                    key: "change",
                    label: "Change Today",
                    format: (v: number) => `${v?.toFixed(2) || 0}%`,
                  },
                  {
                    key: "marketCap",
                    label: "Market Cap",
                    format: formatMarketCap,
                  },
                  {
                    key: "peRatio",
                    label: "P/E Ratio",
                    format: (v: number) => v?.toFixed(2) || "N/A",
                  },
                  {
                    key: "high52w",
                    label: "52W High",
                    format: (v: number) => (v ? `$${v.toFixed(2)}` : "N/A"),
                  },
                  {
                    key: "low52w",
                    label: "52W Low",
                    format: (v: number) => (v ? `$${v.toFixed(2)}` : "N/A"),
                  },
                  {
                    key: "eps",
                    label: "EPS",
                    format: (v: number) => v?.toFixed(2) || "N/A",
                  },
                  {
                    key: "volume",
                    label: "Volume",
                    format: (v: number) => v?.toLocaleString() || "N/A",
                  },
                  {
                    key: "sector",
                    label: "Sector",
                    format: (v: string) => v || "N/A",
                  },
                ].map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-400 font-medium">
                      {row.label}
                    </td>
                    {selectedStocks.map((stock) => (
                      <td
                        key={stock.symbol}
                        className="px-4 py-3 text-sm text-gray-300 text-center"
                      >
                        {row.format(stock[row.key as keyof typeof stock])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {historyData.length > 0 && selectedStocks.length > 0 && (
        <div className="rounded-lg border border-white/10 p-4 bg-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">
            Price Performance (30 Days)
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30333A" />
                <XAxis
                  dataKey="date"
                  stroke="#9095A1"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9095A1" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#141414",
                    border: "1px solid #30333A",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                {selectedStocks.map((stock, index) => {
                  const colors = [
                    "#FDD458",
                    "#0FEDBE",
                    "#5862FF",
                    "#FF495B",
                    "#D13BFF",
                  ];
                  return (
                    <Line
                      key={stock.symbol}
                      type="monotone"
                      dataKey={stock.symbol}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={false}
                      name={stock.symbol}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
