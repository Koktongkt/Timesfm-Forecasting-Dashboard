/**
 * Chart component for displaying forecast data using Plotly
 */

import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import { ForecastResponse } from "../types";
import { useChartData } from "../hooks/useChartData";
import "../styles/Chart.css";

interface ChartProps {
  forecastData: ForecastResponse | null;
  selectedMaterials: string[];
  selectedQuantiles: string[];
  timeRangeStart: string;
  timeRangeEnd: string;
}

export const Chart: React.FC<ChartProps> = ({
  forecastData,
  selectedMaterials,
  selectedQuantiles,
  timeRangeStart,
  timeRangeEnd,
}) => {
  const { series, layout } = useChartData(forecastData, {
    selectedMaterials,
    selectedQuantiles,
    includeOriginalData: true,
  });

  // Filter data by time range
  const filteredSeries = useMemo(() => {
    if (!timeRangeStart || !timeRangeEnd) return series;

    return series.map((s) => {
      const startIdx = (s.x as string[]).findIndex(
        (date) => date >= timeRangeStart
      );
      const endIdx = (s.x as string[]).findLastIndex(
        (date) => date <= timeRangeEnd
      );

      if (startIdx === -1 || endIdx === -1) {
        return s;
      }

      return {
        ...s,
        x: (s.x as string[]).slice(startIdx, endIdx + 1),
        y: (s.y as number[]).slice(startIdx, endIdx + 1),
      };
    });
  }, [series, timeRangeStart, timeRangeEnd]);

  const updatedLayout = useMemo(() => {
    return {
      ...layout,
      xaxis: {
        ...layout.xaxis,
        range: [timeRangeStart, timeRangeEnd],
      },
    };
  }, [layout, timeRangeStart, timeRangeEnd]);

  if (!forecastData) {
    return (
      <div className="chart-placeholder">
        <p>📊 Chart will appear here after generating forecast</p>
      </div>
    );
  }

  if (selectedMaterials.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>⚠️ Please select at least one material to display</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <Plot
        data={filteredSeries}
        layout={{
          ...updatedLayout,
          width: undefined,
          height: 600,
          autosize: true,
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
        }}
      />
    </div>
  );
};
