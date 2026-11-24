import React from 'react';

const FILL_PRESETS = [
  { value: 'url(#landGradient)', label: 'gradient شمالی (سبز)' },
  { value: 'url(#landGradientSouth)', label: 'gradient جنوبی (قهوه‌ای)' },
  { value: '#3a4a32', label: 'سبز تیره' },
  { value: '#4a4030', label: 'قهوه‌ای' },
  { value: '#2a3826', label: 'سبز جنگلی' },
];

const MAP_FILL_PRESETS = [
  { value: 'url(#contLand)', label: 'gradient قاره (سبز)' },
  { value: 'url(#contLandSouth)', label: 'gradient قاره (قهوه‌ای)' },
  { value: '#3a4a32', label: 'سبز' },
  { value: '#4a4030', label: 'قهوه‌ای' },
];

export default function ContinentEditor({ continent, onChange, onDelete }) {
  if (!continent) return null;

  const patch = (p) => onChange({ ...continent, ...p });
  const patchSvg = (p) => patch({ svg: { ...(continent.svg || {}), ...p } });
  const patchMap = (p) => patch({ mapSvg: { ...(continent.mapSvg || {}), ...p } });

  const svg = continent.svg || {};
  const map = continent.mapSvg || {};
  const svgDecorations = svg.decorations || [];
  const mapDecorations = map.decorations || [];

  /* ===== تزئینات SVG ===== */
  const updateSvgDec = (i, nd) => {
    const next = [...svgDecorations];
    next[i] = nd;
    patchSvg({ decorations: next });
  };
  const removeSvgDec = (i) => {
    patchSvg({ decorations: svgDecorations.filter((_, idx) => idx !== i) });
  };
  const addSvgDec = (type) => {
    const base = type === 'path'
      ? { type: 'path', d: 'M0,0 L100,100', stroke: '#1e2a18', strokeWidth: 1, opacity: 0.5 }
      : { type: 'ellipse', cx: 100, cy: 100, rx: 40, ry: 30, fill: '#2a3826', opacity: 0.6 };
    patchSvg({ decorations: [...svgDecorations, base] });
  };

  /* ===== تزئینات MAP ===== */
  const updateMapDec = (i, nd) => {
    const next = [...mapDecorations];
    next[i] = nd;
    patchMap({ decorations: next });
  };
  const removeMapDec = (i) => {
    patchMap({ decorations: mapDecorations.filter((_, idx) => idx !== i) });
  };
  const addMapDec = (type) => {
    let base;
    if (type === 'path') {
      base = { type: 'path', d: 'M0,0 L100,100', stroke: '#3a5a6a', strokeWidth: 2, opacity: 0.8 };
    } else if (type === 'ellipse') {
      base = { type: 'ellipse', cx: 100, cy: 100, rx: 40, ry: 30, fill: '#2a3826', opacity: 0.6 };
    } else if (type === 'mountains') {
      base = { type: 'mountains', points: [{ x: 100, y: 100 }], fill: '#4a4030', stroke: '#6a5a40', snowFill: '#e8e0d0', snowOpacity: 0.5 };
    }
    patchMap({ decorations: [...mapDecorations, base] });
  };

  return (
    <div className="continent-editor">
      <div className="editor-title-row">
        <h2 className="editor-title">🗺 {continent.name || '(بدون نام)'}</h2>
        <button className="danger-text-btn" onClick={onDelete}>🗑 حذف قاره</button>
      </div>

      {/* ===== فیلدهای پایه ===== */}
      <h3>📌 اطلاعات پایه</h3>
      <div className="narrative-fields">
        <div className="field-row">
          <label>id:</label>
          <input type="text" value={continent.id || ''} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
        </div>
        <div className="field-row">
          <label>name:</label>
          <input type="text" value={continent.name || ''} onChange={(e) => patch({ name: e.target.value })} />
        </div>
        <div className="field-row">
          <label>worldSvgId:</label>
          <input type="text" value={continent.worldSvgId || ''} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
        </div>
        <div className="field-row">
          <label>unlocked:</label>
          <input type="checkbox" checked={!!continent.unlocked} onChange={(e) => patch({ unlocked: e.target.checked })} style={{ flex: 'none' }} />
        </div>
      </div>
      <p className="empty-note" style={{ fontSize: '0.78rem' }}>
        ⚠️ <code>id</code> و <code>worldSvgId</code> فقط‌خواندنی هستند.
      </p>

      {/* ============================================================
          بخش ۱: SVG نقشه‌ی جهان
          ============================================================ */}
      <h3>🌍 نقشه‌ی جهان (svg)</h3>
      <div className="svg-editor-grid">
        <div className="svg-editor-form">
          <div className="field-row">
            <label>path:</label>
            <textarea rows={4} value={svg.path || ''} onChange={(e) => patchSvg({ path: e.target.value })} placeholder="M180,90 C 220,60 ..." />
          </div>
          <div className="field-row">
            <label>fill:</label>
            <input type="text" value={svg.fill || ''} onChange={(e) => patchSvg({ fill: e.target.value })} list="svg-fill-presets" />
            <datalist id="svg-fill-presets">
              {FILL_PRESETS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </datalist>
          </div>
          <div className="field-row">
            <label>stroke:</label>
            <input type="text" value={svg.stroke || ''} onChange={(e) => patchSvg({ stroke: e.target.value })} />
            <label>width:</label>
            <input type="number" step="0.5" value={svg.strokeWidth ?? 2.5} onChange={(e) => patchSvg({ strokeWidth: Number(e.target.value) })} />
          </div>
          <div className="field-row">
            <label>labelX:</label>
            <input type="number" value={svg.labelX ?? 0} onChange={(e) => patchSvg({ labelX: Number(e.target.value) })} />
            <label>labelY:</label>
            <input type="number" value={svg.labelY ?? 0} onChange={(e) => patchSvg({ labelY: Number(e.target.value) })} />
          </div>
          <div className="field-row">
            <label>subLabel:</label>
            <input type="text" value={svg.subLabel || ''} onChange={(e) => patchSvg({ subLabel: e.target.value })} />
          </div>
        </div>

        <div className="svg-preview">
          <div className="svg-preview-label">پیش‌نمایش (viewBox 1000×620)</div>
          <svg viewBox="0 0 1000 620" className="svg-preview-canvas">
            <defs>
              <linearGradient id="prevLandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3a4a32" />
                <stop offset="100%" stopColor="#2a3826" />
              </linearGradient>
              <linearGradient id="prevLandGradientSouth" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a4030" />
                <stop offset="100%" stopColor="#3a3224" />
              </linearGradient>
            </defs>
            <rect width="1000" height="620" fill="#0f1820" />
            {svg.path && (
              <path d={svg.path} fill={resolveFill(svg.fill, 'svg')} stroke={svg.stroke || '#5a6a48'} strokeWidth={svg.strokeWidth ?? 2.5} />
            )}
            {svgDecorations.map((dec, i) => renderDecoration(dec, i, resolveFill))}
            {svg.labelX != null && svg.labelY != null && (
              <>
                <text x={svg.labelX} y={svg.labelY} textAnchor="middle" fill="#e8dcc0" fontSize="22" fontWeight="bold">{continent.name}</text>
                {svg.subLabel && <text x={svg.labelX} y={svg.labelY + 22} textAnchor="middle" fill="#a89a78" fontSize="13">{svg.subLabel}</text>}
              </>
            )}
          </svg>
        </div>
      </div>

      <h4>✨ تزئینات نقشه‌ی جهان ({svgDecorations.length})</h4>
      <div className="decorations-list">
        {svgDecorations.map((dec, i) => (
          <DecorationEditor key={i} dec={dec} index={i} onChange={(nd) => updateSvgDec(i, nd)} onRemove={() => removeSvgDec(i)} />
        ))}
        <div className="decoration-add-buttons">
          <button type="button" className="add-btn" onClick={() => addSvgDec('path')}>+ مسیر</button>
          <button type="button" className="add-btn" onClick={() => addSvgDec('ellipse')}>+ بیضی</button>
        </div>
      </div>

      {/* ============================================================
          بخش ۲: MAP SVG نقشه‌ی قاره
          ============================================================ */}
      <h3 style={{ marginTop: 32, borderTop: '1px solid #2e2418', paddingTop: 16 }}>🗺 نقشه‌ی قاره (mapSvg)</h3>
      <div className="svg-editor-grid">
        <div className="svg-editor-form">
          <div className="field-row">
            <label>viewBox:</label>
            <input type="text" value={map.viewBox || '0 0 700 520'} onChange={(e) => patchMap({ viewBox: e.target.value })} />
          </div>
          <div className="field-row">
            <label>background:</label>
            <input type="text" value={map.background || '#0f1820'} onChange={(e) => patchMap({ background: e.target.value })} />
          </div>
          <div className="field-row">
            <label>landPath:</label>
            <textarea rows={4} value={map.landPath || ''} onChange={(e) => patchMap({ landPath: e.target.value })} />
          </div>
          <div className="field-row">
            <label>landFill:</label>
            <input type="text" value={map.landFill || ''} onChange={(e) => patchMap({ landFill: e.target.value })} list="map-fill-presets" />
            <datalist id="map-fill-presets">
              {MAP_FILL_PRESETS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </datalist>
          </div>
          <div className="field-row">
            <label>landStroke:</label>
            <input type="text" value={map.landStroke || ''} onChange={(e) => patchMap({ landStroke: e.target.value })} />
            <label>width:</label>
            <input type="number" step="0.5" value={map.landStrokeWidth ?? 2} onChange={(e) => patchMap({ landStrokeWidth: Number(e.target.value) })} />
          </div>
        </div>

        <div className="svg-preview">
          <div className="svg-preview-label">پیش‌نمایش قاره ({map.viewBox || '0 0 700 520'})</div>
          <svg viewBox={map.viewBox || '0 0 700 520'} className="svg-preview-canvas">
            <defs>
              <filter id="prevContShadow">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
              </filter>
              <linearGradient id="prevContLand" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3a4a32" />
                <stop offset="100%" stopColor="#2a3826" />
              </linearGradient>
              <linearGradient id="prevContLandSouth" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a4030" />
                <stop offset="100%" stopColor="#3a3224" />
              </linearGradient>
              <pattern id="prevForestPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="3" fill="#1e2a18" opacity="0.6" />
                <circle cx="30" cy="25" r="3" fill="#1e2a18" opacity="0.5" />
                <circle cx="20" cy="35" r="2.5" fill="#1e2a18" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={map.background || '#0f1820'} />
            {map.landPath && (
              <path d={map.landPath} fill={resolveFill(map.landFill, 'map')} stroke={map.landStroke || '#5a6a48'} strokeWidth={map.landStrokeWidth ?? 2} filter="url(#prevContShadow)" />
            )}
            {mapDecorations.map((dec, i) => renderDecoration(dec, i, resolveFill))}
          </svg>
        </div>
      </div>

      <h4>✨ تزئینات نقشه‌ی قاره ({mapDecorations.length})</h4>
      <div className="decorations-list">
        {mapDecorations.map((dec, i) => (
          <DecorationEditor key={i} dec={dec} index={i} onChange={(nd) => updateMapDec(i, nd)} onRemove={() => removeMapDec(i)} />
        ))}
        <div className="decoration-add-buttons">
          <button type="button" className="add-btn" onClick={() => addMapDec('path')}>+ مسیر</button>
          <button type="button" className="add-btn" onClick={() => addMapDec('ellipse')}>+ بیضی</button>
          <button type="button" className="add-btn" onClick={() => addMapDec('mountains')}>+ کوه</button>
        </div>
      </div>

      <h3>📍 POIهای این قاره ({continent.pois?.length || 0})</h3>
      <p className="empty-note">برای ویرایش هر POI، از درخت سمت چپ روی آن کلیک کن.</p>
    </div>
  );
}

/* ============================================================
   resolveFill — تبدیل idهای اصلی به idهای پیش‌نمایش
   ============================================================ */
function resolveFill(fill, ctx) {
  if (!fill) return ctx === 'map' ? 'url(#prevContLand)' : 'url(#prevLandGradient)';
  if (fill === 'url(#landGradient)') return 'url(#prevLandGradient)';
  if (fill === 'url(#landGradientSouth)') return 'url(#prevLandGradientSouth)';
  if (fill === 'url(#contLand)') return 'url(#prevContLand)';
  if (fill === 'url(#contLandSouth)') return 'url(#prevContLandSouth)';
  if (fill === 'url(#forestPattern)') return 'url(#prevForestPattern)';
  return fill;
}

/* ============================================================
   renderDecoration — رسم تزئینات (path / ellipse / mountains)
   ============================================================ */
function renderDecoration(dec, i, resolveFill) {
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
}

/* ============================================================
   DecorationEditor — ویرایش یک تزئین
   ============================================================ */
function DecorationEditor({ dec, index, onChange, onRemove }) {
  const patch = (p) => onChange({ ...dec, ...p });

  return (
    <div className="block-editor">
      <div className="block-editor-header">
        <span className="block-index">تزئین #{index + 1} ({dec.type})</span>
        <div className="block-actions">
          <button type="button" className="danger" onClick={onRemove}>✕</button>
        </div>
      </div>

      <div className="block-fields">
        {dec.type === 'path' && (
          <>
            <textarea rows={2} value={dec.d || ''} onChange={(e) => patch({ d: e.target.value })} placeholder="M0,0 L100,100" />
            <div className="field-row">
              <label>stroke:</label>
              <input type="text" value={dec.stroke || ''} onChange={(e) => patch({ stroke: e.target.value })} />
              <label>width:</label>
              <input type="number" step="0.5" value={dec.strokeWidth ?? 1} onChange={(e) => patch({ strokeWidth: Number(e.target.value) })} />
            </div>
          </>
        )}

        {dec.type === 'ellipse' && (
          <>
            <div className="field-row">
              <label>cx:</label>
              <input type="number" value={dec.cx ?? 0} onChange={(e) => patch({ cx: Number(e.target.value) })} />
              <label>cy:</label>
              <input type="number" value={dec.cy ?? 0} onChange={(e) => patch({ cy: Number(e.target.value) })} />
            </div>
            <div className="field-row">
              <label>rx:</label>
              <input type="number" value={dec.rx ?? 0} onChange={(e) => patch({ rx: Number(e.target.value) })} />
              <label>ry:</label>
              <input type="number" value={dec.ry ?? 0} onChange={(e) => patch({ ry: Number(e.target.value) })} />
            </div>
            <div className="field-row">
              <label>fill:</label>
              <input type="text" value={dec.fill || ''} onChange={(e) => patch({ fill: e.target.value })} />
            </div>
          </>
        )}

        {dec.type === 'mountains' && (
          <>
            <p className="empty-note" style={{ fontSize: '0.75rem' }}>مختصات کوه‌ها (x,y):</p>
            {(dec.points || []).map((m, mi) => (
              <div key={mi} className="field-row">
                <label>#{mi + 1}</label>
                <input type="number" value={m.x ?? 0} onChange={(e) => {
                  const points = [...(dec.points || [])];
                  points[mi] = { ...points[mi], x: Number(e.target.value) };
                  patch({ points });
                }} placeholder="x" style={{ maxWidth: 80 }} />
                <input type="number" value={m.y ?? 0} onChange={(e) => {
                  const points = [...(dec.points || [])];
                  points[mi] = { ...points[mi], y: Number(e.target.value) };
                  patch({ points });
                }} placeholder="y" style={{ maxWidth: 80 }} />
                <button type="button" className="tree-icon-btn danger small" onClick={() => {
                  patch({ points: (dec.points || []).filter((_, idx) => idx !== mi) });
                }}>✕</button>
              </div>
            ))}
            <button type="button" className="add-btn" onClick={() => {
              patch({ points: [...(dec.points || []), { x: 100, y: 100 }] });
            }}>+ کوه جدید</button>
            <div className="field-row">
              <label>fill:</label>
              <input type="text" value={dec.fill || ''} onChange={(e) => patch({ fill: e.target.value })} />
            </div>
          </>
        )}

        <div className="field-row">
          <label>opacity:</label>
          <input type="number" step="0.05" min="0" max="1" value={dec.opacity ?? 1} onChange={(e) => patch({ opacity: Number(e.target.value) })} />
        </div>
      </div>
    </div>
  );
}