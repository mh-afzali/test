import React from 'react';
import InfoVersionEditor from './InfoVersionEditor';
import PoiCoordsPicker from './PoiCoordsPicker';
import DateInput from './DateInput';

const POI_ICONS = [
  'city', 'landmark', 'temple', 'ruin', 'port',
  'village', 'fortress', 'forest', 'mountain',
];

export default function PoiEditor({
  poi,
  onChange,
  onDelete,
  onAddNarrative,
  onSelectNarrative,
  world,
  continent,
}) {
  if (!poi) return null;
  const patch = (p) => onChange({ ...poi, ...p });

  const updateVersion = (vi, newVersion) => {
    const infoVersions = [...(poi.infoVersions || [])];
    infoVersions[vi] = newVersion;
    patch({ infoVersions });
  };
  const removeVersion = (vi) => {
    patch({ infoVersions: (poi.infoVersions || []).filter((_, i) => i !== vi) });
  };
  const moveVersion = (vi, dir) => {
    const infoVersions = [...(poi.infoVersions || [])];
    const ni = vi + dir;
    if (ni < 0 || ni >= infoVersions.length) return;
    [infoVersions[vi], infoVersions[ni]] = [infoVersions[ni], infoVersions[vi]];
    patch({ infoVersions });
  };
  const addVersion = () => {
    patch({
      infoVersions: [
        ...(poi.infoVersions || []),
        { from: 0, to: null, type: 'city', title: poi.name || 'POI', description: '', tags: [] },
      ],
    });
  };

  const siblingPois = continent?.pois || [];

  return (
    <div className="poi-editor">
      <div className="editor-title-row">
        <h2 className="editor-title">📍 {poi.name || '(بدون نام)'}</h2>
        <button className="danger-text-btn" onClick={onDelete}>🗑 حذف POI</button>
      </div>

      <div className="narrative-fields">
        <div className="field-row">
          <label>id:</label>
          <input type="text" value={poi.id || ''} onChange={(e) => patch({ id: e.target.value })} />
        </div>
        <div className="field-row">
          <label>name:</label>
          <input type="text" value={poi.name || ''} onChange={(e) => patch({ name: e.target.value })} />
        </div>
        <div className="field-row">
          <label>type:</label>
          <select value={poi.type || 'city'} onChange={(e) => patch({ type: e.target.value })}>
            {POI_ICONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field-row">
          <label>icon:</label>
          <select value={poi.icon || 'city'} onChange={(e) => patch({ icon: e.target.value })}>
            {POI_ICONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field-row">
          <label>revealTime:</label>
          <DateInput
            value={poi.revealTime}
            onChange={(v) => patch({ revealTime: v })}
            allowEmpty
            emptyLabel="از ابتدا آشکار"
          />
        </div>
      </div>

      <h3>🗺 موقعیت روی نقشه</h3>
      {continent?.mapSvg ? (
        <PoiCoordsPicker
          mapSvg={continent.mapSvg}
          coords={poi.coords}
          onChange={(newCoords) => patch({ coords: newCoords })}
          siblingPois={siblingPois}
          currentPoiId={poi.id}
        />
      ) : (
        <p className="empty-note">
          این قاره <code>mapSvg</code> ندارد. ابتدا از ویرایشگر قاره، نقشه‌ی قاره را تعریف کن.
        </p>
      )}

      <div className="narrative-fields" style={{ marginTop: 8 }}>
        <div className="field-row">
          <label>coords.x:</label>
          <input
            type="number"
            value={poi.coords?.x ?? 0}
            onChange={(e) => patch({ coords: { ...poi.coords, x: Number(e.target.value) } })}
            style={{ maxWidth: 100 }}
          />
          <label>coords.y:</label>
          <input
            type="number"
            value={poi.coords?.y ?? 0}
            onChange={(e) => patch({ coords: { ...poi.coords, y: Number(e.target.value) } })}
            style={{ maxWidth: 100 }}
          />
        </div>
      </div>

      <h3>📋 infoVersions ({poi.infoVersions?.length || 0})</h3>
      <div className="sections-list">
        {(poi.infoVersions || []).map((v, vi) => (
          <InfoVersionEditor
            key={vi}
            version={v}
            index={vi}
            onChange={(nv) => updateVersion(vi, nv)}
            onRemove={() => removeVersion(vi)}
            onMoveUp={() => moveVersion(vi, -1)}
            onMoveDown={() => moveVersion(vi, +1)}
          />
        ))}
        <button type="button" className="add-btn" onClick={addVersion}>+ افزودن infoVersion</button>
      </div>

      <h3>📖 روایت‌های این POI ({poi.narratives?.length || 0})</h3>
      <div className="narrative-shortcuts">
        {(poi.narratives || []).map((n) => (
          <button key={n.id} className="narrative-shortcut" onClick={() => onSelectNarrative(n.id)}>
            <span className="tree-nar-kind">{n.kind}</span>
            <span>{n.title}</span>
          </button>
        ))}
        <button type="button" className="add-btn" onClick={onAddNarrative}>+ افزودن روایت جدید</button>
      </div>
    </div>
  );
}