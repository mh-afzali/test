import React, { useMemo } from 'react';
import {
  MONTH_NAMES,
  DAYS_PER_MONTH,
  EXTRA_DAYS,
  daysToDate,
  dateToDays,
  monthLabel,
} from '../utils/calendar';

export default function DateInput({ value, onChange, allowEmpty = false, emptyLabel = '—' }) {
  const isEmpty = value == null;
  const date = useMemo(
    () => (isEmpty ? { year: 1, month: 1, day: 1, isExtra: false } : daysToDate(value)),
    [value, isEmpty]
  );

  const update = (patch) => {
    const next = { ...date, ...patch };
    if (next.isExtra) {
      next.month = null;
      next.day = null;
    } else {
      next.extraDay = null;
    }
    onChange(dateToDays(next));
  };

  const handleClear = () => {
    if (allowEmpty) onChange(null);
  };

  return (
    <div className="date-input">
      {isEmpty ? (
        <span className="date-input-empty">{emptyLabel}</span>
      ) : (
        <>
          {!date.isExtra ? (
            <>
              <select
                value={date.day}
                onChange={(e) => update({ day: Number(e.target.value) })}
                className="date-input-sel day"
              >
                {Array.from({ length: DAYS_PER_MONTH }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>روز {d}</option>
                ))}
              </select>

              <select
                value={date.month}
                onChange={(e) => update({ month: Number(e.target.value) })}
                className="date-input-sel month"
              >
                {MONTH_NAMES.map((m) => (
                  <option key={m.index} value={m.index}>{monthLabel(m.index)}</option>
                ))}
              </select>
            </>
          ) : (
            <select
              value={date.extraDay}
              onChange={(e) => update({ extraDay: Number(e.target.value) })}
              className="date-input-sel extra"
            >
              {Array.from({ length: EXTRA_DAYS }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d} روز قبل از بهار</option>
              ))}
            </select>
          )}

          <select
            value={date.year}
            onChange={(e) => update({ year: Number(e.target.value) })}
            className="date-input-sel year"
          >
            {Array.from({ length: 1000 }, (_, i) => i + 1).map((y) => (
              <option key={y} value={y}>سال {y}</option>
            ))}
          </select>

          <label className="date-input-extra-toggle" title="روزهای آخر سال">
            <input
              type="checkbox"
              checked={date.isExtra}
              onChange={(e) => update({ isExtra: e.target.checked })}
            />
            آخر سال
          </label>
        </>
      )}

      {allowEmpty && !isEmpty && (
        <button type="button" className="date-input-clear" onClick={handleClear} title="خالی کردن">
          ✕
        </button>
      )}
    </div>
  );
}