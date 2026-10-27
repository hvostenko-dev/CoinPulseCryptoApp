# NexusFi Pro — Institutional Crypto Intelligence & Quantitative Terminal

**NexusFi Pro** is a high-frequency cryptocurrency analytics platform, real-time OHLCV terminal, portfolio P&L tracker, and quantitative simulation suite built with **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, **Tailwind CSS v4**, **shadcn/ui**, **TradingView Lightweight Charts v5**, and the **CoinGecko API**.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TradingView Charts](https://img.shields.io/badge/TradingView-Lightweight_Charts_v5-10B981)](https://www.tradingview.com/lightweight-charts/)

---

## ✨ Key Institutional Features

### 1. 📊 Multi-Asset TradingView OHLCV Terminal (`/`)
- Instant 1-click asset switching (`BTC/USD`, `ETH/USD`, `SOL/USD`, `BNB/USD`, `XRP/USD`) without page reloads.
- Switch between **OHLC Candlesticks** and **Gradient Area Charts** with an overlayable **SMA-7 Simple Moving Average**.
- Live crosshair telemetry readout (`O / H / L / C`) and multi-timeframe selectors (`1D`, `1W`, `1M`, `3M`, `6M`, `1Y`, `Max`).

### 2. 🌐 Macro Market Radar & Interactive Heatmap (`/`)
- **Global Telemetry Strip & Live Marquee:** Real-time Global Market Cap, 24h Volume, BTC/ETH Dominance, Active Assets count, and an auto-scrolling live price ticker tape.
- **Fear & Greed Sentiment Index:** Live multi-factor sentiment score (`0–100`) with a 7-day historical spark-bar chart.
- **Interactive Market Heatmap:** Treemap performance matrix colored by 24h momentum, filterable by Market Cap or 24h Volume.

### 3. 🧭 Institutional Screener Pro (`/coins`)
- Instant client-side filtering (`All Assets`, `⭐ Starred Watchlist`, `🚀 24h Gainers`, `🩸 24h Losers`, `🔥 Highest Volume`) and multi-column sorting.
- Embedded **7-Day SVG Sparklines** and **24h Low–High Price Range** progress bars.
- Dual **Pro Table View** and **Responsive Cards View** with mobile-first ergonomics.

### 4. 💼 Portfolio Command & P&L Analytics (`/portfolio`)
- Track holdings with real-time market valuation, Total Cost Basis, Unrealized Net P&L (`$` & `ROI %`), Top Alpha Position, and visual **Portfolio Allocation Weights**.
- Includes a **1-Click "Load Whale Demo"** button for instant evaluation and **1-Click CSV Report Export**.

### 5. ⭐ Watchlist & Automated Price Alerts (`/watchlist`)
- Star any asset across the terminal to track it in a dedicated watchlist dashboard.
- Arm custom **Price Alerts** (`Above` / `Below` target USD thresholds) with percentage distance tracking and live toast notifications (`Test Trigger` mode included).

### 6. 🧪 Quantitative Crypto Lab (`/lab`)
- **Market Cap "What-If" Flippening Comparator:** Calculate implied token price, exact `Xx` multiplier, and projected bag value if Asset A reached Asset B's market cap (e.g., *SOL at ETH Market Cap*).
- **DCA & Compounding Wealth Simulator:** Model recurring Dollar-Cost Averaging investments across 1–10 years with an interactive Year-by-Year Principal vs. Profit bar chart.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.2 (App Router, React Server Components, Server Actions) |
| **Language** | TypeScript 5 |
| **UI & Styling** | React 19, Tailwind CSS v4, shadcn/ui, Radix UI, Lucide Icons |
| **Financial Charts** | TradingView Lightweight Charts v5 (`lightweight-charts`) + Custom SVG Sparklines |
| **Data Feeds** | CoinGecko REST & On-Chain API, Alternative.me Fear & Greed API |

---

## 🚀 Getting Started

```bash
git clone https://github.com/ilyajavadeveloper/CoinPulseCryptoApp.git
cd CoinPulseCryptoApp
npm install
```

Create a `.env.local` file in the root directory:

```env
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY=your_coingecko_demo_or_pro_api_key
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
