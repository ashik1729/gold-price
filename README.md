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

OpenNext runs your package.json `build` script (`next build`) internally.
So Cloudflare must call OpenNext itself — not `npm run build`.

| Setting | Value |
|---|---|
| **Build command** | `npx opennextjs-cloudflare build` |
| **Deploy command** | `npx wrangler deploy` |

Do **not** set Build command to `npm run build` when `build` is `opennextjs-cloudflare build` — that creates an infinite loop.

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
