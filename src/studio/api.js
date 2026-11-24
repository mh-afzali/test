export async function saveDataFile(fileName, data) {
  const res = await fetch('/api/save-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, data }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `ذخیره ناموفق (${res.status})`);
  return json;
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** پیدا کردن location روایت: { continentIndex, poiIndex, narrativeIndex, poi, narrative } */
export function locateNarrative(world, narrativeId) {
  for (let ci = 0; ci < world.continents.length; ci++) {
    const continent = world.continents[ci];
    for (let pi = 0; pi < continent.pois.length; pi++) {
      const poi = continent.pois[pi];
      for (let ni = 0; ni < poi.narratives.length; ni++) {
        if (poi.narratives[ni].id === narrativeId) {
          return { continentIndex: ci, poiIndex: pi, narrativeIndex: ni, continent, poi, narrative: poi.narratives[ni] };
        }
      }
    }
  }
  return null;
}

/** به‌روزرسانی immutable یک روایت با کپی درخت */
export function updateNarrative(world, narrativeId, updater) {
  const copy = deepClone(world);
  const loc = locateNarrative(copy, narrativeId);
  if (!loc) return world;
  const { continentIndex, poiIndex, narrativeIndex } = loc;
  copy.continents[continentIndex].pois[poiIndex].narratives[narrativeIndex] =
    updater(copy.continents[continentIndex].pois[poiIndex].narratives[narrativeIndex]);
  return copy;
}

/** ساخت worldData ترکیبی برای پیش‌نمایش (همان کاری که App.jsx می‌کند) */
export function makePreviewWorldData(world, characters, events) {
  return { ...world, characters, events };
}

/** یک state ساختگی برای پیش‌نمایش: همه‌چیز unlocked و زمان بی‌نهایت */
export function makePreviewState(narrative, time) {
  const narratives = {};
  const readSectionIds = [];
  for (const s of narrative.sections) {
    if (s.triggerTime <= time) readSectionIds.push(s.id);
  }
  narratives[narrative.id] = { unlocked: true, readSectionIds };
  return {
    time,
    timelineIndex: 999,
    revealedPois: [],
    narratives,
    seenCharacters: [],
    seenEvents: [],
  };
}

export function validateWorld(world) {
  const errors = [];
  if (!world?.world?.id) errors.push('world.id تعریف نشده');
  if (!Array.isArray(world?.continents)) errors.push('continents آرایه نیست');
  const poiIds = new Set();
  const narIds = new Set();
  for (const c of world?.continents || []) {
    if (!c.id) errors.push('قاره بدون id');
    for (const p of c.pois || []) {
      if (!p.id) errors.push(`POI بدون id در قاره ${c.id}`);
      if (poiIds.has(p.id)) errors.push(`POI تکراری: ${p.id}`);
      poiIds.add(p.id);
      if (!Array.isArray(p.infoVersions) || p.infoVersions.length === 0) {
        errors.push(`POI ${p.id} بدون infoVersions`);
      }
      for (const n of p.narratives || []) {
        if (!n.id) errors.push(`روایت بدون id در POI ${p.id}`);
        if (narIds.has(n.id)) errors.push(`روایت تکراری: ${n.id}`);
        narIds.add(n.id);
      }
    }
  }
  return errors;
}