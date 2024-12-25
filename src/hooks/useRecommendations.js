import { useState, useEffect } from 'react';
import { useFirestore } from './useFirestore';

const APP_CATEGORIES = {
  utility: {
    keywords: ['utility', 'tool', 'system', 'monitor', 'clean', 'optimize', 'backup', 'security'],
    fallback: 'Here are some utility tools to enhance your system performance.',
    sampleApps: [
      {
        name: 'System Optimizer Pro',
        description: 'Comprehensive system optimization and cleanup tool',
        features: [
          'System cleanup',
          'Performance optimization',
          'Startup management',
          'Disk analyzer'
        ],
        priority: 'high',
        integrations: ['Windows Task Scheduler', 'System Tray', 'File Explorer']
      },
      {
        name: 'BackupMaster',
        description: 'Automated backup and data protection solution',
        features: [
          'Automated backups',
          'Cloud integration',
          'File versioning',
          'Encryption'
        ],
        priority: 'high',
        integrations: ['Google Drive', 'Dropbox', 'OneDrive']
      },
      {
        name: 'SecurityGuard',
        description: 'System security and monitoring tool',
        features: [
          'Real-time protection',
          'Firewall management',
          'Vulnerability scanning',
          'Privacy protection'
        ],
        priority: 'medium',
        integrations: ['Windows Security', 'Task Manager']
      }
    ]
  },
  productivity: {
    keywords: ['task', 'organize', 'plan', 'schedule'],
    fallback: 'Try these productivity tools to stay organized.'
  },
  design: {
    keywords: ['design', 'graphic', 'photo', 'image'],
    fallback: 'Check out these design tools for your creative work.'
  }
};

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [timeSuggestions, setTimeSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getApps } = useFirestore();

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      const apps = await getApps();

      // Combine fetched apps with utility apps
      const utilityApps = APP_CATEGORIES.utility.sampleApps.map(app => ({
        ...app,
        category: 'utility',
        relevance: {
          score: 0.9,
          factors: [
            'Essential system maintenance',
            'Performance optimization',
            'Data protection and security',
            'Regular system health checks'
          ]
        }
      }));

      // Sample recommendations data structure
      const sampleRecommendations = [
        ...utilityApps,
        ...apps.map(app => ({
          ...app,
          priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          features: [
            'Cross-platform compatibility',
            'Real-time collaboration',
            'Cloud storage integration',
            'Advanced security features'
          ],
          integrations: ['Slack', 'Google Drive', 'Dropbox', 'Microsoft Teams'],
          relevance: {
            score: Math.random(),
            factors: [
              'Matches your workflow patterns',
              'Popular in your industry',
              'Compatible with your existing tools',
              'High user satisfaction rating'
            ]
          }
        }))
      ];

      // Sample time-based suggestions with utility focus
      const sampleTimeSuggestions = [
        {
          appId: 'System Optimizer Pro',
          reason: 'Regular system maintenance recommended',
          relevanceScore: 0.95,
          contextFactors: [
            'System performance',
            'Resource usage',
            'Maintenance schedule',
            'System health'
          ],
          potentialWorkflow: {
            steps: [
              'Run system analysis',
              'Review optimization recommendations',
              'Apply suggested fixes',
              'Schedule regular maintenance'
            ],
            expectedOutcome: 'Improved system performance and stability'
          }
        },
        ...apps.slice(0, 2).map(app => ({
          appId: app.name,
          reason: 'Based on your current workflow and time of day',
          relevanceScore: Math.random(),
          contextFactors: [
            'Time of day',
            'Current workload',
            'Recent activity',
            'Team collaboration'
          ],
          potentialWorkflow: {
            steps: [
              'Open the application',
              'Import your existing data',
              'Configure settings',
              'Start your workflow'
            ],
            expectedOutcome: 'Improved productivity and streamlined workflow'
          }
        }))
      ];

      setRecommendations(sampleRecommendations);
      setTimeSuggestions(sampleTimeSuggestions);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRecommendations();
  }, []);

  const refreshRecommendations = () => {
    generateRecommendations();
  };

  return {
    recommendations,
    timeSuggestions,
    loading,
    error,
    refreshRecommendations
  };
}
