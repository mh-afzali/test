import React from 'react';
import DateInput from './DateInput';

const POI_TYPES = [
  'city', 'landmark', 'temple', 'ruin', 'port',
  'village', 'fortress', 'forest', 'mountain',
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
    const tags = raw.split(',').map((t) => t.trim()).filter(Boolean);
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
        <div className="field-row">
          <label>from:</label>
          <DateInput value={version.from ?? 0} onChange={(v) => patch({ from: v })} />
        </div>
        <div className="field-row">
          <label>to:</label>
          <DateInput
            value={version.to}
            onChange={(v) => patch({ to: v })}
            allowEmpty
            emptyLabel="بی‌نهایت"
          />
        </div>

        <div className="field-row">
          <label>type:</label>
          <select value={version.type || 'city'} onChange={(e) => patch({ type: e.target.value })}>
            {POI_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="field-row">
          <label>title:</label>
          <input
            type="text"
            value={version.title || ''}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="نام نمایشی POI در این دوره"
          />
        </div>

        <textarea
          rows={3}
          value={version.description || ''}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="توضیحات..."
        />

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