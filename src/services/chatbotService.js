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

    // List commands
    if (lowercaseInput.includes('list')) {
      if (lowercaseInput.includes('apps')) {
        if (!apps.length) return 'You have no apps added yet. Try adding some apps from the dashboard first.';
        
        // Group apps by category
        const appsByCategory = apps.reduce((acc, app) => {
          const category = app.category || 'Other';
          if (!acc[category]) acc[category] = [];
          acc[category].push(app.name);
          return acc;
        }, {});

        // Format the response
        let response = 'Here are your apps:\n\n';
        Object.entries(appsByCategory).forEach(([category, appNames]) => {
          response += `${category}:\n${appNames.map(name => `- ${name}`).join('\n')}\n\n`;
        });
        return response;
      }
      if (lowercaseInput.includes('workflows')) {
        if (!workflows.length) return 'You have no workflows created yet.';
        const workflowList = workflows.map(w => w.name).join('\n- ');
        return `Your workflows:\n- ${workflowList}`;
      }
    }

    // Help command
    if (lowercaseInput.includes('help')) {
      return `Here are the commands I understand:

Basic Commands:
- "help" - Show this help message
- "list apps" - Show all your installed apps
- "list workflows" - Show all your workflows

App Commands:
- "open [app name]" - Open an application (e.g., "open Chrome")
- "close [app name]" - Close an application
- "find [app name]" - Search for an app
- "show [category] apps" - Show apps in a specific category

Workflow Commands:
- "start workflow [name]" - Start a workflow
- "create workflow" - Create a new workflow (use the dashboard)

Voice Commands:
- "stop" or "stop listening" - Stop voice recognition

Examples:
- "open Chrome"
- "list apps"
- "show productivity apps"
- "start workflow Daily Startup"`;
    }

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

    // Show category apps
    if (lowercaseInput.includes('show') && lowercaseInput.includes('apps')) {
      const categories = ['productivity', 'entertainment', 'development', 'communication', 'utilities'];
      const matchedCategory = categories.find(cat => lowercaseInput.includes(cat));
      
      if (matchedCategory) {
        const categoryApps = apps.filter(app => app.category?.toLowerCase() === matchedCategory);
        if (categoryApps.length === 0) {
          return `No apps found in the ${matchedCategory} category.`;
        }
        const appList = categoryApps.map(app => app.name).join('\n- ');
        return `${matchedCategory.charAt(0).toUpperCase() + matchedCategory.slice(1)} apps:\n- ${appList}`;
      }
    }

    // If no command matched, try to generate a response
    return await generateResponse(input, { apps, workflows });
  } catch (error) {
    console.error('Error processing input:', error);
    throw error;
  }
};

