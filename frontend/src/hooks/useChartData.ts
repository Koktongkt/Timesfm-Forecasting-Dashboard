/**
 * Custom hook for transforming forecast data into Plotly chart format
 */

import { useMemo } from "react";
import { ForecastResponse, ChartSeries, ChartLayout } from "../types";

interface UseChartDataOptions {
  selectedMaterials: string[];
  selectedQuantiles: string[];
  includeOriginalData: boolean;
}

interface UseChartDataReturn {
  series: ChartSeries[];
  layout: ChartLayout;
}

const COLORS = [
  "#1f77b4", // blue
  "#ff7f0e", // orange
  "#2ca02c", // green
  "#d62728", // red
  "#9467bd", // purple
  "#8c564b", // brown
  "#e377c2", // pink
  "#7f7f7f", // gray
  "#bcbd22", // olive
  "#17becf", // cyan
];

const QUANTILE_COLORS: Record<string, string> = {
  q10: "rgba(150, 150, 200, 0.3)",
  q20: "rgba(150, 180, 200, 0.25)",
  q30: "rgba(150, 200, 220, 0.2)",
  q40: "rgba(100, 180, 220, 0.15)",
  q50: "rgba(100, 150, 200, 0.15)",
  q60: "rgba(100, 180, 220, 0.15)",
  q70: "rgba(150, 200, 220, 0.2)",
  q80: "rgba(150, 180, 200, 0.25)",
  q90: "rgba(150, 150, 200, 0.3)",
};

export const useChartData = (
  forecastData: ForecastResponse | null,
  options: UseChartDataOptions
): UseChartDataReturn => {
  return useMemo(() => {
    const series: ChartSeries[] = [];
    let layout: ChartLayout = {
      title: "TimesFM Forecast",
      xaxis: {
        title: "Date",
        type: "date",
        rangeslider: { visible: false },
      },
      yaxis: {
        title: "Value",
      },
      hovermode: "x unified",
      plot_bgcolor: "#f8f9fa",
      paper_bgcolor: "#ffffff",
      font: {
        family: "Inter, sans-serif",
        size: 12,
      },
      margin: {
        l: 60,
        r: 40,
        t: 40,
        b: 40,
      },
      legend: {
        x: 0.02,
        y: 0.98,
      },
    };

    if (!forecastData) {
      return { series, layout };
    }

    const { original_data, forecasts, metadata } = forecastData;
    const { timestamps } = original_data;
    const forecastDates = metadata.forecast_dates;

    // Combine all dates
    const allDates = [...timestamps, ...forecastDates];

    // Add original data
    if (options.includeOriginalData) {
      options.selectedMaterials.forEach((material, idx) => {
        const values = original_data.materials[material];
        if (values) {
          series.push({
            x: timestamps,
            y: values,
            name: `${material} (Actual)`,
            type: "scatter",
            mode: "lines",
            line: {
              color: COLORS[idx % COLORS.length],
              width: 2,
            },
          });
        }
      });
    }

    // Add forecasts
    options.selectedMaterials.forEach((material, idx) => {
      const forecast = forecasts[material];
      if (forecast) {
        // Add mean forecast
        series.push({
          x: forecastDates,
          y: forecast.mean,
          name: `${material} (Forecast)`,
          type: "scatter",
          mode: "lines",
          line: {
            color: COLORS[idx % COLORS.length],
            width: 2,
            dash: "dash",
          },
        });

        // Add selected quantiles
        options.selectedQuantiles.forEach((quantile) => {
          const quantileValues = forecast.quantiles[quantile];
          if (quantileValues) {
            series.push({
              x: forecastDates,
              y: quantileValues,
              name: `${material} (${quantile.toUpperCase()})`,
              type: "scatter",
              mode: "lines",
              line: {
                color: QUANTILE_COLORS[quantile] || "rgba(200, 200, 200, 0.5)",
                width: 1,
                dash: "dot",
              },
              opacity: 0.6,
            });
          }
        });
      }
    });

    return { series, layout };
  }, [forecastData, options]);
};
