import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { toast } from 'react-toastify';
import FileUpload from '../components/FileUpload';
import CVPreview from '../components/CVPreview';
import TemplateSelector from '../components/TemplateSelector';
import { cvService } from '../services/api';

const steps = ['Upload CV', 'Review Parsed Data', 'Generate Template'];

function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [downloadCompleted, setDownloadCompleted] = useState(false);

  const handleFileUpload = async (file) => {
    setLoading(true);
    try {
      console.log('📁 Uploading file:', file.name);
      const result = await cvService.uploadCV(file);
      
      if (result.success) {
        if (result.downloadCompleted) {
          // File was automatically downloaded
          toast.success('CV processed and document generated! Download completed.');
          setUploadedFileName(result.filename);
          setDownloadCompleted(true);
          setActiveStep(2); // Go directly to completion step
        } else {
          // Standard JSON response - go to review
          setCvData(result.data);
          setUploadedFileName(result.filename);
          toast.success('CV parsed successfully!');
          setActiveStep(1); // Go to review step
        }
      } else {
        throw new Error(result.message || 'Failed to parse CV');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || error.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTemplate = async (templateName) => {
    setLoading(true);
    try {
      console.log('📄 Generating template:', templateName);
      const result = await cvService.generateTemplate(templateName, cvData);
      
      if (result.success) {
        setActiveStep(2);
        toast.success('Template generated successfully!');
        
        // Auto-download the file
        const blob = await cvService.downloadFile(result.filename);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error(result.message || 'Failed to generate template');
      }
    } catch (error) {
      console.error('Template generation error:', error);
      toast.error(error.response?.data?.message || error.message || 'Error generating template');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setCvData(null);
    setUploadedFileName('');
    setDownloadCompleted(false);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        CV Parser Automation
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
        Upload your CV, review parsed data, and generate filled templates automatically
      </Typography>

      <Box sx={{ width: '100%', mt: 4, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {activeStep === 0 && (
              <FileUpload 
                onFileUpload={handleFileUpload} 
                loading={loading}
              />
            )}
            
            {activeStep === 1 && cvData && (
              <CVPreview 
                cvData={cvData} 
                fileName={uploadedFileName}
                onNext={() => setActiveStep(2)}
                onBack={() => setActiveStep(0)}
              />
            )}
            
            {activeStep === 2 && (
              <TemplateSelector 
                cvData={cvData}
                onGenerateTemplate={handleGenerateTemplate}
                onReset={handleReset}
                loading={loading}
                downloadCompleted={downloadCompleted}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default HomePage;