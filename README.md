# Victoria Gold & Diamonds

Premium full-screen live gold & silver price display for jewellery showroom TVs.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local Next.js build only

```bash
npm run build:next
npm start
```

## Cloudflare Workers (OpenNext)

```bash
npm run preview   # OpenNext build + local Workers preview
npm run deploy    # OpenNext build + deploy as victoria-gold-price
```

### Cloudflare Workers Builds (dashboard)

Use these settings so OpenNext compiles before Wrangler deploys:

| Setting | Value |
|---|---|
| **Build command** | `npm run build` |
| **Deploy command** | `npx wrangler deploy` |

`npm run build` runs `opennextjs-cloudflare build` (creates `.open-next/`).  
Do **not** use plain `next build` as the Cloudflare build command — Wrangler will fail with:

`Could not find compiled Open Next config`

## Features

- Live gold (XAU) and silver (XAG) prices via Next.js API route
- Victoria selling prices with configurable USD markup from env
- USD & QAR display
- Auto-rotating karat tabs for TV
- Qatar timezone clock (`Asia/Qatar`)
- Auto-refresh every 60 seconds with localStorage cache & retry
- Full-screen mode for TV displays

## Configuration

- Markup: `NEXT_PUBLIC_PRICE_MARKUP_USD` in `.env.local` / Cloudflare vars
- Other settings: `lib/constants.ts`