// Execute app-related commands
const executeAppCommand = async (command, appName, { apps }) => {
  try {
    if (!appName || typeof appName !== 'string') {
      throw new Error('Please specify an app name');
    }

    const searchName = appName.toLowerCase().trim();
    console.log('Searching for app:', searchName);
    
    // Try different variations of the app name
    const findApp = () => {
      // First try exact match
      const exactMatch = apps.find(a => a.name.toLowerCase() === searchName);
      if (exactMatch) {
        console.log('Found exact match:', exactMatch.name);
        return exactMatch;
      }

      // Try partial match at start of name
      const startsWithMatch = apps.find(a => a.name.toLowerCase().startsWith(searchName));
      if (startsWithMatch) {
        console.log('Found starts-with match:', startsWithMatch.name);
        return startsWithMatch;
      }

      // Try contains match
      const containsMatch = apps.find(a => a.name.toLowerCase().includes(searchName));
      if (containsMatch) {
        console.log('Found contains match:', containsMatch.name);
        return containsMatch;
      }

      // Try without special characters
      const cleanSearchName = searchName.replace(/[^a-z0-9]/g, '');
      const cleanMatch = apps.find(a => a.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanSearchName));
      if (cleanMatch) {
        console.log('Found clean match:', cleanMatch.name);
        return cleanMatch;
      }

      console.log('No match found for:', searchName);
      return null;
    };

    switch (command) {
      case 'open': {
        const app = findApp();
        if (app) {
          if (!isElectron) {
            console.error('Not running in Electron environment');
            throw new Error('This app must be run in Electron to open applications. Please restart using npm run electron-dev');
          }

          console.log('Attempting to open app:', app.path);
          if (!app.path) {
            throw new Error(`No path configured for app: ${app.name}`);
          }

          const success = await electronAPI.openApp(app.path);
          if (!success) {
            throw new Error(`Failed to open ${app.name}. Please check if the path is correct: ${app.path}`);
          }
          return `Opening ${app.name}...`;
        }
        
        // If no app found, show similar apps as suggestions
        const similarApps = apps
          .filter(a => {
            const similarity = calculateSimilarity(a.name.toLowerCase(), searchName);
            return similarity > 0.3; // Show apps with >30% similarity
          })
          .map(a => a.name)
          .slice(0, 3); // Show top 3 similar apps
          
        if (similarApps.length > 0) {
          return `Could not find "${appName}". Did you mean: ${similarApps.join(', ')}?`;
        }
        return `Could not find "${appName}". Try adding it first or check if the name is correct.`;
      }

      case 'close': {
        const app = findApp();
        if (app) {
          if (!isElectron) {
            throw new Error('This app must be run in Electron to close applications');
          }
          const success = await electronAPI.closeApp(app.path);
          if (!success) {
            throw new Error(`Failed to close ${app.name}`);
          }
          return `Closing ${app.name}...`;
        }
        return `Could not find "${appName}" to close. Is it running?`;
      }

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error('Error executing app command:', error);
    throw new Error(`Failed to ${command} app: ${error.message}`);
  }
};

// Calculate similarity between two strings (Levenshtein distance based)
const calculateSimilarity = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len2 + 1).fill().map(() => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }

  const distance = matrix[len2][len1];
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
};

// Execute workflow-related commands
const executeWorkflowCommand = async (command, workflowName, { workflows }) => {
  try {
    switch (command) {
      case 'start': {
        const workflow = workflows.find(w => w.name.toLowerCase() === workflowName.toLowerCase());
        if (workflow) {
          if (!isElectron) {
            console.error('Not running in Electron environment');
            throw new Error('This app must be run in Electron to start workflows. Please restart using npm run electron-dev');
          }

          console.log('Starting workflow:', workflow.name);
          console.log('Apps to open:', workflow.apps.map(app => `${app.name} (delay: ${app.delay}ms)`));

          // Open apps sequentially with configured delays
          for (let i = 0; i < workflow.apps.length; i++) {
            const app = workflow.apps[i];
            try {
              // First app opens immediately, subsequent apps wait for previous app's delay
              if (i > 0) {
                const delay = workflow.apps[i - 1].delay || 2000;
                console.log(`Waiting ${delay}ms before launching ${app.name}...`);
                await new Promise(resolve => setTimeout(resolve, delay));
              }

              console.log(`Launching app ${i + 1}/${workflow.apps.length}:`, app.name);
              
              if (!app.path) {
                console.error(`No path configured for ${app.name}`);
                throw new Error(`No path configured for ${app.name}`);
              }

              const success = await electronAPI.openApp(app.path);
              if (!success) {
                console.error(`Failed to open ${app.name}`);
                throw new Error(`Failed to open ${app.name}. Please check if the path is correct.`);
              }
              
              console.log(`Successfully launched ${app.name}`);

            } catch (error) {
              console.error(`Error launching ${app.name}:`, error);
              throw new Error(`Failed to open ${app.name}: ${error.message}`);
            }
          }

          return `Started workflow "${workflow.name}" - all apps launched successfully.`;
        }
        return `Could not find workflow "${workflowName}". Please check the name and try again.`;
      }

      default:
        throw new Error(`Unknown workflow command: ${command}`);
    }
  } catch (error) {
    console.error('Error executing workflow command:', error);
    throw new Error(`Failed to ${command} workflow: ${error.message}`);
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
