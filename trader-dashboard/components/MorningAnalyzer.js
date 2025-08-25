import { useEffect, useState } from 'react';

export default function MorningAnalyzer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analyzer');
      const json = await res.json();
      setData(json.stocks);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 rounded-2xl shadow bg-white">
      <h2 className="text-xl font-bold mb-2">Morning Analyzer</h2>
      {loading && <p>Loading...</p>}
      {!loading && data && (
        <div>
          <ul>
            {data.map((s, idx) => (
              <li key={idx} className="mb-1">
                <span className="font-semibold">{s.symbol}</span> (${s.price}) — Score: {s.score}
                <br />
                <span className="text-sm text-gray-600">{s.insight}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-2">Updated: {lastUpdate}</p>
        </div>
      )}
    </div>
  );
}
