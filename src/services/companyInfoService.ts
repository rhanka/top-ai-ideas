import { OpenAIService } from './OpenAIService';
import { Company } from '@/types';
import { COMPANY_INFO_PROMPT, DEFAULT_COMPANY_INFO_PROMPT, COMPANY_INFO_MODEL, DEFAULT_COMPANY_INFO_MODEL } from '@/context/constants';

export async function fetchCompanyInfo(companyName: string): Promise<Company | null> {
  try {
    // Get API key from localStorage
    const apiKey = localStorage.getItem('topai-openai-key');
    if (!apiKey) {
      throw new Error('API key not found');
    }

    // Get prompt from localStorage or use default
    const prompt = localStorage.getItem(COMPANY_INFO_PROMPT) || DEFAULT_COMPANY_INFO_PROMPT;
    
    // Get model from localStorage or use default
    const model = localStorage.getItem(COMPANY_INFO_MODEL) || DEFAULT_COMPANY_INFO_MODEL;

    // Initialize OpenAI service
    const openai = new OpenAIService(apiKey);

    // Replace placeholder in prompt
    const formattedPrompt = prompt.replace('{{company_name}}', companyName);

    // Call OpenAI API
    const response = await openai.callOpenAI(formattedPrompt, model);

    // Parse response as JSON
    let companyData: Company;
    try {
      companyData = JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse company info response:', error);
      throw new Error('Invalid response format from AI');
    }

    // Add company name if not included in response
    if (!companyData.name) {
      companyData.name = companyName;
    }

    return companyData;
  } catch (error) {
    console.error('Error fetching company info:', error);
    return null;
  }
}

// Create an alias for compatibility with existing code
export const fetchCompanyInfoByName = fetchCompanyInfo;
