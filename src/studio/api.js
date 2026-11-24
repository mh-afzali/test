/* ============================================================
   api.js — لایه‌ی ارتباط استودیو با فایل‌های داده
   ============================================================ */

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

/* ===== تولید ID یکتا ===== */
export function makeId(prefix, existingIds) {
  let i = 1;
  while (existingIds.includes(`${prefix}_${i}`)) i++;
  return `${prefix}_${i}`;
}

export function collectAllPoiIds(world) {
  return world.continents.flatMap((c) => c.pois.map((p) => p.id));
}

export function collectAllNarrativeIds(world) {
  const ids = [];
  for (const c of world.continents) {
    for (const p of c.pois) {
      for (const n of p.narratives || []) ids.push(n.id);
    }
  }
  return ids;
}

export function collectAllContinentIds(world) {
  return world.continents.map((c) => c.id);
}

/* ===== پیدا کردن موقعیت‌ها ===== */
export function locateNarrative(world, narrativeId) {
  for (let ci = 0; ci < world.continents.length; ci++) {
    const continent = world.continents[ci];
    for (let pi = 0; pi < continent.pois.length; pi++) {
      const poi = continent.pois[pi];
      for (let ni = 0; ni < poi.narratives.length; ni++) {
        if (poi.narratives[ni].id === narrativeId) {
          return {
            continentIndex: ci,
            poiIndex: pi,
            narrativeIndex: ni,
            continent,
            poi,
            narrative: poi.narratives[ni],
          };
        }
      }
    }
  }
  return null;
}

export function locatePoi(world, poiId) {
  for (let ci = 0; ci < world.continents.length; ci++) {
    const continent = world.continents[ci];
    for (let pi = 0; pi < continent.pois.length; pi++) {
      if (continent.pois[pi].id === poiId) {
        return {
          continentIndex: ci,
          poiIndex: pi,
          continent,
          poi: continent.pois[pi],
        };
      }
    }
  }
  return null;
}

/* ===== به‌روزرسانی‌ها (immutable) ===== */
export function updateNarrative(world, narrativeId, updater) {
  const copy = deepClone(world);
  const loc = locateNarrative(copy, narrativeId);
  if (!loc) return world;
  const { continentIndex, poiIndex, narrativeIndex } = loc;
  copy.continents[continentIndex].pois[poiIndex].narratives[narrativeIndex] =
    updater(copy.continents[continentIndex].pois[poiIndex].narratives[narrativeIndex]);
  return copy;
}

export function updatePoi(world, poiId, updater) {
  const copy = deepClone(world);
  const loc = locatePoi(copy, poiId);
  if (!loc) return world;
  const { continentIndex, poiIndex } = loc;
  copy.continents[continentIndex].pois[poiIndex] =
    updater(copy.continents[continentIndex].pois[poiIndex]);
  return copy;
}

export function updateContinent(world, continentId, updater) {
  const copy = deepClone(world);
  const ci = copy.continents.findIndex((c) => c.id === continentId);
  if (ci < 0) return world;
  copy.continents[ci] = updater(copy.continents[ci]);
  return copy;
}

/* ===== به‌روزرسانی world meta (فقط یک بار!) ===== */
export function updateWorldMeta(world, updater) {
  const copy = deepClone(world);
  copy.world = updater(copy.world);
  return copy;
}

/* ===== به‌روزرسانی timeSteps ===== */
export function updateTimeSteps(world, newTimeSteps) {
  const copy = deepClone(world);
  copy.timeSteps = newTimeSteps;
  return copy;
}

/* ===== افزودن POI ===== */
export function addPoi(world, continentId) {
  const copy = deepClone(world);
  const c = copy.continents.find((x) => x.id === continentId);
  if (!c) return world;
  const id = makeId('poi', collectAllPoiIds(copy));
  c.pois.push({
    id,
    name: 'POI جدید',
    type: 'city',
    coords: { x: 100, y: 100 },
    icon: 'city',
    revealTime: null,
    infoVersions: [
      { from: 0, to: null, type: 'city', title: 'POI جدید', description: '', tags: [] },
    ],
    narratives: [],
  });
  return copy;
}

