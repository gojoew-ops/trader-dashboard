// pages/api/analyzer.js
import { getSymbolsData } from '@/utils/sources';
import { scoreStock } from '@/utils/scoring';
import { fetchAggregateSentiment } from '@/lib/sources/sentiment';

export default async function handler(req, res) {
  try {
    const symbolsData = await getSymbolsData();

    if (!symbolsData || symbolsData.length === 0) {
      return res.status(200).json({
        message: 'No stock data returned from sources',
        candidates: [],
      });
    }

    // Optional sentiment overlay (safe if the map is empty)
    const sentimentMap = await fetchAggregateSentiment();

    // Focus on sub-$10 universe
    const underTen = symbolsData.filter(s => typeof s.price === 'number' && s.price < 10);

    if (underTen.length === 0) {
      return res.status(200).json({
        message: `Analyzed ${symbolsData.length} stocks but none were under $10. Update data/candidates.json to widen the list.`,
        candidates: [],
      });
    }

    // Score and enrich
    const scored = underTen.map(s => {
      const score = scoreStock(s);
      const sent = sentimentMap?.get?.(s.symbol) ?? {};
      return {
        symbol: s.symbol,
        price: s.price,
        high: s.high,
        low: s.low,
        open: s.open,
        prevClose: s.prevClose,
        volatility: s.volatility ?? null,
        mentions: sent.mentions ?? 0,
        sentiment: typeof sent.sentiment === 'number' ? sent.sentiment : null,
        score
      };
    });

    // Sort best‑to‑worst
    scored.sort((a, b) => b.score - a.score);

    // Return top 5 (or fewer if we don't have that many)
    const topPicks = scored.slice(0, 5);

    return res.status(200).json({
      message: `Analyzed ${symbolsData.length} symbols, ${underTen.length} under $10`,
      candidates: topPicks,
    });
  } catch (err) {
    console.error('Analyzer error:', err);
    return res.status(500).json({ error: 'Analyzer failed', details: err?.message || String(err) });
  }
}

