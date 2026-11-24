import React, { useEffect, useMemo, useState } from 'react';
import worldRaw from '../data/world.json';
import charactersRaw from '../data/characters.json';
import eventsRaw from '../data/events.json';
import {
  saveDataFile,
  deepClone,
  locateNarrative,
  locatePoi,
  updateNarrative,
  updatePoi,
  updateContinent,
  updateWorldMeta,
  updateTimeSteps,
  addPoi,
  removePoi,
  addContinent,
  removeContinent,
  addNarrative,
  removeNarrative,
  addCharacter,
  removeCharacter,
  updateCharacter,
  addEvent,
  removeEvent,
  updateEvent,
} from './api';
import { validateAll } from './validator';
import TreeSidebar from './TreeSidebar';
import NarrativeEditor from './NarrativeEditor';
import PoiEditor from './PoiEditor';
import ContinentEditor from './ContinentEditor';
import WorldEditor from './WorldEditor';
import CharactersEventsTab from './CharactersEventsTab';
import LivePreview from './LivePreview';
import ValidationPanel from './ValidationPanel';
import TimelineSimulator from './TimelineSimulator';
import './studio.css';

export default function StudioApp() {
  const [world, setWorld] = useState(null);
  const [characters, setCharacters] = useState(null);
  const [events, setEvents] = useState(null);
  const [selected, setSelected] = useState(null); // { kind, id, ... }
  const [previewTime, setPreviewTime] = useState(0);
  const [status, setStatus] = useState('');
  const [dirty, setDirty] = useState(false);
  const [jumpTarget, setJumpTarget] = useState(null);
  const [tab, setTab] = useState('editor'); // 'editor' | 'characters-events' | 'timeline'

  useEffect(() => {
    setWorld(deepClone(worldRaw));
    setCharacters(deepClone(charactersRaw));
    setEvents(deepClone(eventsRaw));
  }, []);

  /* ===== موجودیت انتخاب‌شده ===== */
  const selectedEntity = useMemo(() => {
    if (!world || !selected) return null;

    if (selected.kind === 'world') {
      return { kind: 'world' };
    }
    if (selected.kind === 'narrative') {
      const loc = locateNarrative(world, selected.id);
      return loc ? { kind: 'narrative', ...loc } : null;
    }
    if (selected.kind === 'poi') {
      const loc = locatePoi(world, selected.id);
      return loc ? { kind: 'poi', ...loc } : null;
    }
    if (selected.kind === 'continent') {
      const c = world.continents.find((x) => x.id === selected.id);
      return c ? { kind: 'continent', continent: c } : null;
    }
    return null;
  }, [world, selected]);

  const selectedNarrative =
    selectedEntity?.kind === 'narrative' ? selectedEntity.narrative : null;

  /* ===== اعتبارسنجی ===== */
  const issues = useMemo(
    () => (world ? validateAll(world, characters || [], events || []) : []),
    [world, characters, events]
  );

  const markDirty = () => {
    setDirty(true);
    setStatus('');
  };

  /* ===== ذخیره ===== */
  const handleSave = async () => {
    const errs = validateAll(world, characters, events).filter(
      (i) => i.level === 'error'
    );
    if (errs.length > 0) {
      const ok = window.confirm(
        `⚠️ ${errs.length} خطای ساختاری وجود دارد. باز هم ذخیره شود؟`
      );
      if (!ok) return;
    }

    setStatus('در حال ذخیره...');
    try {
      await saveDataFile('world.json', world);
      await saveDataFile('characters.json', characters);
      await saveDataFile('events.json', events);
      setStatus('✅ ذخیره شد روی دیسک');
      setDirty(false);
    } catch (e) {
      setStatus(`❌ ${e.message}`);
    }
  };

  /* ===== تغییردهنده‌های روایت ===== */
  const handleNarrativeChange = (newNarrative) => {
    if (!selected?.id) return;
    setWorld((w) => updateNarrative(w, selected.id, () => newNarrative));
    markDirty();
  };

  /* ===== تغییردهنده‌های POI ===== */
  const handlePoiChange = (newPoi) => {
    if (!selected?.id) return;
    setWorld((w) => updatePoi(w, selected.id, () => newPoi));
    markDirty();
  };

  /* ===== تغییردهنده‌های قاره ===== */
  const handleContinentChange = (newContinent) => {
    if (!selected?.id) return;
    setWorld((w) => updateContinent(w, selected.id, () => newContinent));
    markDirty();
  };

  /* ===== تغییردهنده‌های world ===== */
  const handleWorldMetaChange = (newMeta) => {
    setWorld((w) => updateWorldMeta(w, () => newMeta));
    markDirty();
  };

  const handleTimeStepsChange = (newSteps) => {
    setWorld((w) => updateTimeSteps(w, newSteps));
    markDirty();
  };

  /* ===== افزودن/حذف ===== */
  const handleAddContinent = () => {
    setWorld((w) => addContinent(w));
    markDirty();
  };

  const handleRemoveContinent = (id) => {
    if (!window.confirm('حذف این قاره و همه‌ی POIهایش؟')) return;
    setWorld((w) => removeContinent(w, id));
    if (selected?.id === id) setSelected(null);
    markDirty();
  };

  const handleAddPoi = (continentId) => {
    setWorld((w) => addPoi(w, continentId));
    markDirty();
  };

  const handleRemovePoi = (poiId) => {
    if (!window.confirm('حذف این POI و همه‌ی روایت‌هایش؟')) return;
    setWorld((w) => removePoi(w, poiId));
    if (selected?.id === poiId) setSelected(null);
    markDirty();
  };

  const handleAddNarrative = (poiId) => {
    setWorld((w) => addNarrative(w, poiId));
    markDirty();
  };

  const handleRemoveNarrative = (narrativeId) => {
    if (!window.confirm('حذف این روایت؟')) return;
    setWorld((w) => removeNarrative(w, narrativeId));
    if (selected?.id === narrativeId) setSelected(null);
    markDirty();
  };

  /* ===== شخصیت‌ها ===== */
  const handleAddCharacter = () => {
    let newChar = null;
    setCharacters((prev) => {
      const next = addCharacter(prev);
      newChar = next[next.length - 1];
      return next;
    });
    markDirty();
    return newChar;
  };

  const handleRemoveCharacter = (id) => {
    setCharacters((prev) => removeCharacter(prev, id));
    markDirty();
  };

  const handleChangeCharacter = (id, newChar) => {
    setCharacters((prev) => updateCharacter(prev, id, () => newChar));
    markDirty();
  };

  /* ===== رویدادها ===== */
  const handleAddEvent = () => {
    let newEv = null;
    setEvents((prev) => {
      const next = addEvent(prev);
      newEv = next[next.length - 1];
      return next;
    });
    markDirty();
    return newEv;
  };

  const handleRemoveEvent = (id) => {
    setEvents((prev) => removeEvent(prev, id));
    markDirty();
  };

  const handleChangeEvent = (id, newEv) => {
    setEvents((prev) => updateEvent(prev, id, () => newEv));
    markDirty();
  };

  /* ===== پرش از خطا ===== */
  const handleJump = (issue) => {
    if (!issue.narrativeId) return;

    setSelected((prev) =>
      prev?.kind === 'narrative' && prev.id === issue.narrativeId
        ? prev
        : { kind: 'narrative', id: issue.narrativeId }
    );

    setJumpTarget(issue);

    if (issue.sectionId) {
      const loc = locateNarrative(world, issue.narrativeId);
      const section = loc?.narrative?.sections?.find(
        (s) => s.id === issue.sectionId
      );
      if (section?.triggerTime != null) {
        setPreviewTime(section.triggerTime);
      }
    }

    setTimeout(() => setJumpTarget(null), 1500);
  };

  if (!world) {
    return (
      <div style={{ padding: 24, color: '#f4ecd8' }}>در حال بارگذاری...</div>
    );
  }

  const errorCount = issues.filter((i) => i.level === 'error').length;

  return (
    <div className="studio-root">
      <header className="studio-header">
        <div className="studio-header-left">
          <h1>🎨 استودیو اطلس</h1>
          <div className="studio-tabs">
            <button
              className={`studio-tab ${tab === 'editor' ? 'active' : ''}`}
              onClick={() => setTab('editor')}
            >
              ✏️ ویرایشگر
            </button>
            <button
              className={`studio-tab ${tab === 'characters-events' ? 'active' : ''}`}
              onClick={() => setTab('characters-events')}
            >
              👤 شخصیت‌ها و رویدادها
            </button>
            <button
              className={`studio-tab ${tab === 'timeline' ? 'active' : ''}`}
              onClick={() => setTab('timeline')}
            >
              🕰 شبیه‌ساز تایم‌لاین
            </button>
          </div>
        </div>

        <div className="studio-header-actions">
          {dirty && <span className="dirty-badge">● تغییرات ذخیره‌نشده</span>}
          {errorCount > 0 && (
            <span className="header-error-count">❌ {errorCount} خطا</span>
          )}
          <button onClick={handleSave} className="save-btn">
            💾 ذخیره همه
          </button>
          {status && <span className="status">{status}</span>}
        </div>
      </header>

      <div className="studio-body">
        {/* ستون چپ */}
        <aside className="studio-sidebar">
          <TreeSidebar
            world={world}
            selected={selected}
            onSelect={setSelected}
            onAddContinent={handleAddContinent}
            onRemoveContinent={handleRemoveContinent}
            onAddPoi={handleAddPoi}
            onRemovePoi={handleRemovePoi}
            onAddNarrative={handleAddNarrative}
            onRemoveNarrative={handleRemoveNarrative}
          />
        </aside>

        {/* ستون وسط */}
        <main className="studio-main">
          {tab === 'editor' ? (
            <>
              {selectedEntity?.kind === 'world' && (
                <WorldEditor
                  worldMeta={world.world}
                  timeSteps={world.timeSteps || []}
                  onChangeMeta={handleWorldMetaChange}
                  onChangeTimeSteps={handleTimeStepsChange}
                />
              )}
              {selectedEntity?.kind === 'continent' && (
                <ContinentEditor
                  continent={selectedEntity.continent}
                  onChange={handleContinentChange}
                  onDelete={() =>
                    handleRemoveContinent(selectedEntity.continent.id)
                  }
                />
              )}
              {selectedEntity?.kind === 'poi' && (
                <PoiEditor
                  poi={selectedEntity.poi}
                  world={world}
                  continent={selectedEntity.continent}
                  onChange={handlePoiChange}
                  onDelete={() => handleRemovePoi(selectedEntity.poi.id)}
                  onAddNarrative={() => handleAddNarrative(selectedEntity.poi.id)}
                  onSelectNarrative={(nid) => setSelected({ kind: 'narrative', id: nid })}
                />
              )}
              {selectedEntity?.kind === 'narrative' && (
                <NarrativeEditor
                  narrative={selectedNarrative}
                  onChange={handleNarrativeChange}
                  jumpTarget={jumpTarget}
                />
              )}
              {!selectedEntity && (
                <div className="empty-note">
                  از درخت سمت چپ یک قاره، POI، یا روایت انتخاب کن.
                </div>
              )}
              <ValidationPanel issues={issues} onJump={handleJump} />
            </>
          ) : tab === 'characters-events' ? (
            <CharactersEventsTab
              world={world}
              characters={characters}
              events={events}
              onAddCharacter={handleAddCharacter}
              onRemoveCharacter={handleRemoveCharacter}
              onChangeCharacter={handleChangeCharacter}
              onAddEvent={handleAddEvent}
              onRemoveEvent={handleRemoveEvent}
              onChangeEvent={handleChangeEvent}
            />
          ) : (
            <TimelineSimulator
              world={world}
              characters={characters}
              events={events}
            />
          )}
        </main>

        {/* ستون راست */}
        <aside className="studio-preview">
          <div className="preview-time-control">
            <label>زمان پیش‌نمایش:</label>
            <input
              type="range"
              min={0}
              max={500}
              value={previewTime}
              onChange={(e) => setPreviewTime(Number(e.target.value))}
            />
            <input
              type="number"
              value={previewTime}
              onChange={(e) => setPreviewTime(Number(e.target.value))}
              style={{ width: 70 }}
            />
          </div>
          <LivePreview
            narrative={selectedNarrative}
            world={world}
            characters={characters}
            events={events}
            previewTime={previewTime}
          />
        </aside>
      </div>
    </div>
  );
}