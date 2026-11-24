import React, { useEffect, useState } from 'react';
import AnimatedNumber from './AnimatedNumber';

export default function TimeControl({ state, worldData, onChange, lastChanges }) {
  const steps = worldData.timeSteps;
  const nextIndex = Math.min(state.timelineIndex + 1, steps.length - 1);
  const nextStep = steps[nextIndex];
  const hasNext = state.timelineIndex < steps.length - 1;

  const [showChanges, setShowChanges] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    if (!lastChanges) return;
    setShowChanges(true);
    const t = setTimeout(() => setShowChanges(false), 3200);
    return () => clearTimeout(t);
  }, [lastChanges]);

  const handleClick = () => {
    setIsAdvancing(true);
    onChange();
    setTimeout(() => setIsAdvancing(false), 950);
  };

  const hasUnlockMessage = lastChanges?.newlyUnlocked?.length > 0;

  return (
    <div className={`time-control ${isAdvancing ? 'is-advancing' : ''}`}>
      <div className="time-current">
        سال <AnimatedNumber value={state.time} />
      </div>

      <button
        className="time-btn"
        onClick={handleClick}
        disabled={!hasNext || isAdvancing}
      >
        {hasNext ? (
          <>
            <span className="time-btn-icon">⏳</span>
            گذر زمان
            <span className="time-btn-step">+{nextStep.advance} روز</span>
          </>
        ) : (
          'پایان زمان'
        )}
      </button>

      {showChanges && hasUnlockMessage && (
        <div className="time-changes">
          <span className="change-item unlock">
            📖 {lastChanges.newlyUnlocked.length} روایت جدید باز شد
          </span>
        </div>
      )}
    </div>
  );
}