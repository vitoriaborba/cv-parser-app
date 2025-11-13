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
  // Upload CV to Noxus AI and get processed Word document
  uploadCV: async (file) => {
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await api.post('/cv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // Expecting binary file (Word document)
        timeout: 120000, // 2 minutes for Noxus AI + JSReport processing
      });
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'CV_AdvanceWorks.docx';
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }
      
      // Create blob URL for download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = window.URL.createObjectURL(blob);
      
      return {
        success: true,
        blob: blob,
        url: url,
        fileName: fileName,
        message: 'CV processed successfully!'
      };
      
    } catch (error) {
      // Handle errors - check if it's a JSON error response
      if (error.response?.data instanceof Blob) {
        // Try to parse error from blob
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          throw error; // Keep original error with response data
        } catch (parseError) {
          // Not JSON, use generic error
          throw new Error('Failed to process CV');
        }
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Failed to process CV');
    }
  },
};

export default api;