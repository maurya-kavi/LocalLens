import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function getHealthStatus() {
  const response = await api.get('/health');
  return response.data;
}

export default api;
