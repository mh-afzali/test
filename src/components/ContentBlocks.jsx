import React, { useEffect, useRef, useState } from 'react';
import { parseInline, findTargetByName } from '../utils/markdown';

function InlineText({ text, worldData, onNavigatePoi, onOpenCharacter, onOpenEvent }) {
  const tokens = parseInline(text);
  return (
    <>
      {tokens.map((t, i) => {
        if (t.type === 'bold') return <strong key={i}>{t.value}</strong>;
        if (t.type === 'link') {
          const target = findTargetByName(t.kind, t.value, worldData);
          return (
            <a
              key={i}
              className="inline-link"
              onClick={() => {
                if (!target) return;
                if (target.kind === 'poi') onNavigatePoi?.(target.id);
                else if (target.kind === 'char') onOpenCharacter?.(target.character);
                else if (target.kind === 'event') onOpenEvent?.(target.event);
              }}
            >
              {t.value}
            </a>
          );
        }
        return <React.Fragment key={i}>{t.value}</React.Fragment>;
      })}
    </>
  );
}

function Block({ children, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`content-block ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${Math.min(index * 60, 300)}ms` }}
    >
      {children}
    </div>
  );
}

export default function ContentBlocks({ blocks, worldData, onNavigatePoi, onOpenCharacter, onOpenEvent }) {
  return (
    <div className="content-blocks">
      {blocks.map((block, i) => {
        const inner = (() => {
          switch (block.type) {
            case 'text':
              return (
                <p className="block-text">
                  <InlineText text={block.value} worldData={worldData} onNavigatePoi={onNavigatePoi} onOpenCharacter={onOpenCharacter} onOpenEvent={onOpenEvent} />
                </p>
              );
            case 'image':
              return (
                <figure className="block-image">
                  <img src={block.src} alt={block.alt || ''} />
                  {block.caption && <figcaption>{block.caption}</figcaption>}
                </figure>
              );
            case 'dialogue':
              return (
                <div className="block-dialogue">
                  <span className="speaker">{block.speaker}:</span>
                  <span className="line">«{block.value}»</span>
                </div>
              );
            case 'quote':
              return (
                <blockquote className="block-quote">
                  <p>«{block.value}»</p>
                  {block.source && <cite>— {block.source}</cite>}
                </blockquote>
              );
            case 'callout':
              return (
                <div className={`block-callout callout-${block.variant || 'note'}`}>
                  <InlineText text={block.value} worldData={worldData} onNavigatePoi={onNavigatePoi} onOpenCharacter={onOpenCharacter} onOpenEvent={onOpenEvent} />
                </div>
              );
            case 'scene':
              return (
                <div className="block-scene">
                  <div className="scene-header">
                    {block.location && <span className="scene-loc">📍 {block.location}</span>}
                    {block.time && <span className="scene-time">🕰 {block.time}</span>}
                  </div>
                  <p className="scene-text">
                    <InlineText text={block.value} worldData={worldData} onNavigatePoi={onNavigatePoi} onOpenCharacter={onOpenCharacter} onOpenEvent={onOpenEvent} />
                  </p>
                  {block.source && <div className="scene-source">— {block.source}</div>}
                </div>
              );
            case 'divider':
              return <hr className="block-divider" />;
            default:
              return null;
          }
        })();
        return <Block key={i} index={i}>{inner}</Block>;
      })}
    </div>
  );
}