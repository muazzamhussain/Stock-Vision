"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getSentimentForSymbol, triggerSentimentAnalysis } from "@/lib/actions/sentiment.actions";
import { toast } from "sonner";
import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";

const SentimentCard = ({ symbol }: { symbol: string }) => {
  const [sentiment, setSentiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSentiment = async () => {
    setLoading(true);
    try {
      const data = await getSentimentForSymbol(symbol);
      setSentiment(data);
    } catch (error) {
      console.error("Failed to load sentiment:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSentiment();
  }, [symbol]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await triggerSentimentAnalysis(symbol);
      if (result.success) {
        toast.success("Sentiment analysis triggered. It may take a moment to update.");
        setTimeout(loadSentiment, 3000);
      } else {
        toast.error(result.error || "Failed to trigger sentiment analysis.");
      }
    } catch (error) {
      toast.error("Failed to trigger sentiment analysis.");
    } finally {
      setRefreshing(false);
    }
  };

  const getSentimentColor = (label: string) => {
    switch (label) {
      case "Bullish":
        return "text-green-500 bg-green-500/10 border-green-500/30";
      case "Bearish":
        return "text-red-500 bg-red-500/10 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getSentimentIcon = (label: string) => {
    switch (label) {
      case "Bullish":
        return <TrendingUp className="h-5 w-5" />;
      case "Bearish":
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <Minus className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-700 rounded mb-4"></div>
          <div className="h-10 bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Market Sentiment</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {sentiment ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getSentimentColor(sentiment.label)}`}>
              {getSentimentIcon(sentiment.label)}
              <span className="font-medium">{sentiment.label}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Score: {sentiment.score}/10</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${(sentiment.score / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-gray-300 text-sm leading-relaxed">{sentiment.summary}</p>
          </div>

          {sentiment.keyFactors && sentiment.keyFactors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Key Factors:</p>
              <ul className="space-y-1">
                {sentiment.keyFactors.map((factor: string, index: number) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Last analyzed: {new Date(sentiment.analyzedAt).toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400 mb-4">No sentiment data available yet.</p>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-gray-600 text-gray-400 hover:text-yellow-400 hover:border-yellow-400"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Analyze Sentiment
          </Button>
        </div>
      )}
    </div>
  );
};

export default SentimentCard;