import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { cacheService } from './cacheService';

class AnalyticsService {
  constructor() {
    this.usageCollection = 'appUsage';
    this.analyticsCollection = 'analytics';
  }

  async trackAppLaunch(userId, appId, appData) {
    try {
      const timestamp = new Date().toISOString();
      const usageData = {
        userId,
        appId,
        timestamp,
        category: appData.category,
        duration: 0, // Will be updated on app close
        sessionId: `${userId}-${timestamp}`,
      };

      // Store in Firestore
      const docRef = await addDoc(collection(db, this.usageCollection), usageData);

      // Cache locally
      await cacheService.cacheUsageData(usageData);

      return docRef.id;
    } catch (error) {
      console.error('Error tracking app launch:', error);
      throw error;
    }
  }

  async trackAppClose(userId, sessionId, duration) {
    try {
      const q = query(
        collection(db, this.usageCollection),
        where('sessionId', '==', sessionId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = doc(db, this.usageCollection, querySnapshot.docs[0].id);
        await updateDoc(docRef, { duration });
      }
    } catch (error) {
      console.error('Error tracking app close:', error);
      throw error;
    }
  }

  async getAppUsageStats(userId, timeframe = '7d') {
    try {
      const startDate = this.getStartDate(timeframe);
      const q = query(
        collection(db, this.usageCollection),
        where('userId', '==', userId),
        where('timestamp', '>=', startDate.toISOString())
      );

      const querySnapshot = await getDocs(q);
      const usageData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return this.analyzeUsageData(usageData);
    } catch (error) {
      console.error('Error getting usage stats:', error);
      throw error;
    }
  }

  async getRecommendations(userId, appId) {
    try {
      const usageStats = await this.getAppUsageStats(userId);
      const currentApp = usageStats.apps.find(app => app.id === appId);

      if (!currentApp) return [];

      // Get apps in the same category
      const q = query(
        collection(db, 'apps'),
        where('category', '==', currentApp.category),
        where('id', '!=', appId)
      );

      const querySnapshot = await getDocs(q);
      const similarApps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return this.generateRecommendations(currentApp, similarApps, usageStats);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  getStartDate(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case '24h':
        return new Date(now.setHours(now.getHours() - 24));
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      default:
        return new Date(now.setDate(now.getDate() - 7));
    }
  }

  analyzeUsageData(usageData) {
    const analysis = {
      totalTime: 0,
      apps: {},
      categories: {},
      peakHours: Array(24).fill(0),
      weekdayUsage: Array(7).fill(0),
      trends: []
    };

    usageData.forEach(usage => {
      const date = new Date(usage.timestamp);
      const appId = usage.appId;
      const duration = usage.duration || 0;

      // Per-app statistics
      if (!analysis.apps[appId]) {
        analysis.apps[appId] = {
          id: appId,
          totalTime: 0,
          sessions: 0,
          avgDuration: 0,
          category: usage.category
        };
      }
      analysis.apps[appId].totalTime += duration;
      analysis.apps[appId].sessions += 1;

      // Category statistics
      if (!analysis.categories[usage.category]) {
        analysis.categories[usage.category] = {
          totalTime: 0,
          sessions: 0
        };
      }
      analysis.categories[usage.category].totalTime += duration;
      analysis.categories[usage.category].sessions += 1;

      // Time patterns
      analysis.peakHours[date.getHours()]++;
      analysis.weekdayUsage[date.getDay()]++;
      analysis.totalTime += duration;
    });

    // Calculate averages and identify trends
    Object.values(analysis.apps).forEach(app => {
      app.avgDuration = app.totalTime / app.sessions;
    });

    return {
      ...analysis,
      apps: Object.values(analysis.apps),
      categories: Object.entries(analysis.categories).map(([name, stats]) => ({
        name,
        ...stats
      }))
    };
  }

  generateRecommendations(currentApp, similarApps, usageStats) {
    const recommendations = [];
    const avgTimePerSession = currentApp.totalTime / currentApp.sessions;

    // Find more efficient alternatives
    similarApps.forEach(app => {
      const appStats = usageStats.apps.find(stat => stat.id === app.id);
      if (appStats && appStats.avgDuration < avgTimePerSession) {
        recommendations.push({
          app,
          reason: `Users complete similar tasks ${Math.round((avgTimePerSession - appStats.avgDuration) / 60)} minutes faster with ${app.name}`,
          priority: 'high'
        });
      }
    });

    // Suggest apps with better ratings or more features
    similarApps.forEach(app => {
      if (app.rating > (currentApp.rating || 0)) {
        recommendations.push({
          app,
          reason: `Higher rated alternative with similar functionality`,
          priority: 'medium'
        });
      }
    });

    return recommendations;
  }
}

export const analyticsService = new AnalyticsService();
