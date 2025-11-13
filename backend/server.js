require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const jsreport = require('jsreport-core')();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    errorType: 'RATE_LIMIT'
  }
});
app.use('/api/', limiter);

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024 } // 10MB default
});

// ============================================
// JSREPORT CONFIGURATION FOR CV GENERATION
// ============================================

// Handlebars Helpers - Matching C# implementation exactly
const handlebarHelpers = `
function ifEq(a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
};

function ifNotEq(a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
};

function ifEmptyOrWhitespace(value, options) {
    if (!value) { return options.fn(this); }
    return value.replace(/\\s*/g, '').length === 0
        ? options.fn(this)
        : options.inverse(this);
};

function formatFilename(filename) {
    if(!filename) return '';
    const nameWithoutExtension = filename.split('.').slice(0, -1).join('.');
    const nameWithSpaces = nameWithoutExtension.replace(/_/g, ' ');
    const titleCaseName = nameWithSpaces.replace(/\\w\\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    return titleCaseName;
};

function formatDateToMonthYear(date) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
        return '';
    }
    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[parsedDate.getMonth()];
    const year = parsedDate.getFullYear();
    return month + ' ' + year;
};

function textWithBreaks(text) {
    if (!text) return '';
    return text.replace(/\\n/g, '<p/>');
};
`;

// Initialize JSReport
jsreport.use(require('jsreport-handlebars')());
jsreport.use(require('jsreport-docx')({
  htmlEngine: 'handlebars'
}));

// Function to generate CV using JSReport
async function generateCvAsync(data) {
  try {
    // Read the DOCX template
    const templatePath = path.join(__dirname, 'templates', 'AW_cv_template.docx');
    
    if (!fs.existsSync(templatePath)) {
      throw new Error('Template file not found: AW_cv_template.docx');
    }
    
    const templateContent = fs.readFileSync(templatePath);
    const templateBase64 = templateContent.toString('base64');
    
    // Parse curriculum JSON if it's a string
    let curriculumData = data.curriculum;
    if (typeof curriculumData === 'string') {
      try {
        curriculumData = JSON.parse(curriculumData);
      } catch (parseError) {
        console.error('Failed to parse curriculum JSON:', parseError);
        throw new Error('Invalid curriculum JSON format');
      }
    }
    
    // Prepare template data
    const templateData = {
      candidateIdentification: data.candidateIdentification,
      ...curriculumData
    };
    
    console.log('🏗️ Generating CV with JSReport...');
    console.log('📋 Candidate ID:', data.candidateIdentification);
    console.log('📄 Data keys:', Object.keys(curriculumData));
    
    // Render the document
    const result = await jsreport.render({
      template: {
        recipe: 'docx',
        engine: 'handlebars',
        docx: {
          templateAsset: {
            encoding: 'base64',
            content: templateBase64
          }
        },
        helpers: handlebarHelpers
      },
      data: templateData
    });
    
    // Convert result to base64
    const base64Content = result.content.toString('base64');
    console.log('✅ CV generated successfully, size:', base64Content.length);
    
    return base64Content;
    
  } catch (error) {
    console.error('❌ CV generation error:', error);
    throw error;
  }
}

