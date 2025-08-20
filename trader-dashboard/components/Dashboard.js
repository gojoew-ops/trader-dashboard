"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [hasKeys, setHasKeys] = useState(true);

  useEffect(() => {
    const finnhubKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    const yahooKey = process.env.NEXT_PUBLIC_YAHOO_API_KEY;
    if (!finnhubKey || !yahooKey) {
      setHasKeys(false);
    }
  }, []);

  if (!hasKeys) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-900 text-white">
        <h1>❌ API Keys Missing – Please configure keys in Vercel</h1>
      </div>
    );
  }

  return (
    <div>
      {/* your dashboard */}
    </div>
  );
}
