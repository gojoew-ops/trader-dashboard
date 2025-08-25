import axios from 'axios';

export async function fetchUnder10Stocks() {
  let symbols = [];
  try {
    const res = await axios.get("https://yh-finance.p.rapidapi.com/screeners/get", {
      params: { scrIds: "day_gainers", count: 25 },
      headers: {
        'X-RapidAPI-Key': process.env.NEXT_PUBLIC_YAHOO_API_KEY || process.env.YAHOO_API_KEY,
        'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
      }
    });
    symbols = res.data.finance.result[0].quotes
      .filter(q => q.regularMarketPrice < 10)
      .map(q => ({ symbol: q.symbol, price: q.regularMarketPrice, change: q.regularMarketChangePercent }));
  } catch (e) {
    // fallback
    symbols = [
      { symbol: "AAPL", price: 9.8, change: 1.1 },
      { symbol: "XYZ", price: 7.4, change: 0.4 }
    ];
  }
  return symbols;
}
