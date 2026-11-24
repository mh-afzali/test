import React, { useMemo, useState } from 'react';
import { evaluateCondition } from '../engine/conditions';
import { makePreviewWorldData } from './api';
import { formatDate, formatDateShort } from '../utils/calendar';
import WorldMap from '../components/WorldMap';
import ContinentView from '../components/ContinentView';
import CharacterTimelinePreview from './CharacterTimelinePreview';

/* ============================================================
   شبیه‌سازی
   ============================================================ */
function simulate(worldData) {
  const steps = worldData.timeSteps || [];
  const startTime = worldData.world?.startTime ?? 0;

  const initialNarratives = {};
  for (const c of worldData.continents) {
    for (const p of c.pois) {
      for (const n of p.narratives || []) {
        initialNarratives[n.id] = { unlocked: false, readSectionIds: [] };
      }
    }
  }

  const snapshots = [];
  let time = startTime;
  let timelineIndex = -1;
  let revealedPois = [];

  snapshots.push(
    buildSnapshot(
      worldData,
      { time, timelineIndex, revealedPois, narratives: initialNarratives, seenCharacters: [], seenEvents: [] },
      null
    )
  );

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    time += step.advance;
    timelineIndex = i;

    const newRevealed = [];
    for (const c of worldData.continents) {
      for (const p of c.pois) {
        if (p.revealTime != null && time >= p.revealTime && !revealedPois.includes(p.id)) {
          revealedPois = [...revealedPois, p.id];
          newRevealed.push(p);
        }
      }
    }

    const narratives = { ...initialNarratives };
    for (const c of worldData.continents) {
      for (const p of c.pois) {
        for (const n of p.narratives || []) {
          const fakeState = { time, narratives, revealedPois };
          const ok = evaluateCondition(n.unlock, fakeState, worldData);
          if (ok && !narratives[n.id].unlocked) {
            narratives[n.id] = { ...narratives[n.id], unlocked: true };
          }
        }
      }
    }

    const newSectionsByNarrative = {};
    for (const c of worldData.continents) {
      for (const p of c.pois) {
        for (const n of p.narratives || []) {
          const visible = (n.sections || []).filter((s) => s.triggerTime <= time);
          newSectionsByNarrative[n.id] = visible.map((s) => s.id);
        }
      }
    }

    snapshots.push(
      buildSnapshot(
        worldData,
        { time, timelineIndex, revealedPois, narratives, seenCharacters: [], seenEvents: [] },
        { step, newRevealed, newSectionsByNarrative }
      )
    );
  }

  return snapshots;
}

function buildSnapshot(worldData, state, changes) {
  const revealedPois = worldData.continents.flatMap((c) =>
    c.pois
      .filter((p) => p.revealTime == null || state.revealedPois.includes(p.id))
      .map((p) => ({ ...p, continent: c }))
  );

  const unlockedNarratives = [];
  for (const c of worldData.continents) {
    for (const p of c.pois) {
      for (const n of p.narratives || []) {
        if (state.narratives[n.id]?.unlocked) {
          unlockedNarratives.push({ narrative: n, poi: p, continent: c });
        }
      }
    }
  }

  const narrativeStatuses = [];
  for (const c of worldData.continents) {
    for (const p of c.pois) {
      for (const n of p.narratives || []) {
        const entry = state.narratives[n.id];
        const visible = (n.sections || []).filter((s) => s.triggerTime <= state.time);
        narrativeStatuses.push({
          narrative: n,
          poi: p,
          continent: c,
          unlocked: entry?.unlocked || false,
          visibleSections: visible.length,
          totalSections: (n.sections || []).length,
        });
      }
    }
  }

  return {
    time: state.time,
    timelineIndex: state.timelineIndex,
    revealedPois,
    unlockedNarratives,
    narrativeStatuses,
    isInitial: !changes,
    step: changes?.step || null,
    newRevealed: changes?.newRevealed || [],
    newSectionsByNarrative: changes?.newSectionsByNarrative || {},
  };
}

