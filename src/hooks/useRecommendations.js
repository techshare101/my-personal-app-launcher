import { useState, useEffect } from 'react';
import { useFirestore } from './useFirestore';
import { getAppRecommendations, getTimeBasedSuggestions } from '../services/gemini';
import { useAuth } from '../contexts/AuthContext';

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [timeSuggestions, setTimeSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apps } = useFirestore();
  const { currentUser } = useAuth();

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
    // Sort apps by usage count (if available) or last used timestamp
    return apps
      .sort((a, b) => {
        if (a.usageCount !== b.usageCount) {
          return (b.usageCount || 0) - (a.usageCount || 0);
        }
        return new Date(b.lastUsed || 0) - new Date(a.lastUsed || 0);
      })
      .slice(0, 5);
  };

  const getUserWorkSchedule = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Basic work schedule detection
    if (hour >= 9 && hour < 17) {
      return 'WORK';
    } else if (hour >= 17 && hour < 23) {
      return 'PERSONAL';
    } else {
      return 'OFF_HOURS';
    }
  };

  const fetchRecommendations = async () => {
    if (!apps.length || !currentUser) return;

    setLoading(true);
    try {
      const now = new Date();
      const userContext = {
        currentTime: now.toLocaleTimeString(),
        currentDay: now.toLocaleDateString('en-US', { weekday: 'long' }),
        timeOfDay: getUserWorkSchedule(),
        frequentApps: getFrequentApps(apps),
        preferredCategories: getPreferredCategories(apps),
        userPreferences: {
          email: currentUser.email,
          displayName: currentUser.displayName,
          // Add any user preferences from profile settings
          language: 'en',
          theme: 'dark',
          workHours: {
            start: '09:00',
            end: '17:00'
          }
        },
        recentActivity: apps
          .filter(app => app.lastUsed)
          .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
          .slice(0, 3)
          .map(app => ({
            name: app.name,
            category: app.category,
            lastUsed: app.lastUsed
          }))
      };

      const [recResult, timeResult] = await Promise.all([
        getAppRecommendations(userContext),
        getTimeBasedSuggestions(apps, userContext)
      ]);

      // Filter out apps that user already has
      const existingAppNames = new Set(apps.map(app => app.name.toLowerCase()));
      const filteredRecommendations = recResult.recommendations.filter(
        rec => !existingAppNames.has(rec.name.toLowerCase())
      );

      setRecommendations(filteredRecommendations);
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
    
    // Refresh recommendations every 30 minutes
    const interval = setInterval(fetchRecommendations, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [apps, currentUser]);

  return {
    recommendations,
    timeSuggestions,
    loading,
    error,
    refreshRecommendations: fetchRecommendations
  };
}
