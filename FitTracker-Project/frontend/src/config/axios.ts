import axios from 'axios';

// Configure axios to use the backend URL from environment variable in production
const API_URL = import.meta.env.PROD 
  ? 'https://fittracker-backend-gdgp.onrender.com' 
  : '';

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

export default axios;
