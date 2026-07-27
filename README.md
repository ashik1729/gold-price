# Victoria Gold & Diamonds

Premium full-screen live gold & silver price display for jewellery showroom TVs.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
npm start
```

## Cloudflare Workers (OpenNext)

```bash
npm run preview   # OpenNext build + local Workers preview
npm run deploy    # Deploy to Cloudflare Workers as victoria-gold-price
```

## Features

- Live gold (XAU) and silver (XAG) prices via Next.js API route
- Victoria selling prices with configurable USD 2 markup
- USD & QAR display (configurable exchange rate)
- Karat pricing: 24K / 22K / 21K / 18K
- Weight calculator with karat selector
- Qatar timezone clock (`Asia/Qatar`)
- Auto-refresh every 60 seconds with localStorage cache & retry
- Full-screen mode for TV displays
- Cloudflare Workers deployment via `@opennextjs/cloudflare`

## Configuration

Edit `lib/constants.ts`:

- `PRICE_MARKUP_USD`
- `USD_TO_QAR`
- `REFRESH_INTERVAL_MS`
