"use client";

import FullscreenChartWrapper from "@/components/FullscreenChartWrapper";
import TradingViewWidget from "@/components/TradingViewWidget";

interface FullscreenChartProps {
  scriptUrl: string;
  config: Record<string, unknown>;
  title?: string;
  defaultHeight?: number;
  fullscreenHeight?: number;
  className?: string;
}

export default function FullscreenChart({
  scriptUrl,
  config,
  title,
  defaultHeight = 600,
  fullscreenHeight = 792,
  className,
}: FullscreenChartProps) {
  return (
    <FullscreenChartWrapper title={title} fullscreenHeight={fullscreenHeight}>
      {(isFullscreen: boolean) => (
        <TradingViewWidget
          scriptUrl={scriptUrl}
          config={config}
          className={className}
          height={isFullscreen ? fullscreenHeight : defaultHeight}
        />
      )}
    </FullscreenChartWrapper>
  );
}