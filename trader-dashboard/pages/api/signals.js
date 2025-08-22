
import axios from "axios";

export default async function handler(req, res) {
  try {
    const finnhubKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    const yahooKey = process.env.NEXT_PUBLIC_YAHOO_API_KEY;

    if (!finnhubKey || !yahooKey) {
      return res.status(500).json({ error: "Missing API keys" });
    }

    // Fetch cheap stocks under $10 (mock Yahoo screener call)
    const cheapStocks = ["SIRI", "FCEL", "PLUG", "BBIG", "IDEX"]; // would fetch dynamically

    // Analyze top 5
    const candidates = await Promise.all(
      cheapStocks.map(async (symbol) => {
        // Placeholder for intraday fetch + scoring logic
        return {
          symbol,
          price: (Math.random() * 10).toFixed(2),
          score: Math.floor(Math.random() * 100),
          gap: (Math.random() * 5).toFixed(2),
          volumeRatio: (Math.random() * 3).toFixed(2)
        };
      })
    );

    // Pick best
    const recommendation = candidates.reduce((a, b) => (a.score > b.score ? a : b));

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).json({ morningAnalyzer: { candidates, recommendation } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
