import axios from 'axios';

// Configure axios for production
if (import.meta.env.PROD) {
  axios.defaults.baseURL = 'https://fittracker-backend-gdgp.onrender.com';
}
axios.defaults.withCredentials = true;
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/react-app/index.css";
import App from "@/react-app/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);