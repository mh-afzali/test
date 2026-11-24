import React from 'react';

export default function UnreadBadge({ show, label }) {
  if (!show) return null;
  return <span className="unread-badge" title="نخوانده">{label || '●'}</span>;
}