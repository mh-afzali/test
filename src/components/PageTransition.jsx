// src/components/PageTransition.jsx
import React, { useEffect, useState } from 'react';

export default function PageTransition({ viewKey, children }) {
  const [displayed, setDisplayed] = useState(children);
  const [phase, setPhase] = useState('enter'); // enter | exit

  useEffect(() => {
    setPhase('exit');
    const t = setTimeout(() => {
      setDisplayed(children);
      setPhase('enter');
    }, 220);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey]);

  return (
    <div className={`page-transition phase-${phase}`}>
      {displayed}
    </div>
  );
}