import { evaluateCondition, getAllNarratives } from './conditions';

export function advanceTime(state, worldData) {
  const steps = worldData.timeSteps;
  const nextIndex = Math.min(state.timelineIndex + 1, steps.length - 1);
  const step = steps[nextIndex];
  const newTime = state.time + step.advance;

  const newState = {
    ...state,
    time: newTime,
    timelineIndex: nextIndex,
  };

  // ۱. آشکارسازی POIها
  const newRevealed = [];
  for (const continent of worldData.continents) {
    for (const poi of continent.pois) {
      if (poi.revealTime != null && newTime >= poi.revealTime) {
        if (!newState.revealedPois.includes(poi.id)) {
          newState.revealedPois.push(poi.id);
          newRevealed.push(poi);
        }
      }
    }
  }

  // ۲. ارزیابی مجدد همه روایت‌ها
  const newlyUnlocked = reevaluateAllNarratives(newState, worldData);

  return {
    state: newState,
    changes: {
      newTime,
      step,
      newRevealed,
      newlyUnlocked,
      hasNext: nextIndex < steps.length - 1,
    },
  };
}

export function reevaluateAllNarratives(state, worldData) {
  const newlyUnlocked = [];
  const all = getAllNarratives(worldData);

  for (const { narrative } of all) {
    const entry = state.narratives[narrative.id];
    if (!entry) continue;
    if (entry.unlocked) continue;

    if (evaluateCondition(narrative.unlock, state, worldData)) {
      state.narratives[narrative.id] = { ...entry, unlocked: true };
      newlyUnlocked.push(narrative);
    }
  }
  return newlyUnlocked;
}

export function isPoiRevealed(poi, state) {
  if (poi.revealTime == null) return true;
  return state.revealedPois.includes(poi.id);
}