"""Main Streamlit application for TimesFM forecasting dashboard backend."""

import streamlit as st
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, Any
import plotly.graph_objects as go

from app.config import (
    DEFAULT_FORECAST_HORIZON,
    MAX_FORECAST_HORIZON,
    QUANTILE_LABELS,
)
from app.data_handler import DataHandler
from app.timesfm_processor import TimesFMProcessor

# Page config
st.set_page_config(
    page_title="TimesFM Forecasting Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Initialize session state
if "processor" not in st.session_state:
    st.session_state.processor = TimesFMProcessor(use_mock=True)

if "use_real_model" not in st.session_state:
    st.session_state.use_real_model = False

if "last_data" not in st.session_state:
    st.session_state.last_data = None

if "last_forecast" not in st.session_state:
    st.session_state.last_forecast = None


def prepare_response(
    df: pd.DataFrame,
    data_dict: Dict[str, np.ndarray],
    timestamps: np.ndarray,
    forecasts: Dict[str, Dict[str, np.ndarray]],
    horizon: int,
) -> Dict[str, Any]:
    """Prepare JSON response for frontend."""
    # Generate forecast dates
    last_date = pd.Timestamp(timestamps[-1])
    forecast_dates = [
        (last_date + timedelta(days=i)).isoformat() for i in range(1, horizon + 1)
    ]

    # Build response
    response = {
        "original_data": {
            "timestamps": [pd.Timestamp(ts).isoformat() for ts in timestamps],
            "materials": {
                material: values.tolist() for material, values in data_dict.items()
            },
        },
        "forecasts": {},
        "metadata": {
            "forecast_horizon": horizon,
            "forecast_dates": forecast_dates,
            "available_quantiles": QUANTILE_LABELS,
            "n_materials": len(data_dict),
            "n_samples": len(timestamps),
        },
    }

    # Add forecasts
    for material_name, forecast_data in forecasts.items():

        quantiles = forecast_data["quantiles"]  # dict now

        response["forecasts"][material_name] = {
            "point": forecast_data["point"].tolist(),
            "quantiles": {
                k: v.tolist() for k, v in quantiles.items()
            }
        }

    return response


def main():
    """Main Streamlit application."""
    st.title("📊 TimesFM Forecasting Dashboard")
    st.markdown("Forecast time series data using Google's TimesFM model")

    # Sidebar configuration
    with st.sidebar:
        st.header("⚙️ Configuration")

        horizon = st.slider(
            "Forecast Horizon (days)",
            min_value=1,
            max_value=MAX_FORECAST_HORIZON,
            value=DEFAULT_FORECAST_HORIZON,
            step=1,
        )

        st.markdown("---")
        
        # Model selection
        use_real_model = st.checkbox(
            "Use Real TimesFM Model",
            value=st.session_state.use_real_model,
            help="Uncheck for mock forecasts (testing). Check to use actual TimesFM model (requires ~2GB download)"
        )
        
        if use_real_model != st.session_state.use_real_model:
            st.session_state.use_real_model = use_real_model
            st.session_state.processor = TimesFMProcessor(use_mock=not use_real_model)
        
        if st.session_state.use_real_model:
            st.info("⚠️ Using real TimesFM model. First run will download ~2GB model file.")
        else:
            st.info("📊 Using mock forecasts for testing. Uncheck 'Use Real TimesFM Model' to use actual model.")

        st.markdown("---")
        st.header("📤 Upload Data")

        uploaded_file = st.file_uploader(
            "Upload CSV or Excel file",
            type=["csv", "xlsx", "xls"],
            help="Format: First column = dates, other columns = materials/units",
        )

    # Main area
    if uploaded_file:
        try:
            # Parse and validate data
            df, file_format = DataHandler.parse_uploaded_file(uploaded_file)
            validation_result = DataHandler.validate_data(df)

            st.success(f"✅ File uploaded successfully ({file_format})")

            # Show data preview
            with st.expander("📋 Data Preview & Info", expanded=True):
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Samples", validation_result["n_samples"])
                with col2:
                    st.metric("Materials/Units", validation_result["n_materials"])
                with col3:
                    st.metric("Date Range", validation_result["date_range"])

                st.dataframe(df.head(10), width='stretch')

            # Prepare data for inference
            data_dict, timestamps = DataHandler.prepare_for_inference(df)

            # Generate forecast button
            col1, col2 = st.columns([1, 3])
            with col1:
                if st.button(
                    "🚀 Generate Forecast",
                    type="primary",
                    width='stretch',
                ):
                    with st.spinner("Loading model and generating forecasts..."):
                        try:
                            forecasts = st.session_state.processor.forecast(
                                data_dict, horizon=horizon, quantiles=None
                            )

                            # Prepare response
                            response = prepare_response(
                                df, data_dict, timestamps, forecasts, horizon
                            )

                            st.session_state.last_data = df
                            st.session_state.last_forecast = response

                            st.success("✅ Forecast generated successfully!")

                        except Exception as e:
                            st.error(f"❌ Error generating forecast: {str(e)}")

            # Display forecast if available
            if st.session_state.last_forecast:
                st.markdown("---")
                st.header("📈 Forecast Results")

                forecast = st.session_state.last_forecast

                # Download forecast JSON
                forecast_json = json.dumps(
                    st.session_state.last_forecast, indent=2, default=str
                )
                st.download_button(
                    label="⬇️ Download Forecast (JSON)",
                    data=forecast_json,
                    file_name=f"forecast_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                    mime="application/json",
                )


                materials = list(forecast["original_data"]["materials"].keys())
                timestamps = forecast["original_data"]["timestamps"]
                forecast_dates = forecast["metadata"]["forecast_dates"]

                # =========================
                # FILTERS
                # =========================
                col1, col2 = st.columns(2)

                with col1:
                    selected_materials = st.multiselect(
                        "Select materials",
                        options=materials,
                        default=materials
                    )

                with col2:
                    show_history = st.checkbox("Include historical data", value=True)

                # =========================
                # QUANTILE CONTROL (NEW FLEXIBLE FILTER)
                # =========================
                st.subheader("📊 Forecast Components")

                show_point = st.checkbox("Show forecast (point)", value=True)

                # collect all available quantiles dynamically
                quant_dict = forecast["forecasts"][materials[0]]["quantiles"]

                # separate mean from quantiles
                mean_key = "mean" if "mean" in quant_dict else None

                quantile_keys = [
                    k for k in quant_dict.keys()
                    if k.startswith("q") and k[1:].isdigit()
                ]

                quantile_keys = sorted(quantile_keys, key=lambda x: int(x[1:]))

                show_mean = st.checkbox("Show mean forecast", value=True)

                selected_quantiles = st.multiselect(
                    "Select quantiles (q10–q90)",
                    options=quantile_keys,
                    default=[]
                )

                # =========================
                # PLOT
                # =========================
                fig = go.Figure()

                for material in selected_materials:

                    history = forecast["original_data"]["materials"][material]
                    pred = forecast["forecasts"][material]

                    # -------------------------
                    # HISTORICAL
                    # -------------------------
                    if show_history:
                        fig.add_trace(go.Scatter(
                            x=timestamps,
                            y=history,
                            mode="lines",
                            name=f"{material} (history)"
                        ))

                    # -------------------------
                    # FORECAST (POINT - ALWAYS AVAILABLE)
                    # -------------------------
                    if show_point:
                        fig.add_trace(go.Scatter(
                            x=forecast_dates,
                            y=pred["point"],
                            mode="lines",
                            line=dict(dash="dash"),
                            name=f"{material} (forecast)"
                        ))

                    # -------------------------
                    # MEAN
                    # -------------------------
                    if show_mean and "mean" in pred["quantiles"]:
                        fig.add_trace(go.Scatter(
                            x=forecast_dates,
                            y=pred["quantiles"]["mean"],
                            mode="lines",
                            line=dict(dash="dash"),
                            name=f"{material} (mean)"
                        ))

                    # -------------------------
                    # QUANTILES
                    # -------------------------
                    for q in selected_quantiles:
                        fig.add_trace(go.Scatter(
                            x=forecast_dates,
                            y=pred["quantiles"][q],
                            mode="lines",
                            name=f"{material} ({q})"
                        ))

                # =========================
                # LAYOUT
                # =========================
                fig.update_layout(
                    title="Forecast: Historical + Prediction (Multi-Material)",
                    xaxis_title="Time",
                    yaxis_title="Value",
                    height=650,
                    hovermode="x unified"
                )

                st.plotly_chart(fig, use_container_width=True)

                # Display summary
                with st.expander("📊 Forecast Summary"):
                    metadata = st.session_state.last_forecast["metadata"]
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.metric("Forecast Horizon", metadata["forecast_horizon"])
                    with col2:
                        st.metric("Materials", metadata["n_materials"])
                    with col3:
                        st.metric("Available Quantiles", len(metadata["available_quantiles"]))

                    st.json(st.session_state.last_forecast, expanded=False)

                # Display data as JSON (for frontend consumption)
                st.markdown("---")
                st.subheader("📡 API Response (for Frontend)")
                st.code(forecast_json, language="json")

        except Exception as e:
            st.error(f"❌ Error processing file: {str(e)}")

    else:
        st.info(
            "👈 Please upload a CSV or Excel file in the sidebar to get started.\n\n"
            "**Expected format:**\n"
            "- First column: Dates/timestamps\n"
            "- Other columns: Materials or units with their values\n"
            "- Rows: Time periods (daily, weekly, monthly, etc.)"
        )


if __name__ == "__main__":
    main()
