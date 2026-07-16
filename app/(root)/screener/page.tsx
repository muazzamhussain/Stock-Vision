"use client";

import TradingViewScreener from "@/components/TradingviewScreener";

const ScreenerPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Stock Screener</h1>
        <p className="mt-2 text-gray-400">
          Filter and find stocks based on key metrics.
        </p>
      </div>

      <div className="rounded-lg overflow-hidden border border-white/10 bg-[#141414]">
        <TradingViewScreener
          defaultColumn="overview"
          defaultScreen="most_capitalized"
          market="us"
        />
      </div>
    </div>
  );
};

export default ScreenerPage;