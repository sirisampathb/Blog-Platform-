const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run, save } = require('../db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const db = req.app.locals.db;
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  try {
    const existing = get(db, 'SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing) return res.status(400).json({ error: 'Email or username already exists' });
    const hashed = bcrypt.hashSync(password, 10);
    run(db, 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashed]);
    save(db);
    const user = get(db, 'SELECT id, username, email, role, created_at FROM users WHERE email = ?', [email]);
    const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = req.app.locals.db;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = get(db, 'SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

router.get('/me', authenticate, (req, res) => {
  const db = req.app.locals.db;
  const user = get(db, 'SELECT id, username, email, role, bio, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/profile', authenticate, (req, res) => {
  const { username, bio } = req.body;
  const db = req.app.locals.db;
  run(db, 'UPDATE users SET username = ?, bio = ? WHERE id = ?', [username, bio, req.user.id]);
  save(db);
  const user = get(db, 'SELECT id, username, email, role, bio, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
  res.json(user);
});

module.exports = router;
