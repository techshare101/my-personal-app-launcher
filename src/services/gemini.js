import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export async function getAppRecommendations(userContext) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `As an AI assistant, recommend apps or tools based on the following detailed user context:

    Time Context:
    - Current time: ${userContext.currentTime}
    - Current day: ${userContext.currentDay}
    - Time of day: ${userContext.timeOfDay}

    User Profile:
    - Name: ${userContext.userPreferences.displayName}
    - Language: ${userContext.userPreferences.language}
    - Theme preference: ${userContext.userPreferences.theme}
    - Work hours: ${userContext.userPreferences.workHours.start} to ${userContext.userPreferences.workHours.end}

    User Behavior:
    - Frequently used apps: ${userContext.frequentApps.map(app => app.name).join(', ')}
    - Preferred categories: ${userContext.preferredCategories.join(', ')}
    - Recent activity: ${userContext.recentActivity.map(app => 
      `${app.name} (${new Date(app.lastUsed).toLocaleString()})`
    ).join(', ')}

    Please provide personalized recommendations in the following JSON format:
    {
      "recommendations": [
        {
          "name": "App Name",
          "description": "Detailed explanation of why this app would be valuable for the user",
          "category": "Category",
          "url": "App URL",
          "priority": "high/medium/low",
          "features": ["key feature 1", "key feature 2"],
          "integrations": ["integration 1", "integration 2"],
          "relevance": {
            "score": 0-1,
            "factors": ["factor 1", "factor 2"]
          }
        }
      ],
      "reasoning": {
        "timeContext": "How time influenced these recommendations",
        "userContext": "How user preferences influenced these recommendations",
        "behaviorContext": "How user behavior influenced these recommendations"
      }
    }

    Focus on:
    1. Apps that complement existing tools
    2. Time-appropriate recommendations
    3. Category gaps in current app collection
    4. Integration possibilities with frequent apps
    5. Productivity enhancement potential`;

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
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

export async function getTimeBasedSuggestions(apps, userContext) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Given this detailed context:

    Time Context:
    - Current time: ${userContext.currentTime}
    - Current day: ${userContext.currentDay}
    - Time of day: ${userContext.timeOfDay}
    - Work hours: ${userContext.userPreferences.workHours.start} to ${userContext.userPreferences.workHours.end}

    Available Apps:
    ${JSON.stringify(apps, null, 2)}

    Recent Activity:
    ${userContext.recentActivity.map(app => 
      `- ${app.name} (${new Date(app.lastUsed).toLocaleString()})`
    ).join('\n')}

    Suggest which of the user's existing apps would be most relevant right now based on:
    1. Current time and day context
    2. User's work schedule
    3. Recent app usage patterns
    4. App categories and purposes
    5. Typical workflows and routines

    Please provide suggestions in the following JSON format:
    {
      "suggestions": [
        {
          "appId": "ID of the existing app",
          "relevanceScore": 0-1,
          "reason": "Detailed explanation of why this app is relevant now",
          "suggestedAction": "Specific action or workflow to consider",
          "contextFactors": ["factor 1", "factor 2"],
          "potentialWorkflow": {
            "steps": ["step 1", "step 2"],
            "expectedOutcome": "description"
          }
        }
      ],
      "timeContext": {
        "currentState": "Description of current time context",
        "nextTransition": "When recommendations will likely change",
        "schedulingFactors": ["factor 1", "factor 2"]
      }
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
