
import { useEffect, useState } from "react";

export default function Signals() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/signals")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return <div>Loading signals...</div>;

  const analyzer = data.morningAnalyzer;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">📊 Morning Trade Analyzer (Top 5 &lt;$10)</h2>
      <table className="table-auto border-collapse border border-gray-600 w-full text-sm">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border border-gray-600 px-2 py-1">Symbol</th>
            <th className="border border-gray-600 px-2 py-1">Price</th>
            <th className="border border-gray-600 px-2 py-1">Score</th>
            <th className="border border-gray-600 px-2 py-1">Gap %</th>
            <th className="border border-gray-600 px-2 py-1">Vol Ratio</th>
          </tr>
        </thead>
        <tbody>
          {analyzer.candidates.map((c) => (
            <tr
              key={c.symbol}
              className={
                c.symbol === analyzer.recommendation.symbol
                  ? "bg-green-200 font-bold"
                  : "bg-gray-100"
              }
            >
              <td className="border border-gray-600 px-2 py-1">{c.symbol}</td>
              <td className="border border-gray-600 px-2 py-1">${c.price}</td>
              <td className="border border-gray-600 px-2 py-1">{c.score}</td>
              <td className="border border-gray-600 px-2 py-1">{c.gap}%</td>
              <td className="border border-gray-600 px-2 py-1">{c.volumeRatio}x</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 text-green-700 font-semibold">
        ✅ Recommended: {analyzer.recommendation.symbol} (Score {analyzer.recommendation.score})
      </div>
    </div>
  );
}
