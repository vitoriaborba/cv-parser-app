const fs = require('fs').promises;
const path = require('path');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');

class TemplateService {

  /**
   * Fill a Word template with CV data
   * @param {string} templateName - Name of the template file
   * @param {Object} cvData - Parsed CV data
   * @returns {string} Path to filled template
   */
  async fillTemplate(templateName, cvData) {
    try {
      const templatePath = path.join(__dirname, '../templates', templateName);
      const outputPath = path.join(__dirname, '../uploads', `filled-${Date.now()}-${templateName}`);

      // Check if template exists
      await fs.access(templatePath);

      // Read template file
      const content = await fs.readFile(templatePath, 'binary');

      // Create a new docx template
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Prepare data for template
      const templateData = this.prepareTemplateData(cvData);

      // Render the document
      doc.render(templateData);

      // Generate the output
      const buf = doc.getZip().generate({ type: 'nodebuffer' });

      // Write to output file
      await fs.writeFile(outputPath, buf);

      console.log(`📄 Template filled successfully: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('Error filling template:', error);
      throw new Error(`Error filling template: ${error.message}`);
    }
  }

  /**
   * Prepare CV data for template filling
   * @param {Object} cvData - Raw CV data
   * @returns {Object} Template-ready data
   */
  prepareTemplateData(cvData) {
    const data = {
      // Personal Information
      name: cvData.personalInfo?.name || '[Name]',
      email: cvData.personalInfo?.email || '[Email]',
      phone: cvData.personalInfo?.phone || '[Phone]',
      address: cvData.personalInfo?.address || '[Address]',

      // Experience
      hasExperience: cvData.experience && cvData.experience.length > 0,
      experience: cvData.experience || [],

      // Education  
      hasEducation: cvData.education && cvData.education.length > 0,
      education: cvData.education || [],

      // Skills
      hasSkills: cvData.skills && cvData.skills.length > 0,
      skills: cvData.skills || [],
      skillsList: cvData.skills ? cvData.skills.join(', ') : '[Skills]',

      // Additional fields
      summary: this.generateSummary(cvData),
      currentDate: new Date().toLocaleDateString()
    };

    return data;
  }

  /**
   * Generate a summary from CV data
   * @param {Object} cvData - CV data
   * @returns {string} Generated summary
   */
  generateSummary(cvData) {
    const parts = [];
    
    if (cvData.experience && cvData.experience.length > 0) {
      parts.push(`${cvData.experience.length} years of professional experience`);
    }
    
    if (cvData.education && cvData.education.length > 0) {
      parts.push(`${cvData.education.length} educational qualification(s)`);
    }
    
    if (cvData.skills && cvData.skills.length > 0) {
      parts.push(`skilled in ${cvData.skills.slice(0, 3).join(', ')}`);
    }

    return parts.length > 0 ? parts.join(', ') : 'Professional with diverse background';
  }

  /**
   * Get list of available templates
   * @returns {Array} Array of available template files
   */
  async getAvailableTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates');
      
      // Create templates directory if it doesn't exist
      try {
        await fs.access(templatesDir);
      } catch {
        await fs.mkdir(templatesDir, { recursive: true });
      }

      const files = await fs.readdir(templatesDir);
      const templates = files
        .filter(file => file.endsWith('.docx'))
        .map(file => ({
          name: file,
          displayName: file.replace('.docx', '').replace(/[-_]/g, ' '),
          path: `/templates/${file}`
        }));

      return templates;

    } catch (error) {
      console.error('Error getting templates:', error);
      throw new Error(`Error getting templates: ${error.message}`);
    }
  }

  /**
   * Create a sample template if none exist
   */
  async createSampleTemplate() {
    try {
      const templatePath = path.join(__dirname, '../templates/sample-cv-template.docx');
      
      // Check if template already exists
      try {
        await fs.access(templatePath);
        return; // Template already exists
      } catch {
        // Template doesn't exist, create a basic one
        console.log('📄 Creating sample template...');
        
        // This is a basic template - in a real app, you'd have actual Word templates
        const sampleContent = `
CV Template

Name: {name}
Email: {email}
Phone: {phone}
Address: {address}

SUMMARY
{summary}

EXPERIENCE
{#hasExperience}
{#experience}
- {title} at {company} ({period})
{/experience}
{/hasExperience}
{^hasExperience}
No experience data available.
{/hasExperience}

EDUCATION
{#hasEducation}
{#education}
- {degree} from {institution} ({year})
{/education}
{/hasEducation}
{^hasEducation}
No education data available.
{/hasEducation}

SKILLS
{skillsList}

Generated on: {currentDate}
        `;
        
        // Note: This creates a text file. In production, you'd want actual .docx templates
        await fs.writeFile(templatePath.replace('.docx', '.txt'), sampleContent);
        console.log('📄 Sample template created (as text file for demo)');
      }

    } catch (error) {
      console.error('Error creating sample template:', error);
    }
  }
}

module.exports = new TemplateService();