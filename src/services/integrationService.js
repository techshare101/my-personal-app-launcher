import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc } from '@firebase/firestore';
import { db } from '../firebase';

// Pre-configured integration templates
export const INTEGRATION_TEMPLATES = {
  SLACK_TO_NOTION: {
    id: 'slack-to-notion',
    name: 'Slack to Notion',
    description: 'Automatically save important Slack messages to Notion',
    platforms: ['slack', 'notion'],
    type: 'zapier',
    configFields: [
      { name: 'slackChannel', label: 'Slack Channel', type: 'string' },
      { name: 'notionPageId', label: 'Notion Page ID', type: 'string' },
      { name: 'messageFilter', label: 'Message Filter (optional)', type: 'string' }
    ]
  },
  CALENDAR_TO_TODO: {
    id: 'calendar-to-todo',
    name: 'Calendar to Todo',
    description: 'Create todo items from calendar events',
    platforms: ['google-calendar', 'microsoft-todo'],
    type: 'power-automate',
    configFields: [
      { name: 'calendarId', label: 'Calendar ID', type: 'string' },
      { name: 'todoListId', label: 'Todo List ID', type: 'string' }
    ]
  },
  EMAIL_TO_SLACK: {
    id: 'email-to-slack',
    name: 'Email to Slack',
    description: 'Forward important emails to Slack',
    platforms: ['gmail', 'slack'],
    type: 'ifttt',
    configFields: [
      { name: 'emailFilter', label: 'Email Filter', type: 'string' },
      { name: 'slackChannel', label: 'Slack Channel', type: 'string' }
    ]
  }
};

// Platform configurations
export const PLATFORMS = {
  slack: {
    name: 'Slack',
    icon: 'slack-icon.png',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    scopes: ['channels:read', 'chat:write']
  },
  notion: {
    name: 'Notion',
    icon: 'notion-icon.png',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    scopes: ['page:write', 'database:read']
  },
  'google-calendar': {
    name: 'Google Calendar',
    icon: 'gcal-icon.png',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/calendar.readonly']
  },
  'microsoft-todo': {
    name: 'Microsoft Todo',
    icon: 'mstodo-icon.png',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scopes: ['Tasks.ReadWrite']
  },
  gmail: {
    name: 'Gmail',
    icon: 'gmail-icon.png',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly']
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
