# Stocks Morning Analyzer (Under $10)

Fresh Next.js starter focused on sub-$10 stocks. Includes an API analyzer with intraday RSI/MA slope and a simple CSV export UI.

## Setup

1) Install deps:
```bash
npm install
```

2) Run dev:
```bash
npm run dev
```

3) Env vars:
- `FINNHUB_API_KEY` (or `FINN`) – required.

## Deploy on Vercel

- Connect this repo, set `FINNHUB_API_KEY` in Project Settings → Environment Variables, Deploy.

## Customize Universe

Edit `data/candidates.json` (array or `{ "symbols": [...] }`).

## Sentiment

`lib/sources/sentiment.js` is a stub. Wire in Reddit/Stocktwits/etc and return a `Map(symbol -> {mentions, sentiment})`.
