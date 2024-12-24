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
    try {
      // Get the API key from environment variables
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      console.log('API Key status:', apiKey ? 'Found' : 'Not found');
      
      if (!apiKey) {
        throw new Error('Gemini API key not found in environment variables');
      }

      // Initialize Gemini with your API key
      this.genAI = new GoogleGenerativeAI(apiKey);
      console.log('Initialized GenAI');
      
      // Initialize the model
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      console.log('Model initialized');
      
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
      console.log('Chat initialized successfully');
    } catch (error) {
      console.error('Error initializing chat service:', error);
      this.genAI = null;
      this.model = null;
      this.chat = null;
    }
  }

  async sendMessage(message) {
    try {
      if (!this.chat) {
        console.log('Chat not initialized, attempting to initialize...');
        this.initialize();
        
        if (!this.chat) {
          throw new Error('Chat service is not initialized. Please make sure your REACT_APP_GEMINI_API_KEY is set in the .env file.');
        }
      }

      if (!message || typeof message !== 'string') {
        throw new Error('Invalid message format');
      }

      console.log('Sending message:', message);
      
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
      console.log('Sending prompt to Gemini...');
      const result = await this.chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Received response from Gemini');

      // Store assistant response in context
      this.context.push({ role: 'assistant', content: text });

      return text;
    } catch (error) {
      console.error('Error in chat service:', error);
      return "I apologize, but I'm having trouble connecting to the AI service at the moment. Please check the console for more details and try again later.";
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
