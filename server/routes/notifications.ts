import { Router } from 'express';
import { getUserNotifications, markAsRead, markAllAsRead, getNotificationById } from '../notifications.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const role = req.user!.role;

  const userNotifs = getUserNotifications(userId);
  const adminNotifs = role === 'ADMIN' ? getUserNotifications('ADMIN') : [];

  const combined = Array.from(new Set([...userNotifs, ...adminNotifs])).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json({ notifications: combined });
});

router.post('/:id/read', (req: AuthenticatedRequest, res) => {
  const notification = getNotificationById(req.params.id);
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  // Ensure user owns notification or is reading an admin notification as admin
  const isOwner = notification.userId === req.user!.id;
  const isAdminReadingAdminNotif = req.user!.role === 'ADMIN' && notification.userId === 'ADMIN';

  if (!isOwner && !isAdminReadingAdminNotif) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const success = markAsRead(req.params.id);
  res.json({ success });
});

router.post('/read-all', (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  markAllAsRead(userId);
  if (req.user!.role === 'ADMIN') {
    markAllAsRead('ADMIN');
  }
  res.json({ success: true });
});

export default router;
