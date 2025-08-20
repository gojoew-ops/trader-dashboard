export default async function handler(req, res) {
  const { symbol } = req.query;
  const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
    if (!response.ok) throw new Error("Finnhub failed");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`);
      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: "Both data sources failed" });
    }
  }
}
