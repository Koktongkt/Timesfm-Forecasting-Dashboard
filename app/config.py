"""Configuration for TimesFM forecasting application."""

# Forecast parameters
DEFAULT_FORECAST_HORIZON = 30
MAX_FORECAST_HORIZON = 128  # TimesFM 2.5 max is 128
DEFAULT_INPUT_LENGTH = 512  # TimesFM 2.5 supports up to 16K but 512 is optimal

# Quantiles to compute (excluding mean)
#QUANTILES = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
QUANTILE_LABELS = [
    "mean",
    "q10",
    "q20",
    "q30",
    "q40",
    "q50",
    "q60",
    "q70",
    "q80",
    "q90"
]

# Model configuration
MODEL_NAME = "google/timesfm-2.5-200m-pytorch"
USE_TORCH = True  # TimesFM 2.5 uses PyTorch

# Supported file formats
SUPPORTED_FORMATS = [".csv", ".xlsx", ".xls"]

