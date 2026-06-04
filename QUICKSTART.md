# Quick Start Guide - TimesFM Dashboard

## 1️⃣ Start the Streamlit Backend

```bash
# Navigate to project root
cd c:\Users\Tan19\Documents\Self-Dev\AIML\timesfm

# Activate virtual environment (if not already active)
.venv\Scripts\activate

# Run Streamlit app
streamlit run streamlit_app.py
```

**Expected Output:**
```
  You can now view your Streamlit app in your browser.

  Local URL: http://localhost:8501
  Network URL: http://192.168.x.x:8501
```

## 2️⃣ Start the React Frontend (Optional)

In a new terminal:

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.2.0  ready in 123 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

## 3️⃣ Using the Application

### Backend (Streamlit) - Main Interface

1. **Upload Data**
   - Go to http://localhost:8501
   - Use the sidebar to upload `sample_data.csv` or your own file
   - Adjust the forecast horizon (default: 30 days)

2. **Generate Forecast**
   - Click "🚀 Generate Forecast"
   - Wait for model loading (first time takes ~30 seconds)
   - Model will generate forecasts for each material

3. **View Results**
   - Scroll down to see forecast results
   - JSON response is ready to use or download
   - Copy the JSON for use in React frontend

### Frontend (React) - Interactive Visualization

1. **View Dashboard**
   - Go to http://localhost:3000/
   - See the upload interface

2. **Load Forecast Data**
   - Option A: Generate forecast in Streamlit, copy JSON response
   - Option B: Paste JSON data directly into frontend
   - Chart will populate with data

3. **Interact with Chart**
   - **Materials Filter**: Select/deselect which materials to display
   - **Quantiles**: Choose confidence intervals (none selected by default)
   - **Time Range**: Adjust x-axis to zoom into specific period
   - **Chart Controls**: Use Plotly tools to pan, zoom, download

## 📊 Sample Workflow

1. **Terminal 1 - Streamlit Backend:**
   ```bash
   cd c:\Users\Tan19\Documents\Self-Dev\AIML\timesfm
   .venv\Scripts\activate
   streamlit run streamlit_app.py
   ```

2. **Terminal 2 - React Frontend:**
   ```bash
   cd c:\Users\Tan19\Documents\Self-Dev\AIML\timesfm\frontend
   npm run dev
   ```

3. **Browser Tabs:**
   - Tab 1: http://localhost:8501 (Streamlit - Upload & Generate)
   - Tab 2: http://localhost:3000 (React - Visualize & Explore)

4. **Process:**
   - Upload CSV in Streamlit
   - Generate forecast
   - Copy JSON response
   - Paste into React dashboard
   - Explore with interactive filters

## 🧪 Testing with Sample Data

```bash
# Use included sample file
sample_data.csv

# Contains 3 materials:
# - Steel
# - Aluminum  
# - Copper

# With 31 days of historical data (Jan 1-31, 2023)
# Each material has steadily increasing values
```

## ⚙️ Configuration Changes

### To Change Forecast Horizon
In Streamlit, use the sidebar slider (1-200 days)

### To Change Model Settings
Edit `app/config.py`:
```python
DEFAULT_FORECAST_HORIZON = 30      # Default forecast days
MAX_FORECAST_HORIZON = 200         # Max allowed
DEFAULT_INPUT_LENGTH = 512         # Context length
```

### To Change Quantiles
Edit `app/config.py`:
```python
QUANTILES = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]  # 10% to 90%
```

## 🔧 Troubleshooting

### Model Loading Issues
- **Issue:** Takes very long to load
- **Solution:** This is normal for first run (~2GB download from HuggingFace)
- **Check:** Look for cache at `~/.cache/huggingface/`

### Port Already in Use
- **Streamlit:** `streamlit run streamlit_app.py --server.port 8502`
- **React:** `npm run dev -- --port 3001`

### Dependency Issues
- **Python:** `pip install streamlit openpyxl --upgrade`
- **Node.js:** `npm install --legacy-peer-deps`

### Chart Not Rendering
- Ensure materials are selected in sidebar
- Try selecting "Select All" button
- Check browser console for JavaScript errors

## 📝 File Structure

```
timesfm/
├── streamlit_app.py           # ⭐ Main backend app
├── app/                        # Backend modules
│   ├── config.py
│   ├── data_handler.py
│   └── timesfm_processor.py
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom hooks
│   │   ├── types/              # TypeScript types
│   │   ├── styles/             # Component CSS
│   │   ├── App.tsx             # Main app
│   │   └── main.tsx            # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── sample_data.csv             # Test data
├── DASHBOARD.md                # Full documentation
└── README.md                   # Project info
```

## 🚀 Next Steps

1. **Try with your own data** - Upload a CSV with your time series
2. **Explore quantiles** - Toggle different confidence intervals
3. **Customize materials** - Filter to focus on specific products
4. **Integrate API** - For production, setup dedicated FastAPI backend
5. **Deploy** - Use Streamlit Cloud for backend, Vercel for frontend

## 💡 Tips

- **Hover over chart** to see exact values
- **Click legend items** to show/hide series
- **Use time range slider** to focus on recent data
- **Download chart** using camera icon
- **Select "Common"** preset for typical 10%/50%/90% quantiles

## 📧 Support

For issues with:
- **TimesFM:** See https://github.com/google-research/timesfm
- **Streamlit:** See https://docs.streamlit.io/
- **React/Plotly:** See https://react.dev/ and https://plotly.com/

---

**You're all set!** 🎉 Start the backend and explore your forecasts!
