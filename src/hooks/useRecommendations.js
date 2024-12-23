import { useState, useEffect } from 'react';
import { useFirestore } from './useFirestore';
import { getAppRecommendations, getTimeBasedSuggestions } from '../services/gemini';

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [timeSuggestions, setTimeSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apps } = useFirestore();

  const getPreferredCategories = (apps) => {
    const categoryCount = apps.reduce((acc, app) => {
      acc[app.category] = (acc[app.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  };

  const getFrequentApps = (apps) => {
    // In a real app, you'd track usage frequency in Firestore
    // For now, we'll just return the first few apps
    return apps.slice(0, 5);
  };

  const fetchRecommendations = async () => {
    if (!apps.length) return;

    setLoading(true);
    try {
      const userContext = {
        currentTime: new Date().toLocaleTimeString(),
        frequentApps: getFrequentApps(apps),
        preferredCategories: getPreferredCategories(apps),
        currentTask: null // This could be set based on user input or calendar integration
      };

      const [recResult, timeResult] = await Promise.all([
        getAppRecommendations(userContext),
        getTimeBasedSuggestions(apps, new Date().toLocaleTimeString())
      ]);

      setRecommendations(recResult.recommendations);
      setTimeSuggestions(timeResult.suggestions);
      setError(null);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    
    // Refresh recommendations every hour
    const interval = setInterval(fetchRecommendations, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [apps]);

  return {
    recommendations,
    timeSuggestions,
    loading,
    error,
    refreshRecommendations: fetchRecommendations
  };
}
