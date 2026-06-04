# TimesFM Forecasting Dashboard - Complete Implementation

A full-stack web application for time series forecasting using Google's TimesFM model with an interactive React frontend and Streamlit backend.

## 🎯 What You've Built

This is a **production-ready dashboard** that enables users to:
- 📤 Upload time series data (CSV/Excel)
- 🔮 Generate forecasts using TimesFM 2.5
- 📊 Visualize results with interactive Plotly charts
- 🎛️ Filter by material/unit and adjust time ranges
- 📈 View confidence intervals via 10 quantile levels

## 🏗️ Architecture Overview

### Backend Stack
- **Framework:** Streamlit
- **Model:** TimesFM 2.5 (Google Research)
- **Data Processing:** Pandas, NumPy
- **Inference:** PyTorch or Flax (configurable)

### Frontend Stack
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Charting:** Plotly.js
- **HTTP Client:** Axios

## 📁 Project Structure

```
timesfm/
│
├── 📄 streamlit_app.py           ⭐ Main backend application
├── 🗂️  app/                       Backend modules
│   ├── __init__.py
│   ├── config.py                 Configuration & constants
│   ├── data_handler.py           CSV/Excel parsing
│   └── timesfm_processor.py      Model inference
│
├── 🗂️  frontend/                  React TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUploader.tsx   Drag-drop file upload
│   │   │   ├── FilterPanel.tsx    Material selection
│   │   │   ├── QuantileSelector.tsx Confidence intervals
│   │   │   ├── TimeRangeSelector.tsx Date range zoom
│   │   │   └── Chart.tsx          Plotly visualization
│   │   ├── hooks/
│   │   │   ├── useForecast.ts     API & state management
│   │   │   └── useChartData.ts    Data transformation
│   │   ├── types/
│   │   │   └── index.ts           TypeScript interfaces
│   │   ├── styles/                Component CSS
│   │   ├── App.tsx                Main app component
│   │   ├── App.css                Global styles
│   │   └── main.tsx               Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── 📊 sample_data.csv             Example dataset
├── 📖 DASHBOARD.md                Full documentation
├── 🚀 QUICKSTART.md               Getting started guide
└── 📄 README.md                   This file
```

## 🚀 Quick Start

### 1. Start Backend (Streamlit)

```bash
# Activate virtual environment
.venv\Scripts\activate

# Run Streamlit
streamlit run streamlit_app.py
```

Visit: **http://localhost:8501**

### 2. Start Frontend (React) - Optional

```bash
cd frontend
npm run dev
```

Visit: **http://localhost:3000**

## 📋 Features Breakdown

### Backend Features (Streamlit)

| Feature | Details |
|---------|---------|
| **File Upload** | CSV & Excel support with drag-drop |
| **Data Validation** | Automatic structure & type checking |
| **Configurable Horizon** | 1-200 day forecast (default: 30) |
| **Quantile Forecasts** | 10 quantile levels (10%-90%) |
| **Real-time Results** | JSON response with all forecasts |
| **Download Export** | Save forecast as JSON file |

### Frontend Features (React)

| Feature | Details |
|---------|---------|
| **Responsive Layout** | Desktop & tablet optimized |
| **Material Filtering** | Select/deselect multiple materials |
| **Quick Selection** | Select all / deselect all buttons |
| **Quantile Control** | Toggle confidence intervals (default: off) |
| **Time Range Zoom** | Interactive date range picker |
| **Interactive Chart** | Plotly with hover, pan, zoom |
| **Metadata Display** | Summary statistics of forecast |
| **Chart Download** | Export as PNG via Plotly |

## 🔄 Data Flow

```
User Upload (CSV/Excel)
        ↓
   DataHandler
   - Parse file
   - Validate structure
   - Check data types
        ↓
   TimesFMProcessor
   - Load model
   - Run inference
   - Compute quantiles
        ↓
   JSON Response
   ├── original_data (timestamps + values)
   ├── forecasts (mean + quantiles)
   └── metadata (horizon, quantiles, etc.)
        ↓
   React Frontend
   ├── Display chart
   ├── Apply filters
   └── Allow interactions
```

