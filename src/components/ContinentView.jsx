import React, { useEffect, useState } from 'react';
import { isPoiRevealed } from '../engine/timeEngine';
import { poiHasUnread, getInfoAt } from '../engine/narrative';

// ICONS گسترش‌یافته — هماهنگ با PoiEditor
const ICONS = {
  city: '🏙',
  landmark: '🏛',
  temple: '⛩',
  ruin: '🪨',
  port: '⚓',
  village: '🏘',
  fortress: '🏰',
  forest: '🌲',
  mountain: '⛰',
};

// fallback نقشه‌ی قاره (اگر continent.mapSvg نبود)
const DEFAULT_MAP_SVG = {
  viewBox: '0 0 700 520',
  background: '#0f1820',
  landPath: 'M80,80 C 160,40 300,50 420,80 C 540,110 620,160 640,260 C 660,360 600,440 500,470 C 400,500 280,490 180,450 C 80,410 40,320 50,220 C 55,160 65,110 80,80 Z',
  landFill: 'url(#contLand)',
  landStroke: '#5a6a48',
  landStrokeWidth: 2,
  decorations: [
    { type: 'ellipse', cx: 150, cy: 300, rx: 80, ry: 60, fill: 'url(#forestPattern)', opacity: 0.7 },
    { type: 'path', d: 'M400,100 Q 380,180 350,240 T 280,380 Q 270,420 290,460', stroke: '#3a5a6a', strokeWidth: 4, opacity: 0.8 },
    { type: 'path', d: 'M400,100 Q 380,180 350,240 T 280,380 Q 270,420 290,460', stroke: '#5a8a9a', strokeWidth: 1.5, opacity: 0.6 },
    { type: 'mountains', points: [
      { x: 480, y: 180 }, { x: 510, y: 200 }, { x: 540, y: 175 },
      { x: 465, y: 215 }, { x: 525, y: 230 },
    ], fill: '#4a4030', stroke: '#6a5a40', snowFill: '#e8e0d0', snowOpacity: 0.5 },
  ],
};

export default function ContinentView({ continent, state, worldData, lastChanges, onSelectPoi, onBack }) {
  const [recentlyRevealed, setRecentlyRevealed] = useState([]);

  useEffect(() => {
    if (lastChanges?.newRevealed?.length) {
      const ids = lastChanges.newRevealed.map((p) => p.id);
      setRecentlyRevealed(ids);
      const t = setTimeout(() => setRecentlyRevealed([]), 2500);
      return () => clearTimeout(t);
    }
  }, [lastChanges]);

  const map = continent.mapSvg || DEFAULT_MAP_SVG;

  return (
    <div className="continent-view">
      <button className="back-btn" onClick={onBack}>← بازگشت به نقشه دنیا</button>
      <h2 className="continent-title">{continent.name}</h2>

      <div className="map-frame">
        <svg
          viewBox={map.viewBox || '0 0 700 520'}
          className="continent-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="contSoftShadow">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
            </filter>
            <linearGradient id="contLand" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3a4a32" />
              <stop offset="100%" stopColor="#2a3826" />
            </linearGradient>
            <linearGradient id="contLandSouth" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a4030" />
              <stop offset="100%" stopColor="#3a3224" />
            </linearGradient>
            <pattern id="forestPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="3" fill="#1e2a18" opacity="0.6" />
              <circle cx="30" cy="25" r="3" fill="#1e2a18" opacity="0.5" />
              <circle cx="20" cy="35" r="2.5" fill="#1e2a18" opacity="0.5" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill={map.background || '#0f1820'} />

          {/* مسیر اصلی قاره */}
          <path
            d={map.landPath}
            fill={map.landFill || 'url(#contLand)'}
            stroke={map.landStroke || '#5a6a48'}
            strokeWidth={map.landStrokeWidth ?? 2}
            filter="url(#contSoftShadow)"
          />

          {/* تزئینات */}
          {(map.decorations || []).map((dec, i) => {
            if (dec.type === 'path') {
              return <path key={i} d={dec.d} fill={dec.fill || 'none'} stroke={dec.stroke || 'none'} strokeWidth={dec.strokeWidth ?? 1} opacity={dec.opacity ?? 1} />;
            }
            if (dec.type === 'ellipse') {
              return <ellipse key={i} cx={dec.cx} cy={dec.cy} rx={dec.rx} ry={dec.ry} fill={dec.fill || 'none'} stroke={dec.stroke || 'none'} strokeWidth={dec.strokeWidth ?? 1} opacity={dec.opacity ?? 1} />;
            }
            if (dec.type === 'mountains') {
              return (
                <g key={i}>
                  {(dec.points || []).map((m, mi) => (
                    <g key={mi}>
                      <path d={`M${m.x},${m.y} L${m.x + 18},${m.y + 28} L${m.x - 18},${m.y + 28} Z`} fill={dec.fill || '#4a4030'} stroke={dec.stroke || '#6a5a40'} strokeWidth="1" />
                      <path d={`M${m.x},${m.y} L${m.x + 8},${m.y + 14} L${m.x - 8},${m.y + 14} Z`} fill={dec.snowFill || '#e8e0d0'} opacity={dec.snowOpacity ?? 0.5} />
                    </g>
                  ))}
                </g>
              );
            }
            return null;
          })}

          <text x="350" y="60" className="continent-map-label" textAnchor="middle">
            {continent.name}
          </text>

          {/* POIها */}
          {continent.pois.map((poi, idx) => {
            if (!isPoiRevealed(poi, state)) return null;
            const info = getInfoAt(poi, state.time);
            const hasUnread = poiHasUnread(poi, state);
            const isRecent = recentlyRevealed.includes(poi.id);

            return (
              <g
                key={poi.id}
                transform={`translate(${poi.coords.x}, ${poi.coords.y})`}
                onClick={() => onSelectPoi(poi.id)}
              >
                <g
                  className={`poi-marker poi-enter ${isRecent ? 'poi-recently-revealed' : ''}`}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <circle r="26" className="poi-halo" />
                  <circle r="20" className="poi-circle" />
                  <text textAnchor="middle" dy="7" className="poi-icon">
                    {ICONS[info.type] || '📍'}
                  </text>
                  {hasUnread && (
                    <>
                      <circle r="8" cx="16" cy="-16" className="poi-unread-pulse" />
                      <circle r="5" cx="16" cy="-16" fill="#e8742a" stroke="#fff" strokeWidth="1.5" />
                    </>
                  )}
                  <text textAnchor="middle" dy="46" className="poi-label">
                    {info.title}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="poi-list">
        {continent.pois
          .filter((p) => isPoiRevealed(p, state))
          .map((poi) => {
            const info = getInfoAt(poi, state.time);
            const hasUnread = poiHasUnread(poi, state);
            return (
              <button
                key={poi.id}
                className={`poi-list-item ${hasUnread ? 'has-unread' : ''}`}
                onClick={() => onSelectPoi(poi.id)}
              >
                <span className="poi-list-icon">{ICONS[info.type] || '📍'}</span>
                <span className="poi-list-title">{info.title}</span>
                <span className="poi-list-type">{info.type}</span>
                {hasUnread && <span className="unread-dot">●</span>}
              </button>
            );
          })}
      </div>
    </div>
  );
}