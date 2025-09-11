import { getSymbolsData } from "@/utils/sources";
import { scoreCandidate } from "@/utils/scoring";
import { fetchAggregateSentiment } from "@/lib/sources/sentiment";

export default async function handler(req, res) {
  try {
    const data = await getSymbolsData();
    let filtered = data.filter(d => d.price && d.price < 10);

    const sentimentMap = await fetchAggregateSentiment(filtered.map(d => d.symbol));

    const scored = filtered.map(d => {
      const sentiment = sentimentMap.get(d.symbol) || { sentiment: 0, mentions: 0 };
      const score = scoreCandidate(d, sentiment);
      return { ...d, ...sentiment, score };
    });

    scored.sort((a, b) => b.score - a.score);

    res.status(200).json({
      message: `Analyzed ${data.length} symbols, found ${filtered.length} under $10.`,
      candidates: scored.slice(0, 10)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analyzer error" });
  }
}
