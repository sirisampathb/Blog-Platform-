const express = require('express');
const { get, all, run, save } = require('../db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.get('/', optionalAuth, (req, res) => {
  const db = req.app.locals.db;
  const post = get(db, 'SELECT id FROM posts WHERE slug = ? OR id = ?', [req.params.postId, parseInt(req.params.postId) || 0]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const comments = all(db, `SELECT c.*, u.username as author_name FROM comments c JOIN users u ON c.author_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC`, [post.id]);
  res.json(comments);
});

router.post('/', authenticate, (req, res) => {
  const { content, parent_id } = req.body;
  const db = req.app.locals.db;
  if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
  const post = get(db, 'SELECT id FROM posts WHERE slug = ? OR id = ?', [req.params.postId, parseInt(req.params.postId) || 0]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  run(db, 'INSERT INTO comments (content, post_id, author_id, parent_id) VALUES (?, ?, ?, ?)', [content.trim(), post.id, req.user.id, parent_id || null]);
  save(db);
  const allComments = all(db, `SELECT c.*, u.username as author_name FROM comments c JOIN users u ON c.author_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC`, [post.id]);
  res.status(201).json(allComments[allComments.length - 1]);
});

router.delete('/:commentId', authenticate, (req, res) => {
  const db = req.app.locals.db;
  const comment = get(db, 'SELECT * FROM comments WHERE id = ?', [req.params.commentId]);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  if (comment.author_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  run(db, 'DELETE FROM comments WHERE id = ?', [comment.id]);
  save(db);
  res.json({ message: 'Deleted' });
});

module.exports = router;
