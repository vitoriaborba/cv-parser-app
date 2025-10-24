const axios = require('axios');

class CVService {
  
  constructor() {
    this.GAUZY_ENDPOINT = "https://gauzy.advanceworks.ai/Curriculum/generate";
  }

  /**
   * Parse CV from uploaded file using structured JSON contract format
   * @param {Buffer} fileBuffer - File buffer from memory storage
   * @param {string} mimeType - MIME type of the file
   * @param {string} originalName - Original filename
   * @returns {Object} Parsed CV data in structured format
   */
  async parseCV(fileBuffer, mimeType, originalName) {
    try {
      console.log('🔄 File received, making API call with hardcoded data...');
      console.log('📁 File info:', { originalName, mimeType, bufferSize: fileBuffer.length });

      // Hardcoded curriculum data as requested
      const hardcodedCurriculumData = "{\"$metadata\":{\"personalInformation\":{\"fullName\":\"João Saraiva\",\"cvReference\":\"AW-FS-001\",\"description\":\"Friendly team member\\nSelf-challenged\\nClient focused\\nExtremely curious\"},\"occupationalInfo\":{\"jobTitleName\":\"Full-stack developer\",\"digitalSkills\":\"React (NextJS) | Vue (NuxtJS) | AstroJS | ThreeJS | Typescript | Angular & SAP Spartacus | Tailwind CSS | SCSS | Azure | Github | Docker | Jenkins | .NET C# | Springboot | NodeJS / AdonisJS | MongoDB | SQL | Jest | Storybook | AEM | Netlify | AWS | Postman/Insomnia | Grafana | iOS Swift | Google Analytics\",\"previousJobPositions\":[{\"employerName\":\"Diconium\",\"startDate\":\"2022\",\"endDate\":\"Present\",\"jobTitle\":\"Full-stack developer\",\"jobIndex\":0,\"responsabilitiesAndProjects\":[{\"project\":\"Automotive, data analytics, B2B/B2C e-commerce, medical care, 3D research, internal management projects\",\"responsability\":\"Contributed to several projects in the fields of automotive, data analytics, B2B/B2C e-commerce, medical care, 3D research and internal management.\",\"previousJobResponsibilitiesRemarks\":[[\"Developed server-side rendered pages\"],[\"Implemented best semantic and a11y practices (WCAG 2.1 AA)\"],[\"Managed Azure and Github CI/CD pipelines\"],[\"Successfully optimized Azure cloud costs by 30%\"],[\"Provided reliable on-call support and fixed issues in pre-prod/prod environments\"],[\"Managed cloud security and access, using RBAC, service principals, virtual networks and API management\"],[\"Rolled-out international markets and provided content authoring for stakeholders\"],[\"Utilized Containerized applications for development\"],[\"Led the creation of 3D web components\"],[\"Worked with SAFe and Kanban\"],[\"Assured code quality with unit, integration and E2E tests, using Jest, React Testing Library and Postman\"],[\"Monitored API performance with App Insights and Postman/Insomnia\"],[\"Wrote technical documentation and articles\"]],\"technologies\":\"Azure | Github | Jest | React Testing Library | Postman | App Insights | Insomnia\"}]},{\"employerName\":\"Capgemini Eng.\",\"startDate\":\"2019\",\"endDate\":\"2022\",\"jobTitle\":\"Full-stack developer\",\"jobIndex\":1,\"responsabilitiesAndProjects\":[{\"project\":\"Telecommunications, healthcare and internal management projects\",\"responsability\":\"Worked on projects within telecommunications, healthcare and internal management.\",\"previousJobResponsibilitiesRemarks\":[[\"Developed iOS mobile features with Swift\"],[\"Built performant backends using NodeJS/AdonisJS\"],[\"Restructured monolithic architectures using micro-frontends\"],[\"Assured code quality with unit testing, using Jest and XCTest\"],[\"Wrote detailed technical documentation\"]],\"technologies\":\"Swift | NodeJS | AdonisJS | Jest | XCTest\"}]},{\"employerName\":\"Freelance\",\"startDate\":\"\",\"endDate\":\"\",\"jobTitle\":\"Full-stack developer\",\"jobIndex\":2,\"responsabilitiesAndProjects\":[{\"project\":\"Medical care and financial audit applications\",\"responsability\":\"Worked on single page applications PWA in the field of medical care and financial audit.\",\"previousJobResponsibilitiesRemarks\":[[\"Designed the layouts using Figma and Canva, assuring great UX\"],[\"Deployed to Netlify and AWS Amplify\"],[\"Obtained excellent Lighthouse scores, namely performance, SEO and A11y\"],[\"Enabled mobile installation, offline work and push notifications\"]],\"technologies\":\"Figma | Canva | Netlify | AWS Amplify\"}]}]},\"education\":[{\"year\":\"2018\",\"universityName\":\"U.B.I.\",\"major\":\"Bachelor's degree in Computer Science\"},{\"year\":\"2021\",\"universityName\":\"U.B.I.\",\"major\":\"Master's degree in Computer Science (Machine Learning focused)\"},{\"year\":\"\",\"universityName\":\"\",\"major\":\"Azure Fundamentals\"},{\"year\":\"\",\"universityName\":\"\",\"major\":\"Contentstack Implementation Certification\"},{\"year\":\"\",\"universityName\":\"\",\"major\":\"ThreeJS journey\"}],\"motherTongue\":\"Portuguese\",\"languages\":[{\"language\":\"English\",\"understanding\":\"\",\"speaking\":\"\",\"writing\":\"\"},{\"language\":\"French\",\"understanding\":\"B2\",\"speaking\":\"B2\",\"writing\":\"B2\"},{\"language\":\"Spanish\",\"understanding\":\"\",\"speaking\":\"\",\"writing\":\"\"},{\"language\":\"German\",\"understanding\":\"A1\",\"speaking\":\"A1\",\"writing\":\"A1\"}]}}";

      
      // Direct API call with the exact format you specified
      console.log('📄 Making direct API call to Gauzy...');
      
      const requestBody = {
        candidateIdentification: "AW-FS-001",
        curriculum: hardcodedCurriculumData
      };

      console.log('📡 Sending request to:', this.GAUZY_ENDPOINT);
      
      const response = await axios.post(this.GAUZY_ENDPOINT, requestBody, {
        headers: {
          "Content-Type": "application/json"
        },
        responseType: 'arraybuffer', // To handle binary file data
        timeout: 60000
      });

      console.log('✅ API call successful!');
      console.log('📋 Response status:', response.status);
      
      // Generate filename for frontend
      const fileName = `curriculum_AW-FS-001_${Date.now()}.docx`;
      
      console.log('📄 File ready for download:', fileName);
      
      return {
        success: true,
        status: response.status,
        fileName: fileName,
        fileData: response.data, // Send the binary data to frontend
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        message: 'CV generated successfully - ready for download'
      };

    } catch (error) {
      console.error('❌ API call failed:', error);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', error.response.data);
      }
      throw error;
    }
  }



}

module.exports = new CVService();