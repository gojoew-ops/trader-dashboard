import { useEffect, useState } from 'react';

export default function SettingsSidebar({ open, onClose, settings, setSettings }) {
  const [local, setLocal] = useState(settings);

  useEffect(() => { setLocal(settings); }, [settings]);

  const save = () => {
    setSettings(local);
    if (typeof window !== 'undefined') {
      localStorage.setItem('td_settings', JSON.stringify(local));
    }
    onClose();
  };

  return (
    <aside className={open ? 'sidebar open' : 'sidebar'}>
      <button className="btn iconbtn closebar" onClick={onClose}>✖</button>
      <h2>⚙️ Settings</h2>

      <div className="field">
        <label className="label">Refresh Interval (seconds)</label>
        <select className="select" value={local.refresh} onChange={e => setLocal({ ...local, refresh: Number(e.target.value) })}>
          {[10, 15, 30, 45, 60, 120].map(n => <option key={n} value={n}>{n}s</option>)}
        </select>
      </div>

      <div className="field">
        <label className="label">Confidence Threshold (%)</label>
        <input className="input" type="number" min="40" max="95" step="1"
               value={local.threshold}
               onChange={e => setLocal({ ...local, threshold: Number(e.target.value) })}/>
      </div>

      <div className="field checkbox">
        <input id="wm" type="checkbox" checked={local.overlay} onChange={e => setLocal({ ...local, overlay: e.target.checked })} />
        <label htmlFor="wm">Show Watermark Overlay</label>
      </div>

      <button className="btn" onClick={save}>Save</button>
    </aside>
  );
}