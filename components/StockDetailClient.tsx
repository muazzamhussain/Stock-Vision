"use client";

import { useState, useEffect } from "react";
import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import ChartConfigPanel from "@/components/ChartConfigPanel";
import SentimentCard from "@/components/SentimentCard";
import AddAlertButton from "@/components/AddAlertButton";
import FullscreenChart from "@/components/FullscreenChart";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";
import { getChartConfig } from "@/lib/actions/chart.actions";
import Script from "next/script";

interface Props {
  symbol: string;
  initialIsInWatchlist: boolean;
  sessionUser: User | null;
}

export default function StockDetailClient({
  symbol,
  initialIsInWatchlist,
  sessionUser,
}: Props) {
  const [indicators, setIndicators] = useState<string[]>([]);
  const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);
  const [chartKey, setChartKey] = useState(0); // force remount if needed

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getChartConfig(symbol);
        if (config) {
          setIndicators(config.indicators || []);
        }
      } catch (error) {
        console.error("Failed to load chart config:", error);
      }
    };
    loadConfig();
  }, [symbol]);

  const normalizedSymbol = symbol.toUpperCase();
  const scriptUrl =
    "https://s3.tradingview.com/external-embedding/embed-widget-";

  const handleIndicatorsSaved = (newIndicators: string[], notes: string) => {
    setIndicators(newIndicators);
    // increment key to force the chart widget to fully re‑initialise
    setChartKey((prev) => prev + 1);
  };

  // Helper mapping function
  const mapToTradingViewStudies = (indicators: string[]) => {
    const map: Record<string, string> = {
      RSI: "STD;RSI",
      MACD: "STD;MACD",
      BB: "STD;Bollinger_Bands",
      EMA: "STD;EMA",
      SMA: "STD;SMA",
      VWAP: "STD;VWAP",
    };
    return indicators.map((ind) => map[ind]).filter(Boolean);
  };

  const tradingViewStudies = mapToTradingViewStudies(indicators);

  return (
    <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
      <Script
        id="tradingview-company-profile"
        type="module"
        src="https://widgets.tradingview-widget.com/w/en/tv-company-profile.js"
        strategy="afterInteractive"
      />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}symbol-info.js`}
            config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
            height={170}
          />

          {/* Candlestick Chart with studies */}
          <FullscreenChart
            key={chartKey} // force remount when indicators change
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={CANDLE_CHART_WIDGET_CONFIG(symbol, tradingViewStudies)}
            title="Candlestick Chart"
            className="custom-chart"
            defaultHeight={600}
            fullscreenHeight={792}
          />

          {/* Baseline Chart with studies */}
          <FullscreenChart
            key={chartKey + 1} // different key to avoid conflict
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={BASELINE_WIDGET_CONFIG(symbol, tradingViewStudies)}
            title="Baseline Chart"
            className="custom-chart"
            defaultHeight={600}
            fullscreenHeight={792}
          />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <WatchlistButton
              symbol={normalizedSymbol}
              company={normalizedSymbol}
              isInWatchlist={isInWatchlist}
              onWatchlistChange={(sym, added) => setIsInWatchlist(added)}
            />
            <AddAlertButton symbol={symbol} company={symbol} />
          </div>

          <SentimentCard symbol={normalizedSymbol} />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
            height={400}
          />

          <div className="rounded-lg overflow-hidden min-h-[400px]">
            <tv-company-profile symbol={normalizedSymbol} theme="dark" />
          </div>

          <TradingViewWidget
            scriptUrl={`${scriptUrl}financials.js`}
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
            height={464}
          />

          {/* Chart Config Panel – pass onSave callback */}
          <ChartConfigPanel
            symbol={normalizedSymbol}
            onSave={handleIndicatorsSaved}
          />
        </div>
      </section>
    </div>
  );
}
