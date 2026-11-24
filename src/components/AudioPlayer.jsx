import React, { useEffect, useRef, useState } from 'react';

const STORAGE_KEY_ENABLED = 'atlas-bgm-enabled';
const STORAGE_KEY_VOLUME = 'atlas-bgm-volume';

export default function AudioPlayer({ src = '/audio/bgm.mp3' }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const v = parseFloat(localStorage.getItem(STORAGE_KEY_VOLUME));
    return Number.isFinite(v) ? v : 0.4;
  });
  const [userInteracted, setUserInteracted] = useState(false);
  const [error, setError] = useState(null);

  // ذخیره‌ی volume
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VOLUME, String(volume));
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // تلاش برای autoplay بعد از اولین تعامل کاربر
  useEffect(() => {
    const onFirstInteraction = () => {
      setUserInteracted(true);
      const enabled = localStorage.getItem(STORAGE_KEY_ENABLED);
      if (enabled === 'true' && audioRef.current) {
        audioRef.current
          .play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));
      }
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };

    window.addEventListener('pointerdown', onFirstInteraction, { once: true });
    window.addEventListener('keydown', onFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      localStorage.setItem(STORAGE_KEY_ENABLED, 'false');
    } else {
      audio
        .play()
        .then(() => {
          setPlaying(true);
          localStorage.setItem(STORAGE_KEY_ENABLED, 'true');
        })
        .catch((e) => {
          setError('پخش ناموفق بود. آیا فایل موسیقی وجود دارد؟');
          console.warn(e);
        });
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
        onError={() => setError('فایل موسیقی پیدا نشد: ' + src)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div className="audio-player">
        <button
          className={`audio-toggle ${playing ? 'playing' : ''}`}
          onClick={toggle}
          title={playing ? 'توقف موسیقی' : 'پخش موسیقی'}
        >
          {playing ? '⏸' : '🎵'}
        </button>

        <div className="audio-volume-wrap">
          <span className="audio-volume-icon" title="صدا">
            {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="audio-volume-slider"
            title={`صدا: ${Math.round(volume * 100)}%`}
          />
        </div>

        {error && <span className="audio-error" title={error}>⚠️</span>}
      </div>
    </>
  );
}