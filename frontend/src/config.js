// src/config.js
const envBackend = import.meta.env.VITE_BACKEND_URL;

if (!envBackend) {
  console.warn("VITE_BACKEND_URL is NOT set. Using fallback URL.");
}

// If env is missing, you can temporarily hardcode your Render URL here:
export const BACKEND_URL =
  envBackend || "https://ai-wellbeing-backend-xxxxx.onrender.com";
