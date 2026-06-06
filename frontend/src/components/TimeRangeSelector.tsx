/**
 * TimeRangeSelector component for adjusting x-axis time range
 */

import React from "react";
import "../styles/TimeRangeSelector.css";

interface TimeRangeSelectorProps {
  minDate: string;
  maxDate: string;
  selectedStart: string;
  selectedEnd: string;
  onRangeChange: (start: string, end: string) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  minDate,
  maxDate,
  selectedStart,
  selectedEnd,
  onRangeChange,
}) => {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRangeChange(e.target.value, selectedEnd);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRangeChange(selectedStart, e.target.value);
  };

  const handleResetRange = () => {
    onRangeChange(minDate, maxDate);
  };

  return (
    <div className="time-range-selector">
      <h3>Time Range</h3>

      <div className="range-inputs">
        <div className="input-group">
          <label>From</label>
          <input
            type="date"
            value={selectedStart}
            onChange={handleStartChange}
            min={minDate}
            max={selectedEnd}
          />
        </div>

        <div className="input-group">
          <label>To</label>
          <input
            type="date"
            value={selectedEnd}
            onChange={handleEndChange}
            min={selectedStart}
            max={maxDate}
          />
        </div>

        <button className="btn btn-reset" onClick={handleResetRange}>
          Reset Range
        </button>
      </div>
    </div>
  );
};
