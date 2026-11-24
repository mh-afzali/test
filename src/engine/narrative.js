import { getAllNarratives, findNarrativeById } from './conditions';

export function getVisibleSections(narrative, time) {
  return narrative.sections.filter((s) => s.triggerTime <= time);
}

export function getUnreadSections(narrative, state) {
  const entry = state.narratives[narrative.id];
  if (!entry || !entry.unlocked) return [];
  const visible = getVisibleSections(narrative, state.time);
  return visible.filter((s) => !entry.readSectionIds.includes(s.id));
}

export function narrativeHasUnread(narrative, state) {
  return getUnreadSections(narrative, state).length > 0;
}

export function markSectionReadAndReevaluate(narrativeId, sectionId, state, worldData, reevaluateFn) {
  const entry = state.narratives[narrativeId];
  if (!entry) return { state, newlyUnlocked: [] };
  if (entry.readSectionIds.includes(sectionId)) return { state, newlyUnlocked: [] };

  const newState = {
    ...state,
    narratives: {
      ...state.narratives,
      [narrativeId]: {
        ...entry,
        readSectionIds: [...entry.readSectionIds, sectionId],
      },
    },
  };

  const newlyUnlocked = reevaluateFn(newState, worldData);
  return { state: newState, newlyUnlocked };
}

export function poiHasUnread(poi, state) {
  return poi.narratives.some((n) => narrativeHasUnread(n, state));
}

export function continentHasUnread(continent, state) {
  return continent.pois.some((p) => poiHasUnread(p, state));
}

export function worldHasUnread(worldData, state) {
  return worldData.continents.some((c) => continentHasUnread(c, state));
}

export function getNarrativeStatus(narrative, state) {
  const entry = state.narratives[narrative.id];
  if (!entry || !entry.unlocked) return 'locked';

  const unread = getUnreadSections(narrative, state);
  if (unread.length > 0) return 'has_new';

  const visible = getVisibleSections(narrative, state.time);
  if (narrative.endTime != null && state.time >= narrative.endTime) return 'archived';
  if (visible.length === narrative.sections.length) return 'archived';
  return 'active';
}

export function getInfoAt(poi, time) {
  for (const version of poi.infoVersions) {
    if (version.from <= time && (version.to == null || time < version.to)) {
      return version;
    }
  }
  return poi.infoVersions[0];
}