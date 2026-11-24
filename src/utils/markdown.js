export function parseInline(text) {
  const tokens = [];
  const regex = /(\*\*[^*]+\*\*|\[\[(?:poi|char|event):[^\]]+\]\])/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith('**')) {
      tokens.push({ type: 'bold', value: raw.slice(2, -2) });
    } else {
      const inner = raw.slice(2, -2);
      const [kind, ...rest] = inner.split(':');
      tokens.push({ type: 'link', kind, value: rest.join(':') });
    }
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return tokens;
}

export function findTargetByName(kind, name, worldData) {
  if (kind === 'poi') {
    for (const c of worldData.continents) {
      for (const p of c.pois) {
        if (p.name === name) return { kind: 'poi', id: p.id, poi: p, continent: c };
      }
    }
  } else if (kind === 'char') {
    const ch = (worldData.characters || []).find((c) => c.name === name);
    if (ch) return { kind: 'char', id: ch.id, character: ch };
  } else if (kind === 'event') {
    const ev = (worldData.events || []).find((e) => e.name === name);
    if (ev) return { kind: 'event', id: ev.id, event: ev };
  }
  return null;
}