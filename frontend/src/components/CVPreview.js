import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

function CVPreview({ cvData, fileName, onNext, onBack }) {
  const { personalInfo, experience, education, skills, candidateId, downloadInfo } = cvData;

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Step 2: Review Parsed Data
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Review the extracted information from <strong>{fileName}</strong>. 
        {downloadInfo ? (
          <>Your curriculum has been automatically generated using external APIs!</>
        ) : (
          <>If the data looks correct, proceed to generate a template.</>
        )}
      </Alert>

      {/* API Processing Status */}
      {candidateId && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>✅ External API Processing Complete</strong>
          </Typography>
          <Typography variant="body2">
            Candidate ID: <code>{candidateId}</code>
          </Typography>
          {downloadInfo && (
            <Typography variant="body2">
              Generated Document: <strong>{downloadInfo.fileName}</strong>
            </Typography>
          )}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Personal Information
                </Typography>
              </Box>
              
              {personalInfo && Object.keys(personalInfo).length > 0 ? (
                <List dense>
                  {personalInfo.name && (
                    <ListItem>
                      <ListItemText primary="Name" secondary={personalInfo.name} />
                    </ListItem>
                  )}
                  {personalInfo.email && (
                    <ListItem>
                      <ListItemText primary="Email" secondary={personalInfo.email} />
                    </ListItem>
                  )}
                  {personalInfo.phone && (
                    <ListItem>
                      <ListItemText primary="Phone" secondary={personalInfo.phone} />
                    </ListItem>
                  )}
                  {personalInfo.address && (
                    <ListItem>
                      <ListItemText primary="Address" secondary={personalInfo.address} />
                    </ListItem>
                  )}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No personal information extracted
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Experience */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WorkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Work Experience
                </Typography>
              </Box>
              
              {experience && experience.length > 0 ? (
                <List dense>
                  {experience.map((exp, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={exp.title || 'Position'}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {exp.company || 'Company'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {exp.period || 'Period'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No work experience extracted
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Education */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Education
                </Typography>
              </Box>
              
              {education && education.length > 0 ? (
                <List dense>
                  {education.map((edu, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={edu.degree || 'Degree'}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {edu.institution || 'Institution'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {edu.year || 'Year'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No education information extracted
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Skills */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CodeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Skills
                </Typography>
              </Box>
              
              {skills && skills.length > 0 ? (
                <Box>
                  {skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No skills extracted
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Navigation Buttons */}
      <Box display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
        >
          Upload Different File
        </Button>
        
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={onNext}
        >
          Generate Template
        </Button>
      </Box>

      {/* Raw Text Preview (Collapsible) */}
      {cvData.rawText && (
        <Card elevation={1} sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Raw Extracted Text (Preview)
            </Typography>
            <Box
              sx={{
                maxHeight: 200,
                overflow: 'auto',
                bgcolor: 'grey.50',
                p: 2,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.300',
              }}
            >
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {cvData.rawText.substring(0, 1000)}
                {cvData.rawText.length > 1000 && '...'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default CVPreview;