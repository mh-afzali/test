const STORAGE_KEY = 'atlas-game-state-v2';

export function createInitialState(worldData) {
  const narratives = {};
  for (const continent of worldData.continents) {
    for (const poi of continent.pois) {
      for (const nar of poi.narratives) {
        narratives[nar.id] = {
          unlocked: false,
          readSectionIds: [],
        };
      }
    }
  }
  return {
    time: worldData.world.startTime,
    timelineIndex: -1,
    revealedPois: [],
    narratives,
    seenCharacters: [],
    seenEvents: [],
  };
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Save failed', e);
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
}