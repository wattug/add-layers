import React from 'react';
import {CalciteList, CalciteListItem, CalciteAction } from 'calcite-components'

interface ThirdSquareProps {
  storedUrls: { label: string; url: string; bidang: string; subbidang: string }[];
  bidangOptions: string[];
  subbidangOptions: { [bidang: string]: string[] };
  selectedBidang: string;
  selectedSubbidang: string;
  onBidangChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubbidangChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const ThirdSquare: React.FC<ThirdSquareProps> = ({
  storedUrls,
  bidangOptions,
  subbidangOptions,
  selectedBidang,
  selectedSubbidang,
  onBidangChange,
  onSubbidangChange
}) => {
  const filteredUrls = storedUrls.filter((url) => {
    return (
      (selectedBidang ? url.bidang === selectedBidang : true) &&
      (selectedSubbidang ? url.subbidang === selectedSubbidang : true)
    );
  });

  const downloadFilteredUrls = () => {
    const dataToDownload = filteredUrls.map((entry) => ({
      label: entry.label,
      url: entry.url,
      bidang: entry.bidang,
      subbidang: entry.subbidang
    }));

    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filteredUrls.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div></div>
        <label htmlFor="bidang-select">Bidang</label>
        <select id="bidang-select" value={selectedBidang} onChange={onBidangChange}>
          <option value="">Select Bidang</option>
          {bidangOptions.map((bidang) => (
            <option key={bidang} value={bidang}>
              {bidang}
            </option>
          ))}
        </select>
        <label htmlFor="subbidang-select">Subbidang</label>
        <select
          id="subbidang-select"
          value={selectedSubbidang}
          onChange={onSubbidangChange}
          disabled={!selectedBidang}
        >
          <option value="">Select Subbidang</option>
          {selectedBidang &&
            subbidangOptions[selectedBidang].map((subbidang) => (
              <option key={subbidang} value={subbidang}>
                {subbidang}
              </option>
            ))}
        </select>
      <div>
      <label>Filtered URLs</label>
        <CalciteList>
          {filteredUrls.map((url) => (
            <CalciteListItem key={url.url} label={[url.name, ' | ',url.type]} description={url.label}>
              <CalciteAction slot="actions-end" icon="layer" label={url.url}></CalciteAction>
            </CalciteListItem>
          ))}
        </CalciteList>
      </div>
      <button onClick={downloadFilteredUrls}>Download Filtered URLs</button>
    </div>
  );
};

export default ThirdSquare;
