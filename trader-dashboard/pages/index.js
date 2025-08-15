import { useState, useEffect } from "react";

export default function Home() {
  const [signals, setSignals] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState("AAPL");

  useEffect(() => {
    const demoTickers = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"];
    const interval = setInterval(() => {
      const ticker = demoTickers[Math.floor(Math.random() * demoTickers.length)];
      const action = Math.random() > 0.5 ? "BUY" : "SELL";
      const price = (Math.random() * 1000).toFixed(2);
      setSignals(s => [
        { ticker, action, price, time: new Date().toLocaleTimeString() },
        ...s
      ]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "#0d1117", color: "#fff", minHeight: "100vh", padding: "20px" }}>
      <h1>📊 Short-Term Trader Dashboard</h1>
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: "1" }}>
          <h2>Watchlist</h2>
          {["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"].map(t => (
            <div
              key={t}
              style={{
                padding: "10px",
                cursor: "pointer",
                background: selectedTicker === t ? "#161b22" : "transparent"
              }}
              onClick={() => setSelectedTicker(t)}
            >
              {t}
            </div>
          ))}
        </div>
        <div style={{ flex: "3" }}>
          <h2>{selectedTicker} Chart</h2>
          <iframe
            src={`https://s.tradingview.com/widgetembed/?symbol=${selectedTicker}&interval=15&theme=dark`}
            style={{ width: "100%", height: "500px", border: "none" }}
          ></iframe>
        </div>
        <div style={{ flex: "2" }}>
          <h2>Signals</h2>
          <ul>
            {signals.map((s, i) => (
              <li key={i}>
                <strong>{s.ticker}</strong> — {s.action} at ${s.price} ({s.time})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}