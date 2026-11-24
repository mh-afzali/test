import React from 'react';

export default function TreeSidebar({ world, selected, onSelect }) {
  if (!world) return null;

  return (
    <div className="tree">
      <h3 className="tree-title">🌍 {world.world?.name || 'جهان'}</h3>
      {world.continents.map((continent) => (
        <div key={continent.id} className="tree-continent">
          <div className="tree-continent-name">🗺 {continent.name}</div>
          {continent.pois.map((poi) => (
            <div key={poi.id} className="tree-poi">
              <div className="tree-poi-name">📍 {poi.name}</div>
              <ul className="tree-narratives">
                {poi.narratives.map((n) => {
                  const active = selected?.narrativeId === n.id;
                  return (
                    <li key={n.id}>
                      <button
                        className={`tree-narrative-btn ${active ? 'active' : ''}`}
                        onClick={() =>
                          onSelect({
                            narrativeId: n.id,
                            poiId: poi.id,
                            continentId: continent.id,
                          })
                        }
                      >
                        <span className="tree-nar-kind">{n.kind}</span>
                        <span className="tree-nar-title">{n.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}