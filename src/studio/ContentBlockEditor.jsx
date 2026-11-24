import React from 'react';

const BLOCK_TYPES = [
  { value: 'text', label: 'متن' },
  { value: 'dialogue', label: 'دیالوگ' },
  { value: 'quote', label: 'نقل‌قول' },
  { value: 'callout', label: 'یادداشت (callout)' },
  { value: 'scene', label: 'صحنه' },
  { value: 'image', label: 'تصویر' },
  { value: 'divider', label: 'جداکننده' },
];

const CALLOUT_VARIANTS = ['note', 'warning', 'lore'];

export default function ContentBlockEditor({ block, index, onChange, onRemove, onMoveUp, onMoveDown }) {
  const patch = (p) => onChange({ ...block, ...p });

  const changeType = (newType) => {
    // وقتی type عوض می‌شود، فیلدهای قبلی را نگه می‌داریم ولی فیلدهای پایه را ست می‌کنیم
    const base = { type: newType };
    if (newType === 'text' || newType === 'callout') base.value = block.value || '';
    if (newType === 'dialogue') { base.speaker = block.speaker || ''; base.value = block.value || ''; }
    if (newType === 'quote') { base.value = block.value || ''; base.source = block.source || ''; }
    if (newType === 'scene') {
      base.location = block.location || '';
      base.time = block.time || '';
      base.value = block.value || '';
      base.source = block.source || '';
    }
    if (newType === 'image') { base.src = block.src || ''; base.alt = block.alt || ''; base.caption = block.caption || ''; }
    if (newType === 'callout') base.variant = block.variant || 'note';
    onChange(base);
  };

  return (
    <div className="block-editor">
      <div className="block-editor-header">
        <span className="block-index">#{index + 1}</span>
        <select value={block.type} onChange={(e) => changeType(e.target.value)}>
          {BLOCK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <div className="block-actions">
          <button type="button" onClick={onMoveUp} title="بالا">↑</button>
          <button type="button" onClick={onMoveDown} title="پایین">↓</button>
          <button type="button" className="danger" onClick={onRemove} title="حذف">✕</button>
        </div>
      </div>

      <div className="block-fields">
        {block.type === 'text' && (
          <textarea
            rows={3}
            value={block.value || ''}
            onChange={(e) => patch({ value: e.target.value })}
            placeholder="متن... (می‌توانی از [[char:نام]] و [[poi:نام]] و [[event:نام]] استفاده کنی)"
          />
        )}

        {block.type === 'callout' && (
          <>
            <div className="field-row">
              <label>variant:</label>
              <select value={block.variant || 'note'} onChange={(e) => patch({ variant: e.target.value })}>
                {CALLOUT_VARIANTS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <textarea
              rows={2}
              value={block.value || ''}
              onChange={(e) => patch({ value: e.target.value })}
              placeholder="متن یادداشت..."
            />
          </>
        )}

        {block.type === 'dialogue' && (
          <>
            <input
              type="text"
              value={block.speaker || ''}
              onChange={(e) => patch({ speaker: e.target.value })}
              placeholder="گوینده"
            />
            <textarea
              rows={2}
              value={block.value || ''}
              onChange={(e) => patch({ value: e.target.value })}
              placeholder="متن دیالوگ..."
            />
          </>
        )}

        {block.type === 'quote' && (
          <>
            <textarea
              rows={2}
              value={block.value || ''}
              onChange={(e) => patch({ value: e.target.value })}
              placeholder="متن نقل‌قول..."
            />
            <input
              type="text"
              value={block.source || ''}
              onChange={(e) => patch({ source: e.target.value })}
              placeholder="منبع (اختیاری)"
            />
          </>
        )}

        {block.type === 'scene' && (
          <>
            <div className="field-row">
              <input
                type="text"
                value={block.location || ''}
                onChange={(e) => patch({ location: e.target.value })}
                placeholder="مکان (مثلاً تالار شورا)"
              />
              <input
                type="text"
                value={block.time || ''}
                onChange={(e) => patch({ time: e.target.value })}
                placeholder="زمان (مثلاً سال ۳۴۸)"
              />
            </div>
            <textarea
              rows={2}
              value={block.value || ''}
              onChange={(e) => patch({ value: e.target.value })}
              placeholder="متن صحنه..."
            />
            <input
              type="text"
              value={block.source || ''}
              onChange={(e) => patch({ source: e.target.value })}
              placeholder="منبع (اختیاری)"
            />
          </>
        )}

        {block.type === 'image' && (
          <>
            <input
              type="text"
              value={block.src || ''}
              onChange={(e) => patch({ src: e.target.value })}
              placeholder="آدرس تصویر (src)"
            />
            <input
              type="text"
              value={block.alt || ''}
              onChange={(e) => patch({ alt: e.target.value })}
              placeholder="alt"
            />
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => patch({ caption: e.target.value })}
              placeholder="کپشن (اختیاری)"
            />
          </>
        )}

        {block.type === 'divider' && (
          <p className="empty-note">جداکننده — فیلدی ندارد.</p>
        )}
      </div>
    </div>
  );
}