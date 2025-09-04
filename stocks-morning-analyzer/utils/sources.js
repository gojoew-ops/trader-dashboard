// utils/sources.js
import axios from 'axios';

const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const YAHOO_KEY = process.env.NEXT_PUBLIC_YAHOO_API_KEY;

// Expanded stock universe: mix of blue chips + cheap tickers
const WATCHLIST = [
  // Blue chips
  'AAPL', 'MSFT', 'TSLA', 'META', 'GOOGL', 'F', 'PFE', 'NOK',
  // Under $10 / retail favorites
  'SIRI', 'AMC', 'BB', 'SNAP', 'FCEL', 'IQ', 'GPRO', 'XELA', 'OCGN', 'ZNGA',
  // Penny/small caps often under $5
  'GEVO', 'IDEX', 'CENN', 'KODK', 'NNDM', 'EXPR', 'RIOT', 'MARA', 'PLUG'
];

async function fetchFromFinnhub() {
  if (!FINNHUB_KEY) return [];

  try {
    const results = await Promise.all(
      WATCHLIST.map(async symbol => {
        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`;
        const { data } = await axios.get(url);

        return {
          symbol,
          price: data.c,
          high: data.h,
          low: data.l,
          open: data.o,
          prevClose: data.pc,
          source: 'finnhub',
        };
      })
    );

    const filtered = results.filter(r => r.price !== undefined && r.price !== 0);
    console.log(`Fetched ${filtered.length} symbols from Finnhub`);
    return filtered;
  } catch (err) {
    console.error('Finnhub fetch failed:', err.message);
    return [];
  }
}

async function fetchFromYahoo() {
  if (!YAHOO_KEY) return [];

  try {
    const results = await Promise.all(
      WATCHLIST.map(async symbol => {
        const url = `https://yahoo-finance166.p.rapidapi.com/api/stock/get-quote?region=US&symbol=${symbol}`;
        const { data } = await axios.get(url, {
          headers: { 'x-rapidapi-key': YAHOO_KEY },
        });

        return {
          symbol,
          price: data?.price?.regularMarketPrice?.raw ?? null,
          high: data?.price?.regularMarketDayHigh?.raw ?? null,
          low: data?.price?.regularMarketDayLow?.raw ?? null,
          open: data?.price?.regularMarketOpen?.raw ?? null,
          prevClose: data?.price?.regularMarketPreviousClose?.raw ?? null,
          source: 'yahoo',
        };
      })
    );

    const filtered = results.filter(r => r.price !== null);
    console.log(`Fetched ${filtered.length} symbols from Yahoo`);
    return filtered;
  } catch (err) {
    console.error('Yahoo fetch failed:', err.message);
    return [];
  }
}

export async function getSymbolsData() {
  // Try Finnhub first
  let data = await fetchFromFinnhub();

  if (data.length > 0) {
    return data;
  }

  // Fallback: Yahoo
  data = await fetchFromYahoo();
  if (data.length > 0) {
    return data;
  }

  console.warn('No stock data returned from either source');
  return [];
}

