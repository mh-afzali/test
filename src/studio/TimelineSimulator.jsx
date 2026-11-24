import React, { useMemo, useState } from 'react';
import { getAllNarratives } from '../engine/conditions';
import { evaluateCondition, isNarrativeFullyRead } from '../engine/conditions';
import { makePreviewWorldData } from './api';

/**
 * شبیه‌ساز تایم‌لاین:
 * با پیمایش timeSteps، وضعیت world را در هر گام محاسبه می‌کند.
 * خروجی: آرایه‌ای از snapshotها + اطلاعات هر گام.
 */
function simulate(worldData) {
  const steps = worldData.timeSteps || [];
  const startTime = worldData.world?.startTime ?? 0;

  // state اولیه (شبیه createInitialState)
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

  // snapshot اولیه (قبل از هر step)
  snapshots.push(buildSnapshot(worldData, {
    time, timelineIndex, revealedPois,
    narratives: initialNarratives,
    seenCharacters: [], seenEvents: [],
  }, null));

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    time += step.advance;
    timelineIndex = i;

    // reveal POIها
    const newRevealed = [];
    for (const c of worldData.continents) {
      for (const p of c.pois) {
        if (p.revealTime != null && time >= p.revealTime && !revealedPois.includes(p.id)) {
          revealedPois = [...revealedPois, p.id];
          newRevealed.push(p);
        }
      }
    }

    // unlock روایت‌ها
    const narratives = { ...initialNarratives };
    // re-evaluate همه unlockها از صفر تا این لحظه (چون state فعلی شبیه‌سازی است)
    // برای هر روایت: آیا در زمان فعلی unlock می‌شود؟
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

    // بخش‌های تازه ظاهرشده (triggerTime <= time)
    const newSectionsByNarrative = {};
    for (const c of worldData.continents) {
      for (const p of c.pois) {
        for (const n of p.narratives || []) {
          const visible = (n.sections || []).filter((s) => s.triggerTime <= time);
          newSectionsByNarrative[n.id] = visible.map((s) => s.id);
        }
      }
    }

    snapshots.push(buildSnapshot(worldData, {
      time, timelineIndex, revealedPois, narratives,
      seenCharacters: [], seenEvents: [],
    }, { step, newRevealed, newSectionsByNarrative }));
  }

  return snapshots;
}

function buildSnapshot(worldData, state, changes) {
  // POIهای reveal‌شده در این لحظه
  const revealedPois = worldData.continents.flatMap((c) =>
    c.pois.filter((p) => p.revealTime == null || state.revealedPois.includes(p.id))
      .map((p) => ({ ...p, continent: c }))
  );

  // روایت‌های unlocked
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

  // وضعیت همه روایت‌ها
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
    step: changes?.step || null,
    newRevealed: changes?.newRevealed || [],
    newSectionsByNarrative: changes?.newSectionsByNarrative || {},
    revealedPois,
    unlockedNarratives,
    narrativeStatuses,
    isInitial: !changes,
  };
}

export default function TimelineSimulator({ world, characters, events }) {
  const worldData = useMemo(
    () => makePreviewWorldData(world, characters, events),
    [world, characters, events]
  );

  const snapshots = useMemo(() => simulate(worldData), [worldData]);
  const [activeIndex, setActiveIndex] = useState(0);

  const current = snapshots[activeIndex];

  return (
    <div className="timeline-sim">
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
              <span className="sim-step-time">{snap.time}</span>
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
          <div className="sim-time-badge">زمان: {current.time}</div>
          <div className="sim-step-note-badge">
            {current.step?.note || '—'} (+{current.step?.advance})
          </div>
        </div>
      )}

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
          <NewlyUnlockedList
            snapshots={snapshots}
            activeIndex={activeIndex}
          />
        </div>
      )}

      <div className="sim-section">
        <h3>📖 وضعیت همه روایت‌ها در زمان {current.time}</h3>
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
                <td>
                  {ns.visibleSections} / {ns.totalSections}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              {current.narrativeStatuses.reduce((s, n) => s + (n.unlocked ? n.visibleSections : 0), 0)}
            </div>
            <div className="sim-stat-label">بخش قابل خواندن</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * روایت‌هایی که در این گام تازه باز شده‌اند (نسبت به snapshot قبلی).
 */
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