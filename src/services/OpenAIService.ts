
import axios, { AxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { USE_CASE_LIST_MODEL, USE_CASE_DETAIL_MODEL, FOLDER_NAME_MODEL, COMPANY_INFO_MODEL } from '@/context/constants';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_IMAGE_URL = 'https://api.openai.com/v1/images/generations';

class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(url: string, data: any, config: AxiosRequestConfig = {}) {
    try {
      const response = await axios.post(url, data, {
        ...config,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          ...config.headers,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('OpenAI API error:', error?.response?.data || error.message);
      if (error?.response?.data?.error?.message) {
        toast.error(`Erreur OpenAI: ${error.response.data.error.message.slice(0, 100)}...`);
      } else {
        toast.error(`Erreur de requête: ${error.message}`);
      }
      throw error;
    }
  }

  async generateUseCaseList(prompt: string, model?: string) {
    const selectedModel = model || localStorage.getItem(USE_CASE_LIST_MODEL) || 'gpt-4o-mini';
    console.log(`Generating use case list with model: ${selectedModel}`);
    
    const data = {
      model: selectedModel,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    };
    
    const response = await this.makeRequest(OPENAI_API_URL, data);
    return response.choices[0].message.content;
  }

  async generateUseCaseDetail(prompt: string, model?: string) {
    const selectedModel = model || localStorage.getItem(USE_CASE_DETAIL_MODEL) || 'gpt-4o-mini';
    console.log(`Generating use case detail with model: ${selectedModel}`);
    
    const data = {
      model: selectedModel,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    };
    
    const response = await this.makeRequest(OPENAI_API_URL, data);
    return response.choices[0].message.content;
  }

  async generateFolderName(prompt: string, model?: string) {
    const selectedModel = model || localStorage.getItem(FOLDER_NAME_MODEL) || 'gpt-4o-mini';
    console.log(`Generating folder name with model: ${selectedModel}`);
    
    const data = {
      model: selectedModel,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    };
    
    const response = await this.makeRequest(OPENAI_API_URL, data);
    return response.choices[0].message.content;
  }

  async generateCompanyInfo(prompt: string, model?: string) {
    const selectedModel = model || localStorage.getItem(COMPANY_INFO_MODEL) || 'gpt-4o';
    console.log(`Generating company info with model: ${selectedModel}`);
    
    const data = {
      model: selectedModel,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    };
    
    const response = await this.makeRequest(OPENAI_API_URL, data);
    return response.choices[0].message.content;
  }
}

export default OpenAIService;
