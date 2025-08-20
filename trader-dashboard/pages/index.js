import { useState, useEffect } from "react";
import { WATCHLIST } from "../config/watchlist";

export default function Home() {
  const [signals, setSignals] = useState({});
  const [selectedTicker, setSelectedTicker] = useState(WATCHLIST[0]);
  const [priceHistory, setPriceHistory] = useState({});
  const [trend, setTrend] = useState("");

  // Fetch live prices
  useEffect(() => {
    const fetchPrices = async () => {
      const prices = {};
      for (const ticker of WATCHLIST) {
        try {
          const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1m&range=1d`);
          const data = await res.json();
          const lastPrice = data.chart.result[0].meta.regularMarketPrice;
          prices[ticker] = lastPrice;

          // Track history
          setPriceHistory(prev => {
            const hist = { ...prev };
            if (!hist[ticker]) hist[ticker] = [];
            hist[ticker] = [...hist[ticker].slice(-4), lastPrice]; // Keep last 5 prices
            return hist;
          });

        } catch (err) {
          console.error("Error fetching", ticker, err);
        }
      }
      setSignals(prices);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 20000);
    return () => clearInterval(interval);
  }, []);

  // Determine trend for selected ticker
  useEffect(() => {
    const prices = priceHistory[selectedTicker] || [];
    if (prices.length >= 2) {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      if (prices[prices.length - 1] > avg) setTrend("BUY NOW");
      else setTrend("SELL NOW");
    }
  }, [priceHistory, selectedTicker]);

  return (
    <div style={{ background: "#0d1117", color: "#fff", minHeight: "100vh", padding: "20px" }}>
      <h1>📊 Short-Term Trader Dashboard</h1>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: "1", minWidth: "150px" }}>
          <h2>Watchlist</h2>
          {WATCHLIST.map(t => (
            <div
              key={t}
              style={{
                padding: "10px",
                cursor: "pointer",
                background: selectedTicker === t ? "#161b22" : "transparent"
              }}
              onClick={() => setSelectedTicker(t)}
            >
              {t} {signals[t] ? `- $${signals[t].toFixed(2)}` : ""}
            </div>
          ))}
        </div>
        <div style={{ flex: "3", minWidth: "300px" }}>
          <h2 style={{ fontSize: "3rem", color: trend === "BUY NOW" ? "lime" : "red", textAlign: "center", margin: "10px 0" }}>
            {trend || "Loading..."}
          </h2>
          <iframe
            src={`https://s.tradingview.com/widgetembed/?symbol=${selectedTicker}&interval=15&theme=dark`}
            style={{ width: "100%", height: "500px", border: "none" }}
          ></iframe>
          <div style={{ fontSize: "0.9rem", color: "#bbb", marginTop: "10px", textAlign: "center" }}>
            Green = short-term upward trend, Red = short-term downward trend. Always combine with your own analysis.
          </div>
        </div>
      </div>
    </div>
  );
}