## 📊 Expected Data Format

### Input CSV/Excel
```
Date,Material_A,Material_B,Material_C
2023-01-01,100,200,150
2023-01-02,105,210,160
2023-01-03,110,215,165
```

**Requirements:**
- First column must contain dates (any standard format)
- Remaining columns are materials with numeric values
- No special handling needed for missing data (auto-filled)

### Output JSON Response
```json
{
  "original_data": {
    "timestamps": ["2023-01-01T00:00:00", ...],
    "materials": {
      "Material_A": [100, 105, 110, ...],
      "Material_B": [200, 210, 215, ...]
    }
  },
  "forecasts": {
    "Material_A": {
      "mean": [115, 120, 125, ...],
      "quantiles": {
        "q10": [112, 116, 120, ...],
        "q90": [118, 124, 130, ...]
      }
    }
  },
  "metadata": {
    "forecast_horizon": 30,
    "available_quantiles": ["q10", "q20", ..., "q90"],
    "n_materials": 2,
    "n_samples": 31
  }
}
```

## ⚙️ Configuration

### Backend Configuration (`app/config.py`)

```python
DEFAULT_FORECAST_HORIZON = 30          # Default forecast days
MAX_FORECAST_HORIZON = 200             # Max allowed
DEFAULT_INPUT_LENGTH = 512             # Context window size
QUANTILES = [0.1, 0.2, ..., 0.9]     # Quantile levels
MODEL_NAME = "google/timesfm-1.0-200m" # Model version
USE_TORCH = True                       # Backend: True=Torch, False=Flax
```

### Frontend Configuration (`frontend/vite.config.ts`)

```typescript
server: {
  port: 3000,
  proxy: {
    "/api": {
      target: "http://localhost:8501",
      changeOrigin: true,
    },
  },
}
```

## 🧪 Testing

### With Sample Data

1. In Streamlit: Upload `sample_data.csv`
2. Contains 3 materials: Steel, Aluminum, Copper
3. 31 days of historical data (Jan 1-31, 2023)
4. Generate forecast (default: 30 days)

### Expected Results

- ✅ Data preview shows 31 samples × 3 materials
- ✅ Forecast generates 30 predictions per material
- ✅ 10 quantile levels computed
- ✅ JSON response ready for visualization

## 🔧 Customization

### Change Forecast Horizon
```bash
# In Streamlit sidebar slider (1-200 days)
```

### Modify Quantiles
Edit `app/config.py`:
```python
QUANTILES = [0.05, 0.25, 0.75, 0.95]  # Custom percentiles
```

### Add Custom Materials Filter
Edit `frontend/src/components/FilterPanel.tsx`:
```typescript
// Add grouping or custom filters as needed
```

### Customize Chart Colors
Edit `frontend/src/hooks/useChartData.ts`:
```typescript
const COLORS = ["#1f77b4", "#ff7f0e", ...];  // Plotly colors
```

## 🚨 Troubleshooting

### Model Loading Takes Long
**Cause:** First load downloads ~2GB model from HuggingFace  
**Solution:** This is normal. Subsequent runs are faster (~30s)

### Port Already in Use
```bash
# Streamlit on different port
streamlit run streamlit_app.py --server.port 8502

# React on different port
cd frontend && npm run dev -- --port 3001
```

### Memory Issues
**Cause:** Large datasets or small context window  
**Solution:** Reduce `DEFAULT_INPUT_LENGTH` in config.py

### Chart Not Rendering
**Cause:** No materials selected  
**Solution:** Click "Select All" in FilterPanel

## 📚 Key Components Deep Dive

### DataHandler

