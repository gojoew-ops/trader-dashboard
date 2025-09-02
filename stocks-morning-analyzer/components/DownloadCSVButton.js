export default function DownloadCSVButton({ rows, filename='morning-analyzer.csv' }){
  function toCSV(){
    if(!rows || !rows.length) return '';
    const headers = Object.keys(rows[0]);
    const esc = v => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return (/[",\n]/.test(s)) ? '"' + s.replaceAll('"','""') + '"' : s;
    };
    return [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
  }
  function download(){
    const csv = toCSV();
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
  return <button onClick={download} className="px-3 py-2 rounded bg-black text-white text-sm">Export CSV</button>;
}
