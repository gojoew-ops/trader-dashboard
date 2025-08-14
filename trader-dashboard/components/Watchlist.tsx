"use client";

type Props = {
  symbols: string[];
  selected: string;
  onSelect: (s: string) => void;
};

export default function Watchlist({ symbols, selected, onSelect }: Props) {
  return (
    <div className="card">
      <h2 style={{ marginBottom: 12, fontSize: 16 }}>Today’s Watchlist</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {symbols.map((t) => (
          <button
            key={t}
            onClick={() => onSelect(t)}
            className="input"
            style={{
              textAlign: "left",
              background: selected === t ? "#1e3a8a" : "#151515",
              borderColor: selected === t ? "#3b82f6" : "#2b2b2b",
              fontWeight: 700
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}