import React from 'react';

export default function TreeSidebar({
  world,
  selected,
  onSelect,
  onAddContinent,
  onRemoveContinent,
  onAddPoi,
  onRemovePoi,
  onAddNarrative,
  onRemoveNarrative,
}) {
  if (!world) return null;

  const worldSelected = selected?.kind === 'world';

  return (
    <div className="tree">
      <div className="tree-top">
        <button
          className={`tree-world-btn ${worldSelected ? 'active' : ''}`}
          onClick={() => onSelect({ kind: 'world' })}
          title="ویرایش اطلاعات کلی دنیا و گام‌های زمانی"
        >
          🌍 {world.world?.name || 'جهان'}
        </button>
        <button
          className="tree-add-btn"
          title="افزودن قاره"
          onClick={onAddContinent}
        >
          + قاره
        </button>
      </div>

      {world.continents.map((continent) => {
        const contSelected =
          selected?.kind === 'continent' && selected.id === continent.id;

        return (
          <div key={continent.id} className="tree-continent">
            {/* === ردیف قاره === */}
            <div className={`tree-continent-row ${contSelected ? 'active' : ''}`}>
              <button
                className="tree-label-btn"
                onClick={() => onSelect({ kind: 'continent', id: continent.id })}
                title="ویرایش قاره"
              >
                🗺 {continent.name}
              </button>
              <button
                className="tree-icon-btn"
                title="افزودن POI به این قاره"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddPoi(continent.id);
                }}
              >
                +
              </button>
              <button
                className="tree-icon-btn danger"
                title="حذف قاره"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveContinent(continent.id);
                }}
              >
                ✕
              </button>
            </div>

            {/* === POIهای قاره === */}
            {continent.pois.map((poi) => {
              const poiSelected =
                selected?.kind === 'poi' && selected.id === poi.id;

              return (
                <div key={poi.id} className="tree-poi">
                  <div className={`tree-poi-row ${poiSelected ? 'active' : ''}`}>
                    <button
                      className="tree-label-btn"
                      onClick={() => onSelect({ kind: 'poi', id: poi.id })}
                      title="ویرایش POI"
                    >
                      📍 {poi.name}
                    </button>
                    <button
                      className="tree-icon-btn"
                      title="افزودن روایت به این POI"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddNarrative(poi.id);
                      }}
                    >
                      +
                    </button>
                    <button
                      className="tree-icon-btn danger"
                      title="حذف POI"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePoi(poi.id);
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* === روایت‌های POI === */}
                  <ul className="tree-narratives">
                    {(poi.narratives || []).map((n) => {
                      const narSelected =
                        selected?.kind === 'narrative' && selected.id === n.id;

                      return (
                        <li key={n.id} className="tree-narrative-row">
                          <button
                            className={`tree-narrative-btn ${narSelected ? 'active' : ''}`}
                            onClick={() =>
                              onSelect({
                                kind: 'narrative',
                                id: n.id,
                                poiId: poi.id,
                                continentId: continent.id,
                              })
                            }
                            title="ویرایش روایت"
                          >
                            <span className="tree-nar-kind">{n.kind}</span>
                            <span className="tree-nar-title">{n.title}</span>
                          </button>
                          <button
                            className="tree-icon-btn danger small"
                            title="حذف روایت"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveNarrative(n.id);
                            }}
                          >
                            ✕
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}