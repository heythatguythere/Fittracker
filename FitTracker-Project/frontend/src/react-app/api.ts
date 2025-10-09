import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
  // This line is the key: it automatically reads the VITE_API_BASE_URL
  // you created for both local development and live production.
  baseURL: import.meta.env.VITE_API_BASE_URL,

  // This ensures that authentication cookies are sent with every API request.
  withCredentials: true,
});

export default api;