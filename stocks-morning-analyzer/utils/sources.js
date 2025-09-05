// utils/sources.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';

/**
 * Load a universe of symbols to analyze.
 * Tries, in order:
 *   1) /data/candidates.json -> { "symbols": [...] } or [ ... ]
 *   2) /candidates.json      -> [ ... ]
 *   3) Fallback small built‑in list
 */
function loadUniverse() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'candidates.json');
    if (fs.existsSync(dataPath)) {
      const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      if (Array.isArray(raw)) return raw;
      if (raw && Array.isArray(raw.symbols)) return raw.symbols;
    }
  } catch (_) {}

  try {
    const altPath = path.join(process.cwd(), 'candidates.json');
    if (fs.existsSync(altPath)) {
      const raw = JSON.parse(fs.readFileSync(altPath, 'utf8'));
      if (Array.isArray(raw)) return raw;
      if (raw && Array.isArray(raw.symbols)) return raw.symbols;
    }
  } catch (_) {}

  // Minimal fallback so the UI always shows something
  return ['SIRI','NOK','F','GPRO','PLUG','SOFI','AAL','CCL','IQ','DNA','RIOT','MARA'];
}

/**
 * Fetch quote data for a batch of symbols using Yahoo Finance's
 * public quote endpoint (no API key required). This runs server‑side
 * inside the Next.js API route, so CORS is not an issue.
 */
async function fetchYahooBatch(symbols) {
  if (!symbols.length) return [];
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&symbols=${encodeURIComponent(symbols.join(','))}`;
  const { data } = await axios.get(url, { timeout: 10_000 });
  const results = data?.quoteResponse?.result || [];
  return results.map(r => ({
    symbol: r.symbol,
    price: r.regularMarketPrice ?? null,
    high: r.regularMarketDayHigh ?? null,
    low: r.regularMarketDayLow ?? null,
    open: r.regularMarketOpen ?? null,
    prevClose: r.regularMarketPreviousClose ?? null,
    // lightweight intraday volatility proxy
    volatility: (r.regularMarketPrice && r.regularMarketDayHigh != null && r.regularMarketDayLow != null)
      ? (r.regularMarketDayHigh - r.regularMarketDayLow) / r.regularMarketPrice
      : null,
    source: 'yahoo'
  }));
}

/**
 * Public function used by the API route.
 * Returns [{symbol, price, high, low, open, prevClose, volatility, source}]
 */
export async function getSymbolsData() {
  const universe = loadUniverse();

  // Yahoo allows a lot per request, but we chunk to be safe
  const chunkSize = 40;
  const chunks = [];
  for (let i = 0; i < universe.length; i += chunkSize) {
    chunks.push(universe.slice(i, i + chunkSize));
  }

  const all = [];
  for (const chunk of chunks) {
    try {
      const rows = await fetchYahooBatch(chunk);
      all.push(...rows);
    } catch (err) {
      console.warn('Yahoo batch failed for', chunk.join(','), err?.message || err);
    }
  }

  // De‑dupe just in case
  const seen = new Set();
  const deduped = [];
  for (const row of all) {
    if (row?.symbol && !seen.has(row.symbol)) {
      seen.add(row.symbol);
      deduped.push(row);
    }
  }
  return deduped;
}

export default { getSymbolsData };


