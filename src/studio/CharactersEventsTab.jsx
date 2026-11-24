import React, { useState } from 'react';
import CharacterEditor from './CharacterEditor';
import EventEditor from './EventEditor';

export default function CharactersEventsTab({
  world,
  characters,
  events,
  onAddCharacter,
  onRemoveCharacter,
  onChangeCharacter,
  onAddEvent,
  onRemoveEvent,
  onChangeEvent,
}) {
  const [subTab, setSubTab] = useState('characters'); // 'characters' | 'events'
  const [selectedCharId, setSelectedCharId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const selectedChar = (characters || []).find((c) => c.id === selectedCharId) || null;
  const selectedEvent = (events || []).find((e) => e.id === selectedEventId) || null;

  return (
    <div className="characters-events-tab">
      <div className="ce-subtabs">
        <button
          className={`ce-subtab ${subTab === 'characters' ? 'active' : ''}`}
          onClick={() => setSubTab('characters')}
        >
          👤 شخصیت‌ها ({characters?.length || 0})
        </button>
        <button
          className={`ce-subtab ${subTab === 'events' ? 'active' : ''}`}
          onClick={() => setSubTab('events')}
        >
          ⚔️ رویدادها ({events?.length || 0})
        </button>
      </div>

      {subTab === 'characters' && (
        <div className="ce-grid">
          <aside className="ce-list">
            <button
              className="add-btn"
              onClick={() => {
                const newChar = onAddCharacter();
                if (newChar) setSelectedCharId(newChar.id);
              }}
            >
              + شخصیت جدید
            </button>
            <ul>
              {(characters || []).map((c) => (
                <li key={c.id}>
                  <button
                    className={`ce-list-item ${selectedCharId === c.id ? 'active' : ''}`}
                    onClick={() => setSelectedCharId(c.id)}
                  >
                    <span>{c.name}</span>
                    <small>{c.id}</small>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <main className="ce-editor">
            {selectedChar ? (
              <CharacterEditor
                character={selectedChar}
                world={world}
                onChange={(nc) => onChangeCharacter(nc.id, nc)}
                onDelete={() => {
                  if (window.confirm(`حذف شخصیت «${selectedChar.name}»؟`)) {
                    onRemoveCharacter(selectedChar.id);
                    setSelectedCharId(null);
                  }
                }}
              />
            ) : (
              <div className="empty-note">یک شخصیت انتخاب کن یا شخصیت جدید بساز.</div>
            )}
          </main>
        </div>
      )}

      {subTab === 'events' && (
        <div className="ce-grid">
          <aside className="ce-list">
            <button
              className="add-btn"
              onClick={() => {
                const newEv = onAddEvent();
                if (newEv) setSelectedEventId(newEv.id);
              }}
            >
              + رویداد جدید
            </button>
            <ul>
              {(events || []).map((e) => (
                <li key={e.id}>
                  <button
                    className={`ce-list-item ${selectedEventId === e.id ? 'active' : ''}`}
                    onClick={() => setSelectedEventId(e.id)}
                  >
                    <span>{e.name}</span>
                    <small>{e.id}</small>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <main className="ce-editor">
            {selectedEvent ? (
              <EventEditor
                event={selectedEvent}
                world={world}
                characters={characters}
                events={events}
                onChange={(ne) => onChangeEvent(ne.id, ne)}
                onDelete={() => {
                  if (window.confirm(`حذف رویداد «${selectedEvent.name}»؟`)) {
                    onRemoveEvent(selectedEvent.id);
                    setSelectedEventId(null);
                  }
                }}
              />
            ) : (
              <div className="empty-note">یک رویداد انتخاب کن یا رویداد جدید بساز.</div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}