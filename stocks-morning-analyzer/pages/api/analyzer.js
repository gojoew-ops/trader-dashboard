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

    if (underTen.length === 0) {
      // Instead of returning nothing, tell us what was fetched
      return res.status(200).json({
        message: `Analyzed ${symbolsData.length} stocks but none were under $10. Try expanding universe.`,
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

    // Always return what we have (even if <5)
    const topPicks = scored.slice(0, Math.min(5, scored.length));
    console.log("Top candidates:", JSON.stringify(topPicks, null, 2));

    return res.status(200).json({
      message: `Analyzed ${symbolsData.length} stocks, ${underTen.length} under $10`,
      candidates: topPicks,
    });
  } catch (err) {
    console.error('Analyzer error:', err);
    return res.status(500).json({ error: 'Analyzer failed', details: err.message });
  }
}

