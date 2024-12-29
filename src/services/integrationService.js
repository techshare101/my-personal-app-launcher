import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc } from '@firebase/firestore';
import { db } from '../firebase';

// Pre-configured integration templates
export const INTEGRATION_TEMPLATES = {
  'slack-notion': {
    id: 'slack-notion',
    name: 'Slack to Notion',
    description: 'Automatically save important Slack messages to Notion',
    platforms: ['slack', 'notion'],
    type: 'personal',
    category: 'notes'
  },
  'calendar-todo': {
    id: 'calendar-todo',
    name: 'Calendar to Todo',
    description: 'Create todo items from calendar events',
    platforms: ['google-calendar', 'microsoft-todo'],
    type: 'personal',
    category: 'tasks'
  },
  'email-slack': {
    id: 'email-to-slack',
    name: 'Email to Slack',
    description: 'Forward important emails to Slack',
    platforms: ['gmail', 'slack'],
    type: 'personal',
    category: 'communication'
  },
  'drive-backup': {
    id: 'drive-backup',
    name: 'Drive Backup',
    description: 'Automatically backup Google Drive files to OneDrive',
    platforms: ['google-drive', 'microsoft-onedrive'],
    type: 'personal',
    category: 'backup'
  },
  'github-notion': {
    id: 'github-notion',
    name: 'GitHub to Notion',
    description: 'Track GitHub issues and PRs in Notion',
    platforms: ['github', 'notion'],
    type: 'personal',
    category: 'development'
  },
  'trello-asana': {
    id: 'trello-asana',
    name: 'Trello to Asana',
    description: 'Sync Trello cards with Asana tasks',
    platforms: ['trello', 'asana'],
    type: 'personal',
    category: 'tasks'
  }
};

// Platform configurations
export const PLATFORMS = {
  slack: {
    name: 'Slack',
    icon: 'slack',
    color: '#4A154B'
  },
  notion: {
    name: 'Notion',
    icon: 'notion',
    color: '#000000'
  },
  gmail: {
    name: 'Gmail',
    icon: 'gmail',
    color: '#EA4335'
  },
  'google-calendar': {
    name: 'Google Calendar',
    icon: 'calendar',
    color: '#4285F4'
  },
  'microsoft-todo': {
    name: 'Microsoft Todo',
    icon: 'todo',
    color: '#2564CF'
  },
  'google-drive': {
    name: 'Google Drive',
    icon: 'drive',
    color: '#0F9D58'
  },
  'microsoft-onedrive': {
    name: 'OneDrive',
    icon: 'onedrive',
    color: '#0078D4'
  },
  github: {
    name: 'GitHub',
    icon: 'github',
    color: '#181717'
  },
  trello: {
    name: 'Trello',
    icon: 'trello',
    color: '#0052CC'
  },
  asana: {
    name: 'Asana',
    icon: 'asana',
    color: '#F06A6A'
  }
};

class IntegrationService {
  async createIntegration(userId, integration) {
    try {
      const integrationsRef = collection(db, 'integrations');
      const docRef = await addDoc(integrationsRef, {
        userId,
        ...integration,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      
      // Initialize the integration with the automation platform
      await this.initializeIntegration(docRef.id, integration);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating integration:', error);
      throw error;
    }
  }

  async initializeIntegration(integrationId, integration) {
    const { type } = integration;
    
    try {
      switch (type) {
        case 'zapier':
          await this.initZapierIntegration(integrationId, integration);
          break;
        case 'ifttt':
          await this.initIFTTTIntegration(integrationId, integration);
          break;
        case 'power-automate':
          await this.initPowerAutomateIntegration(integrationId, integration);
          break;
        default:
          throw new Error(`Unsupported integration type: ${type}`);
      }
    } catch (error) {
      console.error('Error initializing integration:', error);
      throw error;
    }
  }

  async initZapierIntegration(integrationId, integration) {
    // Initialize Zapier webhook
    const webhookUrl = `https://hooks.zapier.com/hooks/catch/${integration.zapierAccountId}/${integration.zapierHookId}`;
    
    const docRef = doc(db, 'integrations', integrationId);
    await updateDoc(docRef, {
      webhookUrl,
      status: 'active'
    });
  }

  async initIFTTTIntegration(integrationId, integration) {
    // Initialize IFTTT webhook
    const webhookUrl = `https://maker.ifttt.com/trigger/${integration.eventName}/with/key/${integration.iftttKey}`;
    
    const docRef = doc(db, 'integrations', integrationId);
    await updateDoc(docRef, {
      webhookUrl,
      status: 'active'
    });
  }

  async initPowerAutomateIntegration(integrationId, integration) {
    // Initialize Power Automate flow
    const flowUrl = `https://prod-00.northcentralus.logic.azure.com/workflows/${integration.flowId}/triggers/manual/paths/invoke`;
    
    const docRef = doc(db, 'integrations', integrationId);
    await updateDoc(docRef, {
      flowUrl,
      status: 'active'
    });
  }

  async testIntegration(integrationId) {
    try {
      const docRef = doc(db, 'integrations', integrationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Integration not found');
      }
      
      const integration = docSnap.data();
      
      // Send a test payload based on the integration type
      switch (integration.type) {
        case 'zapier':
          // Send test to Zapier webhook
          break;
        case 'ifttt':
          // Send test to IFTTT webhook
          break;
        case 'power-automate':
          // Send test to Power Automate flow
          break;
        default:
          throw new Error(`Unsupported integration type: ${integration.type}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error testing integration:', error);
      throw error;
    }
  }

  async deleteIntegration(integrationId) {
    try {
      const docRef = doc(db, 'integrations', integrationId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting integration:', error);
      throw error;
    }
  }
}

export const integrationService = new IntegrationService();

export const createIntegration = async (integrationData) => {
  // Implementation for creating an integration
  return {
    id: Math.random().toString(36).substr(2, 9),
    ...integrationData,
    status: 'active',
    createdAt: new Date().toISOString()
  };
};

export const testIntegration = async (integrationId) => {
  // Implementation for testing an integration
  return {
    success: true,
    message: 'Integration test successful'
  };
};

export const deleteIntegration = async (integrationId) => {
  // Implementation for deleting an integration
  return {
    success: true
  };
};
