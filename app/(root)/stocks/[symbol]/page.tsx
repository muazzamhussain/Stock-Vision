import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import StockDetailClient from "@/components/StockDetailClient";

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  const session = await auth?.api.getSession({ headers: await headers() });

  const normalizedSymbol = symbol.toUpperCase();
  const watchlistSymbols = session?.user?.email
    ? await getWatchlistSymbolsByEmail(session.user.email)
    : [];
  const isInWatchlist = watchlistSymbols.includes(normalizedSymbol);

  return (
    <StockDetailClient
      symbol={symbol}
      initialIsInWatchlist={isInWatchlist}
      sessionUser={session?.user || null}
    />
  );
}
