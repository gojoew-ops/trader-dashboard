import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import SettingsSidebar from '../components/SettingsSidebar';
import MorningAnalyzer from '../components/MorningAnalyzer';

const fetcher = (url) => fetch(url).then(r => r.json());

function computeSignal(dp, slope, threshold) {
  // threshold is the minimum abs(dp) to consider BUY/SELL
  const slopeBias = slope > 0 ? 0.4 : slope < 0 ? -0.4 : 0;
  const base = (dp || 0);
  const score = base + slopeBias; // keep simple in % units

  if (Math.abs(base) < threshold && Math.abs(score) < threshold) {
    return { label: 'HOLD', className: 'signal-hold', confidence: Math.max(40, 70 - (threshold - Math.abs(base))) };
  }
  if (score >= threshold) return { label: 'BUY NOW', className: 'signal-buy', confidence: Math.min(95, 60 + (score - threshold) * 5) };
  if (score <= -threshold) return { label: 'SELL NOW', className: 'signal-sell', confidence: Math.min(95, 60 + (Math.abs(score) - threshold) * 5) };
  return { label: 'HOLD', className: 'signal-hold', confidence: 55 };
}

export default function Home() {
  // Settings (persisted)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({ refresh: 30, threshold: 1, overlay: true });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('td_settings');
      if (saved) try { setSettings(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Dynamic watchlist (persisted)
  const [watchlist, setWatchlist] = useState(['AAPL','MSFT','TSLA','META','GOOGL']);
  const [newSymbol, setNewSymbol] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('td_watchlist');
      if (saved) try { setWatchlist(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('td_watchlist', JSON.stringify(watchlist));
    }
  }, [watchlist]);

  const [selected, setSelected] = useState('AAPL');

  // Quote fetch with SWR and refresh interval
  const { data: quote } = useSWR(`/api/quote?symbol=${selected}`, fetcher, { refreshInterval: settings.refresh * 1000 });
  const [lastPrice, setLastPrice] = useState(null);
  const [countdown, setCountdown] = useState(settings.refresh);

  // countdown timer tied to refresh
  useEffect(() => {
    setCountdown(settings.refresh);
    const tick = setInterval(() => setCountdown(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(tick);
  }, [settings.refresh, selected]);

  // update last price to compute slope
  useEffect(() => {
    if (quote && typeof quote.c === 'number') {
      setLastPrice(prev => {
        if (prev == null) return quote.c;
        return quote.c;
      });
    }
  }, [quote]);

  // slope approximation: current vs previous known price (basic)
  const slope = useMemo(() => {
    return 0; // Placeholder: can be enhanced with short history buffer in v6
  }, [quote]);

  // signal
  const signal = useMemo(() => {
    if (!quote) return null;
    const s = computeSignal(quote.dp, slope, settings.threshold);
    return s;
  }, [quote, slope, settings.threshold]);

  const addSymbol = () => {
    const sym = (newSymbol || '').trim().toUpperCase();
    if (!sym) return;
    if (watchlist.includes(sym)) return;
    setWatchlist([...watchlist, sym]);
    setNewSymbol('');
  };

  const removeSymbol = (sym) => {
    setWatchlist(watchlist.filter(s => s !== sym));
    if (selected === sym && watchlist.length > 1) {
      setSelected(watchlist.find(s => s !== sym) || 'AAPL');
    }
  };

  return (
    <div className="container">
      <div className="topbar">
        <h1>📊 Trader Dashboard v5</h1>
        <button className="btn iconbtn" onClick={() => setSettingsOpen(true)}>⚙️</button>
      </div>

      <div className="grid">
        {/* Watchlist */}
        <div className="card">
          <h2>Watchlist</h2>

          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <input className="input" placeholder="Add symbol (e.g. NFLX)"
                   value={newSymbol} onChange={e => setNewSymbol(e.target.value)} />
            <button className="btn" onClick={addSymbol}>Add</button>
          </div>

          {watchlist.map(sym => {
            const cls = sym === selected ? 'watch-item active' : 'watch-item';
            return (
              <div key={sym} className={cls}>
                <span onClick={() => setSelected(sym)} style={{cursor:'pointer'}}>{sym}</span>
                <span>
                  <button className="btn" onClick={() => removeSymbol(sym)}>❌</button>
                </span>
              </div>
            );
          })}
        </div>

        {/* Chart + overlay */}
        <div className="card chart-wrap">
          <div style={{height:520,borderRadius:10,overflow:'hidden',border:'1px solid #1f2937'}}>
            <iframe
              key={selected}
              src={`https://s.tradingview.com/widgetembed/?symbol=${selected}&interval=15&theme=dark`}
              style={{width:'100%',height:'100%',border:'none'}}
              loading="lazy"
            ></iframe>
          </div>

          {settings.overlay && (
            <div className="watermark pulse">
              <span className={signal ? signal.className : 'signal-hold'}>
                {signal ? `${signal.label} (${Math.round(signal.confidence)}%)` : 'Loading...'}
              </span>
              <div className="countdown">
                Refreshing in {countdown}s…
              </div>
            </div>
          )}

          <div className="footer-note">
            Adjust thresholds & refresh rate from ⚙️ Settings. Overlay can be toggled.
          </div>
        </div>

        {/* Signals panel */}
        <div className="card">
          <h2>Signals</h2>
          <ul className="siglist">
            {watchlist.map(sym => (
              <SignalRow key={sym} sym={sym} selected={selected} setSelected={setSelected} threshold={settings.threshold} refreshMs={settings.refresh * 1000} />
            ))}
          </ul>
        </div>
      </div>



        {/* Morning Analyzer */}
        <MorningAnalyzer refreshMs={settings.refresh * 1000} />
      <SettingsSidebar open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} setSettings={setSettings} />
    </div>
  );
}

function SignalRow({ sym, selected, setSelected, threshold, refreshMs }) {
  const { data } = useSWR(`/api/quote?symbol=${sym}`, fetcher, { refreshInterval: refreshMs });
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    if (data && typeof data.c === 'number') setPrev(data.c);
  }, [data]);

  const slope = 0; // placeholder for future micro-trend
  const sig = data ? computeSignal(data.dp, slope, threshold) : null;

  return (
    <li onClick={() => setSelected(sym)} style={{cursor:'pointer'}}>
      <span>{sym}</span>
      <span style={{textAlign:'right'}}>
        {data?.c ? `$${data.c.toFixed(2)}` : '--'} &nbsp;·&nbsp;
        {data?.dp != null ? `${data.dp.toFixed(2)}%` : '--'} &nbsp;·&nbsp;
        <strong className={sig ? sig.className : ''}>{sig ? `${sig.label} (${Math.round(sig.confidence)}%)` : '...'}</strong>
      </span>
    </li>
  );
}