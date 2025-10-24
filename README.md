# CV Parser Automation App

A full-stack application for automated CV parsing and template generation built with React and Node.js.

## Features

- 📁 **File Upload**: Drag & drop interface for PDF, DOC, and DOCX files
- 🤖 **CV Parsing**: Automatic extraction of personal info, experience, education, and skills
- 📄 **Template Generation**: Fill Word templates with parsed CV data
- 📱 **Responsive UI**: Modern Material-UI interface
- 🔒 **Security**: Rate limiting, file validation, and secure file handling

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **pdf-parse** - PDF text extraction
- **mammoth** - Word document parsing
- **docxtemplater** - Word template filling

### Frontend
- **React** - UI framework
- **Material-UI** - Component library
- **React Dropzone** - File upload component
- **Axios** - HTTP client
- **React Query** - Data fetching

## Project Structure

```
cv-parser-app/
├── backend/
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── uploads/         # Temporary file storage
│   ├── templates/       # Word templates
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.js
│   └── package.json
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
- `POST /api/cv/upload` - Upload and parse CV file
- `POST /api/cv/generate-template` - Generate filled template
- `GET /api/cv/templates` - Get available templates
- `GET /api/cv/download/:filename` - Download generated file

### Health Check
- `GET /api/health` - API health status

## Usage

1. **Upload CV**: Drag and drop or select a CV file (PDF, DOC, DOCX)
2. **Review Data**: Check the parsed information for accuracy
3. **Generate Template**: Select a template and generate the filled document
4. **Download**: The filled template will be automatically downloaded

## Template Creation

To add custom templates:

1. Create Word documents (.docx) with placeholders like:
   - `{name}` - Candidate name
   - `{email}` - Email address
   - `{phone}` - Phone number
   - `{#experience}` - Loop through experience items
   - `{/experience}` - End experience loop

2. Place template files in the `backend/templates/` directory

## Environment Variables

Backend `.env` file:
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf,.doc,.docx
```

## Security Features

- File type validation
- File size limits (10MB)
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation

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

### Docker (Optional)
```dockerfile
# Add Docker configuration as needed
```

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

---

**Note**: This is a development setup. For production deployment, ensure proper security measures, database integration, and scaling considerations.