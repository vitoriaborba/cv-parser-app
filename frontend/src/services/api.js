import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for Noxus AI processing
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

export const cvService = {
  // Upload CV to Noxus AI and get download URL for processed document
  uploadCV: async (file) => {
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await api.post('/cv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Remove responseType: 'blob' - now expecting JSON response
        timeout: 120000, // 2 minutes for Noxus AI processing
      });
      
      // Backend now returns JSON with download URL
      return response.data;
      
    } catch (error) {
      // Handle errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Failed to process CV');
    }
  },
};

export default api;