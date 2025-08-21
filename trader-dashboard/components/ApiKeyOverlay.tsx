// Runtime API Key Overlay (v6.2)
import React, { useEffect, useState } from 'react';

function hasValue(v?: string) {
  return typeof v === 'string' && v.trim().length > 0;
}

export default function ApiKeyOverlay() {
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    const finnhub = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    const yahoo = process.env.NEXT_PUBLIC_YAHOO_API_KEY;
    const m: string[] = [];
    if (!hasValue(finnhub)) m.push('NEXT_PUBLIC_FINNHUB_API_KEY');
    if (!hasValue(yahoo)) m.push('NEXT_PUBLIC_YAHOO_API_KEY');
    setMissing(m);
  }, []);

  if (missing.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f172a] text-white rounded-2xl shadow-2xl p-6 w-[92%] max-w-xl border border-white/10">
        <h2 className="text-2xl font-bold mb-3">Missing API Key(s)</h2>
        <ul className="mb-4 space-y-2">
          {missing.map(key => (
            <li key={key} className="flex items-start gap-2">
              <span className="mt-1">❌</span>
              <div>
                <div className="font-semibold">{key}</div>
                <div className="text-sm text-gray-300">
                  Add in Vercel → Project Settings → Environment Variables → Redeploy.
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition shadow"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
