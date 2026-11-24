import React, { useEffect, useState } from 'react';
import { isPoiRevealed } from '../engine/timeEngine';
import { poiHasUnread, getInfoAt } from '../engine/narrative';

const ICONS = {
  city: '🏙',
  landmark: '🏛',
  temple: '⛩',
  ruin: '🪨',
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

  return (
    <div className="continent-view">
      <button className="back-btn" onClick={onBack}>← بازگشت به نقشه دنیا</button>
      <h2 className="continent-title">{continent.name}</h2>

      <div className="map-frame">
        <svg
          viewBox="0 0 700 520"
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
            <pattern id="forestPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="3" fill="#1e2a18" opacity="0.6" />
              <circle cx="30" cy="25" r="3" fill="#1e2a18" opacity="0.5" />
              <circle cx="20" cy="35" r="2.5" fill="#1e2a18" opacity="0.5" />
            </pattern>
          </defs>

          <rect width="700" height="520" fill="#0f1820" />

          <path
            d="M80,80 
               C 160,40 300,50 420,80 
               C 540,110 620,160 640,260 
               C 660,360 600,440 500,470 
               C 400,500 280,490 180,450 
               C 80,410 40,320 50,220 
               C 55,160 65,110 80,80 Z"
            fill="url(#contLand)"
            stroke="#5a6a48"
            strokeWidth="2"
            filter="url(#contSoftShadow)"
          />

          <ellipse cx="150" cy="300" rx="80" ry="60" fill="url(#forestPattern)" opacity="0.7" />

          <path
            d="M400,100 Q 380,180 350,240 T 280,380 Q 270,420 290,460"
            fill="none"
            stroke="#3a5a6a"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M400,100 Q 380,180 350,240 T 280,380 Q 270,420 290,460"
            fill="none"
            stroke="#5a8a9a"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />

          {[
            { x: 480, y: 180 }, { x: 510, y: 200 }, { x: 540, y: 175 },
            { x: 465, y: 215 }, { x: 525, y: 230 },
          ].map((m, i) => (
            <g key={i}>
              <path d={`M${m.x},${m.y} L${m.x + 18},${m.y + 28} L${m.x - 18},${m.y + 28} Z`} fill="#4a4030" stroke="#6a5a40" strokeWidth="1" />
              <path d={`M${m.x},${m.y} L${m.x + 8},${m.y + 14} L${m.x - 8},${m.y + 14} Z`} fill="#e8e0d0" opacity="0.5" />
            </g>
          ))}

          <text x="350" y="60" className="continent-map-label" textAnchor="middle">
            {continent.name}
          </text>

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