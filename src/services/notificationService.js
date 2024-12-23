import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const NOTIFICATION_TYPES = {
  SLACK: 'slack',
  EMAIL: 'email',
  TASK: 'task',
  UPDATE: 'update',
  CALENDAR: 'calendar'
};

class NotificationService {
  async addNotification(userId, notification) {
    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId,
        ...notification,
        timestamp: Timestamp.now(),
        read: false
      });
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  }

  async checkSlackNotifications(userId, slackToken) {
    try {
      const response = await fetch('https://slack.com/api/conversations.list', {
        headers: {
          'Authorization': `Bearer ${slackToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (!data.ok) throw new Error('Failed to fetch Slack data');

      const unreadChannels = data.channels.filter(channel => channel.unread_count > 0);
      
      for (const channel of unreadChannels) {
        await this.addNotification(userId, {
          type: NOTIFICATION_TYPES.SLACK,
          title: `New messages in #${channel.name}`,
          message: `You have ${channel.unread_count} unread messages`,
          appId: 'slack',
          priority: channel.unread_count > 10 ? 'high' : 'medium',
          metadata: {
            channelId: channel.id,
            unreadCount: channel.unread_count
          }
        });
      }
    } catch (error) {
      console.error('Error checking Slack notifications:', error);
    }
  }

  async checkEmailNotifications(userId, emailToken) {
    try {
      const client = Client.init({
        authProvider: (done) => {
          done(null, emailToken);
        }
      });

      const response = await client
        .api('/me/messages')
        .select('subject,receivedDateTime,isRead')
        .filter('isRead eq false')
        .top(10)
        .get();

      const unreadEmails = response.value;
      
      if (unreadEmails.length > 0) {
        await this.addNotification(userId, {
          type: NOTIFICATION_TYPES.EMAIL,
          title: 'Unread Emails',
          message: `You have ${unreadEmails.length} unread emails`,
          appId: 'outlook',
          priority: unreadEmails.length > 5 ? 'high' : 'medium',
          metadata: {
            emailCount: unreadEmails.length,
            latestSubject: unreadEmails[0].subject
          }
        });
      }
    } catch (error) {
      console.error('Error checking email notifications:', error);
    }
  }

  async checkTaskDeadlines(userId, tasks) {
    const now = new Date();
    const upcomingTasks = tasks.filter(task => {
      const deadline = new Date(task.deadline);
      const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);
      return hoursUntilDeadline > 0 && hoursUntilDeadline < 24;
    });

    for (const task of upcomingTasks) {
      const hoursLeft = Math.round((new Date(task.deadline) - now) / (1000 * 60 * 60));
      
      await this.addNotification(userId, {
        type: NOTIFICATION_TYPES.TASK,
        title: 'Task Deadline Approaching',
        message: `"${task.title}" is due in ${hoursLeft} hours`,
        appId: task.appId,
        priority: hoursLeft < 4 ? 'high' : 'medium',
        metadata: {
          taskId: task.id,
          deadline: task.deadline,
          hoursLeft
        }
      });
    }
  }

  async checkAppUpdates(userId, apps) {
    for (const app of apps) {
      try {
        const response = await fetch(app.updateCheckUrl);
        const data = await response.json();
        
        if (data.hasUpdate) {
          await this.addNotification(userId, {
            type: NOTIFICATION_TYPES.UPDATE,
            title: `Update Available: ${app.name}`,
            message: `Version ${data.latestVersion} is now available`,
            appId: app.id,
            priority: 'low',
            metadata: {
              currentVersion: app.version,
              newVersion: data.latestVersion,
              updateUrl: data.updateUrl
            }
          });
        }
      } catch (error) {
        console.error(`Error checking updates for ${app.name}:`, error);
      }
    }
  }
}

export const notificationService = new NotificationService();
