"use client";

import { useEffect, useRef } from "react";

const useTradingViewWidget = (
  scriptUrl: string,
  config: Record<string, unknown>,
  height: number | string = 600
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resolvedHeight =
      typeof height === "number" ? `${height}px` : height;

    const numericHeight =
      typeof height === "number"
        ? height
        : Number.parseInt(height, 10) || 600;

    // ✅ Important: clear old widget so height can update
    container.innerHTML = "";
    delete container.dataset.loaded;

    // ✅ Set container size dynamically
    container.style.width = "100%";
    container.style.height = resolvedHeight;

    // Widget placeholder
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.width = "100%";
    widget.style.height = "100%";

    // Script
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.type = "text/javascript";

    // ✅ Override config height here
    script.innerHTML = JSON.stringify({
      ...config,
      width: "100%",
      height: numericHeight,
    });

    container.appendChild(widget);
    container.appendChild(script);
    container.dataset.loaded = "true";

    return () => {
      if (container) {
        container.innerHTML = "";
        delete container.dataset.loaded;
      }
    };
  }, [scriptUrl, height, JSON.stringify(config)]);

  return containerRef;
};

export default useTradingViewWidget;