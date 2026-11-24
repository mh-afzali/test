import React from 'react';
import DateInput from './DateInput';

const STATUS_OPTIONS = ['زنده', 'مرده', 'مفقود', 'اسطوره'];

export default function CharacterEditor({ character, world, onChange, onDelete }) {
  if (!character) return null;
  const patch = (p) => onChange({ ...character, ...p });

  const allPois = world.continents.flatMap((c) =>
    c.pois.map((p) => ({ id: p.id, name: p.name, continent: c.name }))
  );

  const updateVersion = (vi, nv) => {
    const versions = [...(character.versions || [])];
    versions[vi] = nv;
    patch({ versions });
  };
  const removeVersion = (vi) => {
    patch({ versions: (character.versions || []).filter((_, i) => i !== vi) });
  };
  const moveVersion = (vi, dir) => {
    const versions = [...(character.versions || [])];
    const ni = vi + dir;
    if (ni < 0 || ni >= versions.length) return;
    [versions[vi], versions[ni]] = [versions[ni], versions[vi]];
    patch({ versions });
  };
  const addVersion = () => {
    patch({
      versions: [
        ...(character.versions || []),
        { from: 0, to: null, status: 'زنده', locationId: null, bio: '' },
      ],
    });
  };

  const changeTitles = (raw) => {
    patch({ titles: raw.split(',').map((t) => t.trim()).filter(Boolean) });
  };

  return (
    <div className="character-editor">
      <div className="editor-title-row">
        <h2 className="editor-title">👤 {character.name || '(بدون نام)'}</h2>
        <button className="danger-text-btn" onClick={onDelete}>🗑 حذف شخصیت</button>
      </div>

      <div className="narrative-fields">
        <div className="field-row">
          <label>id:</label>
          <input type="text" value={character.id || ''} onChange={(e) => patch({ id: e.target.value })} />
        </div>
        <div className="field-row">
          <label>name:</label>
          <input type="text" value={character.name || ''} onChange={(e) => patch({ name: e.target.value })} />
        </div>
        <div className="field-row">
          <label>titles:</label>
          <input
            type="text"
            value={(character.titles || []).join(', ')}
            onChange={(e) => changeTitles(e.target.value)}
            placeholder="با کاما جدا کن: ملکه شمال, بنیان‌گذار اور"
          />
        </div>
      </div>

      <h3>📅 versions ({character.versions?.length || 0})</h3>
      <div className="sections-list">
        {(character.versions || []).map((v, vi) => (
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
                <select value={v.status || 'زنده'} onChange={(e) => updateVersion(vi, { ...v, status: e.target.value })}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field-row">
                <label>locationId:</label>
                <select
                  value={v.locationId ?? ''}
                  onChange={(e) => updateVersion(vi, { ...v, locationId: e.target.value || null })}
                >
                  <option value="">— بدون مکان —</option>
                  {allPois.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.continent})</option>
                  ))}
                </select>
              </div>
              <textarea
                rows={3}
                value={v.bio || ''}
                onChange={(e) => updateVersion(vi, { ...v, bio: e.target.value })}
                placeholder="زندگی‌نامه در این دوره..."
              />
            </div>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addVersion}>+ افزودن version</button>
      </div>
    </div>
  );
}