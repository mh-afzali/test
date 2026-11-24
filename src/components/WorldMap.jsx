import React from 'react';
import { continentHasUnread } from '../engine/narrative';

export default function WorldMap({ worldData, state, onSelectContinent, onOpenCharacters }) {
  return (
    <div className="world-map">
      <h1 className="map-title">{worldData.world.name}</h1>

      <div className="map-frame">
        <svg
          viewBox="0 0 1000 620"
          className="world-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="softShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
            </filter>
            <radialGradient id="seaGradient" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1e2c3a" />
              <stop offset="100%" stopColor="#0f1820" />
            </radialGradient>
            <linearGradient id="landGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3a4a32" />
              <stop offset="100%" stopColor="#2a3826" />
            </linearGradient>
            <linearGradient id="landGradientSouth" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a4030" />
              <stop offset="100%" stopColor="#3a3224" />
            </linearGradient>
            <pattern id="seaWaves" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30 Q 15 22, 30 30 T 60 30" fill="none" stroke="#2a3a4a" strokeWidth="1" opacity="0.4" />
              <path d="M0 50 Q 15 42, 30 50 T 60 50" fill="none" stroke="#2a3a4a" strokeWidth="1" opacity="0.3" />
            </pattern>
            <g id="compassRose">
              <circle r="30" fill="none" stroke="#c8732a" strokeWidth="1.5" opacity="0.7" />
              <circle r="24" fill="none" stroke="#c8732a" strokeWidth="0.5" opacity="0.5" />
              <path d="M0,-28 L4,-8 L0,0 L-4,-8 Z" fill="#c8732a" opacity="0.8" />
              <path d="M0,28 L4,8 L0,0 L-4,8 Z" fill="#8a5a2a" opacity="0.5" />
              <path d="M-28,0 L-8,4 L0,0 L-8,-4 Z" fill="#8a5a2a" opacity="0.5" />
              <path d="M28,0 L8,4 L0,0 L8,-4 Z" fill="#8a5a2a" opacity="0.5" />
              <text x="0" y="-36" textAnchor="middle" fill="#c8732a" fontSize="12" fontFamily="serif">N</text>
            </g>
          </defs>

          <rect width="1000" height="620" fill="url(#seaGradient)" />
          <rect width="1000" height="620" fill="url(#seaWaves)" />

          <g opacity="0.08" stroke="#c8732a" strokeWidth="0.5">
            {[100, 200, 300, 400, 500].map((y) => (
              <line key={y} x1="0" y1={y} x2="1000" y2={y} />
            ))}
            {[150, 300, 450, 600, 750, 850].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2="620" />
            ))}
          </g>

          <g
            id="continent-north"
            className="continent-shape continent-enter"
            style={{ animationDelay: '0.1s' }}
            onClick={() => onSelectContinent('continent_north')}
            filter="url(#softShadow)"
          >
            <path
              d="M180,90 C 220,60 300,55 380,75 C 450,90 500,110 520,160 C 540,210 510,260 470,300 C 430,335 380,350 320,345 C 260,340 200,320 160,280 C 120,240 110,190 130,150 C 145,120 160,105 180,90 Z"
              fill="url(#landGradient)"
              stroke="#5a6a48"
              strokeWidth="2.5"
            />
            <path d="M220,140 Q 260,120 300,140" fill="none" stroke="#1e2a18" strokeWidth="1" opacity="0.5" />
            <path d="M350,200 Q 390,180 420,200" fill="none" stroke="#1e2a18" strokeWidth="1" opacity="0.5" />
            <path d="M200,250 Q 240,230 280,250" fill="none" stroke="#1e2a18" strokeWidth="1" opacity="0.5" />
            <text x="320" y="200" className="continent-label" textAnchor="middle">سرزمین شمالی</text>
            <text x="320" y="222" className="continent-sub" textAnchor="middle">شمال سرد</text>
          </g>

          <g
            id="continent-south"
            className="continent-shape continent-enter"
            style={{ animationDelay: '0.25s' }}
            onClick={() => onSelectContinent('continent_south')}
            filter="url(#softShadow)"
          >
            <path
              d="M600,320 C 650,290 720,280 800,300 C 870,320 920,360 930,420 C 940,480 900,540 830,555 C 760,570 680,555 630,520 C 580,485 560,430 575,380 C 585,350 595,335 600,320 Z"
              fill="url(#landGradientSouth)"
              stroke="#6a5a40"
              strokeWidth="2.5"
            />
            <path d="M660,380 Q 700,360 740,380" fill="none" stroke="#2a2418" strokeWidth="1" opacity="0.5" />
            <path d="M720,470 Q 760,450 800,470" fill="none" stroke="#2a2418" strokeWidth="1" opacity="0.5" />
            <text x="760" y="420" className="continent-label" textAnchor="middle">سرزمین جنوبی</text>
            <text x="760" y="442" className="continent-sub" textAnchor="middle">جنوب گرم</text>
          </g>

          <ellipse cx="560" cy="200" rx="18" ry="12" fill="#2a3826" stroke="#5a6a48" strokeWidth="1.5" opacity="0.7" />
          <ellipse cx="880" cy="180" rx="22" ry="14" fill="#3a3224" stroke="#6a5a40" strokeWidth="1.5" opacity="0.7" />

          <g transform="translate(900, 80)">
            <use href="#compassRose" />
          </g>

          <g transform="translate(60, 560)" opacity="0.6">
            <line x1="0" y1="0" x2="100" y2="0" stroke="#c8732a" strokeWidth="2" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#c8732a" strokeWidth="2" />
            <line x1="100" y1="-4" x2="100" y2="4" stroke="#c8732a" strokeWidth="2" />
            <text x="50" y="16" textAnchor="middle" fill="#c8732a" fontSize="11" fontFamily="serif">۱۰۰ لیگ</text>
          </g>

          {worldData.continents.map((continent) => {
            if (!continentHasUnread(continent, state)) return null;
            const badgePos = continent.id === 'continent_north'
              ? { x: 470, y: 100 }
              : { x: 920, y: 320 };
            return (
              <g key={continent.id} className="continent-unread-marker">
                <circle cx={badgePos.x} cy={badgePos.y} r="9" className="unread-pulse" />
                <circle cx={badgePos.x} cy={badgePos.y} r="5" fill="#e8742a" stroke="#fff" strokeWidth="1.5" />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="map-legend">
        {worldData.continents.map((c) => (
          <button
            key={c.id}
            className="legend-item"
            onClick={() => onSelectContinent(c.id)}
          >
            <span className="legend-name">{c.name}</span>
            {continentHasUnread(c, state) && <span className="unread-dot" title="نخوانده">●</span>}
          </button>
        ))}
        <button className="legend-item characters-link" onClick={onOpenCharacters}>
          <span className="legend-name">👤 شخصیت‌ها</span>
        </button>
      </div>
    </div>
  );
}