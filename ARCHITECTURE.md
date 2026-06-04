# 🏗️ TimesFM Dashboard - Architecture & Component Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────┐      ┌──────────────────────────────┐  │
│  │   React Frontend        │◄────►│   Streamlit Backend          │  │
│  │   (Port 3000)           │      │   (Port 8501)                │  │
│  │                         │      │                              │  │
│  │ • FileUploader          │      │ • File Upload               │  │
│  │ • FilterPanel           │      │ • Data Validation           │  │
│  │ • QuantileSelector      │      │ • TimesFM Inference         │  │
│  │ • TimeRangeSelector     │──────►  Forecast Generation       │  │
│  │ • Chart (Plotly)        │      │ • JSON Response             │  │
│  └─────────────────────────┘      │ • Results Download          │  │
│                                     │                              │  │
│                                     └──────────────────────────────┘  │
│                                            ▲                         │
└────────────────────────────────────────────┼─────────────────────────┘
                                             │
                                             ▼
                        ┌───────────────────────────────────┐
                        │   TimesFM Model (2.5)             │
                        │   • 200M Parameters               │
                        │   • 16K Context Length            │
                        │   • 10 Quantile Levels            │
                        └───────────────────────────────────┘
```

## Data Flow

```
User CSV/Excel File
        │
        ▼
┌──────────────────────────┐
│   DataHandler            │
│  - Parse file            │
│  - Validate structure    │
│  - Clean data            │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│   Data Dict              │
│  {Material: values[]}    │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│   TimesFMProcessor       │
│  - Load model            │
│  - Run inference         │
│  - Compute quantiles     │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│   Forecast Results       │
│  - Mean forecast         │
│  - 10 quantile levels    │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│   JSON Response          │
│  - Original data         │
│  - Forecasts             │
│  - Metadata              │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│   React Frontend         │
│  - Transform data        │
│  - Apply filters         │
│  - Render chart          │
└──────────────────────────┘
        │
        ▼
   Interactive Chart
```

## Component Hierarchy

```
App (State Management)
│
├── Sidebar
│   ├── FileUploader
│   │   ├── Drag-drop zone
│   │   └── File input
│   │
│   ├── FilterPanel
│   │   ├── Select All button
│   │   ├── Deselect All button
│   │   └── Material checkboxes
│   │
│   ├── QuantileSelector
│   │   ├── Preset buttons
│   │   ├── Clear All button
│   │   └── Quantile checkboxes (q10-q90)
│   │
│   └── TimeRangeSelector
│       ├── Start date input
│       ├── End date input
│       └── Reset Range button
│
└── Main Content
    ├── Chart
    │   ├── Plotly visualization
    │   ├── Original data (lines)
    │   ├── Forecast (dashed lines)
    │   └── Quantiles (bands/dots)
    │
    └── Metadata
        ├── Material count
        ├── Sample count
        ├── Forecast horizon
        └── Quantile count
```

## Backend Module Structure

```
streamlit_app.py (Main Entry Point)
    │
    ├─► app.config
    │   ├── DEFAULT_FORECAST_HORIZON
    │   ├── MAX_FORECAST_HORIZON
    │   ├── QUANTILES
    │   └── MODEL_NAME
    │
    ├─► app.data_handler
    │   ├── parse_uploaded_file()
    │   ├── validate_data()
    │   └── prepare_for_inference()
    │
    └─► app.timesfm_processor
        ├── load_model()
        ├── forecast()
        └── forecast_batch()
```

## Frontend Hook Architecture

```
App Component
    │
    ├─► useForecast()
    │   ├── State: data, loading, error
    │   ├── Callback: generateForecast()
    │   └── Returns: {data, loading, error}
    │
    └─► useChartData()
        ├── Input: forecastData, filters
        ├── Process: Transform to Plotly format
        ├── Filter: By materials, quantiles, time
        └── Output: {series, layout}
```

## File Organization

```
TimesFM Project Root
│
├── 🔧 Backend (Python)
│   ├── streamlit_app.py           ⭐ Main app
│   └── app/
│       ├── __init__.py
│       ├── config.py              ⚙️ Settings
│       ├── data_handler.py        📁 File I/O
│       └── timesfm_processor.py   🤖 Model
│
├── 🎨 Frontend (React + TypeScript)
│   └── frontend/
│       ├── src/
│       │   ├── components/        🧩 UI components
│       │   │   ├── FileUploader.tsx
│       │   │   ├── FilterPanel.tsx
│       │   │   ├── QuantileSelector.tsx
│       │   │   ├── TimeRangeSelector.tsx
│       │   │   └── Chart.tsx
│       │   ├── hooks/             🪝 Custom hooks
│       │   │   ├── useForecast.ts
│       │   │   └── useChartData.ts
│       │   ├── types/             📋 TS interfaces
│       │   ├── styles/            🎨 CSS
│       │   ├── App.tsx            📱 Main app
│       │   └── main.tsx           🚀 Entry point
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
│
├── 📚 Documentation
│   ├── QUICKSTART.md              🚀 5-min setup
│   ├── DASHBOARD.md               📖 Full docs
│   ├── DASHBOARD_README.md         📚 Features
│   ├── IMPLEMENTATION_SUMMARY.md   ✅ Completion
│   ├── PROJECT_CHECKLIST.md        ☑️ Status
│   └── ARCHITECTURE.md             🏗️ This file
│
├── 📊 Data
│   └── sample_data.csv            📈 Example
│
└── 🔐 Config
    ├── requirements.txt
    ├── pyproject.toml
    └── .venv/
