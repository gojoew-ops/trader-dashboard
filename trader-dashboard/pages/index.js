import { useEffect, useMemo, useState } from 'react';
import { WATCHLIST } from '../config/watchlist';

const API = (symbol) => `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`;

// Smarter signal using percent move + intraday slope
function computeSignal(dp, history) {
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const slope = (last != null && prev != null) ? (last - prev) : 0;
  const slopeBias = slope > 0 ? 0.4 : slope < 0 ? -0.4 : 0;
  const score = (dp || 0) / 1.0 + slopeBias; // simple composite score

  if (score > 1.0) return { label: 'BUY NOW', className: 'signal-buy', emoji: '🚀' };
  if (score < -1.0) return { label: 'SELL NOW', className: 'signal-sell', emoji: '🔻' };
  return { label: 'HOLD', className: 'signal-hold', emoji: '⚖️' };
}

export default function Home() {
  const [selected, setSelected] = useState(WATCHLIST[0]);
  const [quotes, setQuotes] = useState({}); // { [symbol]: { c, dp, t } }
  const [history, setHistory] = useState({}); // { [symbol]: number[] }
  const [error, setError] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(30);

  async function fetchSymbol(symbol) {
    try {
      const res = await fetch(API(symbol));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data || typeof data.c !== 'number') throw new Error('Bad data');
      setQuotes(prev => ({ ...prev, [symbol]: { c: data.c, dp: data.dp, t: Date.now() } }));
      setHistory(prev => {
        const arr = prev[symbol] ? prev[symbol].slice(-19) : [];
        return { ...prev, [symbol]: [...arr, data.c] };
      });
      setError(null);
    } catch (e) {
      console.error('Fetch error for', symbol, e);
      setError('API Error: Check your key or rate limit.');
    }
  }

  // Initial + 30s refresh for all
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      for (const sym of WATCHLIST) {
        if (!mounted) return;
        await fetchSymbol(sym);
      }
      setSecondsLeft(30);
    };
    fetchAll();
    const refresh = setInterval(fetchAll, 30000);
    const tick = setInterval(() => setSecondsLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => { mounted = false; clearInterval(refresh); clearInterval(tick); };
  }, []);

  // Instant refresh when switching tickers
  useEffect(() => { fetchSymbol(selected); }, [selected]);

  const selectedQuote = quotes[selected];
  const selectedHist = history[selected] || [];
  const signal = useMemo(() => {
    if (!selectedQuote || selectedHist.length < 2) return null;
    return computeSignal(selectedQuote.dp, selectedHist);
  }, [selectedQuote, selectedHist]);

  return (
    <div className="container">
      <h1>📊 Trader Dashboard</h1>
      <div className="grid">
        <div className="card">
          <h2>Watchlist</h2>
          {WATCHLIST.map(sym => {
            const q = quotes[sym];
            const cls = sym === selected ? 'watch-item active' : 'watch-item';
            const badge = q && typeof q.dp === 'number' ? (q.dp > 0 ? 'signal-buy' : q.dp < 0 ? 'signal-sell' : 'signal-hold') : '';
            return (
              <div key={sym} className={cls} onClick={() => setSelected(sym)}>
                <span>{sym}</span>
                <span>
                  {q?.c ? `$${q.c.toFixed(2)}` : '--'}
                  <span className={"badge " + badge}>
                    {q?.dp != null ? `${q.dp.toFixed(2)}%` : '...'}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="card chart-wrap">
          <div style={{height: 520, borderRadius: 10, overflow: 'hidden', border: '1px solid #1f2937'}}>
            <iframe
              key={selected}
              src={`https://s.tradingview.com/widgetembed/?symbol=${selected}&interval=15&theme=dark`}
              style={{ width: "100%", height: "100%", border: "none" }}
              loading="lazy"
            ></iframe>
          </div>
          <div className="overlay">
            <div className={"watermark pulse " + (signal ? signal.className : 'signal-hold')}>
              {signal ? `${signal.label} ${signal.emoji}` : 'Loading...'}
            </div>
            <div className="countdown">
              {error ? error : `Refreshing in ${secondsLeft}s…`}
            </div>
          </div>
          <div className="footer-note">
            Green = short-term upward bias, Red = downward bias. Combine with your own analysis.
          </div>
        </div>

        <div className="card">
          <h2>Signals</h2>
          <ul className="siglist">
            {WATCHLIST.map(sym => {
              const q = quotes[sym];
              const h = history[sym] || [];
              const sig = q && h.length >= 2 ? computeSignal(q.dp, h) : null;
              return (
                <li key={sym}>
                  <span>{sym}</span>
                  <span style={{textAlign:'right'}}>
                    {q?.c ? `$${q.c.toFixed(2)}` : '--'} · {q?.dp != null ? `${q.dp.toFixed(2)}%` : '--'} · <strong className={sig ? sig.className : ''}>{sig ? sig.label : '...'}</strong>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}