// CV upload endpoint
app.post('/api/cv/upload', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded',
        errorType: 'NO_FILE'
      });
    }

    // Validate file format
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = req.file.originalname.toLowerCase().match(/\.[^/.]+$/);
    
    if (!allowedTypes.includes(req.file.mimetype) || 
        !fileExtension || 
        !allowedExtensions.includes(fileExtension[0])) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid file format. Only PDF, DOC, and DOCX files are supported.',
        errorType: 'INVALID_FORMAT'
      });
    }

    console.log(`📁 Processing: ${req.file.originalname}`);
    console.log('📄 File size (bytes):', req.file.size);

    // Convert file to base64
    const base64Data = req.file.buffer.toString('base64');
    console.log('📄 Base64 length:', base64Data.length);
    console.log('📄 Base64 starts with:', base64Data.substring(0, 50));

    // Noxus AI configuration
    const workflow_id = process.env.NOXUS_WORKFLOW_ID;
    const api_token = process.env.NOXUS_API_TOKEN;
    
    if (!workflow_id || !api_token) {
      console.error('❌ Missing Noxus AI configuration');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error. Please contact support.',
        errorType: 'CONFIG_ERROR'
      });
    }
    
    const endpoint = `https://app.noxus.ai/api/backend/v1/workflows/${workflow_id}/runs`;

    const headers = {
      "X-API-KEY": api_token,
      "Content-Type": "application/json"
    };

    const body = {
      "input": {
        "CV": base64Data
      }
    };

    // Start workflow
    console.log('🚀 Starting Noxus workflow...');
    let startResponse;
    try {
      startResponse = await axios.post(endpoint, body, { headers });
      console.log('✅ Workflow started, ID:', startResponse.data.id);
    } catch (noxusError) {
      console.error('❌ Noxus API Error:', noxusError.response?.data || noxusError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to start CV processing workflow. Please try again.',
        errorType: 'NOXUS_API_ERROR',
        details: noxusError.response?.status === 401 ? 'Authentication failed' : 'Service unavailable'
      });
    }
    
    const runId = startResponse.data.id;

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60;
    let finalResponse;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;

      console.log(`🔄 Checking status (attempt ${attempts}/${maxAttempts})...`);

      let statusResponse;
      try {
        statusResponse = await axios.get(
          `${endpoint}/${runId}`,
          { headers: { "X-API-KEY": api_token } }
        );
      } catch (noxusError) {
        console.error('❌ Noxus Status Check Error:', noxusError.response?.data || noxusError.message);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to check processing status. Please try again.',
          errorType: 'NOXUS_API_ERROR',
          details: 'Status check failed'
        });
      }

      console.log('📋 Status:', statusResponse.data.status);

      if (statusResponse.data.status === 'completed') {
        finalResponse = statusResponse.data;
        console.log('✅ Workflow completed!');
        break;
      } else if (statusResponse.data.status === 'failed') {
        console.error('❌ Noxus workflow failed. Full response:', JSON.stringify(statusResponse.data, null, 2));
        return res.status(500).json({ 
          success: false, 
          message: 'CV processing failed on Noxus AI. Please check your file and try again.',
          errorType: 'NOXUS_PROCESSING_FAILED',
          details: statusResponse.data.error || 'Workflow execution failed'
        });
      }
    }

    if (!finalResponse) {
      return res.status(500).json({ 
        success: false, 
        message: 'CV processing timed out. The file might be too large or complex. Please try again.',
        errorType: 'NOXUS_TIMEOUT',
        details: `Processing exceeded ${maxAttempts * 5} seconds`
      });
    }

    // Extract the Word document from response
    console.log('🔍 Response output keys:', Object.keys(finalResponse.output || {}));
    
    const outputKeys = Object.keys(finalResponse.output);
    if (outputKeys.length === 0) {
      return res.status(500).json({ 
        success: false, 
        message: 'No processed document was generated. Please try again.',
        errorType: 'NOXUS_NO_OUTPUT',
        details: 'Empty workflow response'
      });
    }
    
    const firstKey = outputKeys[0];
    const nodeOutput = finalResponse.output[firstKey];
    console.log('📄 Node output keys:', Object.keys(nodeOutput || {}));
    
    if (!nodeOutput) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to extract processed document from workflow response.',
        errorType: 'NOXUS_INVALID_RESPONSE',
        details: 'Missing node output'
      });
    }
    
    let wordBuffer;
    
    // Check if we have a file object instead of text
    if (nodeOutput.id && nodeOutput.uri) {
      console.log('📄 Found file object:', nodeOutput.name);
      console.log('📄 File ID:', nodeOutput.id);
      console.log('📄 Content type:', nodeOutput.content_type);
      
      // Return the download link instead of trying to download the file
      const downloadUrl = `https://app.noxus.ai/api/backend/file/${nodeOutput.id}`;
      console.log('� Returning download URL:', downloadUrl);
      
      // Create filename based on original uploaded file
      const originalName = req.file.originalname;
      const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, ''); // Remove extension
      const awFileName = `${nameWithoutExtension}`;
      
      return res.json({
        success: true,
        message: 'CV processed successfully!',
        downloadUrl: downloadUrl,
        fileName: awFileName
      });
      
    } else if (nodeOutput.text) {
      console.log('📄 Found text field with JSON data from Noxus');
      console.log('📄 Generating Word document with JSReport...');
      
      // The text field contains JSON string, not base64 Word document
      // We need to use JSReport to generate the Word document
      try {
        // Check what type nodeOutput.text is
        console.log('🔍 nodeOutput.text type:', typeof nodeOutput.text);
        console.log('🔍 nodeOutput.text sample:', nodeOutput.text.substring(0, 200));
        
        // Parse the JSON string from Noxus (might be double-encoded)
        let parsedData;
        try {
          parsedData = JSON.parse(nodeOutput.text);
          
          // Check if it's still a string (double-encoded JSON)
          if (typeof parsedData === 'string') {
            console.log('🔍 Detected double-encoded JSON, parsing again...');
            parsedData = JSON.parse(parsedData);
          }
          
          console.log('✅ Successfully parsed JSON from Noxus');
          console.log('📋 Has $metadata:', !!parsedData.$metadata);
        } catch (parseError) {
          console.error('❌ Failed to parse Noxus JSON:', parseError);
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to parse CV data from Noxus.',
            errorType: 'NOXUS_PARSE_ERROR',
            details: parseError.message
          });
        }
        
        // Extract fullName and cvReference IMMEDIATELY after parsing
        const fullName = parsedData.$metadata?.personalInformation?.fullName || 'Candidate';
        const cvReference = parsedData.$metadata?.personalInformation?.cvReference || 'Unknown';
        
        console.log('📋 Extracted Full Name:', fullName);
        console.log('📋 Extracted CV Reference:', cvReference);
        
        // Generate candidate ID for JSReport
        let candidateId = cvReference;
        if (!candidateId) {
          const nameParts = fullName.split(' ');
          const initials = nameParts.map(part => part[0]).join('').toUpperCase();
          candidateId = `AW${initials}${Date.now().toString().slice(-4)}`;
        }
        
        console.log('📋 Candidate ID for JSReport:', candidateId);
        
        // Generate the Word document using JSReport
        // Pass the parsed object, not the JSON string
        const base64Doc = await generateCvAsync({
          candidateIdentification: candidateId,
          curriculum: parsedData // Pass the parsed object
        });
        
        // Convert to buffer and send as download
        wordBuffer = Buffer.from(base64Doc, 'base64');
        
        // Build filename using extracted values: AW_CV_FullName_cvReference.docx
        const fileName = `AW CV ${fullName} ${cvReference}.docx`;
        
        res.set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': wordBuffer.length
        });
        
        console.log('✅ Sending generated Word document:', fileName);
        return res.send(wordBuffer);
        
      } catch (jsreportError) {
        console.error('❌ JSReport generation error:', jsreportError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to generate Word document from CV data.',
          errorType: 'JSREPORT_ERROR',
          details: jsreportError.message
        });
      }
      
    } else {
      console.log('📄 Available fields:', Object.keys(nodeOutput));
      console.log('📄 Node output sample:', JSON.stringify(nodeOutput, null, 2).substring(0, 500));
      return res.status(500).json({ 
        success: false, 
        message: 'Processed document format not recognized. Please contact support.',
        errorType: 'NOXUS_INVALID_RESPONSE',
        details: 'Unexpected response format'
      });
    }

  } catch (error) {
    console.error('❌ Unexpected Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'An unexpected error occurred while processing your CV. Please try again.',
      errorType: 'UNKNOWN_ERROR',
      details: error.message
    });
  }
});

