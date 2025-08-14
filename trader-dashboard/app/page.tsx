"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TradingViewChart from "@/components/TradingViewChart";
import Watchlist from "@/components/Watchlist";

type Signal = {
  time: string;
  ticker: string;
  action: "BUY" | "SELL" | "ALERT";
  note?: string;
};

const DEFAULTS = [
  "NASDAQ:AAPL",
  "NASDAQ:TSLA",
  "NASDAQ:MSFT",
  "NASDAQ:AMZN",
  "NASDAQ:NVDA"
];

export default function Page() {
  const [symbols, setSymbols] = useState<string[]>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("symbols") : null;
    return saved ? JSON.parse(saved) : DEFAULTS;
  });
  const [selected, setSelected] = useState<string>(symbols[0] || "NASDAQ:AAPL");
  const [newSymbol, setNewSymbol] = useState("");
  const [signals, setSignals] = useState<Signal[]>([]);
  const [demoMode, setDemoMode] = useState(true);

  // Persist watchlist
  useEffect(() => {
    localStorage.setItem("symbols", JSON.stringify(symbols));
  }, [symbols]);

  // Poll for latest signals
  useEffect(() => {
    let mounted = true;

    async function fetchSignals() {
      try {
        const res = await fetch("/api/alerts?limit=60", { cache: "no-store" });
        const json = await res.json();
        if (mounted && json.ok) setSignals(json.data);
      } catch (e) {
        // ignore
      }
    }
    fetchSignals();
    const id = setInterval(fetchSignals, 3000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // Optional DEMO MODE: generate fake alerts every 5s so you see motion immediately
  useEffect(() => {
    if (!demoMode) return;
    const id = setInterval(async () => {
      const ticker = symbols[Math.floor(Math.random() * symbols.length)];
      const action = Math.random() > 0.5 ? "BUY" : "SELL";
      await fetch("/api/alert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ticker, action, note: "Demo signal" })
      });
    }, 5000);
    return () => clearInterval(id);
  }, [demoMode, symbols]);

  function addSymbol() {
    const s = newSymbol.trim().toUpperCase();
    if (!s) return;
    if (symbols.includes(s)) return setNewSymbol("");
    setSymbols([s, ...symbols].slice(0, 12));
    setNewSymbol("");
  }

  function removeSymbol(s: string) {
    setSymbols(symbols.filter((x) => x !== s));
    if (selected === s) setSelected(symbols[0] || "NASDAQ:AAPL");
  }

  return (
    <div className="container grid" style={{ gap: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900 }}>Neo’s Short-Term Trader Dashboard</h1>
          <div className="small">Watchlist • Live Chart • Signal Feed</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label className="small" htmlFor="demo">Demo mode</label>
          <input id="demo" type="checkbox" checked={demoMode} onChange={e => setDemoMode(e.target.checked)} />
        </div>
      </header>

      <div className="row">
        {/* Left: Watchlist + Add */}
        <div className="grid" style={{ gap: 16 }}>
          <div className="card">
            <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
              <input
                className="input"
                placeholder="Add symbol (e.g., NASDAQ:AAPL)"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
              />
              <button className="btn" onClick={addSymbol}>Add</button>
            </div>
            <div className="small" style={{ marginBottom: 10 }}>
              Tip: Use the full exchange prefix for best results (e.g., <b>NASDAQ:MSFT</b>).
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {symbols.map((s) => (
                <div key={s} className="input" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <button
                    onClick={() => setSelected(s)}
                    style={{
                      background: "transparent",
                      border: 0,
                      color: "#fff",
                      fontWeight: 800,
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    {s}
                  </button>
                  <button
                    onClick={() => removeSymbol(s)}
                    style={{ background: "#ef4444", color: "#1a0b0b", border: 0, padding: "6px 10px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>How to connect TradingView alerts</h2>
            <ol className="small" style={{ display: "grid", gap: 6, paddingLeft: 18 }}>
              <li>Create an alert in TradingView (e.g., breakout, MACD cross).</li>
              <li>Set <b>Webhook URL</b> to: <code>https://trader-dashboard-one.vercel.app/api/alert</code></li>
              <li>Set <b>Message</b> (JSON) like: <code>{"{"}"ticker":"NASDAQ:AAPL","action":"BUY","note":"TV alert"{"}"}</code></li>
              <li>If you set an <code>ALERT_SECRET</code> env var on Vercel, include header <code>x-alert-secret</code> in your webhook (TradingView supports a single message field only; alternatively, you can hardcode the secret in the message and parse it serverside if you prefer—ask me and I’ll show you how).</li>
            </ol>
          </div>
        </div>

        {/* Right: Chart + Signal Feed */}
        <div className="grid" style={{ gap: 24 }}>
          <div className="card">
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Live Chart: {selected}</h2>
            <TradingViewChart symbol={selected} />
          </div>

          <div className="card">
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Signal Feed</h2>
            <div style={{ display: "grid", gap: 8, maxHeight: 280, overflowY: "auto" }}>
              {signals.length === 0 && <div className="small">Waiting for signals… (turn on Demo mode to see sample alerts)</div>}
              {signals.map((s, idx) => (
                <div key={idx} className={`feed-item ${s.action === "BUY" ? "feed-buy" : s.action === "SELL" ? "feed-sell" : ""}`}>
                  <span className="small" style={{ fontFamily: "monospace" }}>{new Date(s.time).toLocaleTimeString()}</span>
                  <span style={{ fontWeight: 800 }}>{s.ticker}</span>
                  <span style={{ textTransform: "uppercase", fontWeight: 900 }}>{s.action}</span>
                  <span className="small" style={{ textAlign: "right" }}>{s.note || ""}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="small" style={{ opacity: 0.7 }}>
        © {new Date().getFullYear()} Neo’s Short-Term Trader Dashboard
      </footer>
    </div>
  );
}

