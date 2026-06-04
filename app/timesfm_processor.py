"""TimesFM model inference and forecast processing."""

import numpy as np
from typing import Dict, List, Tuple, Optional
from app.config import (
    QUANTILE_LABELS,
)
import warnings

warnings.filterwarnings("ignore")


class TimesFMProcessor:
    """Handles TimesFM model loading and inference."""

    def __init__(self, use_mock: bool = False):
        """Initialize TimesFM model.
        
        Args:
            use_mock: If True, use mock forecasts for testing (no model download)
        """
        self.model = None
        self.model_loaded = False
        self.use_mock = use_mock

    def load_model(self):
        """Lazily load TimesFM model."""
        if self.model_loaded:
            return

        if self.use_mock:
            # Mock mode - skip actual model loading
            self.model_loaded = True
            return

        try:
            import timesfm
            from timesfm.configs import ForecastConfig
            import torch
            
            # Set precision for better performance
            torch.set_float32_matmul_precision("high")
            
            # Load TimesFM 2.5 200M model
            self.model = timesfm.TimesFM_2p5_200M_torch.from_pretrained(
                "google/timesfm-2.5-200m-pytorch"
            )
            
            # Compile the model with forecast config
            forecast_config = ForecastConfig(
                max_context=512,
                max_horizon=128,
                normalize_inputs=True,
                use_continuous_quantile_head=True,
                fix_quantile_crossing=True,
            )
            self.model.compile(forecast_config)
            
            self.model_loaded = True
        except Exception as e:
            raise RuntimeError(f"Failed to load TimesFM model: {str(e)}")

    def forecast(
        self,
        data_dict: Dict[str, np.ndarray],
        horizon: int = 30,
        quantiles: List[float] = None,
    ) -> Dict[str, Dict[str, np.ndarray]]:
        """
        Generate forecasts for multiple time series.

        Args:
            data_dict: {material_name: values array}
            horizon: Forecast horizon (1-128)
            quantiles: List of quantiles to compute (0.1-0.9)

        Returns:
            Dict with forecasts for each material:
            {
                material_name: {
                    "mean": ndarray,
                    "quantiles": {
                        "q10": ndarray,
                        "q20": ndarray,
                        ...
                        "q90": ndarray
                    }
                }
            }
        """
        if not self.model_loaded:
            self.load_model()

        if quantiles is None:
            quantiles = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

        # Limit horizon to model's max
        horizon = min(horizon, 128)

        forecasts = {}

        for material_name, values in data_dict.items():
            try:
                if self.use_mock:
                    # Generate mock forecast for testing
                    mean_forecast = self._generate_mock_forecast(values, horizon)
                    quantile_forecasts = {
                        f"q{int(q*100)}": self._generate_mock_forecast(
                            values, horizon, noise_scale=0.1 * (1 - 2*abs(q - 0.5))
                        )
                        for q in quantiles
                    }
                else:
                    # Prepare context - use last 512 values or all if less
                    context = values[-512:] if len(values) > 512 else values
                    context = context.astype(np.float32)
                    
                    # Get forecast - API signature: forecast(horizon, inputs)
                    # Returns tuple: (mean_forecast, quantile_forecast)
                    point_forecast, forecast_quantiles = self.model.forecast(
                        horizon,
                        [context],  # Pass as list of arrays
                    )
                    
                    # Convert to numpy if needed
                    if hasattr(point_forecast, 'numpy'):
                        point_forecast = point_forecast.numpy()
                    if hasattr(forecast_quantiles, 'numpy'):
                        forecast_quantiles = forecast_quantiles.numpy()
                    
                    # Extract point (shape: (batch, horizon))
                    point_forecast = point_forecast[0, :horizon].astype(np.float32)
                    
                    # Organize quantile forecasts (shape: (batch, horizon, num_quantiles))
                    quantile_forecasts = {
                        QUANTILE_LABELS[idx]: forecast_quantiles[0, :horizon, idx].astype(np.float32)
                        for idx in range(min(len(QUANTILE_LABELS), forecast_quantiles.shape[2]))
                    }
                
                forecasts[material_name] = {
                    "point": point_forecast,
                    "quantiles": quantile_forecasts,
                }

            except Exception as e:
                raise RuntimeError(
                    f"Forecast failed for {material_name}: {str(e)}"
                )

        return forecasts
    
    def _generate_mock_forecast(
        self, historical: np.ndarray, horizon: int, noise_scale: float = 0.05
    ) -> np.ndarray:
        """Generate mock forecast for testing (simple extrapolation with noise)."""
        # Calculate trend from last few points
        trend = np.mean(np.diff(historical[-10:]))
        last_value = historical[-1]
        
        # Generate forecast with trend
        forecast = np.array([
            last_value + trend * (i + 1) + np.random.normal(0, noise_scale * last_value)
            for i in range(horizon)
        ], dtype=np.float32)
        
        return forecast

    def forecast_batch(
        self,
        data_list: List[np.ndarray],
        horizon: int = 30,
        quantiles: List[float] = None,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate batch forecasts (for efficiency).

        Args:
            data_list: List of time series arrays
            horizon: Forecast horizon (1-128)
            quantiles: List of quantiles

        Returns:
            Tuple of (mean_forecasts, quantile_forecasts)
        """
        if not self.model_loaded:
            self.load_model()

        if quantiles is None:
            quantiles = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

        # Limit horizon to model's max
        horizon = min(horizon, 128)

        # Prepare batch (pad to same length)
        max_len = min(512, max(len(x) for x in data_list))
        batch = []

        for values in data_list:
            context = values[-max_len:] if len(values) > max_len else values
            if len(context) < max_len:
                context = np.concatenate(
                    [np.zeros(max_len - len(context)), context]
                )
            batch.append(context)

        batch = np.array(batch, dtype=np.float32)

        try:
            # TimesFM API: forecast(horizon, inputs)
            # Returns tuple: (mean_forecast, quantile_forecast)
            # inputs should be list of numpy arrays
            point_forecast, forecast_quantiles = self.model.forecast(
                horizon,
                [batch[i] for i in range(len(batch))],  # Convert batch to list of arrays
            )
            
            # Convert to numpy if needed
            if hasattr(point_forecast, 'numpy'):
                point_forecast = point_forecast.numpy()
            if hasattr(forecast_quantiles, 'numpy'):
                forecast_quantiles = forecast_quantiles.numpy()
                
            return point_forecast, forecast_quantiles
        except Exception as e:
            raise RuntimeError(f"Batch forecast failed: {str(e)}")
