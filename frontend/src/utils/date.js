/**
 * Lightweight Jalali (Shamsi) <-> Gregorian conversion + locale-aware formatting.
 * No external dependency.
 */

function div(a, b) {
  return Math.floor(a / b);
}

/** Gregorian → Jalali [jy, jm, jd] */
export function toJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

/** Jalali → Gregorian [gy, gm, gd] */
export function toGregorian(jy, jm, jd) {
  jy += 1595;
  let days =
    -355668 +
    365 * jy +
    div(jy, 33) * 8 +
    div((jy % 33) + 3, 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy = 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * div(--days, 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  for (gm = 1; gm <= 12 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
  return [gy, gm, gd];
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function parseInput(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  // ISO date or datetime
  const s = String(value).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date/datetime for UI.
 * lang === 'fa' → Jalali (YYYY/MM/DD)
 * lang === 'en' → Gregorian (YYYY-MM-DD)
 */
export function formatDate(value, lang = "fa", options = {}) {
  const d = parseInput(value);
  if (!d) return "—";

  const gy = d.getFullYear();
  const gm = d.getMonth() + 1;
  const gd = d.getDate();

  if (lang === "en") {
    const base = `${gy}-${pad(gm)}-${pad(gd)}`;
    if (options.withTime) {
      return `${base} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    return base;
  }

  // Persian / Jalali
  const [jy, jm, jd] = toJalali(gy, gm, gd);
  const base = `${jy}/${pad(jm)}/${pad(jd)}`;
  if (options.withTime) {
    return `${base} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return base;
}

/** Format time only HH:MM from ISO datetime */
export function formatTime(value) {
  if (!value) return "—";
  const s = String(value);
  if (s.length >= 16 && s.includes("T")) return s.slice(11, 16);
  const d = parseInput(value);
  if (!d) return "—";
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert Jalali string "1403/01/15" or "1403-01-15" → Gregorian "2024-04-03" for API */
export function jalaliToGregorianString(jalaliStr) {
  if (!jalaliStr) return "";
  const parts = String(jalaliStr).trim().split(/[\/\-]/);
  if (parts.length < 3) return jalaliStr;
  const [jy, jm, jd] = parts.map(Number);
  if (!jy || !jm || !jd) return jalaliStr;
  // If looks like already Gregorian year
  if (jy > 1800 && jy < 2100) {
    return `${jy}-${pad(jm)}-${pad(jd)}`;
  }
  const [gy, gm, gd] = toGregorian(jy, jm, jd);
  return `${gy}-${pad(gm)}-${pad(gd)}`;
}
