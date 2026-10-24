import { Router } from 'express';
import { db } from '../db.js';
import { AuthenticatedRequest, JWT_SECRET } from '../middleware/auth.js';
import { generateId } from '../utils.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.getUserByEmail(email);
  if (!user || !user.password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Return user without password
  const { password: _, ...userSafe } = user;

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  return res.json({
    user: userSafe,
    token,
  });
});

router.post('/register', async (req, res) => {
  const { name, email, phone, ward, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = db.addUser({
    id: generateId('usr'),
    name,
    email,
    phone: phone || '',
    ward: ward || 'Ward 1',
    password: passwordHash,
    role: 'CITIZEN',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
  });

  const { password: _, ...userSafe } = newUser;

  const token = jwt.sign(
    { sub: newUser.id, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  return res.status(201).json({
    user: userSafe,
    token,
  });
});

router.get('/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { password: _, ...userSafe } = req.user;
  return res.json({ user: userSafe });
});

router.get('/demo-users', (req, res) => {
  const demoAccounts = db.getUsers().map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
  }));
  res.json({ users: demoAccounts });
});

export default router;
