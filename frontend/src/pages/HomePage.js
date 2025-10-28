import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Alert,
  Button,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import FileUpload from '../components/FileUpload';
import { cvService } from '../services/api';

function HomePage() {
  const [loading, setLoading] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setDownloadInfo(null); // Clear any previous download info when starting new upload
    setProgress(0);
    
    try {
      console.log('📁 Uploading file:', file.name);
      
      // Start progress simulation
      setProgress(10); // File uploaded
      
      setTimeout(() => setProgress(25), 1000);   // Workflow starting
      setTimeout(() => setProgress(40), 3000);   // Processing
      setTimeout(() => setProgress(60), 8000);   // Analyzing  
      setTimeout(() => setProgress(80), 15000);  // Almost done
      setTimeout(() => setProgress(95), 20000);  // Finalizing
      
      const result = await cvService.uploadCV(file);
      setProgress(100); // Complete when done
      
      if (result.success && result.downloadUrl) {
        // Store download info to show in UI
        setDownloadInfo({
          url: result.downloadUrl,
          fileName: result.fileName,
          message: result.message
        });
        
        // Also open download URL in new tab (since it works in browser)
        window.open(result.downloadUrl, '_blank');
        
        console.log('📄 Download URL opened:', result.downloadUrl);
        console.log('📄 File name:', result.fileName);
      } else {
        throw new Error(result.message || 'Failed to process CV');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Handle specific error types with appropriate messages
      if (error.response?.data) {
        const { errorType, message } = error.response.data;
        
        switch (errorType) {
          case 'INVALID_FORMAT':
            toast.error('❌ Invalid File Format\n' + message, {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            break;
            
          case 'NOXUS_API_ERROR':
          case 'NOXUS_PROCESSING_FAILED':
          case 'NOXUS_TIMEOUT':
          case 'NOXUS_NO_OUTPUT':
          case 'NOXUS_INVALID_RESPONSE':
            toast.error('🔧 Noxus AI Service Error\n' + message, {
              position: "top-center",
              autoClose: 7000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            break;
            
          case 'NO_FILE':
            toast.warning('📁 No File Selected\n' + message, {
              position: "top-center",
              autoClose: 4000,
            });
            break;
            
          default:
            toast.error('⚠️ Processing Error\n' + (message || 'An unexpected error occurred'), {
              position: "top-center",
              autoClose: 6000,
            });
        }
      } else {
        // Network or other errors
        toast.error('🌐 Network Error\nPlease check your connection and try again', {
          position: "top-center",
          autoClose: 5000,
        });
      }
      
      setDownloadInfo(null); // Clear any previous download info
    } finally {
      setLoading(false);
      setProgress(0); // Reset progress
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        CV processing with AI automation
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
        Upload the CV file and get a processed Word document instantly
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <FileUpload 
              onFileUpload={handleFileUpload} 
              loading={loading}
              progress={progress}
            />
          </Paper>
        </Grid>
        
        {downloadInfo && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Alert 
                severity="success" 
                sx={{ mb: 2 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => window.open(downloadInfo.url, '_blank')}
                  >
                    Download Again
                  </Button>
                }
              >
                <Typography variant="h6" component="div">
                  🎉 CV Processing Complete!
                </Typography>
                <Typography variant="body2">
                  {downloadInfo.message} Your document should have opened in a new tab.
                </Typography>
              </Alert>
              
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => window.open(downloadInfo.url, '_blank')}
                sx={{ mt: 2 }}
                size="large"
              >
                Download CV
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default HomePage;