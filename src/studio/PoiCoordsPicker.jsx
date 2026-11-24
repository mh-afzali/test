import React, { useRef } from 'react';

/**
 * انتخابگر بصری coords POI روی نقشه‌ی قاره.
 * - نقشه را با mapSvg قاره رسم می‌کند.
 * - با کلیک، مختصات را نسبت به viewBox محاسبه و به onChange می‌دهد.
 * - POIهای دیگر همان قاره را هم نشان می‌دهد تا جابه‌جایی آسان‌تر باشد.
 */
export default function PoiCoordsPicker({
  mapSvg,
  coords,
  onChange,
  siblingPois = [],
  currentPoiId,
}) {
  const svgRef = useRef(null);

  const viewBox = mapSvg?.viewBox || '0 0 700 520';
  const [vx, vy, vw, vh] = viewBox.split(/\s+/).map(Number);

  const handleClick = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const svgP = pt.matrixTransform(ctm.inverse());
    onChange({
      x: Math.round(svgP.x),
      y: Math.round(svgP.y),
    });
  };

  const handleMarkerDrag = (e, poiId) => {
    e.stopPropagation();
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg || poiId !== currentPoiId) return;

    const onMove = (ev) => {
      const pt = svg.createSVGPoint();
      pt.x = ev.clientX;
      pt.y = ev.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const svgP = pt.matrixTransform(ctm.inverse());
      onChange({
        x: Math.round(svgP.x),
        y: Math.round(svgP.y),
      });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div className="coords-picker">
      <div className="coords-picker-header">
        <span className="coords-picker-label">
          کلیک روی نقشه = تنظیم مختصات
        </span>
        <span className="coords-picker-values">
          x: <strong>{coords?.x ?? 0}</strong> , y: <strong>{coords?.y ?? 0}</strong>
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="coords-picker-canvas"
        onClick={handleClick}
        style={{ cursor: 'crosshair' }}
      >
        <defs>
          <linearGradient id="pickerLand" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a4a32" />
            <stop offset="100%" stopColor="#2a3826" />
          </linearGradient>
          <linearGradient id="pickerLandSouth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a4030" />
            <stop offset="100%" stopColor="#3a3224" />
          </linearGradient>
          <pattern id="pickerForest" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="3" fill="#1e2a18" opacity="0.6" />
            <circle cx="30" cy="25" r="3" fill="#1e2a18" opacity="0.5" />
            <circle cx="20" cy="35" r="2.5" fill="#1e2a18" opacity="0.5" />
          </pattern>
        </defs>

        {/* پس‌زمینه */}
        <rect x={vx} y={vy} width={vw} height={vh} fill={mapSvg?.background || '#0f1820'} />

        {/* مسیر قاره */}
        {mapSvg?.landPath && (
          <path
            d={mapSvg.landPath}
            fill={resolveFill(mapSvg.landFill)}
            stroke={mapSvg.landStroke || '#5a6a48'}
            strokeWidth={mapSvg.landStrokeWidth ?? 2}
          />
        )}

        {/* تزئینات */}
        {(mapSvg?.decorations || []).map((dec, i) => {
          if (dec.type === 'path') {
            return <path key={i} d={dec.d} fill={dec.fill || 'none'} stroke={dec.stroke || 'none'} strokeWidth={dec.strokeWidth ?? 1} opacity={dec.opacity ?? 1} />;
          }
          if (dec.type === 'ellipse') {
            return <ellipse key={i} cx={dec.cx} cy={dec.cy} rx={dec.rx} ry={dec.ry} fill={resolveFill(dec.fill)} stroke={dec.stroke || 'none'} strokeWidth={dec.strokeWidth ?? 1} opacity={dec.opacity ?? 1} />;
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

        {/* POIهای دیگر (غیرفعال) */}
        {siblingPois
          .filter((p) => p.id !== currentPoiId)
          .map((p) => (
            <g key={p.id} transform={`translate(${p.coords?.x ?? 0}, ${p.coords?.y ?? 0})`} opacity="0.5">
              <circle r="10" fill="#2e3a2e" stroke="#8a7a66" strokeWidth="1.5" />
              <text textAnchor="middle" dy="4" fontSize="9" fill="#f4ecd8" pointerEvents="none">
                {p.name?.charAt(0) || '?'}
              </text>
            </g>
          ))}

        {/* POI فعلی — قابل درگ */}
        {coords && (
          <g transform={`translate(${coords.x}, ${coords.y})`} style={{ cursor: 'grab' }}>
            <circle r="20" fill="rgba(200, 115, 42, 0.2)" />
            <circle
              r="14"
              fill="#c8732a"
              stroke="#fff"
              strokeWidth="2"
              onPointerDown={(e) => handleMarkerDrag(e, currentPoiId)}
            />
            <circle r="4" fill="#fff" />
            <text textAnchor="middle" dy="34" fontSize="11" fill="#e8a85c" pointerEvents="none">
              ({coords.x}, {coords.y})
            </text>
          </g>
        )}

        {/* راهنما */}
        <text x={vx + 10} y={vy + 20} fontSize="11" fill="#8a7a66">
          کلیک = جابه‌جایی POI
        </text>
      </svg>
    </div>
  );
}

function resolveFill(fill) {
  if (!fill) return 'url(#pickerLand)';
  if (fill === 'url(#contLand)') return 'url(#pickerLand)';
  if (fill === 'url(#contLandSouth)') return 'url(#pickerLandSouth)';
  if (fill === 'url(#forestPattern)') return 'url(#pickerForest)';
  return fill;
}