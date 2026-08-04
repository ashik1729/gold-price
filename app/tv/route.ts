import {
  META_REFRESH_SEC,
  TIMEZONE,
} from "@/lib/constants";
import {
  formatQatarDateShort,
  formatQatarTime,
  formatQatarWeekday,
  formatSpotUSD,
  formatUpdatedAt,
} from "@/lib/currencyFormatter";
import { fetchMetals } from "@/lib/fetchMetals";
import { getAskPrice, getBidPrice } from "@/lib/goldCalculations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Ultra-compatible TV board: plain HTML + inline CSS, zero JavaScript.
 * Use this URL on Skylight / old TV browsers:
 *   https://victoria.metalbeacon.com/tv
 */
export async function GET() {
  const now = new Date();
  let goldBid = "—";
  let goldAsk = "—";
  let silverBid = "—";
  let silverAsk = "—";
  let status = "Unable to load live price — retrying…";
  let ok = false;

  try {
    const data = await fetchMetals();
    goldBid = formatSpotUSD(getBidPrice(data.gold.bid));
    goldAsk = formatSpotUSD(getAskPrice(data.gold.ask));
    silverBid = formatSpotUSD(getBidPrice(data.silver.bid));
    silverAsk = formatSpotUSD(getAskPrice(data.silver.ask));
    status = `Live price updated ${formatUpdatedAt(data.updatedAt, TIMEZONE)}`;
    ok = true;
  } catch {
    // Keep board shell visible; meta refresh will retry.
  }

  const refresh =
    Number.isFinite(META_REFRESH_SEC) && META_REFRESH_SEC > 0
      ? META_REFRESH_SEC
      : 30;

  const clean = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="${refresh}" />
  <title>Victoria Gold &amp; Diamonds | Live Prices (TV)</title>
  <style type="text/css">
    html, body { margin:0; padding:0; width:100%; height:100%; background:#061634; color:#f8f2e7; font-family:"Times New Roman",Times,serif; }
    .wrap { box-sizing:border-box; min-height:100%; padding:3% 4% 5%; background-color:#061634; background-image:url("/brand-assets/page10-img1.jpg"); background-position:center center; background-repeat:no-repeat; background-size:cover; }
    .veil { background:rgba(6,22,52,0.72); min-height:90%; box-sizing:border-box; padding:2% 1%; }
    .top { overflow:hidden; color:#e6cf92; letter-spacing:0.12em; font-size:18px; margin-bottom:18px; }
    .top-left { float:left; }
    .top-right { float:right; text-align:right; }
    .small { font-size:12px; opacity:0.85; margin-top:4px; }
    .brand { text-align:center; margin:10px 0 18px; }
    .brand img { width:52px; height:52px; vertical-align:middle; margin-right:10px; }
    .brand h1 { display:inline-block; vertical-align:middle; margin:0; font-size:42px; font-weight:normal; letter-spacing:0.2em; color:#f8f2e7; }
    .sub { margin-top:4px; color:#d8ab3c; letter-spacing:0.28em; font-size:16px; }
    .status { text-align:center; margin:10px 0 22px; color:#b5bfd3; font-size:16px; }
    .dot { display:inline-block; width:10px; height:10px; background:${ok ? "#8fe0a1" : "#ff9f95"}; margin-right:8px; }
    .grid { width:100%; border-collapse:separate; border-spacing:16px; }
    .card { width:50%; background:rgba(8,20,40,0.78); border:1px solid rgba(209,170,66,0.28); padding:22px 18px 26px; text-align:center; vertical-align:top; }
    .eyebrow { color:#d8ab3c; letter-spacing:0.2em; font-size:14px; margin-bottom:8px; }
    .side { font-size:34px; letter-spacing:0.14em; color:#f8f2e7; }
    .unit { color:#b5bfd3; font-size:13px; letter-spacing:0.16em; margin:8px 0 14px; }
    .price { font-size:48px; color:#f2d27a; letter-spacing:0.04em; }
  </style>
</head>
<body bgcolor="#061634" style="background:#061634;color:#f8f2e7;">
  <div class="wrap">
    <div class="veil">
      <div class="top">
        <div class="top-left">
          <div>${esc(formatQatarTime(now, TIMEZONE))}</div>
          <div class="small">QATAR TIME</div>
        </div>
        <div class="top-right">
          <div>${esc(formatQatarWeekday(now, TIMEZONE))}</div>
          <div class="small">${esc(formatQatarDateShort(now, TIMEZONE))}</div>
        </div>
      </div>
      <div class="brand">
        <img src="/brand-assets/page4-img1.png" width="52" height="52" alt="" />
        <h1>VICTORIA</h1>
        <div class="sub">GOLD &amp; DIAMONDS</div>
      </div>
      <div class="status"><span class="dot"></span>${esc(status)}</div>
      <table class="grid" cellspacing="16" cellpadding="0">
        <tr>
          <td class="card">
            <div class="eyebrow">GOLD</div>
            <div class="side">BID</div>
            <div class="unit">USD / OZ</div>
            <div class="price">${esc(goldBid)}</div>
          </td>
          <td class="card">
            <div class="eyebrow">GOLD</div>
            <div class="side">ASK</div>
            <div class="unit">USD / OZ</div>
            <div class="price">${esc(goldAsk)}</div>
          </td>
        </tr>
        <tr>
          <td class="card">
            <div class="eyebrow">SILVER</div>
            <div class="side">BID</div>
            <div class="unit">USD / OZ</div>
            <div class="price">${esc(silverBid)}</div>
          </td>
          <td class="card">
            <div class="eyebrow">SILVER</div>
            <div class="side">ASK</div>
            <div class="unit">USD / OZ</div>
            <div class="price">${esc(silverAsk)}</div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>`;

  return new Response(clean, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
