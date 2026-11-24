import React from 'react';

// هماهنگ با POI_ICONS در PoiEditor و ICONS در ContinentView
const POI_TYPES = [
  'city',
  'landmark',
  'temple',
  'ruin',
  'port',
  'village',
  'fortress',
  'forest',
  'mountain',
];

export default function InfoVersionEditor({
  version,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}) {
  const patch = (p) => onChange({ ...version, ...p });

  const changeTags = (raw) => {
    const tags = raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    patch({ tags });
  };

  return (
    <div className="block-editor">
      <div className="block-editor-header">
        <span className="block-index">نسخه #{index + 1}</span>
        <div className="block-actions">
          <button type="button" onClick={onMoveUp} title="بالا">↑</button>
          <button type="button" onClick={onMoveDown} title="پایین">↓</button>
          <button type="button" className="danger" onClick={onRemove} title="حذف">✕</button>
        </div>
      </div>

      <div className="block-fields">
        {/* بازه زمانی */}
        <div className="field-row">
          <label>from:</label>
          <input
            type="number"
            value={version.from ?? 0}
            onChange={(e) => patch({ from: Number(e.target.value) })}
          />
          <label>to:</label>
          <input
            type="number"
            value={version.to ?? ''}
            onChange={(e) =>
              patch({ to: e.target.value === '' ? null : Number(e.target.value) })
            }
            placeholder="خالی = بی‌نهایت"
          />
        </div>

        {/* نوع */}
        <div className="field-row">
          <label>type:</label>
          <select
            value={version.type || 'city'}
            onChange={(e) => patch({ type: e.target.value })}
          >
            {POI_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* عنوان */}
        <div className="field-row">
          <label>title:</label>
          <input
            type="text"
            value={version.title || ''}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="نام نمایشی POI در این دوره"
          />
        </div>

        {/* توضیحات */}
        <textarea
          rows={3}
          value={version.description || ''}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="توضیحات..."
        />

        {/* تگ‌ها */}
        <div className="field-row">
          <label>tags:</label>
          <input
            type="text"
            value={(version.tags || []).join(', ')}
            onChange={(e) => changeTags(e.target.value)}
            placeholder="با کاما جدا کن: پایتخت, بندری"
          />
        </div>
      </div>
    </div>
  );
}