import React, { useEffect, useState } from "react";

export default function ApiKeyOverlay() {
  const [missingKeys, setMissingKeys] = useState([]);

  useEffect(() => {
    const missing = [];
    if (!process.env.NEXT_PUBLIC_FINNHUB_API_KEY) {
      missing.push("Finnhub API Key");
    }
    if (!process.env.NEXT_PUBLIC_YAHOO_API_KEY) {
      missing.push("Yahoo Finance API Key");
    }
    setMissingKeys(missing);
  }, []);

  if (missingKeys.length === 0) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md z-50">
      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg text-center max-w-lg">
        <h2 className="text-xl font-bold mb-4">Missing API Key(s)</h2>
        <p className="mb-4">
          The following required keys are missing:{" "}
          <span className="font-semibold">{missingKeys.join(", ")}</span>
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-md transition"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
