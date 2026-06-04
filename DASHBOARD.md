# TimesFM Forecasting Dashboard

A full-stack web application for time series forecasting using Google's TimesFM model with an interactive React frontend and Streamlit backend.

## Features

✨ **File Upload**
- Support for CSV and Excel files
- Drag-and-drop interface
- Data validation and preview

📊 **Interactive Visualization**
- Plotly-based interactive charts
- Real-time filtering and updates
- Time range adjustment with zoom

🎛️ **Advanced Filtering**
- Multi-select materials/units
- Select all / deselect all options
- Quantile confidence intervals (10 levels)

🔮 **Forecasting**
- TimesFM 2.5 model for state-of-the-art forecasting
- Support for 10 quantile levels (10% - 90%)
- Mean forecast + confidence intervals

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Virtual environment (venv or conda)

### Backend Setup (Streamlit)

1. **Activate your virtual environment**
   ```bash
   .venv\Scripts\activate  # Windows
   # or
   source .venv/bin/activate  # macOS/Linux
   ```

2. **Install dependencies**
   The timesfm package should already be installed. If not:
   ```bash
   pip install -e ".[torch]"  # For PyTorch backend
   # or
   pip install -e ".[flax]"   # For Flax backend
   ```

3. **Run Streamlit app**
   ```bash
   streamlit run streamlit_app.py
   ```
   The app will be available at `http://localhost:8501`

### Frontend Setup (React)

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## Usage

### 1. Generate Forecast (Streamlit Backend)

1. Open http://localhost:8501
2. Upload a CSV or Excel file using the sidebar
3. Adjust forecast horizon (default: 30 days)
4. Click "Generate Forecast"
5. The app displays the forecast results in JSON format

**Expected CSV Format:**
```
Date,Material_A,Material_B,Material_C
2023-01-01,100,200,150
2023-01-02,105,210,160
2023-01-03,110,215,165
...
```

### 2. View and Interact (React Frontend)

The React frontend is designed to work with the Streamlit backend. It provides:

**File Upload Interface**
- Drag-and-drop CSV/Excel upload
- File preview and validation

**Filtering Options**
- Select specific materials/units to display
- Toggle between single, multiple, or all materials

**Quantile Selection**
- Choose confidence intervals (q10, q20, ..., q90)
- By default, no quantiles are selected (only mean forecast shown)
- Quick presets for common selections (e.g., 10%, 50%, 90%)

**Time Range Adjustment**
- Zoom in/out on specific date ranges
- Interactive slider for time range selection
- Reset to original range

**Interactive Chart**
- Hover over data points for detailed values
- Pan and zoom using Plotly controls
- Toggle series visibility via legend
- Download as PNG

## Architecture

### Backend (Streamlit)

```
streamlit_app.py          # Main Streamlit application
app/
├── __init__.py
├── config.py             # Configuration constants
├── data_handler.py       # CSV/Excel parsing and validation
└── timesfm_processor.py  # TimesFM model inference
```

**Key Components:**
- **DataHandler:** Parses files, validates structure, prepares data for inference
- **TimesFMProcessor:** Loads model, runs inference, processes quantile forecasts
- **Streamlit App:** UI for upload, configuration, and result display

### Frontend (React + TypeScript)

```
frontend/
├── src/
│   ├── components/
│   │   ├── FileUploader.tsx        # File upload component
│   │   ├── FilterPanel.tsx         # Material selection
│   │   ├── QuantileSelector.tsx    # Quantile filtering
│   │   ├── TimeRangeSelector.tsx   # Time range adjustment
│   │   └── Chart.tsx               # Plotly chart
│   ├── hooks/
│   │   ├── useForecast.ts          # API and state management
│   │   └── useChartData.ts         # Chart data transformation
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── styles/                     # Component CSS files
│   ├── App.tsx                     # Main app component
│   ├── App.css                     # Global styles
│   └── index.css                   # Base styles
├── public/                         # Static assets
├── index.html                      # HTML entry point
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config
└── package.json                    # Dependencies
```

