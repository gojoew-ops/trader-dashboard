import { useState, useEffect } from "react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/quote?symbol=AAPL");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Trader Dashboard v6</h1>
      <pre className="bg-gray-900 text-white p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
