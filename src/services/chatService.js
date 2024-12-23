class ChatService {
  constructor() {
    this.context = [];
  }

  async sendMessage(message) {
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store message in context
    this.context.push({ role: 'user', content: message });

    // Simple response logic (replace with actual AI integration)
    let response = '';
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('recommend') && lowerMessage.includes('app')) {
      response = "Based on your usage patterns, I recommend trying these apps:\n\n" +
        "1. Notion - Great for note-taking and documentation\n" +
        "2. Slack - Excellent for team communication\n" +
        "3. VS Code - Perfect for coding tasks\n\n" +
        "Would you like more details about any of these apps?";
    } else if (lowerMessage.includes('workflow')) {
      response = "I can help you create a workflow. What apps would you like to connect? " +
        "For example, I can help you set up:\n\n" +
        "• Automatic file backups\n" +
        "• Email notifications for important events\n" +
        "• Task synchronization between apps";
    } else if (lowerMessage.includes('productivity') || lowerMessage.includes('tips')) {
      response = "Here are some productivity tips:\n\n" +
        "1. Use keyboard shortcuts for frequent actions\n" +
        "2. Set up automated workflows for repetitive tasks\n" +
        "3. Organize apps by categories or projects\n" +
        "4. Enable quick launch shortcuts for your most-used apps";
    } else {
      response = "I'm here to help! I can:\n\n" +
        "• Recommend apps for specific tasks\n" +
        "• Help you create workflows\n" +
        "• Share productivity tips\n" +
        "• Answer questions about app features\n\n" +
        "What would you like to know?";
    }

    // Store response in context
    this.context.push({ role: 'assistant', content: response });

    return response;
  }

  clearContext() {
    this.context = [];
  }

  // Future enhancement: Integrate with actual AI service
  async connectToAI() {
    // Implementation for connecting to AI service
  }
}

export const chatService = new ChatService();
