// pages/api/analyzer.js
import { getSymbolsData } from '@/utils/sources';
import { scoreStock } from '@/utils/scoring';

export default async function handler(req, res) {
  try {
    // Pull data from unified sources
    const symbolsData = await getSymbolsData();

    if (!symbolsData || symbolsData.length === 0) {
      return res.status(200).json({
        message: 'No stock data returned from sources',
        candidates: [],
      });
    }

    // Filter for stocks under $10
    const underTen = symbolsData.filter(s => s.price && s.price < 10);

    if (underTen.length === 0) {
      return res.status(200).json({
        message: 'No qualifying symbols under $10',
        candidates: [],
      });
    }

    // Score each candidate
    const scored = underTen.map(stock => ({
      ...stock,
      score: scoreStock(stock),
    }));

    // Sort high to low
    scored.sort((a, b) => b.score - a.score);

    return res.status(200).json({
      message: `Analyzed ${symbolsData.length} stocks, ${underTen.length} under $10`,
      candidates: scored.slice(0, 5), // top 5
    });
  } catch (err) {
    console.error('Analyzer error:', err);
    return res.status(500).json({ error: 'Analyzer failed', details: err.message });
  }
}
