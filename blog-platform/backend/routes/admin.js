const express = require('express');
const { get, all, run, save } = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, adminOnly);

router.get('/stats', (req, res) => {
  const db = req.app.locals.db;
  const totalUsers = get(db, 'SELECT COUNT(*) as count FROM users').count;
  const totalPosts = get(db, 'SELECT COUNT(*) as count FROM posts').count;
  const totalComments = get(db, 'SELECT COUNT(*) as count FROM comments').count;
  const viewsRow = get(db, 'SELECT SUM(views) as total FROM posts');
  const totalViews = viewsRow?.total || 0;
  const publishedPosts = get(db, "SELECT COUNT(*) as count FROM posts WHERE status = 'published'").count;
  const draftPosts = get(db, "SELECT COUNT(*) as count FROM posts WHERE status = 'draft'").count;
  const recentPosts = all(db, 'SELECT p.*, u.username as author_name FROM posts p JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC LIMIT 5');
  const recentUsers = all(db, 'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5');
  res.json({ totalUsers, totalPosts, totalComments, totalViews, publishedPosts, draftPosts, recentPosts, recentUsers });
});

router.get('/users', (req, res) => {
  const db = req.app.locals.db;
  const users = all(db, `SELECT u.*, (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.id) as post_count,
    (SELECT COUNT(*) FROM comments c WHERE c.author_id = u.id) as comment_count FROM users u ORDER BY u.created_at DESC`);
  res.json(users);
});

router.put('/users/:id', (req, res) => {
  const { role } = req.body;
  const db = req.app.locals.db;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  run(db, 'UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
  save(db);
  res.json({ message: 'Updated' });
});

router.delete('/users/:id', (req, res) => {
  const db = req.app.locals.db;
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  run(db, 'DELETE FROM users WHERE id = ?', [req.params.id]);
  save(db);
  res.json({ message: 'Deleted' });
});

router.get('/posts', (req, res) => {
  const db = req.app.locals.db;
  const posts = all(db, `SELECT p.*, u.username as author_name,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count
    FROM posts p JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC`);
  res.json(posts);
});

router.get('/comments', (req, res) => {
  const db = req.app.locals.db;
  const comments = all(db, `SELECT c.*, u.username as author_name, p.title as post_title, p.slug as post_slug
    FROM comments c JOIN users u ON c.author_id = u.id JOIN posts p ON c.post_id = p.id
    ORDER BY c.created_at DESC`);
  res.json(comments);
});

module.exports = router;
