const FALLBACK_API_URL = "https://your-backend.onrender.com/api";

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl && envUrl.length > 0) {
    return envUrl.replace(/\/$/, "");
  }

  if (import.meta.env.PROD) {
    console.warn("Warning: VITE_API_URL is not set. Using fallback API URL:", FALLBACK_API_URL);
  } else {
    console.warn("Warning: VITE_API_URL not found. Falling back to:", FALLBACK_API_URL);
  }

  return FALLBACK_API_URL;
};

export const isUsingFallbackApiUrl = (): boolean => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  return !envUrl;
};

export { FALLBACK_API_URL };

