import React, { useMemo } from 'react';
import NarrativeReader from '../components/NarrativeReader';
import { makePreviewWorldData, makePreviewState } from './api';

export default function LivePreview({ narrative, world, characters, events, previewTime }) {
  const worldData = useMemo(
    () => makePreviewWorldData(world, characters, events),
    [world, characters, events]
  );

  const previewState = useMemo(
    () => (narrative ? makePreviewState(narrative, previewTime) : null),
    [narrative, previewTime]
  );

  if (!narrative) {
    return <div className="empty-note">برای دیدن پیش‌نمایش، یک روایت انتخاب کن.</div>;
  }

  return (
    <div className="live-preview">
      <div className="preview-toolbar">
        <span>پیش‌نمایش زنده در زمان: <strong>{previewTime}</strong></span>
      </div>
      <div className="preview-stage">
        <NarrativeReader
          narrative={narrative}
          state={previewState}
          worldData={worldData}
          preview
          onBack={() => {}}
          onSectionRead={() => {}}
          onNavigatePoi={() => {}}
          onOpenCharacter={() => {}}
          onOpenEvent={() => {}}
        />
      </div>
    </div>
  );
}