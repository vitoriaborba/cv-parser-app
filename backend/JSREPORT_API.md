# JSReport CV Generation API Documentation

## 🚀 **Overview**

This API uses JSReport to generate CV documents from JSON data using a Word template with Handlebars syntax.

## 📋 **API Endpoints**

### **1. Generate CV (Base64)**

Returns the generated CV as a Base64-encoded string.

**Endpoint:** `POST /api/curriculum/generate`

**Request Body:**
```json
{
  "candidateIdentification": "string",
  "curriculum": "{...json_string...}"
}
```

**Response:**
```json
{
  "success": true,
  "base64": "UEsDBBQABgAIAAAAIQ...",
  "candidateIdentification": "AW-SD-0148"
}
```

### **2. Generate CV (File Download)**

Returns the generated CV as a downloadable .docx file.

**Endpoint:** `POST /api/curriculum/generate_file`

**Request Body:**
```json
{
  "candidateIdentification": "string",
  "curriculum": "{...json_string...}"
}
```

**Response:** Binary file download with headers:
- `Content-Type`: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `Content-Disposition`: `attachment; filename="CV_{candidateId}_{timestamp}.docx"`

## 📝 **Input Data Structure**

### **Main Structure:**
```typescript
{
  candidateIdentification: string,
  curriculum: string // JSON string with structure below
}
```

### **Curriculum JSON Structure:**
```json
{
  "$metadata": {
    "personalInformation": {
      "fullName": "João Pedro Silva Santos",
      "cvReference": "AW-SD-0148",
      "description": "Professional summary text..."
    },
    "occupationalInfo": {
      "jobTitleName": ".NET Architect",
      "digitalSkills": "C# | Python | Go | ...",
      "previousJobPositions": [
        {
          "employerName": "Company Name",
          "startDate": "Sep 2023",
          "endDate": "Present",
          "jobTitle": "Senior Engineer",
          "jobIndex": 0,
          "responsabilitiesAndProjects": [{
            "project": "Project Name",
            "responsability": "Main responsibility",
            "previousJobResponsibilitiesRemarks": [
              ["Detailed responsibility 1"],
              ["Detailed responsibility 2"]
            ],
            "technologies": "Tech stack used"
          }]
        }
      ]
    },
    "education": [
      {
        "year": "2016",
        "universityName": "University Name",
        "major": "Degree Name"
      }
    ],
    "languages": [
      {
        "language": "English",
        "understanding": "C1",
        "speaking": "C1",
        "writing": "C1"
      }
    ],
    "motherTongue": "Portuguese"
  },
  "$llmResult": {
    "bioText": "Generated biography...",
    "previousJobResponsibilitiesRemarks": [[["Details..."]]]
  },
  "skills": ["Skill 1", "Skill 2"],
  "certificatesAndLicenses": [
    {
      "addCertificate": {
        "file": {
          "currentFilename": "Certificate Name"
        }
      }
    }
  ]
}
```

## 🔧 **Handlebars Helpers**

The following custom helpers are available in your templates:

### **1. ifEq**
Compare two values for equality:
```handlebars
{{#ifEq status "active"}}
  Active user
{{/ifEq}}
```

### **2. ifNotEq**
Compare two values for inequality:
```handlebars
{{#ifNotEq endDate ""}}
  {end Date}}
{{/ifNotEq}}
```

### **3. ifEmptyOrWhitespace**
Check if a value is empty or whitespace:
```handlebars
{{#ifEmptyOrWhitespace description}}
  No description available
{{/ifEmptyOrWhitespace}}
```

### **4. formatFilename**
Format filename to title case:
```handlebars
{{formatFilename "certificate_name_here.pdf"}}
<!-- Output: Certificate Name Here -->
```

### **5. formatDateToMonthYear**
Format date to "Month Year":
```handlebars
{{formatDateToMonthYear "2023-09-15"}}
<!-- Output: September 2023 -->
```

### **6. textWithBreaks**
Convert line breaks to Word paragraph breaks:
```handlebars
{{textWithBreaks $metadata.personalInformation.description}}
```

## 🧪 **Testing the API**

### **Using cURL:**

**Generate Base64:**
```bash
curl -X POST http://localhost:5000/api/curriculum/generate \
  -H "Content-Type: application/json" \
  -d '{
    "candidateIdentification": "TEST-001",
    "curriculum": "{\"$metadata\":{\"personalInformation\":{\"fullName\":\"Test User\"}}}"
  }'
```

**Download File:**
```bash
curl -X POST http://localhost:5000/api/curriculum/generate_file \
  -H "Content-Type: application/json" \
  -d '{
    "candidateIdentification": "TEST-001",
    "curriculum": "{\"$metadata\":{\"personalInformation\":{\"fullName\":\"Test User\"}}}"
  }' \
  --output test_cv.docx
```

### **Using Postman:**

1. **Method:** POST
2. **URL:** `http://localhost:5000/api/curriculum/generate_file`
3. **Headers:** `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "candidateIdentification": "AW-SD-0148",
  "curriculum": "{\"$metadata\":{\"personalInformation\":{\"fullName\":\"João Pedro Silva Santos\",\"cvReference\":\"AW-SD-0148\",\"description\":\"Professional summary...\"},\"occupationalInfo\":{\"jobTitleName\":\".NET Architect\"}}}"
}
```

## 📁 **Template Location**

The Word template must be located at:
```
backend/templates/AW_cv_template.docx
```

## 🚨 **Error Handling**

### **Common Errors:**

**Template Not Found:**
```json
{
  "error": "Failed to generate CV",
  "details": "Template file not found: AW_cv_template.docx"
}
```

**Invalid JSON:**
```json
{
  "error": "Failed to generate CV",
  "details": "Invalid curriculum JSON format"
}
```

**Missing Fields:**
```json
{
  "error": "Missing required fields: candidateIdentification and curriculum"
}
```

## 🔍 **Debugging**

Check server logs for detailed information:
- `🏗️ Generating CV with JSReport...` - Generation started
- `📋 Candidate ID: ...` - Candidate identifier
- `📄 Data keys: ...` - Top-level keys in curriculum data
- `✅ CV generated successfully` - Success message
- `❌ CV generation error:` - Error details

## 📦 **Dependencies**

```json
{
  "jsreport-core": "latest",
  "jsreport-handlebars": "latest",
  "jsreport-docx": "latest"
}
```

## 🎯 **Key Features**

- ✅ Handlebars templating with custom helpers
- ✅ Word document generation from .docx templates
- ✅ Base64 output or direct file download
- ✅ Complex nested data structure support
- ✅ Custom filename with timestamp
- ✅ Comprehensive error handling