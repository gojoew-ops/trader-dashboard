export const config = { api: { bodyParser: false } };

import fs from 'fs';
import path from 'path';
import { fetchAggregateSentiment } from '@/lib/sources/sentiment';

function mean(arr){ if(!arr.length) return 0; return arr.reduce((a,b)=>a+b,0)/arr.length; }
function std(arr){ if(!arr.length) return 0; const m=mean(arr); return Math.sqrt(arr.reduce((s,x)=>s+Math.pow(x-m,2),0)/arr.length); }
function computeRSI(closes, period=14){
  if (!closes || closes.length < period+1) return null;
  const gains=[], losses=[];
  for (let i=1;i<closes.length;i++){ const d=closes[i]-closes[i-1]; gains.push(Math.max(0,d)); losses.push(Math.max(0,-d)); }
  let avgGain = mean(gains.slice(0,period));
  let avgLoss = mean(losses.slice(0,period));
  for (let i=period;i<gains.length;i++){ avgGain=((avgGain*(period-1))+gains[i])/period; avgLoss=((avgLoss*(period-1))+losses[i])/period; }
  if (avgLoss === 0) return 100;
  const rs = avgGain/avgLoss; return 100 - (100/(1+rs));
}
function movingAverage(arr,n){ if(!arr||arr.length<n) return null; return mean(arr.slice(arr.length-n)); }
function computeMASlope(closes, maPeriod=20, barsAgo=5){
  if (!closes || closes.length < maPeriod + barsAgo) return null;
  const maNow = movingAverage(closes, maPeriod);
  const maAgo = mean(closes.slice(closes.length - maPeriod - barsAgo, closes.length - barsAgo));
  return (maNow - maAgo) / Math.max(1, barsAgo);
}
function computeVolatility(closes, lookback=20){
  if(!closes || closes.length < lookback+1) return null;
  const slice = closes.slice(closes.length - (lookback+1));
  const rets=[]; for (let i=1;i<slice.length;i++){ rets.push((slice[i]-slice[i-1])/(slice[i-1]||1)); }
  return std(rets);
}
async function fetchQuote(sym, key){
  const u = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${key}`;
  const r = await fetch(u); if(!r.ok) throw new Error(`quote ${r.status}`);
  return await r.json();
}
async function fetchCandles(sym, key, resolution, from_ts, to_ts){
  const u = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(sym)}&resolution=${resolution}&from=${from_ts}&to=${to_ts}&token=${key}`;
  const r = await fetch(u); if(!r.ok) throw new Error(`candle ${r.status}`);
  return await r.json();
}

export default async function handler(req, res){
  const FINN = process.env.FINNHUB_API_KEY || process.env.FINN || null;
  if (!FINN) { res.status(500).json({ error: 'Missing FINNHUB_API_KEY in env' }); return; }

  // Load candidates
  const file = path.join(process.cwd(), 'data', 'candidates.json');
  let candidates=[];
  try { const raw = fs.readFileSync(file,'utf-8'); const parsed = JSON.parse(raw); candidates = parsed.symbols || parsed || []; } catch(e){ candidates=[]; }

  const sentimentMap = await fetchAggregateSentiment();

  const bars=200, resolution='5';
  const to_ts = Math.floor(Date.now()/1000);
  const from_ts = to_ts - (bars*5*60);

  const items=[];
  for (const sym of candidates){
    try{
      const c = await fetchCandles(sym, FINN, resolution, from_ts, to_ts);
      if (!c || c.s!=='ok' || !c.c || c.c.length<5){
        const q = await fetchQuote(sym, FINN);
        if (q && q.c && q.c < 10){
          const mention = sentimentMap.get(sym) || { mentions:0, sentiment:0 };
          items.push({ symbol:sym, c:q.c, dp:q.dp??0, rsi:null, maSlope:null, volatility:null, mentions:mention.mentions, sentiment:mention.sentiment, score:0, note:'quote-fallback' });
        }
        continue;
      }
      const closes = c.c.slice();
      const last = closes[closes.length-1];
      if (!last || last >= 10) continue;

      const prev = closes[closes.length-2] || last;
      const dp = ((last - prev)/(prev || last))*100;
      const rsi = computeRSI(closes,14);
      const slope = computeMASlope(closes,20,5);
      const vol = computeVolatility(closes,20);
      const high = Math.max(...(c.h||[]));
      const nearHigh = high ? Math.max(0, Math.min(1, (last - (high*0.98))/Math.max(1, high*0.02))) : 0;
      const rising = last > (((c.o && c.o[c.o.length-1]) || prev)) ? 1 : -0.3;

      const mention = sentimentMap.get(sym) || { mentions:0, sentiment:0 };

      const dpWeight=0.8, rsiWeight=0.8, slopeWeight=1.0, volWeight=-0.5, highWeight=0.6, riseWeight=0.6, mentionWeight=0.5, sentimentWeight=1.0;
      const rsiScore = (rsi==null)?0:(50 - Math.abs(rsi-50));
      let score=0;
      score += dpWeight * (dp/10);
      score += rsiWeight * rsiScore/50;
      score += slopeWeight * (slope||0)/(last||1);
      score += volWeight * (vol||0);
      score += highWeight * (nearHigh||0);
      score += riseWeight * (rising||0);
      score += mentionWeight * Math.min(1, (mention.mentions||0)/10);
      score += sentimentWeight * (mention.sentiment||0);

      items.push({ symbol:sym, c:last, dp, rsi, maSlope:slope, volatility:vol, nearHigh, rising, mentions:mention.mentions, sentiment:mention.sentiment, score });
    } catch(e){
      console.error('symbol error', sym, e?.message);
    }
  }

  items.sort((a,b)=> (b.score||-Infinity) - (a.score||-Infinity));

  res.status(200).json({ under10: items, best: items[0]||null, meta: { fetchedAt: Date.now(), resolution, barsRequested: bars, count: items.length } });
}
