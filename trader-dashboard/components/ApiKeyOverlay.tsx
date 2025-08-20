
import React from 'react';

interface Props {
  missingKeys: string[];
  onReload: () => void;
}

const ApiKeyOverlay: React.FC<Props> = ({ missingKeys, onReload }) => {
  if (missingKeys.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Missing API Keys</h2>
        <p className="mb-4">The following keys are missing:</p>
        <ul className="mb-4 list-disc list-inside text-red-400">
          {missingKeys.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
        <button
          onClick={onReload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Reload
        </button>
      </div>
    </div>
  );
};

export default ApiKeyOverlay;
