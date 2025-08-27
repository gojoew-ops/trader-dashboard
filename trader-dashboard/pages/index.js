import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const resp = await fetch("/api/analyzer");
      const json = await resp.json();
      setData(json);
    }
    load();
  }, []);

  if (!data) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Morning Analyzer</h1>

      {/* Main Ranked List */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Top Ranked Stocks</h2>
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Symbol</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">RSI</th>
              <th className="p-2 border">Slope</th>
              <th className="p-2 border">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.items.slice(0, 20).map((stock) => (
              <tr key={stock.symbol} className="text-center">
                <td className="p-2 border font-semibold">{stock.symbol}</td>
                <td className="p-2 border">${stock.current?.toFixed(2)}</td>
                <td className="p-2 border">{stock.rsi ? stock.rsi.toFixed(1) : "-"}</td>
                <td className="p-2 border">{stock.slope ? stock.slope.toFixed(4) : "-"}</td>
                <td className="p-2 border">{stock.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Under $10 Stocks Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Top Stocks Under $10</h2>
        {data.under10.length > 0 ? (
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Symbol</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">RSI</th>
                <th className="p-2 border">Slope</th>
                <th className="p-2 border">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.under10.map((stock) => (
                <tr key={stock.symbol} className="text-center">
                  <td className="p-2 border font-semibold">{stock.symbol}</td>
                  <td className="p-2 border">${stock.current?.toFixed(2)}</td>
                  <td className="p-2 border">{stock.rsi ? stock.rsi.toFixed(1) : "-"}</td>
                  <td className="p-2 border">{stock.slope ? stock.slope.toFixed(4) : "-"}</td>
                  <td className="p-2 border">{stock.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No candidates under $10 today.</p>
        )}
      </section>
    </div>
  );
}