export function removePoi(world, poiId) {
  const copy = deepClone(world);
  const loc = locatePoi(copy, poiId);
  if (!loc) return world;
  copy.continents[loc.continentIndex].pois.splice(loc.poiIndex, 1);
  return copy;
}

/* ===== افزودن قاره ===== */
export function addContinent(world) {
  const copy = deepClone(world);
  const id = makeId('continent', collectAllContinentIds(copy));
  copy.continents.push({
    id,
    name: 'قاره جدید',
    worldSvgId: '',
    unlocked: false,
    mapSvg: {
      viewBox: '0 0 700 520',
      background: '#0f1820',
      landPath:
        'M80,80 C 160,40 300,50 420,80 C 540,110 620,160 640,260 C 660,360 600,440 500,470 C 400,500 280,490 180,450 C 80,410 40,320 50,220 C 55,160 65,110 80,80 Z',
      landFill: 'url(#contLand)',
      landStroke: '#5a6a48',
      landStrokeWidth: 2,
      decorations: [],
    },
    svg: {
      path: '',
      fill: 'url(#landGradient)',
      stroke: '#5a6a48',
      strokeWidth: 2.5,
      labelX: 500,
      labelY: 300,
      subLabel: '',
      decorations: [],
    },
    pois: [],
  });
  return copy;
}

export function removeContinent(world, continentId) {
  const copy = deepClone(world);
  copy.continents = copy.continents.filter((c) => c.id !== continentId);
  return copy;
}

/* ===== افزودن روایت ===== */
export function addNarrative(world, poiId) {
  const copy = deepClone(world);
  const loc = locatePoi(copy, poiId);
  if (!loc) return world;
  const id = makeId('nar', collectAllNarrativeIds(copy));
  copy.continents[loc.continentIndex].pois[loc.poiIndex].narratives.push({
    id,
    title: 'روایت جدید',
    kind: 'lore',
    unlock: { type: 'time', time: 0 },
    endTime: null,
    sections: [],
  });
  return copy;
}

export function removeNarrative(world, narrativeId) {
  const copy = deepClone(world);
  const loc = locateNarrative(copy, narrativeId);
  if (!loc) return world;
  copy.continents[loc.continentIndex].pois[loc.poiIndex].narratives.splice(
    loc.narrativeIndex,
    1
  );
  return copy;
}

/* ===== پیش‌نمایش ===== */
export function makePreviewWorldData(world, characters, events) {
  return { ...world, characters, events };
}

export function makePreviewState(narrative, time) {
  const narratives = {};
  const readSectionIds = [];
  for (const s of narrative.sections || []) {
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

/* ===== اعتبارسنجی ساده ===== */
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
/* ============================================================
   Characters & Events helpers
   ============================================================ */

export function makeCharacterId(characters) {
  return makeId('char', (characters || []).map((c) => c.id));
}

export function makeEventId(events) {
  return makeId('event', (events || []).map((e) => e.id));
}

export function addCharacter(characters) {
  const copy = deepClone(characters || []);
  const id = makeCharacterId(copy);
  copy.push({
    id,
    name: 'شخصیت جدید',
    titles: [],
    versions: [
      { from: 0, to: null, status: 'زنده', locationId: null, bio: '' },
    ],
  });
  return copy;
}

export function removeCharacter(characters, characterId) {
  return (characters || []).filter((c) => c.id !== characterId);
}

export function updateCharacter(characters, characterId, updater) {
  return (characters || []).map((c) => (c.id === characterId ? updater(c) : c));
}

export function addEvent(events) {
  const copy = deepClone(events || []);
  const id = makeEventId(copy);
  copy.push({
    id,
    name: 'رویداد جدید',
    eventType: 'war',
    startTime: 0,
    endTime: null,
    locationIds: [],
    versions: [
      { from: 0, to: null, status: 'در جریان', summary: '' },
    ],
    participants: [],
    relatedEvents: [],
  });
  return copy;
}

export function removeEvent(events, eventId) {
  return (events || []).filter((e) => e.id !== eventId);
}

export function updateEvent(events, eventId, updater) {
  return (events || []).map((e) => (e.id === eventId ? updater(e) : e));
}