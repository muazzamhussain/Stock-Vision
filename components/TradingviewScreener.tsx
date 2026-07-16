"use client";

import { useEffect, useRef } from "react";

interface TradingViewScreenerProps {
  height?: number | string;
  defaultColumn?: string;
  defaultScreen?: string;
  market?: string;
}

export default function TradingViewScreener({
 
  defaultColumn = "overview",
  defaultScreen = "most_capitalized",
  market = "us",
}: TradingViewScreenerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget
    container.innerHTML = "";

    // Widget placeholder
    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";

    // Script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
    //   width: "100vw",
    //   height: "100vh",
      defaultColumn,
      defaultScreen,
      showToolbar: true,
      locale: "en",
      market,
      colorTheme: "dark",
    });

    container.appendChild(widgetDiv);
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [defaultColumn, defaultScreen, market]);


  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{
        height: "700px",
      }}
    />
  );
}