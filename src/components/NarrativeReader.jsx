import React, { useEffect, useRef } from 'react';
import ContentBlocks from './ContentBlocks';
import { getVisibleSections } from '../engine/narrative';

export default function NarrativeReader({
  narrative, state, worldData, onBack, onSectionRead, onNavigatePoi, onOpenCharacter, onOpenEvent,
}) {
  const visibleSections = getVisibleSections(narrative, state.time);
  const hasFutureSections = narrative.sections.length > visibleSections.length;

  return (
    <div className="narrative-reader">
      <button className="back-btn" onClick={onBack}>← بازگشت</button>

      <header className="narrative-header">
        <h2>{narrative.title}</h2>
        <span className="narrative-kind-tag">{narrative.kind}</span>
      </header>

      <div className="narrative-body">
        {visibleSections.map((section, i) => (
          <SectionView
            key={section.id}
            section={section}
            index={i}
            narrativeId={narrative.id}
            worldData={worldData}
            onSectionRead={onSectionRead}
            onNavigatePoi={onNavigatePoi}
            onOpenCharacter={onOpenCharacter}
            onOpenEvent={onOpenEvent}
          />
        ))}

        {hasFutureSections && (
          <div className="future-note">
            ─── ادامه روایت در زمان‌های بعدی ───
          </div>
        )}
      </div>
    </div>
  );
}

function SectionView({ section, index, narrativeId, worldData, onSectionRead, onNavigatePoi, onOpenCharacter, onOpenEvent }) {
  const ref = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timerRef.current = setTimeout(() => {
              onSectionRead(narrativeId, section.id);
            }, 2000);
          } else {
            if (timerRef.current) clearTimeout(timerRef.current);
          }
        });
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [narrativeId, section.id, onSectionRead]);

  return (
    <section
      className="narrative-section"
      ref={ref}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {section.title && <h3 className="section-title">{section.title}</h3>}
      <ContentBlocks
        blocks={section.content}
        worldData={worldData}
        onNavigatePoi={onNavigatePoi}
        onOpenCharacter={onOpenCharacter}
        onOpenEvent={onOpenEvent}
      />
    </section>
  );
}