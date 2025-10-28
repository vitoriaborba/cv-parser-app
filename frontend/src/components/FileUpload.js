import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

function FileUpload({ onFileUpload, loading, progress }) {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejectedFile = rejectedFiles[0];
      const errors = rejectedFile.errors.map(error => error.message);
      console.error('File rejected:', errors);
      
      // Show specific error messages for different rejection reasons
      if (errors.some(error => error.includes('type'))) {
        toast.error('❌ Invalid File Format\nOnly PDF, DOC, and DOCX files are supported.', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (errors.some(error => error.includes('size'))) {
        toast.error('📏 File Too Large\nMaximum file size is 10MB.', {
          position: "top-center",
          autoClose: 5000,
        });
      } else {
        toast.error('❌ File Upload Error\n' + errors.join(', '), {
          position: "top-center",
          autoClose: 5000,
        });
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: loading,
  });

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Upload Your CV
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Supported formats: PDF, DOC, DOCX (max 10MB) • Processed by Noxus AI
      </Alert>

      <Box
        {...getRootProps()}
        sx={{
          border: 2,
          borderColor: isDragReject ? 'error.main' : isDragActive ? 'primary.main' : 'grey.300',
          borderStyle: 'dashed',
          borderRadius: 2,
          p: 6,
          textAlign: 'center',
          cursor: loading ? 'not-allowed' : 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            bgcolor: loading ? 'background.paper' : 'action.hover',
            borderColor: loading ? 'grey.300' : 'primary.main',
          },
        }}
      >
        <input {...getInputProps()} />
        
        {loading ? (
          <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Processing your CV with Noxus AI...
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <LinearProgress 
                variant={progress ? "determinate" : "indeterminate"} 
                value={progress || 0} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'grey.200'
                }}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {progress ? `${Math.round(progress)}% complete` : 'Please wait while we generate your document'}
            </Typography>
            
            {progress && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {progress < 20 && '🚀 Starting workflow...'}
                {progress >= 20 && progress < 60 && '⚙️ Processing document...'}
                {progress >= 60 && progress < 90 && '🔍 Analyzing content...'}
                {progress >= 90 && '✨ Finalizing document...'}
              </Typography>
            )}
          </Box>
        ) : (
          <Box>
            {isDragActive ? (
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            ) : (
              <DescriptionIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
            )}
            
            {isDragActive ? (
              <Typography variant="h6">
                Drop your CV here...
              </Typography>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Drag & drop your CV here
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  or
                </Typography>
                <Button variant="contained" component="span">
                  Browse Files
                </Button>
              </>
            )}
            
            {isDragReject && (
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                File type not supported. Please upload a PDF, DOC, or DOCX file.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default FileUpload;