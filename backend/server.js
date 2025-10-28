require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
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

    // Convert file to base64
    const base64Data = req.file.buffer.toString('base64');
    console.log('📄 Base64 length:', base64Data.length);

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
        "Input 1": base64Data
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
        return res.status(500).json({ 
          success: false, 
          message: 'CV processing failed on Noxus AI. Please check your file and try again.',
          errorType: 'NOXUS_PROCESSING_FAILED',
          details: 'Workflow execution failed'
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
      console.log('📄 Found text field with base64 data');
      wordBuffer = Buffer.from(nodeOutput.text, 'base64');
      
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
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="processed_cv_${Date.now()}.docx"`,
      'Content-Length': wordBuffer.length
    });

    res.send(wordBuffer);

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'CV Parser API' });
});

app.listen(PORT, () => {
  console.log(`🚀 CV Parser API running on port ${PORT}`);
  console.log('📡 Simple proxy to Noxus AI');
});

module.exports = app;
