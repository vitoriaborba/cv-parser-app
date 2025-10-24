import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
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
  // Upload and parse CV
  uploadCV: async (file) => {
    const formData = new FormData();
    formData.append('cv', file);

    const response = await api.post('/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob', // Handle binary file response
    });
    
    // Check if response is a file (binary) or JSON
    if (response.headers['content-type']?.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      // It's a Word document - create download
      const blob = response.data;
      const filename = response.headers['content-disposition']?.match(/filename="(.+)"/)?.[1] || 'curriculum.docx';
      
      // Auto-download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: 'CV processed and document generated successfully!',
        filename: filename,
        downloadCompleted: true
      };
    } else {
      // It's a JSON response - convert blob to text and parse
      const text = await response.data.text();
      return JSON.parse(text);
    }
  },

  // Generate filled template
  generateTemplate: async (templateName, cvData) => {
    const response = await api.post('/cv/generate-template', {
      templateName,
      cvData,
    });
    return response.data;
  },

  // Get available templates
  getTemplates: async () => {
    const response = await api.get('/cv/templates');
    return response.data;
  },

  // Download generated file
  downloadFile: async (filename) => {
    const response = await api.get(`/cv/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;