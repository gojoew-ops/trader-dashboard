import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";

const StockChart = dynamic(() => import("../components/StockChart"), { ssr: false });

export default function Home() {
  const [hasKeys, setHasKeys] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const finnhubKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    const yahooKey = process.env.NEXT_PUBLIC_YAHOO_API_KEY;

    if (!finnhubKey || !yahooKey) {
      setHasKeys(false);
      setError("❌ Missing API Keys. Please set NEXT_PUBLIC_FINNHUB_API_KEY and NEXT_PUBLIC_YAHOO_API_KEY in your Vercel Environment.");
    }
  }, []);

  if (!hasKeys) {
    return (
      <div style={{
        backgroundColor: "red",
        color: "white",
        fontWeight: "bold",
        padding: "20px",
        textAlign: "center",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 9999
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Trader Dashboard v6.1</h1>
      <StockChart />
    </div>
  );
}