import React, { useRef, useState } from 'react';
import {
  validateImportPayload,
  readFileAsText,
  summarizePayload,
} from './exportImport';

export default function ImportDialog({ open, onClose, onConfirm }) {
  const fileRef = useRef(null);
  const [payload, setPayload] = useState(null);
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState([]);
  const [partial, setPartial] = useState(false);

  if (!open) return null;

  const reset = () => {
    setPayload(null);
    setFileName('');
    setErrors([]);
    setPartial(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setErrors([]);
    setPayload(null);
    setPartial(false);

    try {
      const text = await readFileAsText(file);
      const raw = JSON.parse(text);
      const result = validateImportPayload(raw);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setPayload(result.payload);
      setPartial(!!result.partial);
    } catch (err) {
      setErrors([`خطا در خواندن فایل: ${err.message}`]);
    }
  };

  const handleConfirm = () => {
    if (!payload) return;
    onConfirm(payload);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const summary = payload ? summarizePayload(payload) : null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📥 Import داده‌ها</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="empty-note" style={{ fontSize: '0.85rem' }}>
            فایل export شده‌ی استودیو (`.json`) را انتخاب کن.
            فقط فایل‌هایی با فرمت <code>atlas-studio-export</code> پذیرفته می‌شوند
            (به‌جز فایل خام `world.json` که به‌تنهایی هم قبول است).
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            className="import-file-input"
          />

          {fileName && (
            <p className="import-filename">
              فایل انتخاب‌شده: <code>{fileName}</code>
            </p>
          )}

          {errors.length > 0 && (
            <div className="import-errors">
              <strong>❌ خطا در اعتبارسنجی:</strong>
              <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}

          {summary && (
            <div className="import-summary">
              <h4>📊 خلاصه‌ی فایل:</h4>
              <ul>
                <li>جهان: <strong>{summary.worldName}</strong></li>
                <li>قاره‌ها: <strong>{summary.continentCount}</strong></li>
                <li>POIها: <strong>{summary.poiCount}</strong></li>
                <li>روایت‌ها: <strong>{summary.narrativeCount}</strong></li>
                <li>شخصیت‌ها: <strong>{summary.characterCount}</strong></li>
                <li>رویدادها: <strong>{summary.eventCount}</strong></li>
                <li>گام‌های زمانی: <strong>{summary.timeSteps}</strong></li>
              </ul>
              {partial && (
                <p className="import-warning">
                  ⚠️ این فایل فقط شامل <code>world.json</code> بود. characters و events
                  خالی جایگزین می‌شوند.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={handleClose}>انصراف</button>
          <button
            className="save-btn"
            disabled={!payload}
            onClick={handleConfirm}
          >
            ✅ جایگزینی داده‌ها
          </button>
        </div>
      </div>
    </div>
  );
}