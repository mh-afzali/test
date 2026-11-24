/**
 * تقویم فانتزی: ۱۲ ماه ۳۰ روزه + ۵ روز آخر سال.
 * مبدأ: روز ۰ = سال ۱، ماه ۱، روز ۱.
 * سال = ۳۶۵ روز.
 */

export const DAYS_PER_MONTH = 30;
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_YEAR = 365;
export const EXTRA_DAYS = DAYS_PER_YEAR - DAYS_PER_MONTH * MONTHS_PER_YEAR; // 5

export const SEASONS = ['بهار', 'تابستان', 'پاییز', 'زمستان'];

export const MONTH_NAMES = [
  // بهار
  { index: 1, name: 'ماه اول', season: 'بهار', seasonOrder: 1 },
  { index: 2, name: 'ماه دوم', season: 'بهار', seasonOrder: 2 },
  { index: 3, name: 'ماه سوم', season: 'بهار', seasonOrder: 3 },
  // تابستان
  { index: 4, name: 'ماه اول', season: 'تابستان', seasonOrder: 1 },
  { index: 5, name: 'ماه دوم', season: 'تابستان', seasonOrder: 2 },
  { index: 6, name: 'ماه سوم', season: 'تابستان', seasonOrder: 3 },
  // پاییز
  { index: 7, name: 'ماه اول', season: 'پاییز', seasonOrder: 1 },
  { index: 8, name: 'ماه دوم', season: 'پاییز', seasonOrder: 2 },
  { index: 9, name: 'ماه سوم', season: 'پاییز', seasonOrder: 3 },
  // زمستان
  { index: 10, name: 'ماه اول', season: 'زمستان', seasonOrder: 1 },
  { index: 11, name: 'ماه دوم', season: 'زمستان', seasonOrder: 2 },
  { index: 12, name: 'ماه سوم', season: 'زمستان', seasonOrder: 3 },
];

/** نام ماه با ترتیب فصل: مثلاً «ماه دوم بهار» */
export function monthLabel(monthIndex) {
  const m = MONTH_NAMES.find((x) => x.index === monthIndex);
  if (!m) return `ماه ${monthIndex}`;
  return `${m.name} ${m.season}`;
}

/** نام کوتاه ماه: «ماه دوم» */
export function monthShortLabel(monthIndex) {
  const m = MONTH_NAMES.find((x) => x.index === monthIndex);
  return m ? m.name : `ماه ${monthIndex}`;
}

/** فصل ماه */
export function seasonOfMonth(monthIndex) {
  const m = MONTH_NAMES.find((x) => x.index === monthIndex);
  return m ? m.season : '—';
}

/**
 * تبدیل روز مطلق → { year, month, day } یا { year, extraDay }.
 * extraDay: 1..5 (روزهای آخر سال)
 */
export function daysToDate(days) {
  const total = Math.max(0, Math.floor(days));
  const yearIndex = Math.floor(total / DAYS_PER_YEAR);
  const dayInYear = total % DAYS_PER_YEAR; // 0..364
  const year = yearIndex + 1;

  if (dayInYear < DAYS_PER_MONTH * MONTHS_PER_YEAR) {
    const monthIndex = Math.floor(dayInYear / DAYS_PER_MONTH); // 0..11
    const day = (dayInYear % DAYS_PER_MONTH) + 1; // 1..30
    return {
      year,
      month: monthIndex + 1,
      day,
      extraDay: null,
      isExtra: false,
    };
  }

  // ۵ روز آخر سال
  const extraDay = dayInYear - DAYS_PER_MONTH * MONTHS_PER_YEAR + 1; // 1..5
  return {
    year,
    month: null,
    day: null,
    extraDay,
    isExtra: true,
  };
}

/**
 * تبدیل تاریخ → روز مطلق.
 * اگر isExtra، extraDay (1..5) استفاده می‌شود.
 */
export function dateToDays({ year, month, day, extraDay, isExtra }) {
  const y = Math.max(1, Math.floor(year || 1));
  const yearIndex = y - 1;

  if (isExtra) {
    const e = Math.min(Math.max(1, Math.floor(extraDay || 1)), EXTRA_DAYS);
    return yearIndex * DAYS_PER_YEAR + DAYS_PER_MONTH * MONTHS_PER_YEAR + (e - 1);
  }

  const m = Math.min(Math.max(1, Math.floor(month || 1)), MONTHS_PER_YEAR);
  const d = Math.min(Math.max(1, Math.floor(day || 1)), DAYS_PER_MONTH);
  return (
    yearIndex * DAYS_PER_YEAR +
    (m - 1) * DAYS_PER_MONTH +
    (d - 1)
  );
}

/**
 * فرمت کامل: «روز ۱۲ ماه دوم بهار سال ۳۷۰» یا «۲ روز قبل از بهار سال ۳۷۰»
 */
export function formatDate(days) {
  const d = daysToDate(days);
  if (d.isExtra) {
    return `${d.extraDay} روز قبل از بهار سال ${d.year}`;
  }
  return `روز ${d.day} ${monthLabel(d.month)} سال ${d.year}`;
}

/**
 * فرمت کوتاه: «۱۲/۰۲/۳۷۰» یا «-۳/۳۷۰» (برای ۵ روز آخر)
 */
export function formatDateShort(days) {
  const d = daysToDate(days);
  if (d.isExtra) {
    return `-${d.extraDay}/${d.year}`;
  }
  return `${d.day}/${d.month}/${d.year}`;
}