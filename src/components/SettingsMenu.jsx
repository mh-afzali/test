import React, { useState } from 'react';
import { resetState } from '../engine/gameState';

export default function SettingsMenu({ onReset }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleResetClick = () => {
    setConfirming(true);
  };

  const handleConfirm = () => {
    resetState();
    setConfirming(false);
    setOpen(false);
    if (onReset) onReset();
  };

  const handleCancel = () => {
    setConfirming(false);
  };

  return (
    <div className="settings-menu">
      <button
        className="settings-btn"
        onClick={() => setOpen((v) => !v)}
        title="تنظیمات"
      >
        ⚙
      </button>

      {open && (
        <>
          <div className="settings-backdrop" onClick={() => { setOpen(false); setConfirming(false); }} />
          <div className="settings-panel">
            <h3 className="settings-title">تنظیمات</h3>

            {!confirming ? (
              <button className="settings-item danger" onClick={handleResetClick}>
                🗑 پاک کردن دیتا
              </button>
            ) : (
              <div className="settings-confirm">
                <p className="confirm-text">
                  مطمئنی؟ همه پیشرفت (زمان، خوانده‌ها، کشف‌ها) پاک می‌شه.
                </p>
                <div className="confirm-actions">
                  <button className="confirm-btn danger" onClick={handleConfirm}>
                    بله، پاک کن
                  </button>
                  <button className="confirm-btn" onClick={handleCancel}>
                    انصراف
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}