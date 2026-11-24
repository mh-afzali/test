import React from 'react';
import { getInfoAt, getNarrativeStatus } from '../engine/narrative';

const KIND_LABELS = {
  lore: 'مدخل روایی',
  story: 'داستان',
  chronicle: 'وقایع‌نگاری',
  legend: 'افسانه',
  scene: 'سکانس',
};

export default function PoiPanel({ poi, state, worldData, onSelectNarrative, onOpenEvent, onBack }) {
  const info = getInfoAt(poi, state.time);

  const visibleNarratives = poi.narratives.filter((n) => state.narratives[n.id]?.unlocked);

  // رویدادهایی که در این مکان اتفاق افتادن و بازیکن دیدشون
  const seenEventIds = new Set(state.seenEvents || []);
  const localEvents = (worldData.events || []).filter(
    (ev) =>
      (ev.locationIds || []).includes(poi.id) &&
      seenEventIds.has(ev.id)
  );

  return (
    <div className="poi-panel">
      <button className="back-btn" onClick={onBack}>← بازگشت</button>

      <header className="poi-header">
        <h2>{info.title}</h2>
        <span className="poi-type-tag">{info.type}</span>
        <span className="poi-time-tag">سال {state.time}</span>
      </header>

      <p className="poi-description">{info.description}</p>
      {info.tags?.length > 0 && (
        <div className="poi-tags">
          {info.tags.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      {/* رویدادها */}
      {localEvents.length > 0 && (
        <section className="events-section">
          <h3>رویدادها</h3>
          <ul className="event-list">
            {localEvents.map((ev) => {
              const version = getVersionAt(ev, state.time);
              return (
                <li key={ev.id}>
                  <button className="event-item" onClick={() => onOpenEvent(ev)}>
                    <span className="event-icon">⚔</span>
                    <span className="event-name">{ev.name}</span>
                    {version && (
                      <span className={`status-tag status-${version.status}`}>{version.status}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* روایت‌ها */}
      <section className="narratives-section">
        <h3>روایت‌ها</h3>
        {visibleNarratives.length === 0 && (
          <p className="empty-note">هنوز روایتی برای این مکان باز نشده است.</p>
        )}
        <ul className="narrative-list">
          {visibleNarratives.map((nar, idx) => {
            const status = getNarrativeStatus(nar, state);
            return (
              <li
                key={nar.id}
                className="narrative-enter"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <button className="narrative-item" onClick={() => onSelectNarrative(nar.id)}>
                  <span className="narrative-title">{nar.title}</span>
                  <span className="narrative-kind">{KIND_LABELS[nar.kind] || nar.kind}</span>
                  {status === 'has_new' && <span className="unread-dot" title="نخوانده">●</span>}
                  {status === 'archived' && <span className="archived-tag">آرشیو</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function getVersionAt(entity, time) {
  for (const v of entity.versions || []) {
    if (v.from <= time && (v.to == null || time < v.to)) return v;
  }
  return (entity.versions || [])[0] || null;
}