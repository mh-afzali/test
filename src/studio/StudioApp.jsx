import React, { useEffect, useMemo, useState } from 'react';
import worldRaw from '../data/world.json';
import charactersRaw from '../data/characters.json';
import eventsRaw from '../data/events.json';
import { saveDataFile, deepClone, locateNarrative, updateNarrative, validateWorld } from './api';
import TreeSidebar from './TreeSidebar';
import NarrativeEditor from './NarrativeEditor';
import LivePreview from './LivePreview';
import './studio.css';

export default function StudioApp() {
  const [world, setWorld] = useState(null);
  const [characters, setCharacters] = useState(null);
  const [events, setEvents] = useState(null);
  const [selected, setSelected] = useState(null);
  const [previewTime, setPreviewTime] = useState(0);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setWorld(deepClone(worldRaw));
    setCharacters(deepClone(charactersRaw));
    setEvents(deepClone(eventsRaw));
    setErrors(validateWorld(worldRaw));
  }, []);

  const selectedNarrative = useMemo(() => {
    if (!world || !selected?.narrativeId) return null;
    const loc = locateNarrative(world, selected.narrativeId);
    return loc?.narrative || null;
  }, [world, selected]);

  const handleSave = async () => {
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

  const handleNarrativeChange = (newNarrative) => {
    setWorld((w) => updateNarrative(w, selected.narrativeId, () => newNarrative));
    setDirty(true);
    const errs = validateWorld(world);
    setErrors(errs);
  };

  if (!world) return <div style={{ padding: 24 }}>در حال بارگذاری...</div>;

  return (
    <div className="studio-root">
      <header className="studio-header">
        <h1>🎨 استودیو اطلس</h1>
        <div className="studio-header-actions">
          {dirty && <span className="dirty-badge">● تغییرات ذخیره‌نشده</span>}
          <button onClick={handleSave} className="save-btn">💾 ذخیره همه</button>
          {status && <span className="status">{status}</span>}
        </div>
      </header>

      <div className="studio-body">
        <aside className="studio-sidebar">
          <TreeSidebar world={world} selected={selected} onSelect={setSelected} />
        </aside>

        <main className="studio-main">
          <NarrativeEditor
            narrative={selectedNarrative}
            onChange={handleNarrativeChange}
          />
          {errors.length > 0 && (
            <div className="validation-box">
              <strong>⚠️ خطاهای ساختاری:</strong>
              <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}
        </main>

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