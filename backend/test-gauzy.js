const axios = require('axios');

const testGauzyAPI = async () => {
  const testData = {
    candidateIdentification: "test-candidate-001",
    curriculum: {
      "$metadata": {
        "version": "1.0",
        "generatedAt": new Date().toISOString(),
        "source": "cv-parser-app",
        "cvReference": "AW-CV-001"
      },
      "personalInformation": {
        "name": "John Doe",
        "email": "john.doe@email.com",
        "phone": "+1234567890",
        "location": "New York, NY"
      },
      "professionalSummary": "Software Engineer with 5+ years of experience",
      "workExperience": [
        {
          "jobTitle": "Software Engineer",
          "company": "TechCorp",
          "period": "2020-Present",
          "responsibilities": ["Developed web applications", "Led development team"]
        }
      ],
      "education": [
        {
          "degree": "Bachelor's in Computer Science",
          "institution": "University of Technology",
          "period": "2014-2018"
        }
      ],
      "skills": ["JavaScript", "React", "Node.js"],
      "languages": ["English"],
      "certifications": [],
      "projects": []
    }
  };

  try {
    console.log('🧪 Testing Gauzy API...');
    console.log('📡 Request:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('https://gauzy.advanceworks.ai/Curriculum/generate', testData, {
      headers: {
        "Content-Type": "application/json"
      },
      responseType: 'stream',
      timeout: 30000
    });

    console.log('✅ Success! Response status:', response.status);
    console.log('📄 Response headers:', response.headers);
    
    // Save the response stream to a file
    const fs = require('fs');
    const path = require('path');
    const fileName = `test-curriculum-${Date.now()}.docx`;
    const filePath = path.join(__dirname, fileName);
    
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      console.log(`✅ Test document saved as: ${fileName}`);
    });

    writer.on('error', (error) => {
      console.error('❌ File write error:', error);
    });

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('- Status:', error.response?.status);
    console.error('- Status Text:', error.response?.statusText);
    console.error('- Headers:', error.response?.headers);
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        console.error('- Response:', error.response.data);
      } else if (error.response.data.pipe) {
        let responseText = '';
        error.response.data.on('data', chunk => responseText += chunk);
        error.response.data.on('end', () => {
          console.error('- Response:', responseText);
        });
      } else {
        console.error('- Response:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    console.error('- Full error:', error.message);
  }
};

testGauzyAPI();