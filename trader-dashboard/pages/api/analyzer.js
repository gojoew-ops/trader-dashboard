
export const config = {
  api: { bodyParser: false },
};

function noCache(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

async function fetchQuoteFinnhub(sym, key) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${key}`;
  const r = await fetch(url, { headers: { 'cache-control': 'no-store' } });
  if (!r.ok) throw new Error('finnhub ' + r.status);
  const j = await r.json();
  return j;
}

export default async function handler(req, res) {
  noCache(res);
  const FINN = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
  if (!FINN) {
    return res.status(500).json({ error: 'Missing FINNHUB_API_KEY' });
  }
  // Candidate symbols to scan (cheap, liquid-ish). We will filter under $10 dynamically.
  const candidates = ['SIRI','NOK','FUBO','PLUG','SOFI','GPRO','BBBYQ','RIVN','GRAB','IQ','AAL','CCL','NIO','AMC','DNA'];
  const items = [];
  for (const sym of candidates) {
    try {
      const q = await fetchQuoteFinnhub(sym, FINN);
      const c = q.c; // current
      if (!c || c >= 10) continue;
      const dp = q.dp ?? ((q.c - q.pc) / (q.pc || q.c)) * 100;
      const nearHigh = q.h ? Math.max(0, Math.min(1, (c - (q.h*0.98)) / Math.max(1, q.h*0.02))) : 0; // 0..1
      const rising = c > (q.o || q.pc) ? 1 : -0.3;
      const score = (dp/2) + (nearHigh*1.2) + rising; // tuned light
      items.push({ symbol: sym, c, dp, h: q.h, l: q.l, o: q.o, pc: q.pc, score });
    } catch (_) {}
  }
  items.sort((a,b)=> (b.score||-1) - (a.score||-1));
  const best = items[0] || null;
  res.status(200).json({ items, best, updatedAt: Date.now() });
}
