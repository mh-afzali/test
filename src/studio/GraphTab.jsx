import React, { useMemo, useState } from 'react';
import GraphView from './GraphView';
import { buildGraph, getGraphStats } from './graphBuilder';

const KIND_LABELS = {
  continent: 'قاره',
  poi: 'POI',
  narrative: 'روایت',
  character: 'شخصیت',
  event: 'رویداد',
};

const KIND_COLORS = {
  continent: '#c8732a',
  poi: '#8fd08f',
  narrative: '#8fa8d0',
  character: '#e88ac8',
  event: '#e88a8a',
};

export default function GraphTab({ world, characters, events, onNodeClick }) {
  const [hiddenKinds, setHiddenKinds] = useState(new Set());
  const [showOrphansOnly, setShowOrphansOnly] = useState(false);

  const fullGraph = useMemo(
    () => buildGraph(world, characters, events),
    [world, characters, events]
  );

  const stats = useMemo(() => getGraphStats(fullGraph), [fullGraph]);

  const graph = useMemo(() => {
    let nodes = fullGraph.nodes;
    let edges = fullGraph.edges;

    if (hiddenKinds.size > 0) {
      nodes = nodes.filter((n) => !hiddenKinds.has(n.kind));
      const ids = new Set(nodes.map((n) => n.id));
      edges = edges.filter((e) => ids.has(e.from) && ids.has(e.to));
    }
    if (showOrphansOnly) {
      const orphanIds = new Set(nodes.filter((n) => n.orphan).map((n) => n.id));
      nodes = nodes.filter((n) => orphanIds.has(n.id));
      edges = [];
    }
    return { nodes, edges };
  }, [fullGraph, hiddenKinds, showOrphansOnly]);

  const toggleKind = (kind) => {
    const next = new Set(hiddenKinds);
    if (next.has(kind)) next.delete(kind);
    else next.add(kind);
    setHiddenKinds(next);
  };

  return (
    <div className="graph-tab">
      {/* کنترل‌ها */}
      <div className="graph-controls">
        <div className="graph-filters">
          <span className="graph-filters-label">نمایش:</span>
          {Object.entries(KIND_LABELS).map(([kind, label]) => (
            <button
              key={kind}
              className={`graph-filter-btn ${hiddenKinds.has(kind) ? 'off' : 'on'}`}
              onClick={() => toggleKind(kind)}
              style={{
                borderColor: KIND_COLORS[kind],
                color: hiddenKinds.has(kind) ? '#5a4a30' : KIND_COLORS[kind],
              }}
            >
              <span className="graph-filter-dot" style={{ background: KIND_COLORS[kind] }} />
              {label} ({stats.byKind[kind] || 0})
            </button>
          ))}
        </div>

        <div className="graph-actions">
          <label className="graph-orphan-toggle">
            <input
              type="checkbox"
              checked={showOrphansOnly}
              onChange={(e) => setShowOrphansOnly(e.target.checked)}
            />
            فقط یتیم‌ها ({stats.orphans.length})
          </label>
        </div>
      </div>

      {/* آمار */}
      <div className="graph-stats">
        <div className="sim-stat">
          <div className="sim-stat-value">{stats.totalNodes}</div>
          <div className="sim-stat-label">گره</div>
        </div>
        <div className="sim-stat">
          <div className="sim-stat-value">{stats.totalEdges}</div>
          <div className="sim-stat-label">یال</div>
        </div>
        <div className="sim-stat">
          <div className="sim-stat-value" style={{ color: '#e8742a' }}>{stats.orphans.length}</div>
          <div className="sim-stat-label">یتیم</div>
        </div>
      </div>

      {/* گراف */}
      <GraphView graph={graph} onNodeClick={onNodeClick} />

      {/* هشدار یتیم‌ها */}
      {stats.orphans.length > 0 && !showOrphansOnly && (
        <div className="graph-orphan-warning">
          ⚠️ {stats.orphans.length} گره بدون اتصال است. برای دیدنشان «فقط یتیم‌ها» را فعال کن.
        </div>
      )}
    </div>
  );
}