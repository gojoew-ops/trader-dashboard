
import useSWR from 'swr';
import { useMemo } from 'react';

const fetcher = (url) => fetch(url, { headers: { 'cache-control': 'no-store' }}).then(r => r.json());

export default function MorningAnalyzer({ refreshMs = 60000 }) {
  const { data, error, isLoading } = useSWR('/api/analyzer', fetcher, { refreshInterval: refreshMs });
  const ts = useMemo(() => new Date().toLocaleTimeString(), [data]);

  return (
    <div className="card">
      <h2>Morning Analyzer <small style={{opacity:.7,fontWeight:400,marginLeft:8}}>(auto-refresh {Math.round(refreshMs/1000)}s)</small></h2>
      {error && <div className="warn">Analyzer error: {error.message || 'failed'}</div>}
      {isLoading && <div style={{opacity:.7}}>Loading…</div>}
      {data && (
        <div className="analyzer">
          <div style={{marginBottom:8,opacity:.7}}>Last updated: {ts}</div>
          <div className="winner">
            <div style={{fontSize:18,opacity:.8,marginBottom:6}}>Top pick</div>
            <div style={{fontSize:28,fontWeight:700}}>{data.best?.symbol || '—'}</div>
            <div style={{opacity:.85, marginTop:6}}>{data.best ? `${data.best.reason} (score ${data.best.score.toFixed(2)})` : ''}</div>
          </div>
          <div style={{marginTop:12}}>
            <div style={{fontSize:16, fontWeight:600, marginBottom:6}}>Screened (price &lt; $10)</div>
            <ul className="siglist">
              {data.items?.map(it => (
                <li key={it.symbol}>
                  <span>{it.symbol}</span>
                  <span style={{textAlign:'right'}}>
                    ${it.c?.toFixed(2)} · {it.dp?.toFixed(2)}% · score {it.score?.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
