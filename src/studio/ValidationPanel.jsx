import React, { useMemo, useState } from 'react';

const LEVEL_LABEL = { error: '❌ خطا', warning: '⚠️ هشدار' };

export default function ValidationPanel({ issues, onJump }) {
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(true);

  const filtered = useMemo(() => {
    if (filter === 'all') return issues;
    return issues.filter((i) => i.level === filter);
  }, [issues, filter]);

  const errorCount = issues.filter((i) => i.level === 'error').length;
  const warnCount = issues.filter((i) => i.level === 'warning').length;

  return (
    <div className={`validation-panel ${open ? 'open' : 'closed'}`}>
      <div className="validation-panel-header" onClick={() => setOpen(!open)}>
        <span>
          اعتبارسنجی{' '}
          {errorCount > 0 && <span className="vcount error">{errorCount} خطا</span>}
          {warnCount > 0 && <span className="vcount warn">{warnCount} هشدار</span>}
          {issues.length === 0 && <span className="vcount ok">✓ سالم</span>}
        </span>
        <span className="toggle">{open ? '▼' : '▲'}</span>
      </div>

      {open && (
        <>
          <div className="validation-filters">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>همه ({issues.length})</button>
            <button className={filter === 'error' ? 'active' : ''} onClick={() => setFilter('error')}>خطاها ({errorCount})</button>
            <button className={filter === 'warning' ? 'active' : ''} onClick={() => setFilter('warning')}>هشدارها ({warnCount})</button>
          </div>

          <ul className="validation-list">
            {filtered.length === 0 && (
              <li className="validation-empty">موردی برای نمایش نیست. 🎉</li>
            )}
            {filtered.map((issue, i) => (
              <li
                key={i}
                className={`validation-item ${issue.level}`}
                onClick={() => onJump?.(issue)}
                title={issue.code}
              >
                <span className="vlevel">{LEVEL_LABEL[issue.level]}</span>
                <span className="vmsg">{issue.message}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}