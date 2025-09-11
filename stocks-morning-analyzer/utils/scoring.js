// utils/scoring.js

// Basic scoring system: higher score = stronger candidate
export function scoreStock(stock) {
  let score = 0;

  // Safety checks
  if (!stock || typeof stock !== 'object') return 0;

  const price = Number(stock.price) || 0;
  const high = Number(stock.high) || 0;
  const low = Number(stock.low) || 0;
  const open = Number(stock.open) || 0;
  const prevClose = Number(stock.prevClose) || 0;

  // Favor stocks with some intraday range (volatility)
  if (high > low && price > 0) {
    const range = high - low;
    score += (range / Math.max(price, 0.0001)) * 10; // normalized
  }

  // Momentum: price above open
  if (open > 0 && price > open) {
    score += 3;
  }

  // Momentum: price above previous close
  if (prevClose > 0 && price > prevClose) {
    score += 2;
  }

  // Favor low-priced (speculative) candidates for day trading — but keep small bonus
  if (price > 0 && price < 5) {
    score += 1.5;
  } else if (price > 0 && price < 10) {
    score += 0.7;
  }

  // Volume bonus (if provided)
  if (stock.volume && Number(stock.volume) > 0) {
    const vol = Number(stock.volume);
    // modest score for higher volume (log scale)
    score += Math.min(5, Math.log10(vol + 1) );
  }

  return Math.round(score * 100) / 100;
}