// ============================================
// JSREPORT CV GENERATION ENDPOINTS
// ============================================

// Endpoint 1: Generate CV and return Base64 encoded DOCX
app.post('/api/curriculum/generate', async (req, res) => {
  try {
    const { candidateIdentification, curriculum } = req.body;
    
    if (!candidateIdentification || !curriculum) {
      return res.status(400).json({ 
        error: 'Missing required fields: candidateIdentification and curriculum' 
      });
    }
    
    console.log('📝 Generating CV (Base64)...');
    const base64Doc = await generateCvAsync({ candidateIdentification, curriculum });
    
    if (!base64Doc) {
      return res.status(400).json({ error: 'No document generated.' });
    }
    
    res.json({ 
      success: true,
      base64: base64Doc,
      candidateIdentification: candidateIdentification
    });
    
  } catch (error) {
    console.error('❌ CV generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate CV',
      details: error.message 
    });
  }
});

// Endpoint 2: Generate CV and return downloadable file
app.post('/api/curriculum/generate_file', async (req, res) => {
  try {
    const { candidateIdentification, curriculum } = req.body;
    
    if (!candidateIdentification || !curriculum) {
      return res.status(400).json({ 
        error: 'Missing required fields: candidateIdentification and curriculum' 
      });
    }
    
    console.log('📥 Generating CV (File Download)...');
    const base64Doc = await generateCvAsync({ candidateIdentification, curriculum });
    
    if (!base64Doc) {
      return res.status(400).json({ error: 'No document generated.' });
    }
    
    const fileBytes = Buffer.from(base64Doc, 'base64');
    
    // Extract cvReference from curriculum data
    let cvReference = candidateIdentification;
    
    if (typeof curriculum === 'string') {
      try {
        const parsedCurriculum = JSON.parse(curriculum);
        cvReference = parsedCurriculum.$metadata?.personalInformation?.cvReference || candidateIdentification;
      } catch (e) {
        // Use candidateIdentification as fallback
      }
    } else if (curriculum.$metadata?.personalInformation?.cvReference) {
      cvReference = curriculum.$metadata.personalInformation.cvReference;
    }
    
    const fileName = `AW CV ${cvReference}.docx`;
    const contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileBytes.length);
    
    console.log('✅ Sending file:', fileName, 'Size:', fileBytes.length);
    res.send(fileBytes);
    
  } catch (error) {
    console.error('❌ CV file generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate CV file',
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'CV Parser API with JSReport',
    jsreport: 'enabled'
  });
});

// Start server
async function startServer() {
  try {
    console.log('⚙️ Initializing JSReport...');
    await jsreport.init();
    console.log('✅ JSReport initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 CV Parser API running on port ${PORT}`);
      console.log('📡 Simple proxy to Noxus AI');
      console.log('📄 JSReport CV Generation enabled');
    });
  } catch (error) {
    console.error('❌ Failed to initialize JSReport:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
