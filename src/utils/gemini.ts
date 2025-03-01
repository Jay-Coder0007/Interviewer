import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your actual API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

// Use the correct model name
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const parseResumeWithGemini = async (text: string): Promise<ResumeData> => {
  try {
    const prompt = `
      You are a professional resume parser. Your task is to extract information from the resume text and create a structured JSON object.
      This is critical: You must extract the candidate's full name. Look for name patterns at the top of the resume or in headers.
      If you can't find a clear name, look for email addresses that might contain the name.

      Instructions:
      1. The fullName field is mandatory - make your best effort to extract it
      2. Look for patterns like:
         - Name at the top of resume
         - "Name:" or similar headers
         - Professional headers with name
         - Email addresses that might contain name
      3. For other fields, provide meaningful defaults if not found
      4. Never return null or empty values
      5 strictly follow this rule

      Format the response as this exact JSON structure:
      {
        "fullName": "user name here",
        "email": "email or 'Email not provided'",
        "phone": "phone or 'Phone not provided'",
        "skills": ["At least one skill or 'General skills'"],
        "experience": [
          {
            "company": "company name or 'Not specified'",
            "position": "job title or 'Role not specified'",
            "duration": "time period or 'Duration not specified'",
            "responsibilities": ["At least one responsibility or 'General responsibilities'"]
          }
        ],
        "projects": [
          {
            "name": "project name or 'Project not specified'",
            "description": "description or 'No description available'",
            "technologies": ["At least one technology or 'General technologies'"]
          }
        ],
        "education": [
          {
            "degree": "degree or 'Education details not specified'",
            "institution": "school or 'Institution not specified'",
            "year": "year or 'Year not specified'"
          }
        ]
      }

      Resume text to analyze:
      ${text}

      Important: Make your best effort to extract the actual name. If you absolutely cannot find a name, explain why in the fullName field.
    `;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    
    // Clean up the response
    const jsonString = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*/g, '')
      .replace(/[^}]*$/g, '')
      .trim();

    const parsedData = JSON.parse(jsonString) as ResumeData;

    // Better name validation
    if (!parsedData.fullName) {
      throw new Error('Could not find name in resume. Please ensure your name is clearly mentioned at the top of your resume.');
    }

    // Check if the name field contains an error message
    if (parsedData.fullName.toLowerCase().includes('not') || 
        parsedData.fullName.toLowerCase().includes('missing') ||
        parsedData.fullName.toLowerCase().includes('cannot')) {
      throw new Error(`Failed to extract name: ${parsedData.fullName}. Please ensure your name is clearly mentioned in your resume.`);
    }

    // Ensure all required fields exist with default values if needed
    const validatedData: ResumeData = {
      fullName: parsedData.fullName.trim(),
      email: parsedData.email?.trim() || "Email not provided",
      phone: parsedData.phone?.trim() || "Phone not provided",
      skills: parsedData.skills?.length ? 
        parsedData.skills.map(s => s.trim()) : 
        ["Skills not specified"],
      experience: parsedData.experience?.length ? parsedData.experience : [{
        company: "Experience not provided",
        position: "Position not specified",
        duration: "Duration not specified",
        responsibilities: ["Responsibilities not provided"]
      }],
      projects: parsedData.projects?.length ? parsedData.projects : [{
        name: "Projects not provided",
        description: "No project details available",
        technologies: ["Technologies not specified"]
      }],
      education: parsedData.education?.length ? parsedData.education : [{
        degree: "Education not provided",
        institution: "Institution not specified",
        year: "Year not specified"
      }]
    };

    // Final validation of the name
    const nameWords = validatedData.fullName.split(' ').filter(word => word.length > 0);
    if (nameWords.length < 2) {
      throw new Error('Please provide both first and last name in your resume.');
    }

    return validatedData;
  } catch (error) {
    console.error('Error parsing resume:', error);
    if (error instanceof Error) {
      throw error; // Preserve the specific error message
    }
    throw new Error('Failed to parse resume data. Please ensure your resume contains your full name and basic information.');
  }
};

// Type definition for the resume data
export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    responsibilities: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

export const generateInterviewQuestions = async (resumeData: any, jobRole: string) => {
  try {
    const prompt = `
      As an expert interviewer, generate 5 technical interview questions based on the following resume data and job role.
      The questions should be relevant to the candidate's experience, skills, and the job role they're applying for.
      
      Job Role: ${jobRole}
      
      Resume Data:
      ${JSON.stringify(resumeData, null, 2)}
      
      Generate questions in the following JSON format:
      {
        "questions": [
          {
            "id": 1,
            "question": "detailed question here",
            "category": "one of: Technical Skills, Experience, Project Discussion, Problem Solving, Role Specific",
            "difficulty": "one of: Easy, Medium, Hard"
          }
        ]
      }
      
      Requirements:
      1. Generate exactly 5 questions
      2. Questions should be mix of technical and role-specific
      3. Include questions about their past projects and experience
      4. Vary the difficulty levels (2 Easy, 2 Medium, 1 Hard)
      5. Make questions specific to their skills and background
      6. Include at least one problem-solving question
      
      Return only the JSON object without any additional text or formatting.
    `;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    
    // Clean up the response
    const jsonString = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*/g, '')
      .replace(/[^}]*$/g, '')
      .trim();

    const parsed = JSON.parse(jsonString);
    return parsed.questions;
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw new Error('Failed to generate interview questions');
  }
};

export const generateInterviewReport = async (
  questions: any[],
  answers: Record<number, string>,
  jobRole: string,
  resumeData: any
) => {
  try {
    const prompt = `
      As an expert interviewer and ${jobRole} position evaluator, analyze these interview responses and generate a detailed report.
      
      Job Role: ${jobRole}
      
      Candidate Resume:
      ${JSON.stringify(resumeData, null, 2)}
      
      Interview Questions and Answers:
      ${questions.map(q => `
        Question ${q.id} (${q.category} - ${q.difficulty}):
        Q: ${q.question}
        A: ${answers[q.id]}
      `).join('\n')}
      
      Generate a detailed analysis in the following JSON format:
      {
        "score": number (0-100),
        "recommendation": "Clear hiring recommendation with brief explanation",
        "strengths": ["Array of key strengths demonstrated"],
        "areasToImprove": ["Array of areas needing improvement"],
        "technicalAssessment": "Detailed evaluation of technical skills",
        "communicationSkills": "Assessment of communication ability",
        "overallFeedback": "Comprehensive feedback about the candidate",
        "shouldHire": boolean
      }
      
      Consider:
      1. Technical knowledge demonstrated
      2. Relevance of answers to the questions
      3. Communication clarity
      4. Experience alignment with role
      5. Problem-solving ability
      
      Return only the JSON object without any additional text or formatting.
    `;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    
    // Clean up the response
    const jsonString = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*/g, '')
      .replace(/[^}]*$/g, '')
      .trim();

    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating interview report:', error);
    throw new Error('Failed to generate interview report');
  }
}; 