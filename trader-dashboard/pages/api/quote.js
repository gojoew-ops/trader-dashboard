export default async function handler(req, res) {
  const { symbol } = req.query;
  const finnhubKey = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
  const yahooKey = process.env.YAHOO_API_KEY || process.env.NEXT_PUBLIC_YAHOO_API_KEY;

  async function finnhubQuote() {
    if (!finnhubKey) throw new Error('NO_FINNHUB_KEY');
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubKey}`);
    if (!r.ok) throw new Error(`FINNHUB_${r.status}`);
    const j = await r.json();
    return { source: 'finnhub', ...j };
  }

  async function yahooQuote() {
    if (!yahooKey) throw new Error('NO_YAHOO_KEY');
    const url = `https://yh-finance.p.rapidapi.com/market/v2/get-quotes?region=US&symbols=${encodeURIComponent(symbol)}`;
    const r = await fetch(url, { headers: { 'X-RapidAPI-Key': yahooKey, 'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com' }});
    if (!r.ok) throw new Error(`YAHOO_${r.status}`);
    const j = await r.json();
    const q = j?.quoteResponse?.result?.[0];
    if (!q) throw new Error('YAHOO_NO_RESULT');
    const mapped = {
      c: q.regularMarketPrice,
      d: q.regularMarketChange,
      dp: q.regularMarketChangePercent
    };
    return { source: 'yahoo', ...mapped };
  }

  try {
    // Try Finnhub first
    const data = await finnhubQuote();
    return res.status(200).json(data);
  } catch (e1) {
    try {
      const data = await yahooQuote();
      return res.status(200).json(data);
    } catch (e2) {
      const problems = [String(e1?.message || e1), String(e2?.message || e2)];
      return res.status(503).json({ error: 'All providers failed', details: problems });
    }
  }
}
