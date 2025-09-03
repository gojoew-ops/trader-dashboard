// utils/scoring.js

// Basic scoring system: higher score = stronger candidate
export function scoreStock(stock) {
  let score = 0;

  // Favor stocks with some volatility
  if (stock.high && stock.low) {
    const range = stock.high - stock.low;
    if (range > 0 && stock.price) {
      score += (range / stock.price) * 10;
    }
  }

  // Favor if price is above open (momentum signal)
  if (stock.open && stock.price > stock.open) {
    score += 5;
  }

  // Favor if price is above previous close
  if (stock.prevClose && stock.price > stock.prevClose) {
    score += 3;
  }

  // Bonus for very low-priced stocks (speculative upside)
  if (stock.price && stock.price < 5) {
    score += 2;
  }

  return Math.round(score * 100) / 100; // keep 2 decimals
}

