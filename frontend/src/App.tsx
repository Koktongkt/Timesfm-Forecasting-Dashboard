/**
 * Main App component - orchestrates the dashboard
 */

import React, { useState, useEffect } from "react";
import { ForecastResponse } from "./types";
import { FileUploader } from "./components/FileUploader";
import { FilterPanel } from "./components/FilterPanel";
import { QuantileSelector } from "./components/QuantileSelector";
import { TimeRangeSelector } from "./components/TimeRangeSelector";
import { Chart } from "./components/Chart";
import "./App.css";

interface DataPreview {
  file: File;
  materials: string[];
  dateRange: string;
  nSamples: number;
}

function App() {
  // File upload state
  const [dataPreview, setDataPreview] = useState<DataPreview | null>(null);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(
    null
  );

  // Filter state
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedQuantiles, setSelectedQuantiles] = useState<string[]>([]);
  const [timeRangeStart, setTimeRangeStart] = useState<string>("");
  const [timeRangeEnd, setTimeRangeEnd] = useState<string>("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    // In a production setup, you would:
    // 1. Upload to backend
    // 2. Get back the forecast data

    // For this prototype, the user uploads through Streamlit
    // and we provide a way to paste JSON or connect to Streamlit API

    setDataPreview({
      file,
      materials: [], // Will be populated from Streamlit
      dateRange: "", // Will be populated from Streamlit
      nSamples: 0, // Will be populated from Streamlit
    });

    setError(null);
  };

  // Mock data loading from Streamlit or JSON input
  // In production, this would be a real API call
  const loadForecastData = () => {
    // This would typically be called after the user generates a forecast in Streamlit
    // and the data is available via an API endpoint

    // For now, we'll show instructions
    alert(
      "Please generate the forecast in the Streamlit app, then paste the JSON response here or set up API connection"
    );
  };

  useEffect(() => {
    // Initialize date range when forecast data loads
    if (forecastData) {
      const timestamps = forecastData.original_data.timestamps;
      if (timestamps.length > 0) {
        setTimeRangeStart(timestamps[0].split("T")[0]);
        const lastDate = timestamps[timestamps.length - 1];
        const forecastEnd =
          forecastData.metadata.forecast_dates[
            forecastData.metadata.forecast_dates.length - 1
          ];
        setTimeRangeEnd(forecastEnd.split("T")[0]);
      }

      // Initialize materials selection (all selected by default)
      const materials = Object.keys(forecastData.original_data.materials);
      setSelectedMaterials(materials);

      // Clear quantile selection (default to none)
      setSelectedQuantiles([]);
    }
  }, [forecastData]);

  const materials = forecastData
    ? Object.keys(forecastData.original_data.materials)
    : [];
  const availableQuantiles = forecastData?.metadata.available_quantiles || [];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>📊 TimesFM Forecasting Dashboard</h1>
          <p>Forecast time series data using Google's TimesFM model</p>
        </div>
      </header>

      <div className="app-container">
        <aside className="app-sidebar">
          {!forecastData ? (
            <>
              <section className="sidebar-section">
                <h2>📤 Upload Data</h2>
                <FileUploader onFileSelect={handleFileSelect} loading={loading} />
              </section>

              {dataPreview && (
                <section className="sidebar-section">
                  <h3>File Info</h3>
                  <div className="file-info">
                    <p>
                      <strong>File:</strong> {dataPreview.file.name}
                    </p>
                    <p>
                      <strong>Size:</strong>{" "}
                      {(dataPreview.file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={loadForecastData}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "Generate Forecast"}
                  </button>
                </section>
              )}

              {error && (
                <section className="sidebar-section error">
                  <p>❌ {error}</p>
                </section>
              )}
            </>
          ) : (
            <>
              <section className="sidebar-section">
                <FilterPanel
                  materials={materials}
                  selectedMaterials={selectedMaterials}
                  onMaterialsChange={setSelectedMaterials}
                />
              </section>

              <section className="sidebar-section">
                <QuantileSelector
                  availableQuantiles={availableQuantiles}
                  selectedQuantiles={selectedQuantiles}
                  onQuantilesChange={setSelectedQuantiles}
                />
              </section>

              <section className="sidebar-section">
                <TimeRangeSelector
                  minDate={forecastData.original_data.timestamps[0].split("T")[0]}
                  maxDate={
                    forecastData.metadata.forecast_dates[
                      forecastData.metadata.forecast_dates.length - 1
                    ].split("T")[0]
                  }
                  selectedStart={timeRangeStart}
                  selectedEnd={timeRangeEnd}
                  onRangeChange={(start, end) => {
                    setTimeRangeStart(start);
                    setTimeRangeEnd(end);
                  }}
                />
              </section>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  setForecastData(null);
                  setDataPreview(null);
                  setSelectedMaterials([]);
                  setSelectedQuantiles([]);
                }}
                style={{ width: "100%", marginTop: "1rem" }}
              >
                ← Upload New Data
              </button>
            </>
          )}
        </aside>

        <main className="app-main">
          {!forecastData ? (
            <div className="main-placeholder">
              <h2>Welcome to TimesFM Forecasting Dashboard</h2>
              <p>
                Upload your time series data (CSV or Excel) in the sidebar to
                get started.
              </p>
              <p>
                <strong>Expected format:</strong>
              </p>
              <ul>
                <li>First column: Dates/timestamps</li>
                <li>Other columns: Materials or units with their values</li>
                <li>Rows: Time periods (daily, weekly, monthly, etc.)</li>
              </ul>
            </div>
          ) : (
            <>
              <div className="chart-section">
                <Chart
                  forecastData={forecastData}
                  selectedMaterials={selectedMaterials}
                  selectedQuantiles={selectedQuantiles}
                  timeRangeStart={timeRangeStart}
                  timeRangeEnd={timeRangeEnd}
                />
              </div>

              <div className="metadata-section">
                <h3>Forecast Metadata</h3>
                <div className="metadata-grid">
                  <div className="metadata-card">
                    <span className="label">Materials</span>
                    <span className="value">
                      {forecastData.metadata.n_materials}
                    </span>
                  </div>
                  <div className="metadata-card">
                    <span className="label">Samples</span>
                    <span className="value">
                      {forecastData.metadata.n_samples}
                    </span>
                  </div>
                  <div className="metadata-card">
                    <span className="label">Forecast Horizon</span>
                    <span className="value">
                      {forecastData.metadata.forecast_horizon} days
                    </span>
                  </div>
                  <div className="metadata-card">
                    <span className="label">Quantiles Available</span>
                    <span className="value">
                      {forecastData.metadata.available_quantiles.length}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
