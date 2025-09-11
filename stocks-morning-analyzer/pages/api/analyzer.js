// pages/api/analyzer.js
import sources from '@/utils/sources';
import { scoreStock } from '@/utils/scoring';
import { fetchAggregateSentiment } from '@/lib/sources/sentiment';

export default async function handler(req, res) {
  try {
    const symbolsData = await sources.getSymbolsData();

    if (!symbolsData || symbolsData.length === 0) {
      return res.status(200).json({
        message: 'No stock data returned from sources',
        candidates: [],
      });
    }

    // Filter for symbols with numeric price and under $10
    const underTen = symbolsData.filter(s => s && typeof s.price === 'number' && s.price > 0 && s.price < 10);

    // If nothing under $10, return informative message
    if (!underTen || underTen.length === 0) {
      return res.status(200).json({
        message: `No symbols under $10 found in universe (checked ${symbolsData.length} symbols).`,
        candidates: [],
      });
    }

    // Attempt to fetch sentiment/mentions map (may be empty if no integration)
    const sentimentMap = (await fetchAggregateSentiment()) || new Map();

    // Build scored list
    const scored = underTen.map(s => {
      const baseScore = scoreStock(s);
      const sentiment = sentimentMap.get(s.symbol) || { mentions: 0, sentiment: 0 };
      // Combine scores: base + sentiment influence (sentiment in -1..1)
      const combined = baseScore + (Number(sentiment.sentiment || 0) * 4) + (Math.min(50, sentiment.mentions || 0) / 10);
      return {
        symbol: s.symbol,
        price: s.price,
        high: s.high,
        low: s.low,
        open: s.open,
        prevClose: s.prevClose,
        volume: s.volume,
        baseScore,
        sentiment: sentiment.sentiment || 0,
        mentions: sentiment.mentions || 0,
        score: Math.round(combined * 100) / 100,
      };
    });

    // Sort by combined score desc, then mentions desc
    scored.sort((a,b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.mentions || 0) - (a.mentions || 0);
    });

    const topPicks = scored.slice(0, 10);

    return res.status(200).json({
      message: `Analyzed ${symbolsData.length} symbols, found ${underTen.length} under $10.`,
      candidates: topPicks,
    });
  } catch (err) {
    console.error('Analyzer error:', err);
    return res.status(500).json({ error: 'Analyzer failed', details: err?.message || String(err) });
  }
}
