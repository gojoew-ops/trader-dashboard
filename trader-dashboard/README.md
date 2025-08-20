# Trader Dashboard v6

This is **Trader Dashboard v6** with:
- Primary data source: Finnhub API
- Automatic backup data source: Yahoo Finance API (switches if Finnhub fails)
- Watchlist management
- Overlayed BUY/SELL/HOLD signals with confidence % watermark
- Visible countdown timer
- Sidebar settings panel (slide-in from right)

## 🚀 Setup Instructions

1. Clone or unzip this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root with:
   ```bash
   FINNHUB_API_KEY=your_finnhub_api_key_here
   ```
4. Run locally:
   ```bash
   npm run dev
   ```
5. Deploy to Vercel, making sure to add the same environment variable.

---

Built with ❤️ using Next.js + React + Tailwind CSS.
