# CoinPulse — Cryptocurrency Analytics & Live Market Tracker

Modern cryptocurrency analytics platform and live market tracker built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, **TradingView Lightweight Charts**, and the **CoinGecko API**.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Features

- **Market Overview & Trending Coins:** Track global market metrics, trending cryptocurrencies, and top categories in real time.
- **Interactive OHLC Candlestick Charts:** Powered by **TradingView Lightweight Charts** (`lightweight-charts`) with multiple timeframes (`1D`, `1W`, `1M`, `3M`, `6M`, `1Y`, `Max`) and custom dark-mode styling.
- **Detailed Coin Analytics (`/coins/[id]`):** Deep-dive into individual assets with price change metrics (24h / 30d), market cap, volume, on-chain pool discovery, and recent trades.
- **Built-in Crypto Converter:** Instant currency conversion across supported fiat and crypto pairs.
- **Fast Global Search:** Instant modal search (`/api/search`) with debounced queries and server-side caching.
- **Paginated All-Coins Directory (`/coins`):** Browse and filter the broader cryptocurrency market with custom reusable `DataTable` and `CoinsPagination` components.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.2 (App Router, React Server Components, Server Actions) |
| **Language** | TypeScript 5 |
| **UI & Styling** | React 19, Tailwind CSS v4, shadcn/ui (`base-maia`), Radix UI, Base UI |
| **Charts** | TradingView Lightweight Charts v5 (`lightweight-charts`) |
| **Icons** | Lucide React, Hugeicons |
| **Data & API** | CoinGecko REST & On-Chain API, `query-string` |

---

## 📁 Project Structure

```text
CoinPulseCryptoApp/
├── app/
│   ├── api/search/route.ts       # Coin search API route handler
│   ├── coins/
│   │   ├── [id]/page.tsx         # Coin details, OHLC chart, converter & live data
│   │   └── page.tsx              # Paginated directory of all coins
│   ├── globals.css               # Tailwind CSS v4 theme & custom utilities
│   ├── layout.tsx                # Root layout & navigation header
│   └── page.tsx                  # Dashboard home (CoinOverview, TrendingCoins, Categories)
├── components/
│   ├── home/                     # Home dashboard sections & Suspense fallbacks
│   ├── ui/                       # Reusable shadcn/ui & Radix primitives
│   ├── CandlestickChart.tsx      # Interactive TradingView OHLC candlestick chart
│   ├── CoinHeader.tsx            # Asset header with live price badges
│   ├── CoinsPagination.tsx       # Pagination controls for coin tables
│   ├── Converter.tsx             # Crypto-to-fiat & token converter
│   ├── DataTable.tsx             # Generic typed data table component
│   ├── Header.tsx                # Top navigation bar
│   ├── LiveDataWrapper.tsx       # Real-time trades & chart wrapper
│   └── SearchModal.tsx           # Command/modal search dialog
├── lib/
│   ├── coingecko.actions.ts      # Server Actions & typed fetcher for CoinGecko API
│   └── utils.ts                  # Formatting & class merging utilities
├── constants.ts                  # Chart themes, timeframe configs & nav links
└── types.d.ts                    # Global TypeScript interfaces
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ilyajavadeveloper/CoinPulseCryptoApp.git
cd CoinPulseCryptoApp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY=your_coingecko_demo_or_pro_api_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

- `npm run dev` — Start development server at `http://localhost:3000`
- `npm run build` — Create an optimized production build
- `npm run start` — Start the production server
- `npm run lint` — Run ESLint checks
