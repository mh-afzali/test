import React from 'react';
import { formatDate, formatDateShort } from '../utils/calendar';

export default function DateDisplay({ days, short = false, className = '' }) {
  if (days == null) return <span className={className}>—</span>;
  return (
    <span className={className} title={formatDate(days)}>
      {short ? formatDateShort(days) : formatDate(days)}
    </span>
  );
}