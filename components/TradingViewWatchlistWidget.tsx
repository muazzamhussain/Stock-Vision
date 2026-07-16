"use client";

import { useEffect, useRef } from "react";

interface TradingViewWatchlistWidgetProps {
  symbols: string[];
  direction?: "horizontal" | "vertical";
}

export default function TradingViewWatchlistWidget({
  symbols,
  direction = "horizontal",
}: TradingViewWatchlistWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const formatSymbol = (symbol: string) => {
    const nasdaqStocks = [
      "AAPL",
      "MSFT",
      "GOOGL",
      "GOOG",
      "AMZN",
      "META",
      "NVDA",
      "TSLA",
      "NFLX",
      "ADBE",
      "INTC",
      "AMD",
      "PYPL",
      "CSCO",
      "CMCSA",
      "PEP",
      "AVGO",
      "TXN",
      "COST",
      "QCOM",
      "TMUS",
      "AMGN",
      "SBUX",
      "INTU",
    ];
    const upper = symbol.toUpperCase();
    return nasdaqStocks.includes(upper) ? `NASDAQ:${upper}` : `NYSE:${upper}`;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || symbols.length === 0) return;

    // Clear previous content
    container.innerHTML = "";

    const symbolSectors = [
      {
        sectionName: "My Watchlist",
        symbols: symbols.map(formatSymbol),
      },
    ];

    // ✅ Create the custom element manually
    const widget = document.createElement("tv-market-summary");
    widget.setAttribute("symbol-sectors", JSON.stringify(symbolSectors));
    widget.setAttribute("direction", direction);
    widget.setAttribute("mode", "custom");
    widget.setAttribute("theme", "dark");

    container.appendChild(widget);

    // ✅ Load the script AFTER the element is in the DOM
    const existingScript = document.querySelector(
      'script[src="https://widgets.tradingview-widget.com/w/en/tv-market-summary.js"]',
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://widgets.tradingview-widget.com/w/en/tv-market-summary.js";
      script.async = true;
      document.head.appendChild(script);
    } else {
      // If script exists, force re-registration by re-appending element
      // The custom element should auto-initialize
    }

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [symbols, direction]);

  if (symbols.length === 0) return null;

  return <div ref={containerRef} className="w-full" />;
}
