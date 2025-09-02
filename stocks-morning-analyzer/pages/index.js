import { useEffect, useState } from 'react';
import DownloadCSVButton from '@/components/DownloadCSVButton';

export default function Home(){
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load(){
      try {
        setLoading(true);
        const r = await fetch('/api/analyzer');
        const j = await r.json();
        setData(j);
      } catch (e) {
        setError(e?.message || 'Error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-6">No data</div>;

  const rows = data.under10 || [];
  const dt = new Date(data.meta?.fetchedAt || Date.now());

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stocks Morning Analyzer (Under $10)</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Updated: {dt.toLocaleString()}</span>
          <DownloadCSVButton rows={rows} filename="morning-analyzer-under10.csv" />
        </div>
      </header>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Top Picks Under $10</h2>
        {rows.length ? (
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Symbol</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-right">RSI(14)</th>
                  <th className="px-3 py-2 text-right">MA20 Slope</th>
                  <th className="px-3 py-2 text-right">Volatility</th>
                  <th className="px-3 py-2 text-right">Mentions</th>
                  <th className="px-3 py-2 text-right">Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(s => (
                  <tr key={s.symbol} className="border-t">
                    <td className="px-3 py-2 font-semibold">{s.symbol}</td>
                    <td className="px-3 py-2 text-right">${s.c?.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{s.score?.toFixed ? s.score.toFixed(3) : s.score}</td>
                    <td className="px-3 py-2 text-right">{s.rsi?.toFixed ? s.rsi.toFixed(1) : '-'}</td>
                    <td className="px-3 py-2 text-right">{s.maSlope?.toFixed ? s.maSlope.toFixed(5) : '-'}</td>
                    <td className="px-3 py-2 text-right">{s.volatility?.toFixed ? s.volatility.toFixed(4) : '-'}</td>
                    <td className="px-3 py-2 text-right">{s.mentions ?? 0}</td>
                    <td className="px-3 py-2 text-right">{typeof s.sentiment === 'number' ? s.sentiment.toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p>No qualifying symbols under $10.</p>}
      </section>
    </div>
  );
}
