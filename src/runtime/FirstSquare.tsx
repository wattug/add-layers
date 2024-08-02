import React from 'react';
import './Widget.css';

interface FirstSquareProps {
  storedUrls: { label: string; url: string; bidang: string; subbidang: string }[];
  onhandleStoredUrlChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const FirstSquare: React.FC<FirstSquareProps> = ({
  storedUrls,
  onhandleStoredUrlChange
}) => {
  return (
    <div>
      <label>Stored Urls</label>
      <select onChange={onhandleStoredUrlChange}>
        <option value="">Select a stored URL</option>
        {storedUrls.map((entry, index) => (
          <option key={index} value={entry.url}>
            {entry.name}
          </option>
        ))}
      </select>
    </div>
  );
};


export default FirstSquare;

