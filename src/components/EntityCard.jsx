import React from 'react';

export default function EntityCard({ entity, kind, state, worldData, onClose, onNavigatePoi }) {
  const version = getVersionAt(entity, state.time);
  if (!version) return null;

  return (
    <div className="entity-modal-backdrop" onClick={onClose}>
      <div className="entity-modal" onClick={(e) => e.stopPropagation()}>
        <button className="entity-close" onClick={onClose}>✕</button>

        <header className="entity-header">
          <h2>{entity.name}</h2>
          <span className="entity-kind">{kind === 'char' ? 'شخصیت' : 'رویداد'}</span>
        </header>

        {kind === 'char' && (
          <>
            <div className="entity-status">
              <span className={`status-tag status-${version.status}`}>{version.status}</span>
              {version.locationId && (
                <span className="entity-location">
                  📍 {getLocationName(version.locationId, worldData)}
                </span>
              )}
            </div>
            <p className="entity-bio">{version.bio}</p>
            {entity.titles?.length > 0 && (
              <div className="entity-titles">
                {entity.titles.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            )}
          </>
        )}

        {kind === 'event' && (
          <>
            <div className="entity-status">
              <span className={`status-tag status-${version.status}`}>{version.status}</span>
              <span className="entity-time">
                {entity.startTime}{entity.endTime ? `–${entity.endTime}` : ''}
              </span>
            </div>
            <p className="entity-summary">{version.summary}</p>
            {entity.participants?.length > 0 && (
              <div className="entity-participants">
                <strong>درگیران:</strong>
                {entity.participants.map((pid) => {
                  const ch = (worldData.characters || []).find((c) => c.id === pid);
                  return ch ? <span key={pid} className="participant-tag">{ch.name}</span> : null;
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function getVersionAt(entity, time) {
  for (const v of entity.versions || []) {
    if (v.from <= time && (v.to == null || time < v.to)) return v;
  }
  return (entity.versions || [])[0] || null;
}

function getLocationName(locationId, worldData) {
  for (const c of worldData.continents) {
    for (const p of c.pois) {
      if (p.id === locationId) return p.name;
    }
  }
  return '؟';
}