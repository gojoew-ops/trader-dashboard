// pages/api/analyzer.js
import { getSymbolsData } from '@/utils/sources';
import { scoreStock } from '@/utils/scoring';

export default async function handler(req, res) {
  try {
    // Pull data from unified sources
    const symbolsData = await getSymbolsData();
    console.log("Fetched symbolsData:", JSON.stringify(symbolsData, null, 2));

    if (!symbolsData || symbolsData.length === 0) {
      console.log("No stock data returned from sources");
      return res.status(200).json({
        message: 'No stock data returned from sources',
        candidates: [],
      });
    }

    // Filter for stocks under $10
    const underTen = symbolsData.filter(s => s.price && s.price < 10);
    console.log(`Filtered under $10: ${underTen.length} symbols`);
    console.log("Under $10 symbols:", JSON.stringify(underTen, null, 2));

    if (underTen.length === 0) {
      return res.status(200).json({
        message: 'No qualifying symbols under $10',
        candidates: [],
      });
    }

    // Score each candidate
    const scored = underTen.map(stock => {
      const score = scoreStock(stock);
      console.log(`Scored ${stock.symbol}: ${score}`);
      return {
        ...stock,
        score,
      };
    });

    // Sort high to low
    scored.sort((a, b) => b.score - a.score);

    console.log("Top candidates:", JSON.stringify(scored.slice(0, 5), null, 2));

    return res.status(200).json({
      message: `Analyzed ${symbolsData.length} stocks, ${underTen.length} under $10`,
      candidates: scored.slice(0, 5), // top 5
    });
  } catch (err) {
    console.error('Analyzer error:', err);
    return res.status(500).json({ error: 'Analyzer failed', details: err.message });
  }
}

