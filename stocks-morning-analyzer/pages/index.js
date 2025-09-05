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
        if(!r.ok){
          throw new Error(j?.error || 'Request failed');
        }
        setData(j);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const rows = data?.candidates || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Stocks Morning Analyzer (Under $10)</h1>
      <p className="text-sm text-gray-600 mb-4">{data?.message || 'Loading latest quotes...'}</p>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      <section className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Top Candidates</h2>
          <DownloadCSVButton rows={rows} filename="morning-analyzer.csv" />
        </div>

        {rows.length > 0 ? (
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Symbol</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">High</th>
                  <th className="px-3 py-2 text-right">Low</th>
                  <th className="px-3 py-2 text-right">Open</th>
                  <th className="px-3 py-2 text-right">Prev Close</th>
                  <th className="px-3 py-2 text-right">Volatility</th>
                  <th className="px-3 py-2 text-right">Mentions</th>
                  <th className="px-3 py-2 text-right">Sentiment</th>
                  <th className="px-3 py-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.symbol} className="odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2 font-semibold">{s.symbol}</td>
                    <td className="px-3 py-2 text-right">{typeof s.price === 'number' ? s.price.toFixed(2) : '-'}</td>
                    <td className="px-3 py-2 text-right">{typeof s.high === 'number' ? s.high.toFixed(2) : '-'}</td>
                    <td className="px-3 py-2 text-right">{typeof s.low === 'number' ? s.low.toFixed(2) : '-'}</td>
                    <td className="px-3 py-2 text-right">{typeof s.open === 'number' ? s.open.toFixed(2) : '-'}</td>
                    <td className="px-3 py-2 text-right">{typeof s.prevClose === 'number' ? s.prevClose.toFixed(2) : '-'}</td>
                    <td className="px-3 py-2 text-right">{typeof s.volatility === 'number' ? s.volatility.toFixed(4) : '-'}</td>
                    <td className="px-3 py-2 text-right">{s.mentions ?? 0}</td>
                    <td className="px-3 py-2 text-right">{typeof s.sentiment === 'number' ? s.sentiment.toFixed(2) : '-'}</td>
                    <td className="px-3 py-2 text-right">{typeof s.score === 'number' ? s.score.toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (!loading && !error) ? (
          <p>No qualifying symbols under $10.</p>
        ) : null}
      </section>
    </div>
  );
}

