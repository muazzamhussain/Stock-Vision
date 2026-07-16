import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import ChartConfigPanel from "@/components/ChartConfigPanel";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import SentimentCard from "@/components/SentimentCard";
import FullscreenChart from "@/components/FullscreenChart";
import AddAlertButton from "@/components/AddAlertButton";
import Script from "next/script";

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;
  const session = await auth?.api.getSession({ headers: await headers() });
  const normalizedSymbol = symbol.toUpperCase();
  const watchlistSymbols = session?.user?.email
    ? await getWatchlistSymbolsByEmail(session.user.email)
    : [];
  const isInWatchlist = watchlistSymbols.includes(normalizedSymbol);

  return (
    <div className="flex min-h-screen p-4 md:p-6 lg:p-8">
      <Script
        id="tradingview-company-profile"
        type="module"
        src="https://widgets.tradingview-widget.com/w/en/tv-company-profile.js"
        strategy="afterInteractive"
      />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Left column charts */}
        <div className="flex flex-col gap-6">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}symbol-info.js`}
            config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
            height={170}
          />

          {/* ✅ No function as children — just props */}
          <FullscreenChart
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
            title="Candlestick Chart"
            className="custom-chart"
            defaultHeight={600}
            fullscreenHeight={792}
          />

          <FullscreenChart
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={BASELINE_WIDGET_CONFIG(symbol)}
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
            />
            <AddAlertButton symbol={symbol} company={symbol} />
          </div>
          <div>
            <SentimentCard symbol={normalizedSymbol} />
          </div>

          <TradingViewWidget
            scriptUrl={`${scriptUrl}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
            height={400}
          />

          <div className="rounded-lg overflow-hidden  min-h-[400px]">
            <tv-company-profile symbol={normalizedSymbol} theme="dark"></tv-company-profile>
          </div>

          <TradingViewWidget
            scriptUrl={`${scriptUrl}financials.js`}
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
            height={464}
          />

          {/* Add Chart Config Panel here */}
          <ChartConfigPanel symbol={normalizedSymbol} />
        </div>
      </section>
    </div>
  );
}
