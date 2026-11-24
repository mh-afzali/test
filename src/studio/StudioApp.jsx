import React, { useEffect, useMemo, useState } from 'react';
import worldRaw from '../data/world.json';
import charactersRaw from '../data/characters.json';
import eventsRaw from '../data/events.json';
import {
  saveDataFile,
  deepClone,
  locateNarrative,
  updateNarrative,
} from './api';
import { validateAll } from './validator';
import TreeSidebar from './TreeSidebar';
import NarrativeEditor from './NarrativeEditor';
import LivePreview from './LivePreview';
import ValidationPanel from './ValidationPanel';
import TimelineSimulator from './TimelineSimulator';
import './studio.css';

export default function StudioApp() {
  const [world, setWorld] = useState(null);
  const [characters, setCharacters] = useState(null);
  const [events, setEvents] = useState(null);
  const [selected, setSelected] = useState(null);
  const [previewTime, setPreviewTime] = useState(0);
  const [status, setStatus] = useState('');
  const [dirty, setDirty] = useState(false);
  const [jumpTarget, setJumpTarget] = useState(null);
  const [tab, setTab] = useState('editor'); // 'editor' | 'timeline'

  // بارگذاری اولیه از فایل‌های واقعی پروژه (کپی عمیق برای جلوگیری از mutation)
  useEffect(() => {
    setWorld(deepClone(worldRaw));
    setCharacters(deepClone(charactersRaw));
    setEvents(deepClone(eventsRaw));
  }, []);

  // روایت انتخاب‌شده
  const selectedNarrative = useMemo(() => {
    if (!world || !selected?.narrativeId) return null;
    const loc = locateNarrative(world, selected.narrativeId);
    return loc?.narrative || null;
  }, [world, selected]);

  // اعتبارسنجی کامل (با useMemo فقط وقتی داده تغییر کند اجرا می‌شود)
  const issues = useMemo(
    () => (world ? validateAll(world, characters || [], events || []) : []),
    [world, characters, events]
  );

  const handleSave = async () => {
    const errs = validateAll(world, characters, events).filter(
      (i) => i.level === 'error'
    );
    if (errs.length > 0) {
      const ok = window.confirm(
        `⚠️ ${errs.length} خطای ساختاری وجود دارد. باز هم ذخیره شود؟`
      );
      if (!ok) return;
    }

    setStatus('در حال ذخیره...');
    try {
      await saveDataFile('world.json', world);
      await saveDataFile('characters.json', characters);
      await saveDataFile('events.json', events);
      setStatus('✅ ذخیره شد روی دیسک');
      setDirty(false);
    } catch (e) {
      setStatus(`❌ ${e.message}`);
    }
  };

  const handleNarrativeChange = (newNarrative) => {
    if (!selected?.narrativeId) return;
    setWorld((w) => updateNarrative(w, selected.narrativeId, () => newNarrative));
    setDirty(true);
    setStatus('');
  };

  // پرش از روی خطای اعتبارسنجی
  const handleJump = (issue) => {
    if (!issue.narrativeId) return;

    // انتخاب روایت مربوطه
    setSelected((prev) =>
      prev?.narrativeId === issue.narrativeId
        ? prev
        : { narrativeId: issue.narrativeId }
    );

    setJumpTarget(issue);

    // اگر بخش مشخصی داشت، زمان پیش‌نمایش را روی triggerTime آن تنظیم کن
    if (issue.sectionId) {
      const loc = locateNarrative(world, issue.narrativeId);
      const section = loc?.narrative?.sections?.find(
        (s) => s.id === issue.sectionId
      );
      if (section?.triggerTime != null) {
        setPreviewTime(section.triggerTime);
      }
    }

    // پاک‌کردن نشانگر پرش بعد از ۱.۵ ثانیه
    setTimeout(() => setJumpTarget(null), 1500);
  };

  if (!world) {
    return <div style={{ padding: 24, color: '#f4ecd8' }}>در حال بارگذاری...</div>;
  }

  const errorCount = issues.filter((i) => i.level === 'error').length;

  return (
    <div className="studio-root">
      <header className="studio-header">
        <div className="studio-header-left">
          <h1>🎨 استودیو اطلس</h1>
          <div className="studio-tabs">
            <button
              className={`studio-tab ${tab === 'editor' ? 'active' : ''}`}
              onClick={() => setTab('editor')}
            >
              ✏️ ویرایشگر
            </button>
            <button
              className={`studio-tab ${tab === 'timeline' ? 'active' : ''}`}
              onClick={() => setTab('timeline')}
            >
              🕰 شبیه‌ساز تایم‌لاین
            </button>
          </div>
        </div>
        <div className="studio-header-actions">
          {dirty && <span className="dirty-badge">● تغییرات ذخیره‌نشده</span>}
          {errorCount > 0 && (
            <span className="header-error-count">❌ {errorCount} خطا</span>
          )}
          <button onClick={handleSave} className="save-btn">
            💾 ذخیره همه
          </button>
          {status && <span className="status">{status}</span>}
        </div>
      </header>

      <div className="studio-body">
        {/* ستون چپ: درخت */}
        <aside className="studio-sidebar">
          <TreeSidebar world={world} selected={selected} onSelect={setSelected} />
        </aside>

        {/* ستون وسط: بسته به تب */}
        <main className="studio-main">
          {tab === 'editor' ? (
            <>
              <NarrativeEditor
                narrative={selectedNarrative}
                onChange={handleNarrativeChange}
                jumpTarget={jumpTarget}
              />
              <ValidationPanel issues={issues} onJump={handleJump} />
            </>
          ) : (
            <TimelineSimulator
              world={world}
              characters={characters}
              events={events}
            />
          )}
        </main>

        {/* ستون راست: پیش‌نمایش زنده */}
        <aside className="studio-preview">
          <div className="preview-time-control">
            <label>زمان پیش‌نمایش:</label>
            <input
              type="range"
              min={0}
              max={500}
              value={previewTime}
              onChange={(e) => setPreviewTime(Number(e.target.value))}
            />
            <input
              type="number"
              value={previewTime}
              onChange={(e) => setPreviewTime(Number(e.target.value))}
              style={{ width: 70 }}
            />
          </div>
          <LivePreview
            narrative={selectedNarrative}
            world={world}
            characters={characters}
            events={events}
            previewTime={previewTime}
          />
        </aside>
      </div>
    </div>
  );
}