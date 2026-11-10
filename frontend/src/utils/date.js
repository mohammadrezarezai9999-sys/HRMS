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


/**
 * Payroll helpers: backend always stores Gregorian year+month.
 * UI may collect Jalali year+month when lang is fa.
 * Conversion uses day 1 of the selected month as the anchor date.
 */

const MONTH_NAMES_EN = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_NAMES_FA = [
  "",
  "حمل / فروردین",
  "ثور / اردیبهشت",
  "جوزا / خرداد",
  "سرطان / تیر",
  "اسد / مرداد",
  "سنبله / شهریور",
  "میزان / مهر",
  "عقرب / آبان",
  "قوس / آذر",
  "جدی / دی",
  "دلو / بهمن",
  "حوت / اسفند",
];

/** Jalali year+month → Gregorian year+month (anchor: day 1 of Jalali month). */
export function jalaliMonthYearToGregorian(jy, jm) {
  const [gy, gm] = toGregorian(Number(jy), Number(jm), 1);
  return { year: gy, month: gm };
}

/** Gregorian year+month → Jalali year+month (anchor: day 1 of Gregorian month). */
export function gregorianMonthYearToJalali(gy, gm) {
  const [jy, jm] = toJalali(Number(gy), Number(gm), 1);
  return { year: jy, month: jm };
}

/** Label for a stored Gregorian payroll month, for current UI language. */
export function payrollMonthLabel(gregorianMonth, lang = "fa") {
  const m = Number(gregorianMonth);
  if (!m || m < 1 || m > 12) return "—";
  if (lang === "en") return MONTH_NAMES_EN[m];
  // Show Jalali month name that corresponds to day-1 of this Gregorian month
  // For list rows we only have G-month; pair with year when formatting full period.
  return MONTH_NAMES_EN[m] + " / " + (MONTH_NAMES_FA[m] || m);
}

/** Full period label from stored Gregorian year+month. */
export function payrollPeriodLabel(gregorianYear, gregorianMonth, lang = "fa") {
  const gy = Number(gregorianYear);
  const gm = Number(gregorianMonth);
  if (!gy || !gm) return "—";
  if (lang === "en") {
    return `${MONTH_NAMES_EN[gm]} ${gy}`;
  }
  const { year: jy, month: jm } = gregorianMonthYearToJalali(gy, gm);
  return `${MONTH_NAMES_FA[jm]} ${jy}`;
}

export function currentGregorianYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function currentJalaliYearMonth() {
  const now = new Date();
  const [jy, jm] = toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return { year: jy, month: jm };
}

export { MONTH_NAMES_EN, MONTH_NAMES_FA };

/** Month name only for a stored Gregorian payroll period. */
export function payrollMonthNameOnly(gregorianYear, gregorianMonth, lang = "fa") {
  const gy = Number(gregorianYear);
  const gm = Number(gregorianMonth);
  if (!gm || gm < 1 || gm > 12) return "—";
  if (lang === "en") return MONTH_NAMES_EN[gm];
  const { month: jm } = gregorianMonthYearToJalali(gy || 2000, gm);
  return MONTH_NAMES_FA[jm];
}

/** Year number for UI from stored Gregorian payroll period. */
export function payrollYearOnly(gregorianYear, gregorianMonth, lang = "fa") {
  const gy = Number(gregorianYear);
  const gm = Number(gregorianMonth) || 1;
  if (!gy) return "—";
  if (lang === "en") return gy;
  return gregorianMonthYearToJalali(gy, gm).year;
}
