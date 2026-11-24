import React, { useMemo, useState } from 'react';

const KIND_COLORS = {
  world: '#e8a85c',
  continent: '#c8732a',
  poi: '#8fd08f',
  narrative: '#8fa8d0',
  character: '#e88ac8',
  event: '#e88a8a',
};

const KIND_LABELS = {
  world: 'جهان',
  continent: 'قاره',
  poi: 'POI',
  narrative: 'روایت',
  character: 'شخصیت',
  event: 'رویداد',
};

const EDGE_COLORS = {
  contains: '#5a4a30',
  has: '#5a4a30',
  located_at: '#4a6a3a',
  occurs_at: '#6a3a3a',
  participant: '#6a4a5a',
  related: '#5a3a5a',
  mentions: '#3a4a6a',
};

function computeLayout(nodes, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const grouped = {};
  for (const n of nodes) {
    if (!grouped[n.kind]) grouped[n.kind] = [];
    grouped[n.kind].push(n);
  }

  const ringOrder = ['world', 'continent', 'poi', 'narrative', 'character', 'event'];
  const maxR = Math.min(width, height) / 2 - 80;
  const ringStep = maxR / (ringOrder.length + 1);

  const positions = {};
  ringOrder.forEach((kind, ringIndex) => {
    const group = grouped[kind] || [];
    if (group.length === 0) return;
    const r = ringStep * (ringIndex + 1);
    const angleStep = (2 * Math.PI) / group.length;
    group.forEach((node, i) => {
      const angle = angleStep * i - Math.PI / 2;
      positions[node.id] = {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    });
  });

  return positions;
}

export default function GraphView({ graph, onNodeClick, width = 900, height = 700 }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const positions = useMemo(
    () => computeLayout(graph.nodes, width, height),
    [graph.nodes, width, height]
  );

  const highlighted = useMemo(() => {
    if (!selected) return null;
    const connected = new Set([selected]);
    for (const e of graph.edges) {
      if (e.from === selected) connected.add(e.to);
      if (e.to === selected) connected.add(e.from);
    }
    return connected;
  }, [selected, graph.edges]);

  const selectedNode = selected ? graph.nodes.find((n) => n.id === selected) : null;
  const selectedEdges = selected
    ? graph.edges.filter((e) => e.from === selected || e.to === selected)
    : [];

  return (
    <div className="graph-view">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="graph-canvas"
        onClick={() => setSelected(null)}
      >
        {/* یال‌ها */}
        {graph.edges.map((e, i) => {
          const from = positions[e.from];
          const to = positions[e.to];
          if (!from || !to) return null;
          const isHighlighted = highlighted && (e.from === selected || e.to === selected);
          const isDimmed = highlighted && !isHighlighted;
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={EDGE_COLORS[e.kind] || '#3a2e20'}
              strokeWidth={isHighlighted ? 2.5 : 1}
              opacity={isDimmed ? 0.08 : isHighlighted ? 0.9 : 0.4}
            />
          );
        })}

        {/* گره‌ها */}
        {graph.nodes.map((n) => {
          const pos = positions[n.id];
          if (!pos) return null;
          const color = KIND_COLORS[n.kind] || '#8a7a66';
          const isSelected = selected === n.id;
          const isHovered = hovered === n.id;
          const isHighlighted = highlighted && highlighted.has(n.id);
          const isDimmed = highlighted && !isHighlighted;
          const r = isSelected ? 12 : isHovered ? 11 : n.orphan ? 7 : 9;

          // شفافیت لیبل
          const labelOpacity = isSelected || isHovered ? 1 : isDimmed ? 0.15 : 0.9;
          const labelWeight = isSelected || isHovered ? 'bold' : 'normal';
          const labelSize = isSelected || isHovered ? 15 : 13;

          // عرض تقریبی لیبل برای پس‌زمینه
          const labelWidth = Math.max(20, n.label.length * labelSize * 0.55);

          return (
            <g
              key={n.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{ cursor: 'pointer' }}
              onClick={(ev) => {
                ev.stopPropagation();
                setSelected(isSelected ? null : n.id);
              }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {n.orphan && (
                <circle
                  r={r + 4}
                  fill="none"
                  stroke="#e8742a"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.7"
                />
              )}
              <circle
                r={r}
                fill={color}
                stroke={isSelected ? '#fff' : '#0f0c0a'}
                strokeWidth={isSelected ? 2 : 1}
                opacity={isDimmed ? 0.15 : 1}
              />
              {/* پس‌زمینه‌ی لیبل */}
              <rect
                x={r + 6}
                y={-labelSize / 2 - 3}
                width={labelWidth}
                height={labelSize + 4}
                rx={3}
                fill="#0a0806"
                opacity={labelOpacity * 0.75}
                style={{ pointerEvents: 'none' }}
              />
              {/* لیبل — همیشه نمایش داده می‌شود */}
              <text
                x={r + 10}
                y={labelSize / 2 - 3}
                fontSize={labelSize}
                fontWeight={labelWeight}
                fill={isSelected || isHovered ? '#fff' : '#e8dcc0'}
                opacity={labelOpacity}
                style={{ pointerEvents: 'none', fontFamily: 'inherit' }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* پنل جزئیات */}
      {selectedNode && (
        <div className="graph-details" onClick={(e) => e.stopPropagation()}>
          <div className="graph-details-header">
            <span
              className="graph-kind-badge"
              style={{ background: KIND_COLORS[selectedNode.kind] }}
            >
              {KIND_LABELS[selectedNode.kind]}
            </span>
            <button className="graph-details-close" onClick={() => setSelected(null)}>
              ✕
            </button>
          </div>
          <h3>{selectedNode.label}</h3>
          <p className="graph-details-id">
            <code>{selectedNode.refId}</code>
          </p>
          {selectedNode.orphan && (
            <p className="graph-details-orphan">
              ⚠️ این گره هیچ اتصالی ندارد (یتیم).
            </p>
          )}
          <button
            className="save-btn"
            style={{ marginTop: 8 }}
            onClick={() => onNodeClick?.(selectedNode)}
          >
            ✏️ ویرایش این موجودیت
          </button>
          <h4>اتصالات ({selectedEdges.length})</h4>
          <ul className="graph-edge-list">
            {selectedEdges.map((e, i) => {
              const isOut = e.from === selected;
              const otherId = isOut ? e.to : e.from;
              const otherNode = graph.nodes.find((n) => n.id === otherId);
              return (
                <li key={i}>
                  <span className="graph-edge-kind">
                    {isOut ? '→' : '←'} {e.label}
                  </span>
                  <span className="graph-edge-target">
                    {otherNode?.label || otherId}
                  </span>
                </li>
              );
            })}
            {selectedEdges.length === 0 && (
              <li className="empty-note">اتصالی ندارد.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}