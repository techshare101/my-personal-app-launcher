import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
console.log('Environment variables:', process.env);
console.log('API Key loaded:', API_KEY ? 'Yes (length: ' + API_KEY.length + ')' : 'No');

let genAI = null;
let model = null;
let chatHistory = [];
let initError = null;

try {
  if (!API_KEY) {
    initError = 'Missing Gemini API key. Please add REACT_APP_GEMINI_API_KEY to your .env file.';
    console.error(initError);
  } else {
    console.log('Initializing Gemini with API key...');
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log('Gemini model initialized successfully');
  }
} catch (error) {
  initError = `Error initializing Gemini: ${error.message}`;
  console.error(initError, error);
}

// Helper function to format system context
const formatSystemContext = (context) => {
  const systemPrompt = `
System Prompt for Personal App Launcher Assistant

You are an AI assistant integrated into a personal app launcher application, dedicated to helping users efficiently manage their applications and workflows.

Available Resources:
- Apps: ${context?.apps?.map(app => app.name).join(', ') || 'None'}
- Workflows: ${context?.workflows?.map(w => w.name).join(', ') || 'None'}

Your Core Responsibilities:
1. Assist with Applications: Launch, manage, and provide guidance on the apps available in the dashboard.
2. Facilitate Workflows: Suggest and execute workflows tailored to the user's needs.
3. Offer Recommendations: Identify and recommend apps or workflows needed to accomplish specific tasks or goals.
4. Answer Inquiries: Provide clear, accurate answers about system features, app usage, and workflow capabilities.

Behavioral Guidelines:
- Context-Aware Recommendations: Use the user's input to suggest relevant apps or workflows from the available resources.
- Workflow Guidance: When the user describes a goal, guide them to a specific workflow or help them create a new one using available apps.
- Concise Communication: Keep responses brief, yet informative, to maximize clarity and efficiency.
- Conversational Approach: Use natural and friendly language to maintain a user-focused experience.
- Transparency: Clearly state the actions you are about to take (e.g., launching an app, suggesting a workflow).

Operational Focus:
- Assist with Local Computing: Ensure that suggestions and actions pertain to the user's desktop environment.
- Dynamic Suggestions: Adapt recommendations based on the apps and workflows already available, or suggest downloading new ones when appropriate.

Example Use Cases:
1. User wants to edit a document:
   Response: "You can use the 'DocEdit Pro' app from your dashboard. Would you like me to open it for you?"

2. User needs help with project management:
   Response: "For project management, you can use the 'TaskMaster' workflow. If you prefer, I can create a new workflow using apps like 'PlanAhead' and 'TimeTracker.' Would you like me to set it up?"

3. User asks how to organize files:
   Response: "The 'FileOrganizer' app is great for this. I can launch it now, or guide you through creating a file organization workflow. What works best for you?"

Remember: Focus on providing practical, actionable assistance while maintaining a helpful and efficient conversation.`;
  return systemPrompt.trim();
};

export const generateResponse = async (prompt, context, onStream) => {
  try {
    if (!model) {
      throw new Error(initError || 'Gemini model not initialized. Check your API key configuration.');
    }

    // Format chat history for Gemini API
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'system' ? 'user' : msg.role, // Gemini only accepts 'user' or 'model' roles
      parts: msg.parts
    }));

    // Start a new chat for each response to ensure fresh context
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    // Add system context if this is a new conversation
    if (chatHistory.length === 0) {
      const systemContext = formatSystemContext(context) + `\n\nCommand Response Guidelines:
- When suggesting a command to execute, wrap it in a code block with the 'command' tag
- Example: \`\`\`command\nopen Chrome\n\`\`\`
- Use markdown formatting for better readability
- Format app names and commands in inline code blocks
- When suggesting multiple commands, list them one at a time and wait for user confirmation

Example Response:
I'll help you open Chrome. Here's the command:
\`\`\`command
open Chrome
\`\`\`

Would you like me to execute this command for you?

Additional Guidelines:
- Format your responses in markdown for better readability
- Use code blocks with appropriate language tags for code examples
- Use bullet points and numbered lists where appropriate
- Use bold and italic text for emphasis
- Format app names and commands in inline code blocks`;
      
      await chat.sendMessage(systemContext);
      chatHistory.push({ role: 'user', parts: [{ text: systemContext }] }); // Store as 'user' role
    }

    // Add user message to history
    chatHistory.push({ role: 'user', parts: [{ text: prompt }] });

    // Generate streaming response
    const result = await chat.sendMessageStream(prompt);
    let fullResponse = '';

    try {
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        
        // Call the streaming callback if provided
        if (onStream && typeof onStream === 'function') {
          onStream(chunkText);
        }
      }
    } catch (streamError) {
      console.error('Error in stream:', streamError);
      throw streamError;
    }

    // Add assistant response to history
    chatHistory.push({ role: 'model', parts: [{ text: fullResponse }] }); // Use 'model' instead of 'assistant'
    
    // Keep only the last 10 messages to prevent context from getting too large
    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(-10);
    }

    return fullResponse;
  } catch (error) {
    console.error('Error generating response:', error);
    if (error.message?.includes('API key')) {
      throw new Error('The chatbot is currently unavailable due to an API configuration issue. Please try again later.');
    }
    throw new Error(`I encountered an error: ${error.message}. Please try rephrasing your question.`);
  }
};

export const generateAppSuggestions = async (userInput, apps) => {
  try {
    if (!model) {
      throw new Error(initError || 'Gemini model not initialized');
    }

    if (!apps || apps.length === 0) {
      return [];
    }

    const chat = model.startChat({
      generationConfig: {
        temperature: 0.3, // Lower temperature for more focused suggestions
        topP: 0.8,
        topK: 40,
      },
    });

    const prompt = `
User Input: "${userInput}"
Available Apps: ${apps.map(app => app.name).join(', ')}

Task: Suggest up to 3 most relevant apps based on the user input.
Consider:
1. Exact or partial name matches
2. Apps commonly used for the described task
3. Topic or category relevance

Format: Return ONLY a comma-separated list of app names from the available apps.
If no matches found, return "No matching apps found."
`;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const suggestions = response.text()
      .split(',')
      .map(app => app.trim())
      .filter(app => apps.some(a => a.name.toLowerCase() === app.toLowerCase()));

    return suggestions;
  } catch (error) {
    console.error('Error in generateAppSuggestions:', error);
    return [];
  }
};

export const generateWorkflowSuggestions = async (userInput, workflows) => {
  try {
    if (!model) {
      throw new Error(initError || 'Gemini model not initialized');
    }

    if (!workflows || workflows.length === 0) {
      return null;
    }

    const chat = model.startChat({
      generationConfig: {
        temperature: 0.3, // Lower temperature for more focused suggestions
        topP: 0.8,
        topK: 40,
      },
    });

    const prompt = `
User Input: "${userInput}"
Available Workflows: ${workflows.map(w => w.name).join(', ')}

Task: Suggest the single most relevant workflow based on the user input.
Consider:
1. Exact or partial name matches
2. Workflows commonly used for the described task
3. Topic or category relevance

Format: Return ONLY a single workflow name from the available workflows.
If no match found, return "No matching workflow found."
`;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const suggestion = response.text().trim();
    
    return workflows.some(w => w.name.toLowerCase() === suggestion.toLowerCase())
      ? suggestion
      : null;
  } catch (error) {
    console.error('Error in generateWorkflowSuggestions:', error);
    return null;
  }
};
