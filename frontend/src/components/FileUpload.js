import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

function FileUpload({ onFileUpload, loading }) {
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles[0].errors.map(error => error.message).join(', ');
      console.error('File rejected:', errors);
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
        Step 1: Upload Your CV
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Supported formats: PDF, DOC, DOCX (max 10MB)
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
          <Box>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6">
              Processing your CV...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we parse your document
            </Typography>
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

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          💡 <strong>Tip:</strong> For best results, ensure your CV has clear sections for 
          personal information, experience, education, and skills.
        </Typography>
      </Box>
    </Box>
  );
}

export default FileUpload;