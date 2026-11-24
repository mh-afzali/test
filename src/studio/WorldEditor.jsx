import React from 'react';
import DateInput from './DateInput';
import { formatDate } from '../utils/calendar';

export default function WorldEditor({ worldMeta, timeSteps, onChangeMeta, onChangeTimeSteps }) {
  const patchMeta = (p) => onChangeMeta({ ...worldMeta, ...p });

  const updateStep = (i, newStep) => {
    const next = [...timeSteps];
    next[i] = newStep;
    onChangeTimeSteps(next);
  };
  const removeStep = (i) => {
    onChangeTimeSteps(timeSteps.filter((_, idx) => idx !== i));
  };
  const moveStep = (i, dir) => {
    const ni = i + dir;
    if (ni < 0 || ni >= timeSteps.length) return;
    const next = [...timeSteps];
    [next[i], next[ni]] = [next[ni], next[i]];
    onChangeTimeSteps(next);
  };
  const addStep = () => {
    onChangeTimeSteps([...timeSteps, { advance: 30, note: 'گام جدید' }]);
  };

  const cumulativeTimes = [];
  let acc = worldMeta?.startTime ?? 0;
  for (const s of timeSteps) {
    acc += s.advance ?? 0;
    cumulativeTimes.push(acc);
  }

  return (
    <div className="world-editor">
      <div className="editor-title-row">
        <h2 className="editor-title">🌍 {worldMeta?.name || '(بدون نام)'}</h2>
      </div>

      <h3>📌 اطلاعات پایه</h3>
      <div className="narrative-fields">
        <div className="field-row">
          <label>id:</label>
          <input
            type="text"
            value={worldMeta?.id || ''}
            onChange={(e) => patchMeta({ id: e.target.value })}
          />
        </div>
        <div className="field-row">
          <label>name:</label>
          <input
            type="text"
            value={worldMeta?.name || ''}
            onChange={(e) => patchMeta({ name: e.target.value })}
          />
        </div>
        <div className="field-row">
          <label>mapSvg:</label>
          <input
            type="text"
            value={worldMeta?.mapSvg || ''}
            onChange={(e) => patchMeta({ mapSvg: e.target.value })}
            placeholder="world.svg (فعلاً استفاده نمی‌شود)"
          />
        </div>
        <div className="field-row">
          <label>تاریخ شروع داستان:</label>
          <DateInput
            value={worldMeta?.startTime ?? 0}
            onChange={(v) => patchMeta({ startTime: v })}
          />
        </div>
      </div>
      <p className="empty-note" style={{ fontSize: '0.78rem' }}>
        📅 «تاریخ شروع داستان» = زمانی که بازی از آن شروع می‌شود.
        مبدأ تقویم همیشه سال ۱ ماه ۱ روز ۱ است.
        <br />
        ⚠️ <code>id</code> در <code>gameState.js</code> استفاده می‌شود.
        <code>mapSvg</code> فعلاً در کد استفاده نمی‌شود.
      </p>

      <h3>⏳ گام‌های زمانی (timeSteps) — {timeSteps.length} گام</h3>
      <p className="empty-note" style={{ fontSize: '0.78rem' }}>
        هر گام، مقدار <code>advance</code> (به روز) را به زمان فعلی اضافه می‌کند.
        جمع همه‌ی گام‌ها + startTime = حداکثر زمان بازی.
      </p>

      <div className="timesteps-list">
        {timeSteps.map((step, i) => (
          <div key={i} className="timestep-row">
            <span className="timestep-index">#{i + 1}</span>
            <span className="timestep-cumulative" title="زمان تجمعی">
              → {formatDate(cumulativeTimes[i])}
            </span>
            <input
              type="number"
              className="timestep-advance"
              value={step.advance ?? 0}
              onChange={(e) =>
                updateStep(i, { ...step, advance: Number(e.target.value) })
              }
              title="advance (روز)"
              style={{ width: 70 }}
            />
            <span className="timestep-advance-label">روز</span>
            <input
              type="text"
              className="timestep-note"
              value={step.note || ''}
              onChange={(e) => updateStep(i, { ...step, note: e.target.value })}
              placeholder="توضیح گام"
            />
            <div className="block-actions">
              <button type="button" onClick={() => moveStep(i, -1)} title="بالا">↑</button>
              <button type="button" onClick={() => moveStep(i, +1)} title="پایین">↓</button>
              <button type="button" className="danger" onClick={() => removeStep(i)} title="حذف">✕</button>
            </div>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addStep}>
          + افزودن گام زمانی
        </button>
      </div>

      <div className="timesteps-summary">
        <div className="sim-stat">
          <div className="sim-stat-value">
            {formatDate(cumulativeTimes[cumulativeTimes.length - 1] ?? worldMeta?.startTime ?? 0)}
          </div>
          <div className="sim-stat-label">حداکثر زمان بازی</div>
        </div>
        <div className="sim-stat">
          <div className="sim-stat-value">{timeSteps.length}</div>
          <div className="sim-stat-label">تعداد گام</div>
        </div>
      </div>
    </div>
  );
}