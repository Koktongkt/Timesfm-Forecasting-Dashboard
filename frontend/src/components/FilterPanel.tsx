/**
 * FilterPanel component for filtering materials
 */

import React, { useState } from "react";
import "../styles/FilterPanel.css";

interface FilterPanelProps {
  materials: string[];
  selectedMaterials: string[];
  onMaterialsChange: (materials: string[]) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  materials,
  selectedMaterials,
  onMaterialsChange,
}) => {
  const handleSelectAll = () => {
    onMaterialsChange(materials);
  };

  const handleDeselectAll = () => {
    onMaterialsChange([]);
  };

  const handleToggle = (material: string) => {
    if (selectedMaterials.includes(material)) {
      onMaterialsChange(selectedMaterials.filter((m) => m !== material));
    } else {
      onMaterialsChange([...selectedMaterials, material]);
    }
  };

  return (
    <div className="filter-panel">
      <h3>Materials / Units</h3>

      <div className="filter-buttons">
        <button
          className="btn btn-select-all"
          onClick={handleSelectAll}
          disabled={selectedMaterials.length === materials.length}
        >
          Select All
        </button>
        <button
          className="btn btn-deselect-all"
          onClick={handleDeselectAll}
          disabled={selectedMaterials.length === 0}
        >
          Deselect All
        </button>
      </div>

      <div className="materials-list">
        {materials.map((material) => (
          <label key={material} className="material-checkbox">
            <input
              type="checkbox"
              checked={selectedMaterials.includes(material)}
              onChange={() => handleToggle(material)}
            />
            <span>{material}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
