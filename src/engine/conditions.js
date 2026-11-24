export function evaluateCondition(condition, state, worldData) {
  if (!condition) return true;

  switch (condition.type) {
    case 'time':
      return state.time >= condition.time;

    case 'story_read':
      return isNarrativeFullyRead(condition.storyId, state, worldData);

    case 'all':
      return condition.conditions.every((c) => evaluateCondition(c, state, worldData));

    case 'any':
      return condition.conditions.some((c) => evaluateCondition(c, state, worldData));

    case 'not':
      return !evaluateCondition(condition.condition, state, worldData);

    default:
      console.warn('Unknown condition type:', condition.type);
      return false;
  }
}

export function isNarrativeFullyRead(narrativeId, state, worldData) {
  const entry = state.narratives[narrativeId];
  if (!entry || !entry.unlocked) return false;

  const narrative = findNarrativeById(narrativeId, worldData);
  if (!narrative) return false;

  const visibleSections = narrative.sections.filter((s) => s.triggerTime <= state.time);
  if (visibleSections.length === 0) return false;

  return visibleSections.every((s) => entry.readSectionIds.includes(s.id));
}

export function findNarrativeById(narrativeId, worldData) {
  for (const continent of worldData.continents) {
    for (const poi of continent.pois) {
      for (const nar of poi.narratives) {
        if (nar.id === narrativeId) return nar;
      }
    }
  }
  return null;
}

export function findPoiById(poiId, worldData) {
  for (const continent of worldData.continents) {
    for (const poi of continent.pois) {
      if (poi.id === poiId) return { poi, continent };
    }
  }
  return null;
}

export function getAllNarratives(worldData) {
  const list = [];
  for (const continent of worldData.continents) {
    for (const poi of continent.pois) {
      for (const nar of poi.narratives) {
        list.push({ narrative: nar, poi, continent });
      }
    }
  }
  return list;
}

export function findCharacterById(id, worldData) {
  return (worldData.characters || []).find((c) => c.id === id) || null;
}

export function findEventById(id, worldData) {
  return (worldData.events || []).find((e) => e.id === id) || null;
}