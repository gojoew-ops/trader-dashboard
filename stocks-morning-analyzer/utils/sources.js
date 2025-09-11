// utils/sources.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';

/**
 * Load universe from data/candidates.json or root candidates.json
 * Accepts either:
 *  - an array: ["AAPL","F","NOK"]
 *  - an object: { "symbols": ["AAPL","F"] }
 *
 * Returns deduped array of symbol strings.
 */
function loadUniverseSymbols() {
  const filesToTry = [
    path.join(process.cwd(), 'data', 'candidates.json'),
    path.join(process.cwd(), 'candidates.json'),
  ];

  for (const p of filesToTry) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(s => String(s).trim().toUpperCase()).filter(Boolean);
        if (parsed && Array.isArray(parsed.symbols)) return parsed.symbols.map(s => String(s).trim().toUpperCase()).filter(Boolean);
      }
    } catch (e) {
      // ignore and try next
      console.warn('Could not parse', p, e?.message);
    }
  }

  // Fallback sample universe (low-priced examples for demo)
  return ['F','NOK','SNDL','GME','AMC','PLTR','PFE','T','ZNGA'].map(s=>s.toUpperCase());
}

function chunkArray(arr, n){
  const out=[];
  for(let i=0;i<arr.length;i+=n) out.push(arr.slice(i,i+n));
  return out;
}

/**
 * Fetch quotes from Yahoo Finance public endpoint for given symbols
 * Returns array of objects: { symbol, price, high, low, open, prevClose, regularMarketVolume }
 */
async function fetchQuotesForSymbols(symbols){
  if(!symbols || symbols.length===0) return [];
  const qs = symbols.join(',');
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(qs)}`;
  const r = await axios.get(url, { timeout: 10000 });
  const results = r?.data?.quoteResponse?.result || [];
  return results.map(q => ({
    symbol: q.symbol,
    price: q.regularMarketPrice ?? q.regularMarketPreviousClose ?? null,
    high: q.regularMarketDayHigh ?? null,
    low: q.regularMarketDayLow ?? null,
    open: q.regularMarketOpen ?? null,
    prevClose: q.regularMarketPreviousClose ?? null,
    volume: q.regularMarketVolume ?? null,
  }));
}

/**
 * Public function: getSymbolsData
 * Loads universe, fetches quotes in chunks, dedupes and returns array of {symbol, price, high, low, open, prevClose, volume}
 */
export async function getSymbolsData(){
  const universe = loadUniverseSymbols();
  const unique = Array.from(new Set(universe));
  const chunks = chunkArray(unique, 50); // Yahoo accepts many symbols; keep chunk small for safety
  const out = [];
  for(const c of chunks){
    try{
      const quotes = await fetchQuotesForSymbols(c);
      for(const q of quotes){
        if(q && q.symbol) out.push(q);
      }
    }catch(e){
      console.error('Failed to fetch quotes chunk', e?.message || e);
    }
  }
  // ensure returned array matches requested symbols order (where possible)
  const bySymbol = new Map(out.map(o=>[o.symbol, o]));
  const ordered = unique.map(s=> bySymbol.get(s) || { symbol: s, price: null, high:null, low:null, open:null, prevClose:null, volume:null });
  return ordered;
}

export default { getSymbolsData };