/** ساخت state ساختگی برای پیش‌نمایش */
function makeSimState(snapshot) {
  const narratives = {};
  for (const ns of snapshot.narrativeStatuses) {
    narratives[ns.narrative.id] = {
      unlocked: ns.unlocked,
      readSectionIds: [],
    };
  }
  return {
    time: snapshot.time,
    timelineIndex: snapshot.timelineIndex ?? 0,
    revealedPois: snapshot.revealedPois.map((p) => p.id),
    narratives,
    seenCharacters: [],
    seenEvents: [],
  };
}

/* ============================================================
   کامپوننت اصلی
   ============================================================ */
export default function TimelineSimulator({ world, characters, events }) {
  const worldData = useMemo(
    () => makePreviewWorldData(world, characters, events),
    [world, characters, events]
  );

  const snapshots = useMemo(() => simulate(worldData), [worldData]);
  const [activeIndex, setActiveIndex] = useState(0);

  // پیش‌نمایش
  const [previewMode, setPreviewMode] = useState('world'); // 'world' | 'continent'
  const [previewContinentId, setPreviewContinentId] = useState(
    world.continents[0]?.id || null
  );

  const current = snapshots[activeIndex];
  const simState = useMemo(() => makeSimState(current), [current]);

  // برای پیش‌نمایش قاره، lastChanges را از گام فعلی می‌سازیم
  const simLastChanges = useMemo(
    () => ({ newRevealed: current.newRevealed || [] }),
    [current]
  );

  const previewContinent = world.continents.find((c) => c.id === previewContinentId);

  const handleSelectContinent = (continentId) => {
    setPreviewContinentId(continentId);
    setPreviewMode('continent');
  };

  const handleSelectPoi = () => {
    // در شبیه‌ساز، کلیک روی POI کاری نمی‌کند (فقط برای نمایش)
  };

  return (
    <div className="timeline-sim">
      {/* ===== هدر و نوار تایم‌لاین ===== */}
      <div className="sim-header">
        <h2>🕰 شبیه‌ساز تایم‌لاین</h2>
        <div className="sim-timeline-strip">
          {snapshots.map((snap, i) => (
            <button
              key={i}
              className={`sim-step-btn ${i === activeIndex ? 'active' : ''} ${i === 0 ? 'initial' : ''}`}
              onClick={() => setActiveIndex(i)}
              title={i === 0 ? 'شروع' : snap.step?.note || `step ${i}`}
            >
              <span className="sim-step-time">{formatDateShort(snap.time)}</span>
              <span className="sim-step-note">
                {i === 0 ? 'شروع' : snap.step?.note || '—'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {current.isInitial && (
        <div className="sim-initial-note">
          وضعیت اولیه (قبل از اولین پیشرفت زمان). برای دیدن تغییرات روی یکی از گام‌ها کلیک کن.
        </div>
      )}

      {!current.isInitial && (
        <div className="sim-step-info">
          <div className="sim-time-badge">زمان: {formatDate(current.time)}</div>
          <div className="sim-step-note-badge">
            {current.step?.note || '—'} (+{current.step?.advance} روز)
          </div>
        </div>
      )}

      {/* ===== پیش‌نمایش زنده ===== */}
      <div className="sim-preview-section">
        <div className="sim-preview-toolbar">
          <div className="sim-preview-tabs">
            <button
              className={`sim-preview-tab ${previewMode === 'world' ? 'active' : ''}`}
              onClick={() => setPreviewMode('world')}
            >
              🌍 جهان
            </button>
            <button
              className={`sim-preview-tab ${previewMode === 'continent' ? 'active' : ''}`}
              onClick={() => setPreviewMode('continent')}
              disabled={!previewContinentId}
            >
              🗺 قاره
            </button>
          </div>

          {previewMode === 'continent' && (
            <select
              className="sim-continent-select"
              value={previewContinentId || ''}
              onChange={(e) => setPreviewContinentId(e.target.value)}
            >
              {world.continents.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          <span className="sim-preview-time">
            در زمان: <strong>{formatDate(current.time)}</strong>
          </span>
        </div>

        <div className="sim-preview-stage">
          {previewMode === 'world' ? (
            <WorldMap
              worldData={worldData}
              state={simState}
              onSelectContinent={handleSelectContinent}
              onOpenCharacters={() => {}}
            />
          ) : previewContinent ? (
            <ContinentView
              continent={previewContinent}
              state={simState}
              worldData={worldData}
              lastChanges={simLastChanges}
              onSelectPoi={handleSelectPoi}
              onBack={() => setPreviewMode('world')}
            />
          ) : (
            <div className="empty-note">قاره‌ای انتخاب نشده.</div>
          )}
        </div>
      </div>

      {/* ===== تغییرات این گام ===== */}
      {!current.isInitial && current.newRevealed.length > 0 && (
        <div className="sim-section">
          <h3>📍 POIهای تازه آشکارشده ({current.newRevealed.length})</h3>
          <div className="sim-poi-chips">
            {current.newRevealed.map((p) => (
              <span key={p.id} className="sim-chip poi">
                {p.name} <small>({p.id})</small>
              </span>
            ))}
          </div>
        </div>
      )}

      {!current.isInitial && (
        <div className="sim-section">
          <h3>🔓 روایت‌های بازشده در این گام</h3>
          <NewlyUnlockedList snapshots={snapshots} activeIndex={activeIndex} />
        </div>
      )}

      {/* ===== شخصیت‌ها در این زمان ===== */}
      <div className="sim-section">
        <h3>👤 شخصیت‌ها در زمان {formatDate(current.time)}</h3>
        <CharacterTimelinePreview
          characters={characters}
          world={world}
          time={current.time}
        />
      </div>

      {/* ===== جدول وضعیت روایت‌ها ===== */}
      <div className="sim-section">
        <h3>📖 وضعیت همه روایت‌ها در {formatDate(current.time)}</h3>
        <table className="sim-table">
          <thead>
            <tr>
              <th>قاره</th>
              <th>POI</th>
              <th>روایت</th>
              <th>نوع</th>
              <th>وضعیت</th>
              <th>بخش‌های دیده‌شده</th>
            </tr>
          </thead>
          <tbody>
            {current.narrativeStatuses.map((ns) => (
              <tr key={ns.narrative.id} className={!ns.unlocked ? 'locked' : ''}>
                <td>{ns.continent.name}</td>
                <td>{ns.poi.name}</td>
                <td>{ns.narrative.title}</td>
                <td><span className="sim-kind">{ns.narrative.kind}</span></td>
                <td>
                  {ns.unlocked
                    ? <span className="sim-status unlocked">باز</span>
                    : <span className="sim-status locked">قفل</span>}
                </td>
                <td>{ns.visibleSections} / {ns.totalSections}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== خلاصه ===== */}
      <div className="sim-section">
        <h3>📊 خلاصه</h3>
        <div className="sim-summary">
          <div className="sim-stat">
            <div className="sim-stat-value">{current.revealedPois.length}</div>
            <div className="sim-stat-label">POI آشکار</div>
          </div>
          <div className="sim-stat">
            <div className="sim-stat-value">{current.unlockedNarratives.length}</div>
            <div className="sim-stat-label">روایت باز</div>
          </div>
          <div className="sim-stat">
            <div className="sim-stat-value">
              {current.narrativeStatuses.reduce(
                (s, n) => s + (n.unlocked ? n.visibleSections : 0), 0
              )}
            </div>
            <div className="sim-stat-label">بخش قابل خواندن</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewlyUnlockedList({ snapshots, activeIndex }) {
  if (activeIndex === 0) {
    return <p className="empty-note">در گام شروع، هیچ روایتی باز نیست.</p>;
  }
  const prev = snapshots[activeIndex - 1];
  const curr = snapshots[activeIndex];
  const prevUnlocked = new Set(prev.unlockedNarratives.map((u) => u.narrative.id));
  const newly = curr.unlockedNarratives.filter((u) => !prevUnlocked.has(u.narrative.id));

  if (newly.length === 0) {
    return <p className="empty-note">در این گام روایت جدیدی باز نشد.</p>;
  }

  return (
    <ul className="sim-newly-list">
      {newly.map((u) => (
        <li key={u.narrative.id}>
          <span className="sim-chip narrative">{u.narrative.title}</span>
          <span className="sim-newly-meta">
            {u.continent.name} → {u.poi.name} → <code>{u.narrative.id}</code>
          </span>
        </li>
      ))}
    </ul>
  );
}