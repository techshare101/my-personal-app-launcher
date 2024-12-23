import { GoogleGenerativeAI } from '@google/generative-ai';

class ChatService {
  constructor() {
    this.context = [];
    this.genAI = null;
    this.model = null;
    this.chat = null;
    this.initialize();
  }

  initialize() {
    // Get the API key from environment variables
    const apiKey = process.env.REACT_APP_GEMINI_KEY || 
                  process.env.REACT_APP_GEMINI_API_KEY || 
                  process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      return;
    }

    // Initialize Gemini with your API key
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // For most chat applications, we recommend using the chat-bison-001 model
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Start a new chat
    this.chat = this.model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });
  }

  async sendMessage(message) {
    try {
      if (!this.chat) {
        this.initialize();
      }

      // Store user message in context
      this.context.push({ role: 'user', content: message });

      // Prepare the chat prompt with app-specific context
      const prompt = `As an AI assistant for SmartLaunch Pro, a personal app launcher and productivity tool, help the user with their request. The available features include app management, workflow automation, and productivity tracking.

User's message: ${message}

Please provide a helpful response while considering:
1. App recommendations based on user needs
2. Workflow automation suggestions
3. Productivity tips and insights
4. Integration possibilities with other tools
5. Best practices for app organization

Response:`;

      // Get the response from Gemini
      const result = await this.chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      // Store assistant response in context
      this.context.push({ role: 'assistant', content: text });

      return text;
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      return "I apologize, but I'm having trouble connecting to the AI service at the moment. Please try again later.";
    }
  }

  clearContext() {
    this.context = [];
    this.initialize(); // Start a new chat session
  }

  // Helper method to format the chat history for Gemini
  formatHistory() {
    return this.context.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));
  }
}

export const chatService = new ChatService();
