"use client";

import { useState, useRef, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FullscreenChartWrapperProps {
  title?: string;
  fullscreenHeight?: number;
  // ✅ Union type: supports both JSX and render prop
  children:
    | React.ReactNode
    | ((isFullscreen: boolean) => React.ReactNode);
}

export default function FullscreenChartWrapper({
  children,
  title,
  fullscreenHeight = 800,
}: FullscreenChartWrapperProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        await wrapperRef.current?.requestFullscreen();
      } catch {
        setIsFullscreen(true);
      }
    } else {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          setIsFullscreen(false);
        }
      } catch {
        setIsFullscreen(false);
      }
    }
  };

  // ✅ Cast to function type explicitly to satisfy TypeScript
  const resolvedChildren =
    typeof children === "function"
      ? (children as (isFullscreen: boolean) => React.ReactNode)(isFullscreen)
      : children;

  return (
    <div
      ref={wrapperRef}
      className={`relative group ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-background p-4 overflow-auto"
          : "w-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        {title && (
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className={`ml-auto gap-2 opacity-0 group-hover:opacity-100 
            transition-opacity duration-200 cursor-pointer ${
              isFullscreen ? "opacity-100" : ""
            }`}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-4 w-4" />
              <span className="text-xs">Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              <span className="text-xs">Fullscreen</span>
            </>
          )}
        </Button>
      </div>

      {/* Chart */}
      <div
        className="w-full"
        style={isFullscreen ? { height: `${fullscreenHeight}px` } : undefined}
      >
        {resolvedChildren}
      </div>
    </div>
  );
}