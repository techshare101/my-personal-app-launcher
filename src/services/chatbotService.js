import axios from 'axios';
import { analyticsService } from './analyticsService';

// For testing without API key
const MOCK_RECOMMENDATIONS = {
  recommendations: [
    {
      app_name: "Microsoft Office",
      description: "Complete suite of productivity tools for documents, spreadsheets, and presentations."
    },
    {
      app_name: "Slack",
      description: "Team communication and collaboration platform."
    },
    {
      app_name: "Trello",
      description: "Visual project management with boards and cards."
    }
  ]
};

const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are an AI assistant for SmartLaunch Pro that recommends apps based on user needs.
Provide recommendations in this exact JSON format:
{
    "recommendations": [
        {
            "app_name": "App Name",
            "description": "Brief description under 100 characters"
        }
    ]
}

Rules:
1. Always return exactly 3 apps
2. Keep descriptions concise and clear
3. Focus on the most relevant apps for the task
4. Return ONLY the JSON, no other text`;

export const chatbotService = {
  async getAppRecommendations(query, isFirstQuery = false) {
    try {
      console.log("ChatbotService: Getting recommendations for query:", query);
      
      // Check if we have an API key
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!apiKey) {
        console.log("No API key found, using mock data");
        return MOCK_RECOMMENDATIONS;
      }

      const response = await axios.post(
        OPENAI_API_ENDPOINT,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: `Based on this request: "${query}", recommend exactly 3 apps that would be most helpful. Remember to return only the JSON object.`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("ChatbotService: Raw response:", response.data);

      const content = response.data.choices[0].message.content;
      console.log("ChatbotService: Content:", content);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }
      
      const recommendations = JSON.parse(jsonMatch[0]);
      console.log("ChatbotService: Parsed recommendations:", recommendations);
      
      analyticsService.trackEvent('app_recommendations_generated', {
        query,
        isFirstQuery,
        numResults: recommendations.recommendations.length
      });

      return {
        isFirstQuery,
        ...recommendations
      };
    } catch (error) {
      console.error('ChatbotService Error:', error);
      // If API fails, return mock data
      console.log("Falling back to mock data");
      return MOCK_RECOMMENDATIONS;
    }
  }
};
