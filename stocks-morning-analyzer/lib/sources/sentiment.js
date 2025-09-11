// stocks-morning-analyzer/lib/sources/sentiment.js

// Very simple sentiment scoring
function analyzeText(text) {
  const positiveWords = ["gain", "growth", "beat", "bullish", "surge", "soar", "positive"];
  const negativeWords = ["loss", "miss", "bearish", "drop", "fall", "down", "negative"];

  let score = 0;
  const lower = text.toLowerCase();
  positiveWords.forEach(word => { if (lower.includes(word)) score += 1; });
  negativeWords.forEach(word => { if (lower.includes(word)) score -= 1; });

  return score;
}

export async function fetchAggregateSentiment(symbols) {
  const results = new Map();

  const bingKey = process.env.BING_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;
  // (Future: Reddit / Twitter / StockTwits keys here)

  for (const symbol of symbols) {
    results.set(symbol, { sentiment: 0, mentions: 0 });
  }

  // Bing News API (if key is set)
  if (bingKey) {
    for (const symbol of symbols) {
      try {
        const url = `https://api.bing.microsoft.com/v7.0/news/search?q=${symbol}&count=10&mkt=en-US`;
        const resp = await fetch(url, { headers: { "Ocp-Apim-Subscription-Key": bingKey } });
        const data = await resp.json();
        if (data.value) {
          let mentions = data.value.length;
          let score = 0;
          data.value.forEach(article => {
            score += analyzeText(article.name + " " + (article.description || ""));
          });
          results.set(symbol, { sentiment: score, mentions });
        }
      } catch (err) {
        console.error("Bing error:", symbol, err.message);
      }
    }
  }

  // Finnhub sentiment API (if key is set)
  if (finnhubKey) {
    for (const symbol of symbols) {
      try {
        const url = `https://finnhub.io/api/v1/news-sentiment?symbol=${symbol}&token=${finnhubKey}`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data && data.sentiment) {
          const score = Math.round((data.sentiment.momentum + data.sentiment.relevanceScore) * 10);
          results.set(symbol, {
            sentiment: score,
            mentions: data.sentiment.score || 0
          });
        }
      } catch (err) {
        console.error("Finnhub error:", symbol, err.message);
      }
    }
  }

  return results;
}
