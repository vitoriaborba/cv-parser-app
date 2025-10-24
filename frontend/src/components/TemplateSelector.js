import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { cvService } from '../services/api';
import { toast } from 'react-toastify';

function TemplateSelector({ cvData, onGenerateTemplate, onReset, loading, downloadCompleted = false }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    if (!downloadCompleted) {
      loadTemplates();
    } else {
      setLoadingTemplates(false);
    }
  }, [downloadCompleted]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const result = await cvService.getTemplates();
      
      if (result.success) {
        setTemplates(result.templates || []);
        if (result.templates && result.templates.length > 0) {
          setSelectedTemplate(result.templates[0].name);
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Error loading templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleGenerateTemplate = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }
    onGenerateTemplate(selectedTemplate);
  };

  const getDataSummary = () => {
    const summary = [];
    
    if (cvData.personalInfo?.name) summary.push('Personal Info');
    if (cvData.experience?.length > 0) summary.push(`${cvData.experience.length} Experience(s)`);
    if (cvData.education?.length > 0) summary.push(`${cvData.education.length} Education(s)`);
    if (cvData.skills?.length > 0) summary.push(`${cvData.skills.length} Skills`);
    
    return summary;
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        {downloadCompleted ? 'Download Complete!' : 'Step 3: Generate Template'}
      </Typography>

      {downloadCompleted ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          ✅ CV processed and document generated successfully! Your file has been downloaded.
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 3 }}>
          CV data parsed successfully! Select a template to generate your filled document.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* CV Data Summary */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Parsed Data Summary
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {getDataSummary().map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>

              {cvData.personalInfo?.name && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Name:</strong> {cvData.personalInfo.name}
                </Typography>
              )}
              
              {cvData.personalInfo?.email && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Email:</strong> {cvData.personalInfo.email}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Template Selection */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Template
              </Typography>

              {loadingTemplates ? (
                <Box display="flex" alignItems="center">
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                  <Typography variant="body2">Loading templates...</Typography>
                </Box>
              ) : (
                <>
                  {templates.length > 0 ? (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Choose Template</InputLabel>
                      <Select
                        value={selectedTemplate}
                        label="Choose Template"
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                      >
                        {templates.map((template) => (
                          <MenuItem key={template.name} value={template.name}>
                            <Box display="flex" alignItems="center">
                              <DescriptionIcon sx={{ mr: 1, fontSize: 20 }} />
                              {template.displayName}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      No templates available. Please add template files to the backend.
                    </Alert>
                  )}

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={loadTemplates}
                    disabled={loadingTemplates}
                  >
                    <RefreshIcon sx={{ mr: 1 }} />
                    Refresh Templates
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={onReset}
          disabled={loading}
        >
          Start Over
        </Button>

        <Button
          variant="contained"
          onClick={handleGenerateTemplate}
          disabled={!selectedTemplate || loading || templates.length === 0}
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
        >
          {loading ? 'Generating...' : 'Generate & Download'}
        </Button>
      </Box>

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Next Steps:</strong>
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2, mt: 1 }}>
          <li>Click "Generate & Download" to create a filled template with your CV data</li>
          <li>The template will be automatically downloaded to your computer</li>
          <li>You can then open and edit the generated document as needed</li>
        </Typography>
      </Alert>
    </Box>
  );
}

export default TemplateSelector;