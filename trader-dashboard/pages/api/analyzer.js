import { fetchUnder10Stocks } from '@/utils/sources';
import { scoreStocks } from '@/utils/scoring';

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

  try {
    const stocks = await fetchUnder10Stocks();
    const scored = scoreStocks(stocks);
    return res.status(200).json({ updated: new Date().toISOString(), stocks: scored });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
