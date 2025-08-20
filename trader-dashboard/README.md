# Trader Dashboard v6.1

This version introduces **API Key enforcement**.

## 🔑 API Keys Required
- `NEXT_PUBLIC_FINNHUB_API_KEY`
- `NEXT_PUBLIC_YAHOO_API_KEY`

## Behavior
- If either key is missing:
  - 🚨 A red banner appears at the very top of the screen
  - ⛔ All API calls are halted
  - ❌ The dashboard will not load until the keys are set

## Running Locally
```bash
npm install
npm run dev
```

## Building for Production
```bash
npm run build
npm start
```
