import React from 'react';
import SectionEditor from './SectionEditor';

export default function NarrativeEditor({ narrative, onChange }) {
  if (!narrative) return <div className="empty-note">یک روایت از سمت راست انتخاب کن.</div>;

  const patch = (p) => onChange({ ...narrative, ...p });

  const updateSection = (si, newSection) => {
    const sections = [...(narrative.sections || [])];
    sections[si] = newSection;
    patch({ sections });
  };

  const removeSection = (si) => {
    patch({ sections: (narrative.sections || []).filter((_, i) => i !== si) });
  };

  const moveSection = (si, dir) => {
    const sections = [...(narrative.sections || [])];
    const ni = si + dir;
    if (ni < 0 || ni >= sections.length) return;
    [sections[si], sections[ni]] = [sections[ni], sections[si]];
    patch({ sections });
  };

  const addSection = () => {
    const id = `s${(narrative.sections?.length || 0) + 1}`;
    patch({ sections: [...(narrative.sections || []), { id, triggerTime: 0, content: [] }] });
  };

  const updateUnlock = (newUnlock) => patch({ unlock: newUnlock });

  return (
    <div className="narrative-editor">
      <h2 className="editor-title">{narrative.title || '(بدون عنوان)'}</h2>

      <div className="narrative-fields">
        <div className="field-row">
          <label>id:</label>
          <input type="text" value={narrative.id || ''} onChange={(e) => patch({ id: e.target.value })} />
        </div>
        <div className="field-row">
          <label>title:</label>
          <input type="text" value={narrative.title || ''} onChange={(e) => patch({ title: e.target.value })} />
        </div>
        <div className="field-row">
          <label>kind:</label>
          <select value={narrative.kind || 'lore'} onChange={(e) => patch({ kind: e.target.value })}>
            <option value="lore">lore</option>
            <option value="story">story</option>
            <option value="scene">scene</option>
          </select>
        </div>
        <div className="field-row">
          <label>endTime:</label>
          <input
            type="number"
            value={narrative.endTime ?? ''}
            onChange={(e) => patch({ endTime: e.target.value === '' ? null : Number(e.target.value) })}
            placeholder="خالی = بی‌نهایت"
          />
        </div>
        <div className="field-row unlock-row">
          <label>unlock:</label>
          <UnlockEditor unlock={narrative.unlock} onChange={updateUnlock} />
        </div>
      </div>

      <h3>بخش‌ها ({narrative.sections?.length || 0})</h3>
      <div className="sections-list">
        {(narrative.sections || []).map((s, si) => (
          <SectionEditor
            key={si}
            section={s}
            index={si}
            onChange={(ns) => updateSection(si, ns)}
            onRemove={() => removeSection(si)}
            onMoveUp={() => moveSection(si, -1)}
            onMoveDown={() => moveSection(si, +1)}
          />
        ))}
        <button type="button" className="add-btn" onClick={addSection}>+ افزودن بخش</button>
      </div>
    </div>
  );
}

function UnlockEditor({ unlock, onChange }) {
  const current = unlock?.type || 'time';
  return (
    <div className="unlock-editor">
      <select value={current} onChange={(e) => {
        if (e.target.value === 'time') onChange({ type: 'time', time: 0 });
        else onChange({ type: 'story_read', storyId: '' });
      }}>
        <option value="time">time</option>
        <option value="story_read">story_read</option>
      </select>
      {current === 'time' && (
        <input
          type="number"
          value={unlock?.time ?? 0}
          onChange={(e) => onChange({ type: 'time', time: Number(e.target.value) })}
        />
      )}
      {current === 'story_read' && (
        <input
          type="text"
          value={unlock?.storyId || ''}
          onChange={(e) => onChange({ type: 'story_read', storyId: e.target.value })}
          placeholder="storyId"
        />
      )}
    </div>
  );
}