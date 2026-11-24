/**
 * Export/Import کامل داده‌های پروژه.
 * فرمت: یک فایل JSON ترکیبی با متادیتا.
 */

export const EXPORT_FORMAT_VERSION = 1;

/**
 * ساخت شیء export از state فعلی استودیو.
 */
export function buildExportPayload(world, characters, events) {
  return {
    __format: 'atlas-studio-export',
    __version: EXPORT_FORMAT_VERSION,
    __exportedAt: new Date().toISOString(),
    world,
    characters,
    events,
  };
}

/**
 * دانلود payload به‌صورت فایل JSON.
 */
export function downloadPayload(payload, filename) {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download =
    filename ||
    `atlas-export-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * اعتبارسنجی payload import.
 * خروجی: { ok: boolean, errors: [], payload?: {world, characters, events} }
 */
export function validateImportPayload(raw) {
  const errors = [];

  if (!raw || typeof raw !== 'object') {
    return { ok: false, errors: ['فایل JSON معتبر نیست.'] };
  }

  // اگر فایل تک‌فایلی باشد (مثلاً فقط world.json)، آن را هم قبول کن
  if (raw.world && raw.continents) {
    // این یک world.json خام است
    return {
      ok: true,
      errors: [],
      payload: {
        world: raw,
        characters: [],
        events: [],
      },
      partial: true,
    };
  }

  if (raw.__format !== 'atlas-studio-export') {
    errors.push('فرمت فایل نامعتبر است (__format با atlas-studio-export نمی‌خواند).');
  }

  if (typeof raw.__version !== 'number') {
    errors.push('نسخه‌ی فایل مشخص نیست (__version).');
  } else if (raw.__version > EXPORT_FORMAT_VERSION) {
    errors.push(
      `نسخه‌ی فایل (${raw.__version}) جدیدتر از نسخه‌ی فعلی (${EXPORT_FORMAT_VERSION}) است.`
    );
  }

  if (!raw.world || typeof raw.world !== 'object') {
    errors.push('بخش world وجود ندارد یا معتبر نیست.');
  } else if (!raw.world.world || !Array.isArray(raw.world.continents)) {
    errors.push('ساختار world ناقص است (world.world یا world.continents).');
  }

  if (!Array.isArray(raw.characters)) {
    errors.push('بخش characters آرایه نیست.');
  }

  if (!Array.isArray(raw.events)) {
    errors.push('بخش events آرایه نیست.');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    errors: [],
    payload: {
      world: raw.world,
      characters: raw.characters,
      events: raw.events,
    },
  };
}

/**
 * خواندن فایل از input[type=file] و برگرداندن payload اعتبارسنجی‌شده.
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * خلاصه‌ی آماری payload برای نمایش در مودال تأیید.
 */
export function summarizePayload(payload) {
  const { world, characters, events } = payload;
  let poiCount = 0;
  let narrativeCount = 0;
  for (const c of world.continents || []) {
    for (const p of c.pois || []) {
      poiCount++;
      narrativeCount += (p.narratives || []).length;
    }
  }
  return {
    worldName: world.world?.name || '(بدون نام)',
    continentCount: (world.continents || []).length,
    poiCount,
    narrativeCount,
    characterCount: characters.length,
    eventCount: events.length,
    timeSteps: (world.timeSteps || []).length,
  };
}