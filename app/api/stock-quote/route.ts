// app/api/stock-quote/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const token =
      process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();

    if (data.c !== undefined && data.c !== 0) {
      return NextResponse.json({ currentPrice: data.c });
    }

    return NextResponse.json({ error: "No price data found" }, { status: 404 });
  } catch (error) {
    console.error(`Failed to fetch quote for ${symbol}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}