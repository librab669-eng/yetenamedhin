// Ethiopian Calendar library - pure functions, Ethiopian-only storage
// Ethiopian month 13 = Pagume. Years are integer; leap year when year % 4 === 3.

export const MONTHS_EN = [
  "Meskerem", "Tekemt", "Hedar", "Tahsas", "Tir", "Yekatit", "Megabit",
  "Miazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume",
] as const;

export const MONTHS_AM = [
  "መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት", "መጋቢት",
  "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ",
] as const;

export const WEEKDAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const WEEKDAYS_AM = ["ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "አርብ", "ቅዳሜ", "እሑድ"] as const;

const ETHIOPIC_EPOCH_JDN = 2443398; // JDN of 1 Meskerem 1970 EC = 11 Sep 1977 GC

export interface EthDate {
  year: number;
  month: number; // 1..13
  day: number; // 1..30 (Pagume max 6)
  weekday: number; // 0=Monday .. 6=Sunday
}

export function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y2 = year + 4800 - a;
  const m2 = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045
  );
}

export function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

export function ethToJdn(year: number, month: number, day: number): number {
  const days =
    (year - 1970) * 365 +
    (Math.floor(year / 4) - 492) +
    (month - 1) * 30 +
    (day - 1);
  return ETHIOPIC_EPOCH_JDN + days;
}

export function jdnToEth(jdn: number): EthDate {
  let totalDays = jdn - ETHIOPIC_EPOCH_JDN;
  const cycles = Math.floor(totalDays / 1461);
  let year = 1970 + cycles * 4;
  let rem = totalDays % 1461;
  const yearLengths = [365, 366, 365, 365]; // cycle starts on year % 4 === 2
  for (let i = 0; i < 4; i++) {
    if (rem < yearLengths[i]) {
      const month = Math.floor(rem / 30) + 1;
      const day = (rem % 30) + 1;
      return { year, month, day, weekday: jdn % 7 };
    }
    rem -= yearLengths[i];
    year++;
  }
  throw new Error("Invalid JDN for Ethiopian conversion");
}

export function ethDaysInMonth(year: number, month: number): number {
  if (month < 13) return 30;
  return year % 4 === 3 ? 6 : 5; // Pagume
}

export function todayEth(): EthDate {
  const now = new Date();
  const jdn = gregorianToJdn(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return jdnToEth(jdn);
}

export function ethDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseEthDate(s: string): EthDate {
  const [year, month, day] = s.split("-").map(Number);
  const jdn = ethToJdn(year, month, day);
  return jdnToEth(jdn);
}

export function ethMonthName(year: number, month: number, lang: "en" | "am"): string {
  const list = lang === "am" ? MONTHS_AM : MONTHS_EN;
  return list[month - 1] ?? "";
}

export function ethWeekdayName(weekday: number, lang: "en" | "am"): string {
  const list = lang === "am" ? WEEKDAYS_AM : WEEKDAYS_EN;
  return list[weekday] ?? "";
}

export function formatEthDate(d: EthDate, lang: "en" | "am"): string {
  return `${ethMonthName(d.year, d.month, lang)} ${d.day}, ${d.year}`;
}

export function formatEthLong(d: EthDate, lang: "en" | "am"): string {
  return `${ethWeekdayName(d.weekday, lang)}, ${formatEthDate(d, lang)}`;
}

export function addDaysEth(eth: EthDate, days: number): EthDate {
  return jdnToEth(ethToJdn(eth.year, eth.month, eth.day) + days);
}

export function diffDaysEth(a: EthDate, b: EthDate): number {
  return ethToJdn(b.year, b.month, b.day) - ethToJdn(a.year, a.month, a.day);
}

// Ethiopian week starts on Sunday (Nehase 1, 2018 = Sunday).
export function startOfWeekEth(eth: EthDate): EthDate {
  // weekday: 0=Mon..6=Sun -> days since Sunday = (weekday + 1) % 7
  const back = (eth.weekday + 1) % 7;
  return addDaysEth(eth, -back);
}

export function startOfMonthEth(year: number, month: number): EthDate {
  return { year, month, day: 1, weekday: jdnToEth(ethToJdn(year, month, 1)).weekday };
}

export function startOfYearEth(year: number): EthDate {
  return { year, month: 1, day: 1, weekday: jdnToEth(ethToJdn(year, 1, 1)).weekday };
}