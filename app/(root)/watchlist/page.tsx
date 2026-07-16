import Link from "next/link";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import TradingViewWatchlistWidget from "@/components/TradingViewWatchlistWidget";
import AddAlertButton from "@/components/AddAlertButton";

const page = async () => {
  const session = await auth?.api.getSession({ headers: await headers() });

  if (!session?.user?.email) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Your Watchlist</h1>
        <p className="mt-3 text-gray-400">
          Sign in to start tracking your favorite stocks.
        </p>
      </div>
    );
  }

  const symbols = await getWatchlistSymbolsByEmail(session.user.email);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Your Watchlist</h1>
          <p className="mt-2 text-gray-400">
            {symbols.length > 0
              ? `Tracking ${symbols.length} stock${symbols.length === 1 ? "" : "s"}`
              : "Add stocks to get started"}
          </p>
        </div>
        <Link
          href="/alerts"
          className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-400 transition hover:bg-yellow-500/20"
        >
          View Alerts
        </Link>
      </div>

      {symbols.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
          <p className="text-lg text-white">No stocks saved yet</p>
          <p className="mt-2 text-gray-400">
            Visit a stock page to add your first symbol.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-4 overflow-hidden">
          <TradingViewWatchlistWidget symbols={symbols} direction="vertical" />
          {symbols.map((symbol) => (
            <AddAlertButton key={symbol} symbol={symbol} company={symbol} />
          ))}
        </div>
      )}
    </div>
  );
};

export default page;
