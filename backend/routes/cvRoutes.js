const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const cvService = require('../services/cvService');
const templateService = require('../services/templateService');

const router = express.Router();

// Configure multer for file uploads - using memory storage (no disk storage)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory only
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload and parse CV endpoint with structured parsing + document generation
router.post('/upload', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log(`📁 Processing file: ${req.file.originalname}`);

    // Parse the CV using memory buffer (no disk storage)
    const parsedData = await cvService.parseCV(req.file.buffer, req.file.mimetype, req.file.originalname);

    // If we have file data, send it as a download
    if (parsedData.fileData) {
      res.set({
        'Content-Type': parsedData.contentType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${parsedData.fileName}"`,
        'Content-Length': parsedData.fileData.length
      });
      
      console.log('📤 Sending file as download:', parsedData.fileName);
      res.send(parsedData.fileData);
    } else {
      // Fallback to JSON response if no file data
      res.json({
        success: true,
        message: 'CV processed successfully',
        data: parsedData,
        filename: req.file.originalname
      });
    }

  } catch (error) {
    console.error('Error processing CV:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing CV and generating document',
      error: error.message
    });
  }
});

// Generate filled template endpoint
router.post('/generate-template', [
  body('templateName').notEmpty().withMessage('Template name is required'),
  body('cvData').isObject().withMessage('CV data must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { templateName, cvData } = req.body;

    console.log(`📄 Generating template: ${templateName}`);

    // Generate the filled template
    const filledTemplate = await templateService.fillTemplate(templateName, cvData);

    res.json({
      success: true,
      message: 'Template generated successfully',
      downloadUrl: `/api/cv/download/${path.basename(filledTemplate)}`,
      filename: path.basename(filledTemplate)
    });

  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating template',
      error: error.message
    });
  }
});

// Download generated template endpoint
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);

    res.download(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
    });

  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: error.message
    });
  }
});

// Get available templates endpoint
router.get('/templates', async (req, res) => {
  try {
    const templates = await templateService.getAvailableTemplates();
    
    res.json({
      success: true,
      templates: templates
    });

  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting templates',
      error: error.message
    });
  }
});

module.exports = router;