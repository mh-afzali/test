import React, { useEffect, useMemo, useRef, useState } from 'react';

const KIND_META = {
  world: { icon: '🌍', label: 'جهان', color: '#e8a85c' },
  continent: { icon: '🗺', label: 'قاره', color: '#c8732a' },
  poi: { icon: '📍', label: 'POI', color: '#8fd08f' },
  narrative: { icon: '📖', label: 'روایت', color: '#8fa8d0' },
  character: { icon: '👤', label: 'شخصیت', color: '#e88ac8' },
  event: { icon: '⚔️', label: 'رویداد', color: '#e88a8a' },
};

/**
 * ساخت ایندکس جستجو از داده‌ها.
 */
function buildIndex(world, characters, events) {
  const items = [];

  items.push({
    kind: 'world',
    id: world.world?.id,
    label: world.world?.name || 'جهان',
    sub: world.world?.id || '',
    ref: { kind: 'world' },
  });

  for (const c of world.continents || []) {
    items.push({
      kind: 'continent',
      id: c.id,
      label: c.name,
      sub: c.id,
      ref: { kind: 'continent', id: c.id },
    });
    for (const p of c.pois || []) {
      items.push({
        kind: 'poi',
        id: p.id,
        label: p.name,
        sub: `${c.name} · ${p.id}`,
        ref: { kind: 'poi', id: p.id },
      });
      for (const n of p.narratives || []) {
        items.push({
          kind: 'narrative',
          id: n.id,
          label: n.title,
          sub: `${p.name} · ${n.kind}`,
          ref: { kind: 'narrative', id: n.id },
        });
      }
    }
  }

  for (const ch of characters || []) {
    items.push({
      kind: 'character',
      id: ch.id,
      label: ch.name,
      sub: (ch.titles || []).join(' · ') || ch.id,
      ref: { kind: 'character', id: ch.id },
    });
  }

  for (const ev of events || []) {
    items.push({
      kind: 'event',
      id: ev.id,
      label: ev.name,
      sub: `${ev.eventType} · ${ev.id}`,
      ref: { kind: 'event', id: ev.id },
    });
  }

  return items;
}

export default function SearchModal({ open, onClose, world, characters, events, onPick }) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const index = useMemo(
    () => (world ? buildIndex(world, characters || [], events || []) : []),
    [world, characters, events]
  );

  const results = useMemo(() => {
    if (!query.trim()) return index.slice(0, 30);
    const q = query.trim().toLowerCase();
    return index
      .filter(
        (it) =>
          it.label.toLowerCase().includes(q) ||
          (it.sub || '').toLowerCase().includes(q) ||
          (it.id || '').toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [index, query]);

  // ریست وقتی باز می‌شود
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ریست activeIdx وقتی query عوض می‌شود
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // اسکرول به آیتم فعال
  useEffect(() => {
    const el = listRef.current?.children?.[activeIdx];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  if (!open) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIdx]) {
        onPick(results[activeIdx].ref);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-input-wrap">
          <span className="search-modal-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="جستجو در قاره‌ها، POIها، روایت‌ها، شخصیت‌ها، رویدادها..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className="search-modal-hint">Esc</span>
        </div>

        <ul className="search-modal-results" ref={listRef}>
          {results.length === 0 && (
            <li className="search-modal-empty">
              {query.trim() ? 'نتیجه‌ای پیدا نشد.' : 'شروع به تایپ کن...'}
            </li>
          )}
          {results.map((r, i) => {
            const meta = KIND_META[r.kind] || { icon: '•', label: r.kind, color: '#8a7a66' };
            return (
              <li key={`${r.kind}:${r.id}`}>
                <button
                  className={`search-result-item ${i === activeIdx ? 'active' : ''}`}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => {
                    onPick(r.ref);
                    onClose();
                  }}
                >
                  <span className="search-result-icon" style={{ color: meta.color }}>
                    {meta.icon}
                  </span>
                  <span className="search-result-body">
                    <span className="search-result-label">{r.label}</span>
                    <span className="search-result-sub">{r.sub}</span>
                  </span>
                  <span className="search-result-kind" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="search-modal-footer">
          <span>↑↓ جابه‌جایی</span>
          <span>Enter انتخاب</span>
          <span>Esc بستن</span>
        </div>
      </div>
    </div>
  );
}