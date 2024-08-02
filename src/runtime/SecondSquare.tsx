import React from 'react';

interface SecondSquareProps {
  featureServiceUrlInput: string;
  nameLabel: string;
  selectedLayerType: string;
  bidangOptions: string[];
  subbidangOptions: { [bidang: string]: string[] };
  selectedBidang: string;
  selectedSubbidang: string;
  onFeatureServiceUrlInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNameLabelInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLayerTypeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBidangChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubbidangChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const SecondSquare: React.FC<SecondSquareProps> = ({
  featureServiceUrlInput,
  nameLabel,
  selectedLayerType,
  bidangOptions,
  subbidangOptions,
  selectedBidang,
  selectedSubbidang,
  onFeatureServiceUrlInputChange,
  onNameLabelInput,
  onLayerTypeChange,
  onBidangChange,
  onSubbidangChange,
  onSubmit
}) => {
  return (
    <div>
      <div></div>
      <form onSubmit={onSubmit}>
      <label>Feature Service URL</label>
        <input
          placeholder="Please Assign the URL"
          type="text"
          value={featureServiceUrlInput}
          onChange={onFeatureServiceUrlInputChange}
        />
        <label>Name</label>
        <input
          placeholder="Please Assign the Name"
          type="text"
          value={nameLabel}
          onChange={onNameLabelInput}
        />
        <label>Type</label>
        <select value={selectedLayerType} onChange={onLayerTypeChange}>
          <option value="" selected>Select Layer Type</option>
          <option value="CSVLayer">CSV Layer</option>
          <option value="FeatureLayer">Feature Layer</option>
          <option value="GeoJSONLayer">GeoJSON Layer</option>
        </select>
        <label>Bidang</label>
        <select value={selectedBidang} onChange={onBidangChange}>
          <option value="">Select Bidang</option>
          {bidangOptions.map((bidang, index) => (
            <option key={index} value={bidang}>
              {bidang}
            </option>
          ))}
        </select>
        <label>Sub-Bidang</label>
        <select value={selectedSubbidang} onChange={onSubbidangChange}>
          <option value="">Select Subbidang</option>
          {(subbidangOptions[selectedBidang] || []).map((subbidang, index) => (
            <option key={index} value={subbidang}>
              {subbidang}
            </option>
          ))}
        </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SecondSquare;
