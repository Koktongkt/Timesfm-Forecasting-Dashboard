/**
 * QuantileSelector component for selecting quantiles to display
 */

import React from "react";
import "../styles/QuantileSelector.css";

interface QuantileSelectorProps {
  availableQuantiles: string[];
  selectedQuantiles: string[];
  onQuantilesChange: (quantiles: string[]) => void;
}

export const QuantileSelector: React.FC<QuantileSelectorProps> = ({
  availableQuantiles,
  selectedQuantiles,
  onQuantilesChange,
}) => {
  const handleToggle = (quantile: string) => {
    if (selectedQuantiles.includes(quantile)) {
      onQuantilesChange(selectedQuantiles.filter((q) => q !== quantile));
    } else {
      onQuantilesChange([...selectedQuantiles, quantile]);
    }
  };

  const handleSelectCommon = () => {
    onQuantilesChange(["q10", "q50", "q90"]);
  };

  const handleClearAll = () => {
    onQuantilesChange([]);
  };

  return (
    <div className="quantile-selector">
      <h3>Quantiles (Confidence Intervals)</h3>

      <div className="quantile-presets">
        <button className="btn btn-preset" onClick={handleSelectCommon}>
          Common (10%, 50%, 90%)
        </button>
        <button className="btn btn-preset" onClick={handleClearAll}>
          Clear All
        </button>
      </div>

      <div className="quantiles-grid">
        {availableQuantiles.map((quantile) => (
          <label key={quantile} className="quantile-checkbox">
            <input
              type="checkbox"
              checked={selectedQuantiles.includes(quantile)}
              onChange={() => handleToggle(quantile)}
            />
            <span className="quantile-label">{quantile.toUpperCase()}</span>
          </label>
        ))}
      </div>

      <p className="quantile-info">
        💡 Quantiles represent different confidence levels in the forecast. By
        default, none are selected.
      </p>
    </div>
  );
};
