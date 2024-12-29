import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
console.log('Environment variables:', process.env);
console.log('Initializing Gemini with API key:', API_KEY ? 'Present' : 'Missing');

let genAI = null;
let model = null;

try {
  if (!API_KEY) {
    console.error('Missing Gemini API key. Please add REACT_APP_GEMINI_API_KEY to your .env file.');
  } else {
    genAI = new GoogleGenerativeAI(API_KEY);
    // Get the generative model
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log('Gemini model initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Gemini:', error);
}

export const generateResponse = async (prompt, context) => {
  try {
    if (!model) {
      throw new Error('Gemini model not initialized. Check your API key configuration.');
    }

    console.log('Generating response for prompt:', prompt);
    
    // Create a chat session
    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });

    // Generate a response
    console.log('Sending message to chat...');
    const result = await chat.sendMessage(prompt);
    console.log('Received result:', result);
    const response = await result.response;
    const text = response.text();
    console.log('Final response:', text);
    return text;
  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
};

export const generateAppSuggestions = async (userInput, apps) => {
  try {
    if (!model) {
      throw new Error('Gemini model not initialized. Check your API key configuration.');
    }

    if (!apps || apps.length === 0) {
      console.log('No apps available');
      return [];
    }

    console.log('Generating app suggestions for input:', userInput);
    console.log('Available apps:', apps);
    
    const prompt = `Based on the user input "${userInput}" and the available apps: ${apps.map(app => app.name).join(', ')}, 
    suggest up to 3 most relevant apps that the user might want to open. Consider the following:
    1. App names that partially match the input
    2. Apps that are commonly used for the task described
    3. Apps that are related to the topic or category mentioned
    
    Format your response as a simple comma-separated list of app names, only including apps from the provided list.
    If no relevant apps are found, respond with "No matching apps found."`;

    console.log('Sending prompt to Gemini:', prompt);
    const result = await model.generateContent(prompt);
    console.log('Received result:', result);
    const response = await result.response;
    const suggestions = response.text().split(',').map(app => app.trim()).filter(app => apps.some(a => a.name.toLowerCase() === app.toLowerCase()));
    console.log('Filtered suggestions:', suggestions);
    return suggestions;
  } catch (error) {
    console.error('Error in generateAppSuggestions:', error);
    throw new Error(`Failed to generate app suggestions: ${error.message}`);
  }
};

export const generateWorkflowSuggestions = async (userInput, workflows) => {
  try {
    if (!model) {
      throw new Error('Gemini model not initialized. Check your API key configuration.');
    }

    if (!workflows || workflows.length === 0) {
      console.log('No workflows available');
      return null;
    }

    console.log('Generating workflow suggestions for input:', userInput);
    console.log('Available workflows:', workflows);
    
    const prompt = `Based on the user input "${userInput}" and the available workflows: ${workflows.map(w => w.name).join(', ')}, 
    suggest the most relevant workflow that the user might want to start. Consider the following:
    1. Workflow names that partially match the input
    2. Workflows that are commonly used for the task described
    3. Workflows that are related to the topic or category mentioned
    
    Format your response as a single workflow name from the provided list.
    If no relevant workflow is found, respond with "No matching workflow found."`;

    console.log('Sending prompt to Gemini:', prompt);
    const result = await model.generateContent(prompt);
    console.log('Received result:', result);
    const response = await result.response;
    const suggestion = response.text().trim();
    console.log('Raw suggestion:', suggestion);
    const validSuggestion = workflows.some(w => w.name.toLowerCase() === suggestion.toLowerCase()) ? suggestion : null;
    console.log('Valid suggestion:', validSuggestion);
    return validSuggestion;
  } catch (error) {
    console.error('Error in generateWorkflowSuggestions:', error);
    throw new Error(`Failed to generate workflow suggestions: ${error.message}`);
  }
};
