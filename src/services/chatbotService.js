import { useAuth } from '../contexts/AuthContext';
import { generateResponse, generateAppSuggestions, generateWorkflowSuggestions } from './geminiService';

// Check if we're running in Electron
const isElectron = window?.electron?.isElectron === true;
console.log('Running in Electron:', isElectron);

// Create a safe electron API wrapper
const electronAPI = {
  openApp: async (path) => {
    if (!isElectron) {
      console.warn('Not running in Electron environment');
      return false;
    }
    try {
      return await window.electron.openApp(path);
    } catch (error) {
      console.error('Error calling openApp:', error);
      return false;
    }
  },
  closeApp: async (path) => {
    if (!isElectron) {
      console.warn('Not running in Electron environment');
      return false;
    }
    try {
      return await window.electron.closeApp(path);
    } catch (error) {
      console.error('Error calling closeApp:', error);
      return false;
    }
  }
};

// Process user input and execute commands
export const processUserInput = async (input, context) => {
  try {
    console.log('Processing user input:', input);
    console.log('Context:', context);

    const { apps, workflows } = context;
    if (!apps || !workflows) {
      console.error('Missing context:', { apps: !!apps, workflows: !!workflows });
      throw new Error('App data not available. Please try again in a moment.');
    }

    const lowercaseInput = input.toLowerCase();
    console.log('Lowercase input:', lowercaseInput);

    // Direct commands
    if (lowercaseInput.startsWith('open ')) {
      const appName = input.slice(5).trim();
      return await executeAppCommand('open', appName, { apps });
    }

    if (lowercaseInput.startsWith('close ')) {
      const appName = input.slice(6).trim();
      return await executeAppCommand('close', appName, { apps });
    }

    if (lowercaseInput.startsWith('start workflow ')) {
      const workflowName = input.slice(15).trim();
      return await executeWorkflowCommand('start', workflowName, { workflows });
    }

    // List commands
    if (lowercaseInput.includes('list')) {
      if (lowercaseInput.includes('apps')) {
        if (!apps.length) return 'You have no apps added yet.';
        const appList = apps.map(app => app.name).join(', ');
        return `Your apps: ${appList}`;
      }
      if (lowercaseInput.includes('workflows')) {
        if (!workflows.length) return 'You have no workflows created yet.';
        const workflowList = workflows.map(w => w.name).join(', ');
        return `Your workflows: ${workflowList}`;
      }
    }

    // Help command
    if (lowercaseInput.includes('help')) {
      return `Here are the commands I understand:

Basic Commands:
- "help" - Show this help message
- "list apps" - Show all your apps
- "list workflows" - Show all your workflows

App Commands:
- "open [app name]" - Open an application
- "close [app name]" - Close an application

Workflow Commands:
- "start workflow [name]" - Start a workflow

Voice Commands:
- "stop" or "stop listening" - Stop voice recognition

Examples:
- "open Chrome"
- "close Notepad"
- "start workflow Productivity"
- "list apps"`;
    }

    // If no direct command matches, try to understand the intent
    try {
      const response = await generateResponse(input, { apps, workflows });
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      return "I'm not sure how to help with that. Try saying 'help' to see what I can do.";
    }
  } catch (error) {
    console.error('Error processing command:', error);
    if (error.message.includes('App data not available')) {
      return error.message;
    }
    return `I don't understand that command. Type "help" to see what I can do.`;
  }
};

// Execute app-related commands
const executeAppCommand = async (command, appName, { apps }) => {
  try {
    switch (command) {
      case 'open':
        const app = apps.find(a => a.name.toLowerCase() === appName.toLowerCase());
        if (app) {
          if (!isElectron) {
            console.error('Not running in Electron environment');
            throw new Error('This app must be run in Electron to open applications. Please restart using npm run electron-dev');
          }
          const success = await electronAPI.openApp(app.path);
          if (!success) {
            throw new Error('Failed to open app. Make sure the path is correct.');
          }
          return `Opening ${app.name}...`;
        }
        return `Could not find app "${appName}". Try adding it first.`;

      case 'close':
        const appToClose = apps.find(a => a.name.toLowerCase() === appName.toLowerCase());
        if (appToClose) {
          if (!isElectron) {
            console.error('Not running in Electron environment');
            throw new Error('This app must be run in Electron to close applications. Please restart using npm run electron-dev');
          }
          const success = await electronAPI.closeApp(appToClose.path);
          if (!success) {
            throw new Error('Failed to close app. It might already be closed.');
          }
          return `Closing ${appToClose.name}...`;
        }
        return `Could not find app "${appName}".`;

      default:
        return `Unknown command "${command}".`;
    }
  } catch (error) {
    console.error('Error executing app command:', error);
    throw error;
  }
};

// Execute workflow-related commands
const executeWorkflowCommand = async (command, workflowName, { workflows }) => {
  try {
    switch (command) {
      case 'start':
        const workflow = workflows.find(w => w.name.toLowerCase() === workflowName.toLowerCase());
        if (workflow) {
          if (!isElectron) {
            console.error('Not running in Electron environment');
            throw new Error('This app must be run in Electron to start workflows. Please restart using npm run electron-dev');
          }
          // Execute each app in the workflow sequence
          for (const app of workflow.apps) {
            const success = await electronAPI.openApp(app.path);
            if (!success) {
              throw new Error(`Failed to open ${app.name}. Workflow stopped.`);
            }
            // Add small delay between app launches
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          return `Started workflow "${workflow.name}".`;
        }
        return `Could not find workflow "${workflowName}".`;

      default:
        return `Unknown workflow command "${command}".`;
    }
  } catch (error) {
    console.error('Error executing workflow command:', error);
    throw error;
  }
};

// Supported chatbot platforms and their capabilities
export const CHATBOT_PLATFORMS = {
  'openai': {
    name: 'OpenAI ChatGPT',
    color: '#74AA9C',
    capabilities: [
      'app-control',
      'workflow-automation',
      'natural-language-search',
      'task-assistance',
      'integration-help'
    ]
  }
};
