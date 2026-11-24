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

          {/* === قاره‌ها از داده === */}
          {worldData.continents.map((continent, index) => {
            const svg = continent.svg;
            if (!svg) {
              // fallback: اگر svg تعریف نشده باشد، یک مستطیل ساده با نام
              return (
                <g
                  key={continent.id}
                  className="continent-shape continent-enter"
                  style={{ animationDelay: `${0.1 + index * 0.15}s` }}
                  onClick={() => onSelectContinent(continent.id)}
                  filter="url(#softShadow)"
                >
                  <rect x="100" y="100" width="800" height="400" fill="url(#landGradient)" stroke="#5a6a48" strokeWidth="2.5" opacity="0.5" />
                  <text x="500" y="300" className="continent-label" textAnchor="middle">{continent.name}</text>
                </g>
              );
            }

            return (
              <g
                key={continent.id}
                className="continent-shape continent-enter"
                style={{ animationDelay: `${0.1 + index * 0.15}s` }}
                onClick={() => onSelectContinent(continent.id)}
                filter="url(#softShadow)"
              >
                {/* مسیر اصلی قاره */}
                <path
                  d={svg.path}
                  fill={svg.fill || 'url(#landGradient)'}
                  stroke={svg.stroke || '#5a6a48'}
                  strokeWidth={svg.strokeWidth ?? 2.5}
                />

                {/* تزئینات (خطوط کوه، جنگل، رودخانه و...) */}
                {(svg.decorations || []).map((dec, di) => {
                  if (dec.type === 'path') {
                    return (
                      <path
                        key={di}
                        d={dec.d}
                        fill={dec.fill || 'none'}
                        stroke={dec.stroke || 'none'}
                        strokeWidth={dec.strokeWidth ?? 1}
                        opacity={dec.opacity ?? 1}
                      />
                    );
                  }
                  if (dec.type === 'ellipse') {
                    return (
                      <ellipse
                        key={di}
                        cx={dec.cx}
                        cy={dec.cy}
                        rx={dec.rx}
                        ry={dec.ry}
                        fill={dec.fill || 'none'}
                        stroke={dec.stroke || 'none'}
                        strokeWidth={dec.strokeWidth ?? 1}
                        opacity={dec.opacity ?? 1}
                      />
                    );
                  }
                  return null;
                })}

                {/* نام و زیرنویس قاره */}
                <text
                  x={svg.labelX ?? 0}
                  y={svg.labelY ?? 0}
                  className="continent-label"
                  textAnchor="middle"
                >
                  {continent.name}
                </text>
                {svg.subLabel && (
                  <text
                    x={svg.labelX ?? 0}
                    y={(svg.labelY ?? 0) + 22}
                    className="continent-sub"
                    textAnchor="middle"
                  >
                    {svg.subLabel}
                  </text>
                )}
              </g>
            );
          })}

          {/* جزایر کوچک تزئینی (ثابت — اگر خواستی بعداً داده‌محور می‌کنیم) */}
          <ellipse cx="560" cy="200" rx="18" ry="12" fill="#2a3826" stroke="#5a6a48" strokeWidth="1.5" opacity="0.7" />
          <ellipse cx="880" cy="180" rx="22" ry="14" fill="#3a3224" stroke="#6a5a40" strokeWidth="1.5" opacity="0.7" />

          {/* قطب‌نما */}
          <g transform="translate(900, 80)">
            <use href="#compassRose" />
          </g>

          {/* مقیاس */}
          <g transform="translate(60, 560)" opacity="0.6">
            <line x1="0" y1="0" x2="100" y2="0" stroke="#c8732a" strokeWidth="2" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#c8732a" strokeWidth="2" />
            <line x1="100" y1="-4" x2="100" y2="4" stroke="#c8732a" strokeWidth="2" />
            <text x="50" y="16" textAnchor="middle" fill="#c8732a" fontSize="11" fontFamily="serif">۱۰۰ لیگ</text>
          </g>

          {/* نشانگرهای unread روی قاره‌ها */}
          {worldData.continents.map((continent) => {
            if (!continentHasUnread(continent, state)) return null;
            const svg = continent.svg || {};
            const cx = (svg.labelX ?? 0) + 150;
            const cy = (svg.labelY ?? 0) - 100;
            return (
              <g key={`unread-${continent.id}`} className="continent-unread-marker">
                <circle cx={cx} cy={cy} r="9" className="unread-pulse" />
                <circle cx={cx} cy={cy} r="5" fill="#e8742a" stroke="#fff" strokeWidth="1.5" />
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