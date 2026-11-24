import React, { useEffect, useState } from 'react';
import worldRaw from '../data/world.json';
import charactersRaw from '../data/characters.json';
import eventsRaw from '../data/events.json';
import { saveDataFile, validateWorld } from './api';

export default function StudioApp() {
  const [status, setStatus] = useState('');
  const [world, setWorld] = useState(null);
  const [characters, setCharacters] = useState(null);
  const [events, setEvents] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    setWorld(worldRaw);
    setCharacters(charactersRaw);
    setEvents(eventsRaw);
    setErrors(validateWorld(worldRaw));
  }, []);

  const handleSave = async () => {
    setStatus('در حال ذخیره...');
    try {
      await saveDataFile('world.json', world);
      await saveDataFile('characters.json', characters);
      await saveDataFile('events.json', events);
      setStatus('✅ ذخیره شد روی دیسک');
    } catch (e) {
      setStatus(`❌ ${e.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <aside style={{ width: 240, borderInlineEnd: '1px solid #ddd', padding: 16, background: '#fafafa' }}>
        <h2 style={{ marginTop: 0 }}>🎨 استودیو اطلس</h2>
        <p style={{ fontSize: 12, color: '#666' }}>گام ۱: زیرساخت + تست ذخیره</p>
        <button onClick={handleSave} style={{ width: '100%', padding: '8px 12px', cursor: 'pointer' }}>
          💾 ذخیره همه
        </button>
        <div style={{ marginTop: 12, fontSize: 13 }}>{status}</div>
        {errors.length > 0 && (
          <div style={{ marginTop: 16, color: 'crimson', fontSize: 12 }}>
            <strong>خطاها:</strong>
            <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}
      </aside>

      <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <h3>وضعیت داده‌ها</h3>
        {world && (
          <ul>
            <li>قاره‌ها: {world.continents?.length}</li>
            <li>کل POIها: {world.continents?.reduce((s, c) => s + (c.pois?.length || 0), 0)}</li>
            <li>کل روایت‌ها: {world.continents?.reduce((s, c) => s + (c.pois?.reduce((a, p) => a + (p.narratives?.length || 0), 0)), 0)}</li>
            <li>شخصیت‌ها: {characters?.length}</li>
            <li>رویدادها: {events?.length}</li>
          </ul>
        )}
        <p style={{ fontSize: 12, color: '#888' }}>
          این فقط اسکلت است. در گام‌های بعدی ویرایشگر درختی، ویرایشگر روایت/بخش/بلاک، اعتبارسنجی و شبیه‌ساز تایم‌لاین اضافه می‌شود.
        </p>
      </main>
    </div>
  );
}