**Key Components:**
- **App.tsx:** Orchestrates all components and state
- **FileUploader:** Handles file selection and preview
- **FilterPanel:** Material/unit selection with select all/deselect all
- **QuantileSelector:** Confidence interval selection (default: none)
- **TimeRangeSelector:** Date range adjustment
- **Chart:** Plotly-based interactive visualization
- **Hooks:** Custom React hooks for data fetching and transformation

## API Response Format

The Streamlit app returns forecast data in JSON format:

```json
{
  "original_data": {
    "timestamps": ["2023-01-01T00:00:00", ...],
    "materials": {
      "material_a": [100, 105, 110, ...],
      "material_b": [200, 210, 220, ...]
    }
  },
  "forecasts": {
    "material_a": {
      "mean": [115, 120, 125, ...],
      "quantiles": {
        "q10": [112, 116, 120, ...],
        "q20": [113, 117, 121, ...],
        ...
        "q90": [118, 124, 130, ...]
      }
    },
    "material_b": {
      "mean": [230, 240, 250, ...],
      "quantiles": { ... }
    }
  },
  "metadata": {
    "forecast_horizon": 30,
    "forecast_dates": ["2023-02-01", ...],
    "available_quantiles": ["q10", "q20", ..., "q90"],
    "n_materials": 2,
    "n_samples": 31
  }
}
```

## Integration

### Current Flow:
1. User uploads file → Streamlit processes → Generates forecast
2. JSON response displayed in Streamlit
3. Copy JSON and use in React frontend (or setup API endpoint)

### For Production:
1. **Option A: FastAPI Backend**
   - Create dedicated FastAPI server for file upload/forecast
   - Keep Streamlit for interactive exploration
   - React frontend calls FastAPI endpoints

2. **Option B: Streamlit API**
   - Convert Streamlit app to use `st.write()` for JSON output
   - Frontend calls Streamlit app endpoints
   - Handle CORS configuration

3. **Option C: WebSocket Connection**
   - Stream forecast results in real-time
   - Better UX for large datasets

## Configuration

### Backend (`app/config.py`)
- `DEFAULT_FORECAST_HORIZON`: Default forecast period (days)
- `MAX_FORECAST_HORIZON`: Maximum allowed forecast period
- `QUANTILES`: List of quantile levels to compute
- `MODEL_NAME`: TimesFM model identifier

### Frontend (`frontend/vite.config.ts`)
- `port`: Development server port
- `proxy`: Backend API proxy settings

## Troubleshooting

### Streamlit Issues
- **Model loading slow:** First load downloads the model (~2GB). Subsequent runs are faster.
- **Out of memory:** Reduce input length in `config.py` or use smaller batch sizes
- **Port conflict:** Change port with `streamlit run --server.port 8502`

### Frontend Issues
- **Dependencies not installing:** Use `npm install --legacy-peer-deps`
- **Plotly not rendering:** Ensure `react-plotly.js` is correctly installed
- **CSS not loading:** Verify CSS files are in `src/styles/` directory

### Common Data Issues
- **NaN values:** Data handler automatically fills with forward fill
- **Non-numeric columns:** Ensure only numeric data in value columns
- **Date parsing:** First column must be parseable as dates (ISO format recommended)

## Sample Data

Use the included `sample_data.csv` to test the application:
```bash
# In Streamlit app, upload this file to see forecast
```

## Future Enhancements

- [ ] Support for multivariate forecasting (covariate features)
- [ ] Model fine-tuning on custom data
- [ ] Export forecasts to CSV/Excel
- [ ] Forecast comparison (multiple models)
- [ ] Real-time data streaming
- [ ] Authentication and multi-user support
- [ ] Database integration for forecast history
- [ ] Automated retraining schedules

## License

This project integrates with Google Research's TimesFM. See LICENSE for details.

## References

- [TimesFM Paper](https://arxiv.org/abs/2310.10688)
- [TimesFM GitHub](https://github.com/google-research/timesfm)
- [Streamlit Documentation](https://docs.streamlit.io/)
- [React Documentation](https://react.dev/)
- [Plotly.js Documentation](https://plotly.com/javascript/)
