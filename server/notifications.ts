import { Notification } from './types.js';
import { generateId } from './utils.js';

let notifications: Notification[] = [];

export function addNotification(
  notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
): Notification {
  const newNotif: Notification = {
    ...notification,
    id: generateId('notif'),
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(newNotif);
  // Keep last 100
  if (notifications.length > 100) {
    notifications = notifications.slice(0, 100);
  }
  return newNotif;
}

export function getUserNotifications(userId: string): Notification[] {
  return notifications.filter((n) => n.userId === userId || n.userId === 'ALL');
}

export function getNotificationById(id: string): Notification | undefined {
  return notifications.find((n) => n.id === id);
}

export function markAsRead(id: string): boolean {
  const notif = notifications.find((n) => n.id === id);
  if (notif) {
    notif.read = true;
    return true;
  }
  return false;
}

export function markAllAsRead(userId: string): void {
  notifications.forEach((n) => {
    if (n.userId === userId || n.userId === 'ALL') {
      n.read = true;
    }
  });
}

export function seedNotifications(initial: Notification[]) {
  notifications = [...initial];
}
