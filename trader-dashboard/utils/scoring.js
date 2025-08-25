export function scoreStocks(stocks) {
  return stocks.map(stock => {
    const momentum = stock.change || 0;
    const score = Math.min(95, Math.max(30, Math.round(momentum * 10 + 50)));
    const insight = momentum > 2
      ? "Strong momentum with upside potential."
      : momentum > 0
        ? "Mild upward move, could be worth watching."
        : "Weak or negative momentum, less favorable for intraday trade.";
    return { ...stock, score, insight };
  });
}
