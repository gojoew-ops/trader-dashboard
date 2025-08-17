import { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

const WATCHLIST = ["AAPL", "MSFT", "TSLA", "META", "GOOGL"];

export default function Home() {
  const [symbol, setSymbol] = useState("AAPL");
  const { data, error, isLoading } = useSWR(`/api/quote?symbol=${symbol}`, fetcher, { refreshInterval: 30000 });
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev === 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (error) return <div>Failed to load</div>;
  if (isLoading || !data) return <div>Loading...</div>;

  // Basic signal logic
  const changePercent = data.dp;
  let signal = "HOLD";
  let confidence = 50;

  if (changePercent > 1) {
    signal = "BUY NOW";
    confidence = Math.min(90, 50 + changePercent * 5);
  } else if (changePercent < -1) {
    signal = "SELL NOW";
    confidence = Math.min(90, 50 + Math.abs(changePercent) * 5);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Trader Dashboard v4</h1>

      <div style={{ marginBottom: 20 }}>
        {WATCHLIST.map((s) => (
          <button key={s} onClick={() => setSymbol(s)} style={{ marginRight: 10, padding: "6px 12px" }}>
            {s}
          </button>
        ))}
      </div>

      <div className="chart-container">
        <iframe
          src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${symbol}&symbol=${symbol}&interval=5&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=[]&hideideas=1&theme=dark`}
          style={{ width: "100%", height: "600px", border: "none" }}
        ></iframe>

        <div className="signal-overlay">
          {signal} ({confidence.toFixed(0)}%)
          <div className="timer-overlay">Refreshing in {countdown}s…</div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h2>Signals</h2>
        <p>Change %: {changePercent}%</p>
        <p>Signal: {signal}</p>
        <p>Confidence: {confidence.toFixed(0)}%</p>
      </div>
    </div>
  );
}