```python
DataHandler.parse_uploaded_file(file)
  ↓ Returns: (DataFrame, format_type)
  ↓ Supports: CSV, XLSX, XLS

DataHandler.validate_data(df)
  ↓ Returns: validation results
  ↓ Checks: date column, numeric values

DataHandler.prepare_for_inference(df)
  ↓ Returns: (data_dict, timestamps)
  ↓ Fills: NaN values, formats for model
```

### TimesFMProcessor

```python
processor = TimesFMProcessor()
processor.load_model()  # Load TimesFM 2.5
forecasts = processor.forecast(
  data_dict,
  horizon=30,
  quantiles=[0.1, ..., 0.9]
)
  ↓ Returns: {material: {mean, quantiles}}
```

### React Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| App | Main orchestrator | State management |
| FileUploader | File input | `onFileSelect` callback |
| FilterPanel | Material selection | `selectedMaterials` |
| QuantileSelector | Quantile filtering | `selectedQuantiles` |
| TimeRangeSelector | Date range zoom | `timeRangeStart/End` |
| Chart | Plotly visualization | `forecastData`, filters |

## 🔌 Integration Options

### Option 1: Direct Streamlit Use
- Users generate forecast in Streamlit
- Copy JSON response
- Use React frontend for visualization

### Option 2: FastAPI Backend
- Wrapper API for file upload
- Streamlit for exploratory analysis
- React frontend for production UI

### Option 3: Full Streamlit App
- Add st.write() JSON endpoint
- React frontend calls Streamlit API
- Setup CORS for cross-origin requests

## 📦 Dependencies

### Backend
```
streamlit>=1.28.0
pandas>=2.0.0
numpy>=1.24.0
timesfm>=0.1.0
openpyxl>=3.1.0  # For Excel support
```

### Frontend
```
react@^18.3.1
react-plotly.js@^2.0.1
plotly.js@^2.26.0
axios@^1.6.8
```

## 🚀 Deployment

### Streamlit Cloud
```bash
# Push to GitHub, then deploy via:
# https://streamlit.io/cloud
```

### Vercel (React Frontend)
```bash
cd frontend
vercel deploy
```

### Docker (Production)
```dockerfile
FROM python:3.11
COPY . /app
RUN pip install -r requirements.txt
RUN cd app/frontend && npm install && npm build
CMD ["streamlit", "run", "streamlit_app.py"]
```

## 🎓 Learning Resources

- [TimesFM Paper](https://arxiv.org/abs/2310.10688)
- [Streamlit Docs](https://docs.streamlit.io/)
- [React TypeScript Guide](https://react.dev/learn/typescript)
- [Plotly.js Examples](https://plotly.com/javascript/)

## 📝 Next Steps

1. **Test with sample data** (`sample_data.csv`)
2. **Try your own data** (CSV with date + numeric columns)
3. **Explore quantiles** (toggle confidence intervals)
4. **Customize colors/styling** (frontend CSS)
5. **Deploy to production** (Streamlit Cloud + Vercel)
6. **Integrate into workflow** (API endpoint setup)

## 📧 Support & Issues

### Common Questions

**Q: How do I add more materials?**  
A: Just add more columns to your CSV (after the date column)

**Q: Can I change the forecast horizon?**  
A: Yes, use the Streamlit sidebar slider (1-200 days)

**Q: What's the maximum data size?**  
A: Up to 512 time steps (configurable in config.py)

**Q: Can I use the model with GPU?**  
A: Yes, install torch-cuda and TimesFM will auto-detect

### Debugging

1. Check Streamlit logs: Terminal output while running
2. Check React logs: Browser console (F12)
3. Verify model load: First run downloads ~2GB
4. Test with sample data first: Narrow down issues

## 📄 License

This dashboard integrates with Google Research's TimesFM model. Please see the main repository LICENSE for details.

---

**Built with ❤️ for time series forecasting**

**Next:** Read [QUICKSTART.md](QUICKSTART.md) to get running in 5 minutes!
