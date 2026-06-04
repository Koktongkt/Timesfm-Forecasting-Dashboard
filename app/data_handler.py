"""Data handling for CSV/Excel uploads and validation."""

import pandas as pd
import numpy as np
from io import BytesIO
from typing import Tuple, Dict, Any


class DataHandler:
    """Handles file upload, parsing, and validation."""

    @staticmethod
    def parse_uploaded_file(uploaded_file) -> Tuple[pd.DataFrame, str]:
        """
        Parse uploaded CSV or Excel file.

        Args:
            uploaded_file: Streamlit uploaded file object

        Returns:
            Tuple of (DataFrame, format_type)

        Raises:
            ValueError: If file format is unsupported or data is invalid
        """
        if not uploaded_file:
            raise ValueError("No file uploaded")

        filename = uploaded_file.name.lower()

        try:
            if filename.endswith(".csv"):
                df = pd.read_csv(uploaded_file)
                return df, "csv"
            elif filename.endswith((".xlsx", ".xls")):
                df = pd.read_excel(uploaded_file)
                return df, "excel"
            else:
                raise ValueError(f"Unsupported file format: {filename}")
        except Exception as e:
            raise ValueError(f"Error parsing file: {str(e)}")

    @staticmethod
    def validate_data(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Validate time series data structure.

        Expected format:
        - First column: dates/timestamps (can be unnamed or named)
        - Remaining columns: materials/units with their values

        Args:
            df: Parsed DataFrame

        Returns:
            Dict with validation results and metadata

        Raises:
            ValueError: If data structure is invalid
        """
        if df.empty:
            raise ValueError("DataFrame is empty")

        if len(df.columns) < 2:
            raise ValueError("Data must have at least 2 columns (date + 1 material)")

        # Try to parse first column as datetime
        try:
            dates = pd.to_datetime(df.iloc[:, 0])
        except Exception as e:
            raise ValueError(f"First column must be dates/timestamps. Error: {str(e)}")

        # Check if values are numeric
        data_cols = df.iloc[:, 1:]
        for col in data_cols.columns:
            try:
                pd.to_numeric(df[col], errors="coerce")
            except Exception:
                raise ValueError(f"Column '{col}' contains non-numeric values")

        # Handle NaN values
        numeric_df = df.iloc[:, 1:].apply(pd.to_numeric, errors="coerce")
        null_ratio = numeric_df.isnull().sum() / len(numeric_df)

        materials = list(data_cols.columns)
        n_samples = len(df)
        date_range = f"{dates.min().date()} to {dates.max().date()}"

        return {
            "valid": True,
            "n_samples": n_samples,
            "n_materials": len(materials),
            "materials": materials,
            "date_range": date_range,
            "dates": dates.tolist(),
            "null_ratios": null_ratio.to_dict(),
        }

    @staticmethod
    def prepare_for_inference(df: pd.DataFrame) -> Tuple[Dict[str, np.ndarray], np.ndarray]:
        """
        Prepare data for TimesFM inference.

        Returns:
            Tuple of (data_dict, timestamps)
            - data_dict: {material_name: ndarray of values}
            - timestamps: array of datetime objects
        """
        dates = pd.to_datetime(df.iloc[:, 0])
        timestamps = dates.values

        data_dict = {}
        for col in df.columns[1:]:
            values = pd.to_numeric(df[col], errors="coerce").ffill().fillna(0)
            data_dict[col] = values.values.astype(np.float32)

        return data_dict, timestamps
