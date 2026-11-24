import React, { useEffect, useState, useCallback } from 'react';
import worldDataRaw from './data/world.json';
import charactersData from './data/characters.json';
import eventsData from './data/events.json';
import WorldMap from './components/WorldMap';
import ContinentView from './components/ContinentView';
import PoiPanel from './components/PoiPanel';
import NarrativeReader from './components/NarrativeReader';
import CharactersView from './components/CharactersView';
import TimeControl from './components/TimeControl';
import PageTransition from './components/PageTransition';
import SettingsMenu from './components/SettingsMenu';
import EntityCard from './components/EntityCard';
import { createInitialState, saveState, loadState } from './engine/gameState';
import { advanceTime, reevaluateAllNarratives } from './engine/timeEngine';
import { markSectionReadAndReevaluate } from './engine/narrative';
import { findNarrativeById, findPoiById } from './engine/conditions';

const worldData = {
  ...worldDataRaw,
  characters: charactersData,
  events: eventsData,
};

export default function App() {
  const [state, setState] = useState(() => loadState() || createInitialState(worldData));
  const [view, setView] = useState({ screen: 'world' });
  const [lastChanges, setLastChanges] = useState(null);
  const [openEntity, setOpenEntity] = useState(null);

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    const revealed = [];
    for (const c of worldData.continents) {
      for (const p of c.pois) {
        if (p.revealTime == null && !state.revealedPois.includes(p.id)) {
          revealed.push(p.id);
        }
      }
    }
    if (revealed.length > 0) {
      setState((s) => ({ ...s, revealedPois: [...s.revealedPois, ...revealed] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdvanceTime = () => {
    const { state: newState, changes } = advanceTime(state, worldData);
    setState(newState);
    setLastChanges(changes);
  };

  const handleSectionRead = useCallback((narrativeId, sectionId) => {
    setState((s) => {
      const { state: newState, newlyUnlocked } = markSectionReadAndReevaluate(
        narrativeId, sectionId, s, worldData, reevaluateAllNarratives
      );
      if (newlyUnlocked.length > 0) {
        setLastChanges((lc) => ({
          ...(lc || { newRevealed: [], newlyUnlocked: [] }),
          newlyUnlocked: [...(lc?.newlyUnlocked || []), ...newlyUnlocked],
        }));
      }
      return newState;
    });
  }, []);

  const handleNavigatePoi = (poiId) => {
    const found = findPoiById(poiId, worldData);
    if (found) setView({ screen: 'poi', poiId, continentId: found.continent.id });
  };

  // باز کردن کارت شخصیت/رویداد + ثبت «دیده‌شدن»
  const openCharacterCard = (character) => {
    setOpenEntity({ kind: 'char', entity: character });
    setState((s) => {
      if (s.seenCharacters?.includes(character.id)) return s;
      return { ...s, seenCharacters: [...(s.seenCharacters || []), character.id] };
    });
  };

  const openEventCard = (event) => {
    setOpenEntity({ kind: 'event', entity: event });
    setState((s) => {
      if (s.seenEvents?.includes(event.id)) return s;
      return { ...s, seenEvents: [...(s.seenEvents || []), event.id] };
    });
  };

  const handleReset = () => {
    const fresh = createInitialState(worldData);
    setState(fresh);
    setView({ screen: 'world' });
    setLastChanges(null);
    setOpenEntity(null);
  };

  const viewKey = `${view.screen}-${view.continentId || ''}-${view.poiId || ''}-${view.narrativeId || ''}`;

  let content = null;

  if (view.screen === 'world') {
    content = (
      <WorldMap
        worldData={worldData}
        state={state}
        onSelectContinent={(id) => setView({ screen: 'continent', continentId: id })}
        onOpenCharacters={() => setView({ screen: 'characters' })}
      />
    );
  } else if (view.screen === 'continent') {
    const continent = worldData.continents.find((c) => c.id === view.continentId);
    content = (
      <ContinentView
        continent={continent}
        state={state}
        worldData={worldData}
        lastChanges={lastChanges}
        onSelectPoi={(poiId) => setView({ screen: 'poi', poiId, continentId: continent.id })}
        onBack={() => setView({ screen: 'world' })}
      />
    );
  } else if (view.screen === 'poi') {
    const found = findPoiById(view.poiId, worldData);
    content = (
      <PoiPanel
        poi={found.poi}
        state={state}
        worldData={worldData}
        onSelectNarrative={(id) => setView({ screen: 'narrative', narrativeId: id, poiId: view.poiId, continentId: view.continentId })}
        onOpenEvent={openEventCard}
        onBack={() => setView({ screen: 'continent', continentId: view.continentId })}
      />
    );
  } else if (view.screen === 'narrative') {
    const narrative = findNarrativeById(view.narrativeId, worldData);
    const entry = state.narratives[view.narrativeId];
    if (!entry?.unlocked) {
      content = <div className="app"><p>این روایت هنوز باز نشده است.</p></div>;
    } else {
      content = (
        <NarrativeReader
          narrative={narrative}
          state={state}
          worldData={worldData}
          onSectionRead={handleSectionRead}
          onNavigatePoi={handleNavigatePoi}
          onOpenCharacter={openCharacterCard}
          onOpenEvent={openEventCard}
          onBack={() => setView({ screen: 'poi', poiId: view.poiId, continentId: view.continentId })}
        />
      );
    }
  } else if (view.screen === 'characters') {
    content = (
      <CharactersView
        worldData={worldData}
        state={state}
        onBack={() => setView({ screen: 'world' })}
        onOpenCharacter={openCharacterCard}
      />
    );
  }

  return (
    <div className="app">
      <SettingsMenu onReset={handleReset} />
      <PageTransition viewKey={viewKey}>{content}</PageTransition>
      <TimeControl
        state={state}
        worldData={worldData}
        onChange={handleAdvanceTime}
        lastChanges={lastChanges}
      />
      {openEntity && (
        <EntityCard
          entity={openEntity.entity}
          kind={openEntity.kind}
          state={state}
          worldData={worldData}
          onClose={() => setOpenEntity(null)}
          onNavigatePoi={(poiId) => {
            setOpenEntity(null);
            handleNavigatePoi(poiId);
          }}
        />
      )}
    </div>
  );
}