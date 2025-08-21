# Trader Dashboard v6.2

This is version 6.2 of the Trader Dashboard with patched TypeScript support.


## v6.2 Overlay & Data Fallback
- Client overlay checks NEXT_PUBLIC_* keys at runtime.
- API route uses FINNHUB_API_KEY (or NEXT_PUBLIC_) and falls back to Yahoo RapidAPI.
