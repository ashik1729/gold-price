/** Asia/Qatar is fixed UTC+3 (no daylight saving). */
const QATAR_OFFSET_MS = 3 * 60 * 60 * 1000;

function toQatarWallClock(date: Date): Date {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60_000;
  return new Date(utcMs + QATAR_OFFSET_MS);
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function formatUsdManual(value: number, fractionDigits: number): string {
  const fixed = value.toFixed(fractionDigits);
  const [whole, frac = ""] = fixed.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `$${withCommas}.${frac}` : `$${withCommas}`;
}

function tryIntlNumber(
  value: number,
  options: Intl.NumberFormatOptions
): string | null {
  try {
    return new Intl.NumberFormat("en-US", options).format(value);
  } catch {
    return null;
  }
}

export function formatUSD(value: number): string {
  return (
    tryIntlNumber(value, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) ?? formatUsdManual(value, 2)
  );
}

export function formatQAR(value: number): string {
  return (
    tryIntlNumber(value, {
      style: "currency",
      currency: "QAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) ?? `QAR ${formatUsdManual(value, 2).slice(1)}`
  );
}

export function formatSpotUSD(value: number): string {
  return (
    tryIntlNumber(value, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }) ?? formatUsdManual(value, 3)
  );
}

export function formatQatarTime(date: Date, _timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Qatar",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    const q = toQatarWallClock(date);
    let hour = q.getHours();
    const minute = pad2(q.getMinutes());
    const second = pad2(q.getSeconds());
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${pad2(hour)}:${minute}:${second} ${ampm}`;
  }
}

export function formatQatarDate(date: Date, _timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Qatar",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    const q = toQatarWallClock(date);
    return `${WEEKDAYS[q.getDay()]}, ${MONTHS[q.getMonth()]} ${q.getDate()}, ${q.getFullYear()}`;
  }
}

export function formatQatarWeekday(date: Date, _timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Qatar",
      weekday: "long",
    })
      .format(date)
      .toUpperCase();
  } catch {
    return WEEKDAYS[toQatarWallClock(date).getDay()].toUpperCase();
  }
}

export function formatQatarDateShort(date: Date, _timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Qatar",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
      .format(date)
      .toUpperCase();
  } catch {
    const q = toQatarWallClock(date);
    return `${MONTHS[q.getMonth()].toUpperCase()} ${pad2(q.getDate())}, ${q.getFullYear()}`;
  }
}

export function formatQARAmount(value: number): string {
  return (
    tryIntlNumber(value, { maximumFractionDigits: 0 }) ??
    Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  );
}

export function formatChangeAbsolute(value: number): string {
  return (
    tryIntlNumber(Math.abs(value), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) ?? Math.abs(value).toFixed(2)
  );
}

export function formatChangePercent(value: number): string {
  return `${Math.abs(value).toFixed(2)}%`;
}

export function formatUpdatedAt(iso: string, timezone: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return formatQatarTime(date, timezone);
}