```

## Key Decision Points

### Architecture Decisions ✓
```
Choice 1: Backend Framework
├── Options: FastAPI, Flask, Streamlit
├── Selected: Streamlit
└── Reason: Quick UI, built-in widgets, fast iteration

Choice 2: Frontend Framework
├── Options: React, Vue, Svelte
├── Selected: React + TypeScript
└── Reason: Type safety, large ecosystem, future-proof

Choice 3: Charting Library
├── Options: Plotly, Chart.js, D3, Recharts
├── Selected: Plotly
└── Reason: Interactive, time-series friendly, responsive

Choice 4: Build Tool
├── Options: Create React App, Vite, Webpack
├── Selected: Vite
└── Reason: Fast builds, simple config, modern ES modules

Choice 5: State Management
├── Options: Redux, Zustand, Context, Local State
├── Selected: Local State + Hooks
└── Reason: Simple, no overkill, perfect for this scale
```

## Data Format Specifications

### Input CSV Format
```
Date,Material_A,Material_B,...
YYYY-MM-DD,numeric,numeric,...
YYYY-MM-DD,numeric,numeric,...
...
```

### Output JSON Schema
```json
{
  "original_data": {
    "timestamps": ["ISO-8601 date strings"],
    "materials": {
      "material_name": [numeric array]
    }
  },
  "forecasts": {
    "material_name": {
      "mean": [numeric array],
      "quantiles": {
        "q10": [array],
        "q20": [array],
        ...
        "q90": [array]
      }
    }
  },
  "metadata": {
    "forecast_horizon": number,
    "available_quantiles": ["q10", ..., "q90"],
    "n_materials": number,
    "n_samples": number
  }
}
```

## Performance Characteristics

```
Component              | Time    | Notes
-----------------------+---------+----------------------
File Upload            | <1s     | Client-side
CSV Parsing            | 1-2s    | Depends on size
Model Loading (first)  | 30-40s  | Downloads from HF
Model Loading (cached) | 5-10s   | Loads from disk
Inference (30 days)    | 10-20s  | Per material
Chart Render           | <1s     | React + Plotly
Filter Apply           | <100ms  | Real-time
Zoom/Pan               | <50ms   | Smooth interaction
```

## Integration Points

### Current Integration ✓
```
User uploads CSV
        │
        ▼
    Streamlit app processes
        │
        ▼
    Returns JSON response
        │
        ▼
    User copies JSON
        │
        ▼
    React frontend receives
        │
        ▼
    Chart renders
```

### Future Integration Options
```
Option A: Direct API
├── FastAPI wrapper around TimesFM
├── React calls API endpoints
└── Stateless, scalable

Option B: WebSocket Streaming
├── Real-time forecast updates
├── Better UX for large data
└── Persistent connection

Option C: Database Storage
├── Save forecast history
├── Compare multiple runs
└── Track model performance
```

## Deployment Architecture

### Local Development
```
Terminal 1: streamlit run streamlit_app.py
            └── http://localhost:8501

Terminal 2: npm run dev (in frontend/)
            └── http://localhost:3000
```

### Production (Recommended)
```
Streamlit Cloud: Backend
├── Auto-deployed from GitHub
├── Scales to handle traffic
└── Free tier available

Vercel: Frontend
├── Auto-deployed from GitHub
├── Global CDN
└── Free tier available

Database: Forecast Storage (Optional)
├── PostgreSQL or Firebase
├── Store results
└── Track history
```

## Security Considerations

```
File Upload
├── ✓ Type validation (.csv, .xlsx)
├── ✓ Size limits (configurable)
└── ✓ Malware scanning (optional)

Data Processing
├── ✓ Input validation
├── ✓ NaN handling
└── ✓ Type checking

API Response
├── ✓ JSON structure validated
├── ✓ No sensitive data leaked
└── ✓ Error messages safe

Frontend
├── ✓ XSS prevention
├── ✓ CSRF protection ready
└── ✓ Secure headers
```

## Future Roadmap

```
Phase 1: MVP ✅ (COMPLETE)
├── File upload
├── Forecasting
├── Visualization
└── Filtering

Phase 2: Enhancement
├── Database integration
├── Multi-forecast comparison
├── Export functionality
└── User authentication

Phase 3: Production
├── Enterprise deployment
├── Monitoring & analytics
├── API documentation
└── SLA management

Phase 4: Advanced
├── Model fine-tuning
├── Real-time streaming
├── Mobile app
└── Batch processing
```

---

**For implementation details, see the source code!**
