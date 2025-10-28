# CV Parser Automation App

A streamlined single-page application for automated CV parsing and Word document generation, powered by AdvanceWorks and Noxus AI.

## Features

- 🏢 **AdvanceWorks Branding**: Professional corporate identity with company logo
- 📁 **File Upload**: Intuitive drag & drop interface for PDF, DOC, and DOCX files (max 10MB)
- 🤖 **Noxus AI Integration**: Advanced CV processing through Noxus AI workflow API
- ⚡ **Real-time Progress**: Linear progress bar with stage indicators and emoji feedback
- 📄 **Instant Download**: Automatic Word document generation with custom filename prefixes
- � **Smart Error Handling**: Comprehensive error messages with toast notifications
- 📱 **Responsive Design**: Modern Material-UI interface with professional black header

## Tech Stack

### Backend
- **Node.js & Express.js** - Lightweight proxy server
- **Multer** - Memory-based file upload handling
- **Axios** - HTTP client for Noxus AI API communication
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18.3.1** - Modern UI framework with Vite 5.4.21
- **Material-UI v6** - Professional component library
- **React Dropzone** - Enhanced file upload component
- **React Toastify** - Toast notification system
- **Axios** - API communication

### External Services
- **Noxus AI** - Advanced CV processing workflow API
- **AdvanceWorks** - Corporate branding and identity

## Project Structure

```
cv-parser-app/
├── backend/
│   ├── server.js        # Express proxy server with Noxus AI integration
│   └── package.json     # Backend dependencies
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  
│   │   │   ├── FileUpload.js    # Drag-drop upload with progress
│   │   │   └── Logo.js          # AdvanceWorks SVG logo component
│   │   ├── pages/       
│   │   │   └── HomePage.js      # Main application page
│   │   ├── services/    
│   │   │   └── api.js           # API service layer
│   │   ├── App.js               # Root component with toast container
│   │   └── main.js              # React entry point
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite configuration
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### CV Processing
- `POST /api/cv/upload` - Upload CV file and process through Noxus AI workflow
  - Accepts: PDF, DOC, DOCX files (max 10MB)
  - Returns: Download URL for processed Word document
  - Error handling: Format validation, Noxus API errors, timeouts

### Health Check
- `GET /api/health` - API health status and service information

## Noxus AI Integration

The application integrates with Noxus AI workflow `f93d38d3-864e-4186-95a8-0a7f54b8fc50`:

1. **File Upload**: Converts uploaded CV to base64 format
2. **Workflow Execution**: Sends file to Noxus AI for processing
3. **Polling**: Monitors workflow status every 5 seconds (max 5 minutes)
4. **Response Handling**: Extracts download URL from completed workflow
5. **Download**: Opens processed Word document in new browser tab

## Usage

1. **Upload CV**: Drag and drop or click to select a CV file (PDF, DOC, DOCX - max 10MB)
2. **Processing**: Watch the real-time progress bar with stage indicators:
   - 🚀 Starting workflow...
   - ⚙️ Processing document...
   - 🔍 Analyzing content...
   - ✨ Finalizing document...
3. **Download**: Processed Word document automatically opens in new tab
4. **Success**: Green alert shows completion with option to download again

## Error Handling

The application provides comprehensive error handling with toast notifications:

### File Format Errors
- **Invalid Format**: Shows when non-PDF/DOC/DOCX files are uploaded
- **File Too Large**: Displays when files exceed 10MB limit

### Noxus AI Errors
- **API Errors**: Authentication failures or service unavailability
- **Processing Failures**: When workflow execution fails
- **Timeouts**: When processing exceeds time limits
- **Invalid Responses**: When response format is unexpected

### Network Errors
- **Connection Issues**: Network connectivity problems
- **Server Errors**: Backend service unavailability

## Configuration

### Noxus AI Workflow
- **Workflow ID**: `f93d38d3-864e-4186-95a8-0a7f54b8fc50`
- **API Endpoint**: `https://app.noxus.ai/api/backend/v1/workflows/`
- **Authentication**: X-API-KEY header authentication
- **Polling Interval**: 5 seconds
- **Timeout**: 5 minutes (60 attempts)

## Environment Variables

Backend configuration (hardcoded in server.js):
```
PORT=5000
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760  # 10MB
NOXUS_WORKFLOW_ID=f93d38d3-864e-4186-95a8-0a7f54b8fc50
NOXUS_API_TOKEN=[configured in server.js]
```

For production deployment, move sensitive values to environment variables:
```bash
# .env file
NOXUS_API_TOKEN=your_api_token_here
NOXUS_WORKFLOW_ID=your_workflow_id_here
```

## Security Features

- **File Validation**: Strict MIME type and extension checking
- **File Size Limits**: 10MB maximum file size
- **CORS Protection**: Configured for localhost:3000 origin
- **Memory Storage**: Files processed in memory without disk storage
- **API Authentication**: Secure Noxus AI API key authentication
- **Error Sanitization**: Structured error responses without sensitive data exposure

## UI/UX Features

- **Professional Branding**: AdvanceWorks logo in black header
- **Responsive Design**: Mobile-friendly Material-UI components
- **Progress Feedback**: Linear progress bar with percentage and stage emojis
- **Toast Notifications**: Non-intrusive error and success messages
- **Drag & Drop**: Intuitive file upload experience
- **Visual States**: Clear loading, success, and error states

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload enabled with Vite
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

### Production Considerations
- Move API tokens to environment variables
- Implement proper logging and monitoring
- Add database integration for user sessions (if needed)
- Configure proper CORS for production domains
- Set up SSL/TLS certificates
- Implement API rate limiting for production use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review the API endpoints

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│   Backend   │───▶│  Noxus AI   │
│  React App  │    │ Express API │    │  Workflow   │
│ localhost:  │    │ localhost:  │    │   Service   │
│    3000     │    │    5000     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│File Upload  │    │Base64 Conv. │    │ CV Process  │
│Progress Bar │    │Error Handle │    │Word Gen.    │
│Toast Notify │    │CORS Proxy   │    │File Storage │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

**AdvanceWorks CV Parser** - Streamlined, professional CV processing with Noxus AI integration.