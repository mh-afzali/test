import { parseInline } from '../utils/markdown';

/**
 * ساخت گراف از داده‌های پروژه.
 * خروجی:
 *   nodes: [{ id, kind, label, refId, orphan }]
 *   edges: [{ from, to, kind, label }]
 */
export function buildGraph(world, characters, events) {
  const nodes = [];
  const edges = [];
  const nodeIds = new Set();

  const addNode = (node) => {
    if (nodeIds.has(node.id)) return;
    nodeIds.add(node.id);
    nodes.push({ ...node, orphan: true });
  };

  const addEdge = (from, to, kind, label) => {
    if (!nodeIds.has(from) || !nodeIds.has(to)) return;
    edges.push({ from, to, kind, label });
    // غیریتیم کردن
    const fromNode = nodes.find((n) => n.id === from);
    const toNode = nodes.find((n) => n.id === to);
    if (fromNode) fromNode.orphan = false;
    if (toNode) toNode.orphan = false;
  };

  /* ===== گره‌ها ===== */
  // قاره‌ها
  for (const c of world.continents || []) {
    addNode({
      id: `continent:${c.id}`,
      kind: 'continent',
      label: c.name,
      refId: c.id,
    });
  }

  // POIها
  for (const c of world.continents || []) {
    for (const p of c.pois || []) {
      addNode({
        id: `poi:${p.id}`,
        kind: 'poi',
        label: p.name,
        refId: p.id,
        continentId: c.id,
      });
      addEdge(`continent:${c.id}`, `poi:${p.id}`, 'contains', 'شامل');
    }
  }

  // روایت‌ها
  for (const c of world.continents || []) {
    for (const p of c.pois || []) {
      for (const n of p.narratives || []) {
        addNode({
          id: `narrative:${n.id}`,
          kind: 'narrative',
          label: n.title,
          refId: n.id,
          poiId: p.id,
        });
        addEdge(`poi:${p.id}`, `narrative:${n.id}`, 'has', 'دارد');
      }
    }
  }

  // شخصیت‌ها
  for (const ch of characters || []) {
    addNode({
      id: `character:${ch.id}`,
      kind: 'character',
      label: ch.name,
      refId: ch.id,
    });
  }

  // رویدادها
  for (const ev of events || []) {
    addNode({
      id: `event:${ev.id}`,
      kind: 'event',
      label: ev.name,
      refId: ev.id,
    });
  }

  /* ===== یال‌ها ===== */

  // character → poi (locationId در versions)
  for (const ch of characters || []) {
    const locIds = new Set(
      (ch.versions || []).map((v) => v.locationId).filter(Boolean)
    );
    for (const locId of locIds) {
      addEdge(`character:${ch.id}`, `poi:${locId}`, 'located_at', 'در');
    }
  }

  // event → poi (locationIds)
  for (const ev of events || []) {
    for (const locId of ev.locationIds || []) {
      addEdge(`event:${ev.id}`, `poi:${locId}`, 'occurs_at', 'رخ می‌دهد در');
    }
  }

  // event → character (participants)
  for (const ev of events || []) {
    for (const chId of ev.participants || []) {
      addEdge(`event:${ev.id}`, `character:${chId}`, 'participant', 'شرکت‌کننده');
    }
  }

  // event → event (relatedEvents)
  for (const ev of events || []) {
    for (const relId of ev.relatedEvents || []) {
      addEdge(`event:${ev.id}`, `event:${relId}`, 'related', 'مرتبط با');
    }
  }

  // narrative → character / poi / event (ارجاع‌های درون‌متنی)
  for (const c of world.continents || []) {
    for (const p of c.pois || []) {
      for (const n of p.narratives || []) {
        const refs = extractNarrativeRefs(n);
        for (const ref of refs) {
          if (ref.kind === 'char') {
            const target = (characters || []).find((ch) => ch.name === ref.name);
            if (target) {
              addEdge(`narrative:${n.id}`, `character:${target.id}`, 'mentions', 'اشاره به');
            }
          } else if (ref.kind === 'poi') {
            let targetId = null;
            for (const cc of world.continents || []) {
              const found = (cc.pois || []).find((pp) => pp.name === ref.name);
              if (found) { targetId = found.id; break; }
            }
            if (targetId) {
              addEdge(`narrative:${n.id}`, `poi:${targetId}`, 'mentions', 'اشاره به');
            }
          } else if (ref.kind === 'event') {
            const target = (events || []).find((e) => e.name === ref.name);
            if (target) {
              addEdge(`narrative:${n.id}`, `event:${target.id}`, 'mentions', 'اشاره به');
            }
          }
        }
      }
    }
  }

  return { nodes, edges };
}

/** استخراج ارجاع‌های [[char/poi/event:name]] از همه‌ی بلاک‌های یک روایت */
export function extractNarrativeRefs(narrative) {
  const refs = [];
  const seen = new Set();
  const walkText = (text) => {
    if (typeof text !== 'string' || !text.includes('[[')) return;
    const tokens = parseInline(text);
    for (const tok of tokens) {
      if (tok.type !== 'link') continue;
      const key = `${tok.kind}:${tok.value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      refs.push({ kind: tok.kind, name: tok.value });
    }
  };

  for (const section of narrative.sections || []) {
    for (const block of section.content || []) {
      if (['text', 'callout', 'dialogue', 'quote', 'scene'].includes(block.type)) {
        walkText(block.value);
      }
    }
  }
  return refs;
}

/** آمار گراف */
export function getGraphStats(graph) {
  const byKind = {};
  for (const n of graph.nodes) {
    byKind[n.kind] = (byKind[n.kind] || 0) + 1;
  }
  const orphans = graph.nodes.filter((n) => n.orphan);
  return {
    totalNodes: graph.nodes.length,
    totalEdges: graph.edges.length,
    byKind,
    orphans,
  };
}