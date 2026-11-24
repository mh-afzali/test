import React from 'react';

export default function CharactersView({ worldData, state, onBack, onOpenCharacter }) {
  const characters = worldData.characters || [];

  return (
    <div className="characters-view">
      <button className="back-btn" onClick={onBack}>← بازگشت</button>
      <h2 className="characters-title">شخصیت‌ها</h2>

      {characters.length === 0 && (
        <p className="empty-note">هنوز شخصیتی در این دنیا نیست.</p>
      )}

      <div className="character-grid">
        {characters.map((ch) => {
          const seen = state.seenCharacters?.includes(ch.id);
          const version = getVersionAt(ch, state.time);
          return (
            <button
              key={ch.id}
              className={`character-card ${!seen ? 'unseen' : ''}`}
              onClick={() => {
                if (!seen) return; // ← کارت کشف‌نشده باز نمی‌شود
                onOpenCharacter(ch);
              }}
              disabled={!seen}
              title={!seen ? 'هنوز کشف نشده' : ch.name}
            >
              <div className="character-card-icon">
                {seen ? '👤' : '❔'}
              </div>
              <div className="character-card-info">
                <div className="character-card-name">
                  {seen ? ch.name : '؟؟؟'}
                </div>
                {seen && version ? (
                  <div className="character-card-status">
                    <span className={`status-tag status-${version.status}`}>{version.status}</span>
                  </div>
                ) : (
                  <div className="character-card-hint">هنوز کشف نشده</div>
                )}
              </div>
            </button>
          );
        })}
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