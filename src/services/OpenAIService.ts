
import axios from 'axios';

type OpenAIParams = {
  model: string;
  messages?: { role: string; content: string }[];
  input?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: { type: string }[];
  tool_choice?: string | object;
};

/**
 * Service for interacting with the OpenAI API
 */
export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Makes a request to the OpenAI API
   */
  async makeApiRequest(params: OpenAIParams) {
    try {
      // Determine which endpoint to use based on parameters
      let endpoint = 'https://api.openai.com/v1/chat/completions';
      let requestData: any = { ...params };
      
      // If input is provided directly instead of messages array, convert it
      if (!params.messages && params.input) {
        // For the completion endpoint with tools
        if (params.tools) {
          endpoint = 'https://api.openai.com/v1/chat/completions';
          requestData.messages = [{ role: "user", content: params.input }];
          delete requestData.input;
        } else {
          // For the legacy completions endpoint
          endpoint = 'https://api.openai.com/v1/completions';
          requestData.prompt = params.input;
          delete requestData.input;
        }
      }
      
      const response = await axios.post(
        endpoint,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (endpoint.includes('chat/completions')) {
        if (params.tools) {
          // Handle structured response with tools
          return {
            output: response.data.choices[0].message.tool_calls || 
                   response.data.choices[0].message.content || 
                   response.data.choices[0].message
          };
        } else {
          // Handle normal chat completion response
          return {
            text: response.data.choices[0].message.content
          };
        }
      } else {
        // Handle legacy completion response
        return {
          text: response.data.choices[0].text
        };
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
}
