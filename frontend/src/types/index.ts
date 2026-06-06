/**
 * Type definitions for TimesFM API responses
 */

export interface OriginalData {
  timestamps: string[];
  materials: Record<string, number[]>;
}

export interface QuantileForecasts {
  [key: string]: number[]; // e.g., "q10": [...], "q20": [...]
}

export interface MaterialForecast {
  mean: number[];
  quantiles: QuantileForecasts;
}

export interface Forecasts {
  [material: string]: MaterialForecast;
}

export interface Metadata {
  forecast_horizon: number;
  forecast_dates: string[];
  available_quantiles: string[];
  n_materials: number;
  n_samples: number;
}

export interface ForecastResponse {
  original_data: OriginalData;
  forecasts: Forecasts;
  metadata: Metadata;
}

export interface ChartSeries {
  x: string[];
  y: number[];
  name: string;
  type: "scatter" | "scattergl";
  mode: "lines";
  line?: {
    color?: string;
    width?: number;
    dash?: "solid" | "dash" | "dot";
  };
  fill?: "tozeroy" | "tonexty";
  fillcolor?: string;
  opacity?: number;
}

export interface ChartLayout {
  title: string;
  xaxis: {
    title: string;
    type: "date";
    rangeslider?: { visible: boolean };
  };
  yaxis: {
    title: string;
  };
  hovermode: "x unified";
  plot_bgcolor: string;
  paper_bgcolor: string;
  font: {
    family: string;
    size: number;
  };
  margin: {
    l: number;
    r: number;
    t: number;
    b: number;
  };
  legend: {
    x: number;
    y: number;
  };
}
