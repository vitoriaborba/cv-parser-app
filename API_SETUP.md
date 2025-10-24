# API Integration Setup Guide

This guide explains how to configure the external API integrations for the CV Parser app.

## Required API Credentials

### 1. Noxus AI Workflow API
- **Workflow ID**: `6997bf25-f8bc-43df-ac6a-55d317398123`
- **API Token**: You need to obtain this from your Noxus AI account
- **Endpoint**: `https://app.noxus.ai/api/backend/v1/workflows/{workflow_id}/runs`

### 2. Gauzy Curriculum Generator API
- **Endpoint**: `https://gauzy.advanceworks.ai/Curriculum/generate`
- **Authentication**: Appears to be open (no API key required)

## Configuration Steps

### 1. Update Environment Variables
Edit the `backend/.env` file and replace the placeholder API token:

```env
# External API Keys
NOXUS_WORKFLOW_ID=6997bf25-f8bc-43df-ac6a-55d317398123
NOXUS_API_TOKEN=your_actual_api_token_here
```

### 2. How to Get Noxus API Token
1. Log in to your Noxus AI account at https://app.noxus.ai
2. Navigate to your API settings or developer section
3. Generate or copy your API token
4. Replace `your_actual_api_token_here` in the `.env` file

## API Flow

The application now follows this workflow:

1. **File Upload** → User uploads CV (PDF, DOC, DOCX)
2. **Text Extraction** → Basic text extraction for preview
3. **Noxus API Call** → Triggers workflow for CV processing
4. **Gauzy API Call** → Generates curriculum document with Noxus response
5. **Auto Download** → Generated curriculum is automatically downloaded

## API Request Details

### Noxus API Request
```javascript
POST https://app.noxus.ai/api/backend/v1/workflows/6997bf25-f8bc-43df-ac6a-55d317398123/runs
Headers: {
  "X-API-KEY": "your_api_token",
  "Content-Type": "application/json"
}
Body: {} // Empty body as specified
```

### Gauzy API Request
```javascript
POST https://gauzy.advanceworks.ai/Curriculum/generate
Headers: {
  "Content-Type": "application/json"
}
Body: {
  "candidateIdentification": "candidate_12345",
  "curriculum": "response_from_noxus_api"
}
```

## Error Handling

The application includes comprehensive error handling for:
- ❌ Invalid API tokens
- ❌ Network timeouts (30s for Noxus, 60s for Gauzy)
- ❌ API rate limits
- ❌ File download failures
- ❌ Invalid response formats

## Testing the Integration

1. **Test Noxus API** first:
   ```bash
   curl -X POST "https://app.noxus.ai/api/backend/v1/workflows/6997bf25-f8bc-43df-ac6a-55d317398123/runs" \
     -H "X-API-KEY: your_api_token" \
     -H "Content-Type: application/json" \
     -d "{}"
   ```

2. **Upload a test CV** through the web interface

3. **Check console logs** for API call status and responses

## Troubleshooting

### Common Issues:
- **401 Unauthorized**: Check your Noxus API token
- **Timeout errors**: APIs may be slow, increase timeout values if needed
- **File download fails**: Check Gauzy API response format
- **CORS errors**: APIs should support cross-origin requests

### Debug Mode:
Enable detailed logging by checking the browser console and backend logs for API request/response details.

## Security Notes

- ✅ API tokens stored in environment variables
- ✅ File cleanup after processing
- ✅ Input validation on uploads
- ✅ Request timeouts to prevent hanging
- ⚠️ Store sensitive credentials securely in production

---

**Need Help?**
- Check the backend console for detailed API logs
- Verify your API credentials are correct
- Test APIs independently before integration