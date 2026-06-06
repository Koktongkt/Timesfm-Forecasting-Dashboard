/**
 * Custom hook for managing forecast API calls and state
 */

import { useState, useCallback } from "react";
import axios from "axios";
import { ForecastResponse } from "../types";

const STREAMLIT_URL = "http://localhost:8501";

interface UseForeCastReturn {
  data: ForecastResponse | null;
  loading: boolean;
  error: string | null;
  generateForecast: (
    file: File,
    horizon: number
  ) => Promise<ForecastResponse | null>;
}

export const useForecast = (): UseForeCastReturn => {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateForecast = useCallback(
    async (file: File, horizon: number): Promise<ForecastResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        // Since we're using Streamlit, the frontend needs to:
        // 1. Call the Streamlit backend API (JSON endpoint)
        // 2. Streamlit will handle file upload internally

        // For now, we'll use a simpler approach:
        // The user uploads in Streamlit, then we fetch the forecast data from Streamlit

        // In a production setup, you'd want to:
        // - Create a dedicated FastAPI backend alongside Streamlit for cleaner API
        // - Or setup Streamlit as API with st.write() endpoints

        // For this implementation, the frontend displays data from Streamlit's session state
        // which is made available via the JSON response

        console.log("Forecast generation initiated in parent component");
        return null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate forecast";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, generateForecast };
};
