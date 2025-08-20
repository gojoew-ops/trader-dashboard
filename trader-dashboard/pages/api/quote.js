export default async function handler(req, res) {
  const { symbol } = req.query;
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing FINNHUB_API_KEY" });
  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
    if (!r.ok) return res.status(r.status).json({ error: "Finnhub error", status: r.status });
    const data = await r.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
}