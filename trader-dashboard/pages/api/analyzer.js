import fs from "fs";
import path from "path";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || process.env.FINN;

// Utility: compute RSI
function computeRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period || 1e-9;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// Utility: simple moving average
function sma(values, period) {
  if (values.length < period) return null;
  const sum = values.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

// Compute slope of MA
function maSlope(closes, period = 20) {
  if (closes.length < period + 1) return null;
  const maNow = sma(closes, period);
  const maPrev = sma(closes.slice(0, -1), period);
  return maNow - maPrev;
}

// Standard deviation
function stddev(arr) {
  if (!arr.length) return null;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const sq = arr.map(x => (x - mean) ** 2);
  return Math.sqrt(sq.reduce((a, b) => a + b, 0) / arr.length);
}

// Load candidate list
function loadCandidates() {
  const filePath = path.join(process.cwd(), "data", "candidates.json");
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Could not load candidates.json:", e);
    return ["AAPL", "MSFT", "GOOGL"];
  }
}

export default async function handler(req, res) {
  const candidates = loadCandidates();
  const now = Math.floor(Date.now() / 1000);
  const from = now - 60 * 60 * 24 * 5; // last 5 days
  const resolution = "5"; // 5-minute candles

  const items = [];

  for (const symbol of candidates) {
    try {
      // Fetch intraday candles
      const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}&token=${FINNHUB_API_KEY}`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (data && data.s === "ok") {
        const closes = data.c;
        const rsi = computeRSI(closes);
        const slope = maSlope(closes);
        const vol = stddev(
          closes.slice(-50).map((c, i, arr) =>
            i === 0 ? 0 : (c - arr[i - 1]) / arr[i - 1]
          )
        );

        const current = closes[closes.length - 1];
        const high = Math.max(...closes);
        const nearHigh = current > 0.98 * high;

        // Composite score
        let score = 0;
        if (rsi !== null) score += (rsi - 50) / 50;
        if (slope !== null) score += slope / current;
        if (nearHigh) score += 0.5;

        items.push({
          symbol,
          current,
          rsi,
          slope,
          vol,
          nearHigh,
          score: parseFloat(score.toFixed(3)),
        });
      } else {
        // fallback: quote only
        const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
        const q = await fetch(quoteUrl).then(r => r.json());
        items.push({
          symbol,
          current: q.c,
          rsi: null,
          slope: null,
          vol: null,
          nearHigh: null,
          score: 0,
        });
      }
    } catch (err) {
      console.error("Error fetching data for", symbol, err);
    }
  }

  // Rank all
  items.sort((a, b) => b.score - a.score);

  // Filter top under $10 stocks
  const under10 = items.filter(x => x.current && x.current < 10);
  under10.sort((a, b) => b.score - a.score);

  res.status(200).json({
    items,
    best: items[0] || null,
    under10: under10.slice(0, 10), // top 10 under $10
    meta: { total: items.length, under10Count: under10.length },
  });
}
