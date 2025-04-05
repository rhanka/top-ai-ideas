
import { toast } from "sonner";

export class BaseApiService {
  protected apiKey: string;
  protected toastId: string | number | undefined;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  protected async callOpenAI(
    model: string, 
    messages: Array<{ role: string; content: string }>,
    options: {
      temperature?: number;
      max_tokens?: number;
      responseFormat?: { type: string };
    } = {}
  ) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        ...(options.responseFormat && { response_format: options.responseFormat }),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(error.error?.message || "Failed to call OpenAI API");
    }

    return await response.json();
  }

  protected showToast(type: "loading" | "success" | "error", title: string, description?: string, duration?: number) {
    if (type === "loading") {
      this.toastId = toast.loading(title, {
        description: description,
        duration: duration || Infinity,
        id: this.toastId
      });
    } else if (type === "success") {
      toast.success(title, { 
        description: description,
        id: this.toastId,
        duration: duration || 3000
      });
    } else if (type === "error") {
      toast.error(title, { 
        description: description,
        id: this.toastId,
        duration: duration || 5000
      });
    }

    return this.toastId;
  }
}
