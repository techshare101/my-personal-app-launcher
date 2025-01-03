import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error('Missing Gemini API key. Please add REACT_APP_GEMINI_API_KEY to your .env file.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function getAppRecommendations(userContext) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `As an AI assistant, recommend apps or tools based on the following context:
    - Current time: ${userContext.currentTime}
    - User's frequently used apps: ${userContext.frequentApps.map(app => app.name).join(', ')}
    - User's preferred categories: ${userContext.preferredCategories.join(', ')}
    - Current task type (if any): ${userContext.currentTask || 'Not specified'}

    Please provide recommendations in the following JSON format:
    {
      "recommendations": [
        {
          "name": "App Name",
          "description": "Brief description of why this app is recommended",
          "category": "Category",
          "url": "App URL",
          "priority": "high/medium/low"
        }
      ],
      "reasoning": "Brief explanation of the recommendation logic"
    }

    Focus on productivity tools and consider the time of day for context-aware suggestions.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Extract JSON from the response
      const jsonStr = text.substring(
        text.indexOf('{'),
        text.lastIndexOf('}') + 1
      );
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

export async function getTimeBasedSuggestions(apps, currentTime) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Given the current time (${currentTime}) and this list of apps:
    ${JSON.stringify(apps, null, 2)}

    Suggest which apps would be most relevant right now based on:
    1. Time of day
    2. Typical work/personal schedule
    3. App categories and purposes

    Please provide suggestions in the following JSON format:
    {
      "suggestions": [
        {
          "appId": "ID of the existing app",
          "relevanceScore": 0-1,
          "reason": "Brief explanation of why this app is relevant now"
        }
      ],
      "timeContext": "Brief explanation of how the current time influenced these suggestions"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonStr = text.substring(
        text.indexOf('{'),
        text.lastIndexOf('}') + 1
      );
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error getting time-based suggestions:', error);
    throw error;
  }
}
