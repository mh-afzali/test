import React from 'react';
import ContentBlockEditor from './ContentBlockEditor';
import DateInput from './DateInput';

export default function SectionEditor({ section, index, onChange, onRemove, onMoveUp, onMoveDown }) {
  const patch = (p) => onChange({ ...section, ...p });

  const addBlock = () => {
    patch({ content: [...(section.content || []), { type: 'text', value: '' }] });
  };

  const updateBlock = (bi, newBlock) => {
    const content = [...(section.content || [])];
    content[bi] = newBlock;
    patch({ content });
  };

  const removeBlock = (bi) => {
    patch({ content: (section.content || []).filter((_, i) => i !== bi) });
  };

  const moveBlock = (bi, dir) => {
    const content = [...(section.content || [])];
    const ni = bi + dir;
    if (ni < 0 || ni >= content.length) return;
    [content[bi], content[ni]] = [content[ni], content[bi]];
    patch({ content });
  };

  return (
    <div className="section-editor">
      <div className="section-editor-header">
        <span className="section-index">بخش #{index + 1}</span>
        <div className="block-actions">
          <button type="button" onClick={onMoveUp}>↑</button>
          <button type="button" onClick={onMoveDown}>↓</button>
          <button type="button" className="danger" onClick={onRemove}>✕</button>
        </div>
      </div>

      <div className="section-fields">
        <div className="field-row">
          <label>id:</label>
          <input
            type="text"
            value={section.id || ''}
            onChange={(e) => patch({ id: e.target.value })}
            placeholder="s1"
          />
        </div>
        <div className="field-row">
          <label>triggerTime:</label>
          <DateInput
            value={section.triggerTime ?? 0}
            onChange={(v) => patch({ triggerTime: v })}
          />
        </div>
        <div className="field-row">
          <label>title:</label>
          <input
            type="text"
            value={section.title || ''}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="عنوان بخش (اختیاری)"
          />
        </div>
      </div>

      <div className="blocks-list">
        {(section.content || []).map((block, bi) => (
          <ContentBlockEditor
            key={bi}
            block={block}
            index={bi}
            onChange={(b) => updateBlock(bi, b)}
            onRemove={() => removeBlock(bi)}
            onMoveUp={() => moveBlock(bi, -1)}
            onMoveDown={() => moveBlock(bi, +1)}
          />
        ))}
        <button type="button" className="add-btn" onClick={addBlock}>+ افزودن بلاک</button>
      </div>
    </div>
  );
}