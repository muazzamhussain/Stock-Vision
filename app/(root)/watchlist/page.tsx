import Link from "next/link";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";

const WatchlistPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.email) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Your watchlist</h1>
        <p className="mt-3 text-gray-400">Sign in to start tracking your favorite stocks.</p>
      </div>
    );
  }

  const symbols = await getWatchlistSymbolsByEmail(session.user.email);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Your watchlist</h1>
          <p className="mt-2 text-gray-400">
            {symbols.length > 0
              ? `You are tracking ${symbols.length} stock${symbols.length === 1 ? "" : "s"}.`
              : "Add stocks from the market pages to build your list."}
          </p>
        </div>
      </div>

      {symbols.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
          <p className="text-lg text-white">No stocks saved yet</p>
          <p className="mt-2 text-gray-400">Visit a stock page and use the watchlist button to add your first symbol.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {symbols.map((symbol) => (
            <Link
              key={symbol}
              href={`/stocks/${symbol}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-yellow-500/50 hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{symbol}</p>
                  <p className="text-sm text-gray-400">View stock details</p>
                </div>
                <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-sm text-yellow-400">
                  Watching
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
