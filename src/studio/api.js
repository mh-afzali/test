export async function saveDataFile(fileName, data) {
  const res = await fetch('/api/save-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, data }),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.error || `ذخیره ناموفق (${res.status})`);
  }
  return json;
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