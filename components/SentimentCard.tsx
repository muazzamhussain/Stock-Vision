"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { getSentimentForSymbol, triggerSentimentAnalysis } from "@/lib/actions/sentiment.actions";
import { toast } from "sonner";
import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";

const POLL_INTERVAL = 3000; // ms between checks
const MAX_ATTEMPTS = 10; // gives up after ~30s so the button never stays stuck

const SentimentCard = ({ symbol }: { symbol: string }) => {
  const [sentiment, setSentiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadSentiment = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getSentimentForSymbol(symbol);
      setSentiment(data);
      return data;
    } catch (error) {
      console.error("Failed to load sentiment:", error);
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadSentiment();

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
      setIsAnalyzing(false);
    };
  }, [symbol]);

  const handleRefresh = async () => {
    if (isAnalyzing) return; // extra guard against double triggers

    setIsAnalyzing(true);
    const previousAnalyzedAt = sentiment?.analyzedAt;

    try {
      const result = await triggerSentimentAnalysis(symbol);

      if (!result.success) {
        toast.error(result.error || "Failed to trigger sentiment analysis.");
        setIsAnalyzing(false);
        return;
      }

      toast.success("Sentiment analysis triggered. It may take a moment to update.");

      // Keep the button disabled until fresh data shows up (or we time out)
      let attempts = 0;
      const poll = async () => {
        attempts++;
        const data = await loadSentiment(true);
        const isUpdated = data && data.analyzedAt !== previousAnalyzedAt;

        if (isUpdated || attempts >= MAX_ATTEMPTS) {
          setIsAnalyzing(false);
          return;
        }
        pollRef.current = setTimeout(poll, POLL_INTERVAL);
      };

      pollRef.current = setTimeout(poll, POLL_INTERVAL);
    } catch (error) {
      toast.error("Failed to trigger sentiment analysis.");
      setIsAnalyzing(false);
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
          disabled={isAnalyzing}
          className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
          {isAnalyzing ? "Analyzing..." : "Refresh"}
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
            disabled={isAnalyzing}
            variant="outline"
            className="border-gray-600 text-gray-400 hover:text-yellow-400 hover:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
            {isAnalyzing ? "Analyzing..." : "Analyze Sentiment"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SentimentCard;