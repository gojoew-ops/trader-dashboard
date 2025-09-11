export function scoreCandidate(stock, sentiment) {
  let score = 0;

  // Volatility
  const range = stock.high - stock.low;
  if (range > 0 && stock.price) {
    score += (range / stock.price) * 50;
  }

  // Momentum
  if (stock.price > stock.open) score += 10;
  if (stock.price > stock.prevClose) score += 5;

  // Price tier bonus
  if (stock.price < 5) score += 5;
  else if (stock.price < 10) score += 2;

  // Sentiment weight
  score += (sentiment.sentiment || 0) * 2;
  score += (sentiment.mentions || 0) * 0.5;

  return Math.round(score);
}

