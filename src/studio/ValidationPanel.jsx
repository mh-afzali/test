import React, { useMemo, useState } from 'react';

const LEVEL_LABEL = { error: '❌', warning: '⚠️' };
const GROUP_LABELS = {
  world: '🌍 جهان',
  continent: '🗺 قاره',
  poi: '📍 POI',
  narrative: '📖 روایت',
  character: '👤 شخصیت',
  event: '⚔️ رویداد',
  general: '📌 عمومی',
};
const GROUP_ORDER = ['world', 'continent', 'poi', 'narrative', 'character', 'event', 'general'];

export default function ValidationPanel({ issues, onJump }) {
  const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 'error' | 'warning'
  const [groupFilter, setGroupFilter] = useState('all'); // 'all' | one of GROUP_ORDER
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  const filtered = useMemo(() => {
    return issues.filter((i) => {
      if (levelFilter !== 'all' && i.level !== levelFilter) return false;
      if (groupFilter !== 'all' && i.group !== groupFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !i.message.toLowerCase().includes(q) &&
          !i.code.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [issues, levelFilter, groupFilter, search]);

  const grouped = useMemo(() => {
    const g = {};
    for (const kind of GROUP_ORDER) g[kind] = [];
    for (const i of filtered) {
      if (!g[i.group]) g[i.group] = [];
      g[i.group].push(i);
    }
    return g;
  }, [filtered]);

  // شمارنده‌ها بر اساس همه‌ی issues (نه filtered) برای نمایش در گروه‌ها
  const groupStats = useMemo(() => {
    const s = {};
    for (const kind of GROUP_ORDER) s[kind] = { error: 0, warning: 0, total: 0 };
    for (const i of issues) {
      if (!s[i.group]) s[i.group] = { error: 0, warning: 0, total: 0 };
      s[i.group][i.level] = (s[i.group][i.level] || 0) + 1;
      s[i.group].total++;
    }
    return s;
  }, [issues]);

  const errorCount = issues.filter((i) => i.level === 'error').length;
  const warnCount = issues.filter((i) => i.level === 'warning').length;

  const toggleGroup = (kind) => {
    const next = new Set(collapsedGroups);
    if (next.has(kind)) next.delete(kind);
    else next.add(kind);
    setCollapsedGroups(next);
  };

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
          {/* فیلترها */}
          <div className="validation-controls">
            <input
              type="text"
              className="validation-search"
              placeholder="🔍 جستجو در خطاها..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="validation-filters">
              <button
                className={levelFilter === 'all' ? 'active' : ''}
                onClick={() => setLevelFilter('all')}
              >
                همه
              </button>
              <button
                className={levelFilter === 'error' ? 'active' : ''}
                onClick={() => setLevelFilter('error')}
              >
                خطا ({errorCount})
              </button>
              <button
                className={levelFilter === 'warning' ? 'active' : ''}
                onClick={() => setLevelFilter('warning')}
              >
                هشدار ({warnCount})
              </button>
            </div>
          </div>

          {/* فیلتر گروه */}
          <div className="validation-group-filters">
            <button
              className={`vgf-btn ${groupFilter === 'all' ? 'active' : ''}`}
              onClick={() => setGroupFilter('all')}
            >
              همه
            </button>
            {GROUP_ORDER.map((kind) => {
              const st = groupStats[kind] || { total: 0 };
              if (st.total === 0) return null;
              return (
                <button
                  key={kind}
                  className={`vgf-btn ${groupFilter === kind ? 'active' : ''}`}
                  onClick={() => setGroupFilter(kind)}
                >
                  {GROUP_LABELS[kind]}
                  {st.error > 0 && <span className="vgf-count error">{st.error}</span>}
                  {st.warning > 0 && <span className="vgf-count warn">{st.warning}</span>}
                </button>
              );
            })}
          </div>

          {/* لیست گروه‌بندی‌شده */}
          <ul className="validation-list">
            {filtered.length === 0 && (
              <li className="validation-empty">
                {issues.length === 0
                  ? 'همه‌چیز سالم است. 🎉'
                  : 'موردی با این فیلتر پیدا نشد.'}
              </li>
            )}

            {GROUP_ORDER.map((kind) => {
              const items = grouped[kind] || [];
              if (items.length === 0) return null;
              const isCollapsed = collapsedGroups.has(kind);
              const st = groupStats[kind] || { error: 0, warning: 0, total: 0 };
              return (
                <li key={kind} className="validation-group">
                  <button
                    className="validation-group-header"
                    onClick={() => toggleGroup(kind)}
                  >
                    <span>{isCollapsed ? '▶' : '▼'} {GROUP_LABELS[kind]}</span>
                    <span className="validation-group-stats">
                      {st.error > 0 && <span className="vcount error">{st.error}</span>}
                      {st.warning > 0 && <span className="vcount warn">{st.warning}</span>}
                    </span>
                  </button>
                  {!isCollapsed && (
                    <ul className="validation-group-items">
                      {items.map((issue, i) => (
                        <li
                          key={i}
                          className={`validation-item ${issue.level}`}
                          onClick={() => onJump?.(issue)}
                          title={issue.code}
                        >
                          <span className="vlevel">{LEVEL_LABEL[issue.level]}</span>
                          <span className="vmsg">{issue.message}</span>
                          <code className="vcode">{issue.code}</code>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}