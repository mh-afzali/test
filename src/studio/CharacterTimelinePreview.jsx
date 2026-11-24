import React, { useMemo } from 'react';
import { formatDate } from '../utils/calendar';

/**
 * انتخاب version مناسب برای یک زمان مشخص.
 * منطق: اولین version که from <= time < to (یا to=null) باشد.
 */
export function getVersionAt(versions, time) {
  if (!Array.isArray(versions) || versions.length === 0) return null;
  const sorted = [...versions].sort((a, b) => (a.from ?? 0) - (b.from ?? 0));
  for (const v of sorted) {
    const from = v.from ?? 0;
    const to = v.to ?? Infinity;
    if (time >= from && time < to) return v;
  }
  return null;
}

export default function CharacterTimelinePreview({
  characters,
  world,
  time,
}) {
  // نقشه‌ی poiId → نام
  const poiNameById = useMemo(() => {
    const map = {};
    for (const c of world.continents || []) {
      for (const p of c.pois || []) {
        map[p.id] = p.name;
      }
    }
    return map;
  }, [world]);

  const rows = useMemo(() => {
    return (characters || []).map((ch) => {
      const version = getVersionAt(ch.versions, time);
      return {
        character: ch,
        version,
        locationName: version?.locationId
          ? poiNameById[version.locationId] || version.locationId
          : null,
      };
    });
  }, [characters, time, poiNameById]);

  const statusColor = (status) => {
    if (status === 'زنده') return '#8fd08f';
    if (status === 'مرده') return '#e88a8a';
    if (status === 'مفقود') return '#e8a85c';
    if (status === 'اسطوره') return '#c8a8e8';
    return '#a89a78';
  };

  if (!characters || characters.length === 0) {
    return <p className="empty-note">هیچ شخصیتی تعریف نشده است.</p>;
  }

  return (
    <div className="char-timeline-preview">
      <div className="ctp-header">
        <span>👤 وضعیت شخصیت‌ها در زمان <strong>{formatDate(time)}</strong></span>
        <span className="ctp-count">{rows.length} شخصیت</span>
      </div>

      <div className="ctp-grid">
        {rows.map(({ character, version, locationName }) => {
          const exists = !!version;
          return (
            <div
              key={character.id}
              className={`ctp-card ${!exists ? 'not-exist' : ''}`}
            >
              <div className="ctp-card-header">
                <span className="ctp-name">{character.name}</span>
                {version && (
                  <span
                    className="ctp-status"
                    style={{
                      color: statusColor(version.status),
                      borderColor: statusColor(version.status),
                    }}
                  >
                    {version.status}
                  </span>
                )}
              </div>

              {character.titles && character.titles.length > 0 && (
                <div className="ctp-titles">
                  {character.titles.map((t, i) => (
                    <span key={i} className="ctp-title">{t}</span>
                  ))}
                </div>
              )}

              {exists ? (
                <>
                  {locationName ? (
                    <div className="ctp-location">
                      📍 {locationName}
                    </div>
                  ) : (
                    <div className="ctp-location ctp-none">بدون مکان</div>
                  )}
                  {version.bio && (
                    <div className="ctp-bio">{version.bio}</div>
                  )}
                  <div className="ctp-range">
                    بازه: {formatDate(version.from ?? 0)}
                    {version.to != null ? ` → ${formatDate(version.to)}` : ' → بی‌نهایت'}
                  </div>
                </>
              ) : (
                <div className="ctp-missing">
                  در این زمان نسخه‌ای تعریف نشده.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}