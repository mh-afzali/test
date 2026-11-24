import React from 'react';
import DateInput from './DateInput';

const EVENT_TYPES = ['war', 'peace', 'disaster', 'discovery', 'political', 'religious', 'natural'];
const STATUS_OPTIONS = ['در جریان', 'پایان‌یافته', 'آینده'];

export default function EventEditor({ event, world, characters, events, onChange, onDelete }) {
  if (!event) return null;
  const patch = (p) => onChange({ ...event, ...p });

  const allPois = world.continents.flatMap((c) =>
    c.pois.map((p) => ({ id: p.id, name: p.name, continent: c.name }))
  );

  const updateVersion = (vi, nv) => {
    const versions = [...(event.versions || [])];
    versions[vi] = nv;
    patch({ versions });
  };
  const removeVersion = (vi) => {
    patch({ versions: (event.versions || []).filter((_, i) => i !== vi) });
  };
  const moveVersion = (vi, dir) => {
    const versions = [...(event.versions || [])];
    const ni = vi + dir;
    if (ni < 0 || ni >= versions.length) return;
    [versions[vi], versions[ni]] = [versions[ni], versions[vi]];
    patch({ versions });
  };
  const addVersion = () => {
    patch({
      versions: [
        ...(event.versions || []),
        { from: event.startTime ?? 0, to: null, status: 'در جریان', summary: '' },
      ],
    });
  };

  const toggleLocation = (poiId) => {
    const set = new Set(event.locationIds || []);
    if (set.has(poiId)) set.delete(poiId);
    else set.add(poiId);
    patch({ locationIds: Array.from(set) });
  };

  const toggleParticipant = (charId) => {
    const set = new Set(event.participants || []);
    if (set.has(charId)) set.delete(charId);
    else set.add(charId);
    patch({ participants: Array.from(set) });
  };

  const toggleRelated = (eventId) => {
    if (eventId === event.id) return;
    const set = new Set(event.relatedEvents || []);
    if (set.has(eventId)) set.delete(eventId);
    else set.add(eventId);
    patch({ relatedEvents: Array.from(set) });
  };

  return (
    <div className="event-editor">
      <div className="editor-title-row">
        <h2 className="editor-title">⚔️ {event.name || '(بدون نام)'}</h2>
        <button className="danger-text-btn" onClick={onDelete}>🗑 حذف رویداد</button>
      </div>

      <div className="narrative-fields">
        <div className="field-row">
          <label>id:</label>
          <input type="text" value={event.id || ''} onChange={(e) => patch({ id: e.target.value })} />
        </div>
        <div className="field-row">
          <label>name:</label>
          <input type="text" value={event.name || ''} onChange={(e) => patch({ name: e.target.value })} />
        </div>
        <div className="field-row">
          <label>eventType:</label>
          <select value={event.eventType || 'war'} onChange={(e) => patch({ eventType: e.target.value })}>
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field-row">
          <label>startTime:</label>
          <DateInput value={event.startTime ?? 0} onChange={(v) => patch({ startTime: v })} />
        </div>
        <div className="field-row">
          <label>endTime:</label>
          <DateInput
            value={event.endTime}
            onChange={(v) => patch({ endTime: v })}
            allowEmpty
            emptyLabel="بی‌نهایت"
          />
        </div>
      </div>

      <h3>📍 مکان‌ها ({event.locationIds?.length || 0})</h3>
      <div className="multiselect-box">
        {allPois.map((p) => (
          <label key={p.id} className="multiselect-item">
            <input
              type="checkbox"
              checked={(event.locationIds || []).includes(p.id)}
              onChange={() => toggleLocation(p.id)}
            />
            <span>{p.name}</span>
            <small>{p.continent}</small>
          </label>
        ))}
        {allPois.length === 0 && <p className="empty-note">هیچ POIای وجود ندارد.</p>}
      </div>

      <h3>👥 شرکت‌کنندگان ({event.participants?.length || 0})</h3>
      <div className="multiselect-box">
        {(characters || []).map((c) => (
          <label key={c.id} className="multiselect-item">
            <input
              type="checkbox"
              checked={(event.participants || []).includes(c.id)}
              onChange={() => toggleParticipant(c.id)}
            />
            <span>{c.name}</span>
            <small>{c.id}</small>
          </label>
        ))}
        {(characters || []).length === 0 && <p className="empty-note">هیچ شخصیتی وجود ندارد.</p>}
      </div>

      <h3>🔗 رویدادهای مرتبط ({event.relatedEvents?.length || 0})</h3>
      <div className="multiselect-box">
        {(events || []).filter((e) => e.id !== event.id).map((e) => (
          <label key={e.id} className="multiselect-item">
            <input
              type="checkbox"
              checked={(event.relatedEvents || []).includes(e.id)}
              onChange={() => toggleRelated(e.id)}
            />
            <span>{e.name}</span>
            <small>{e.id}</small>
          </label>
        ))}
      </div>

      <h3>📅 versions ({event.versions?.length || 0})</h3>
      <div className="sections-list">
        {(event.versions || []).map((v, vi) => (
          <div key={vi} className="block-editor">
            <div className="block-editor-header">
              <span className="block-index">نسخه #{vi + 1}</span>
              <div className="block-actions">
                <button type="button" onClick={() => moveVersion(vi, -1)}>↑</button>
                <button type="button" onClick={() => moveVersion(vi, +1)}>↓</button>
                <button type="button" className="danger" onClick={() => removeVersion(vi)}>✕</button>
              </div>
            </div>
            <div className="block-fields">
              <div className="field-row">
                <label>from:</label>
                <DateInput
                  value={v.from ?? 0}
                  onChange={(nv) => updateVersion(vi, { ...v, from: nv })}
                />
              </div>
              <div className="field-row">
                <label>to:</label>
                <DateInput
                  value={v.to}
                  onChange={(nv) => updateVersion(vi, { ...v, to: nv })}
                  allowEmpty
                  emptyLabel="بی‌نهایت"
                />
              </div>
              <div className="field-row">
                <label>status:</label>
                <select value={v.status || 'در جریان'} onChange={(e) => updateVersion(vi, { ...v, status: e.target.value })}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <textarea
                rows={3}
                value={v.summary || ''}
                onChange={(e) => updateVersion(vi, { ...v, summary: e.target.value })}
                placeholder="خلاصه در این دوره..."
              />
            </div>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addVersion}>+ افزودن version</button>
      </div>
    </div>
  );
}