const express = require('express');
const { get, all, run, save } = require('../db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

router.get('/', optionalAuth, (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 10, category, search, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = [];
  let params = [];

  if (!req.user || req.user.role !== 'admin') {
    where.push("p.status = 'published'");
  } else if (status) {
    where.push("p.status = ?"); params.push(status);
  }
  if (category) { where.push("p.category = ?"); params.push(category); }
  if (search) { where.push("(p.title LIKE ? OR p.content LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }

  const wc = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const posts = all(db, `SELECT p.*, u.username as author_name,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as like_count
    FROM posts p JOIN users u ON p.author_id = u.id ${wc}
    ORDER BY p.created_at DESC LIMIT ? OFFSET ?`, [...params, parseInt(limit), offset]);
  const totalRow = get(db, `SELECT COUNT(*) as count FROM posts p ${wc}`, params);
  const total = totalRow ? totalRow.count : 0;
  res.json({ posts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

router.get('/:slug', optionalAuth, (req, res) => {
  const db = req.app.locals.db;
  const post = get(db, `SELECT p.*, u.username as author_name, u.bio as author_bio,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as like_count
    FROM posts p JOIN users u ON p.author_id = u.id WHERE p.slug = ?`, [req.params.slug]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  run(db, 'UPDATE posts SET views = views + 1 WHERE id = ?', [post.id]);
  save(db);
  if (req.user) {
    const liked = get(db, 'SELECT id FROM likes WHERE post_id = ? AND user_id = ?', [post.id, req.user.id]);
    post.user_liked = !!liked;
  }
  res.json(post);
});

router.post('/', authenticate, (req, res) => {
  const { title, content, excerpt, category = 'General', tags = [], cover_image, status = 'published' } = req.body;
  const db = req.app.locals.db;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  const slug = slugify(title);
  try {
    run(db, `INSERT INTO posts (title, slug, content, excerpt, category, tags, cover_image, status, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, content, excerpt || content.substring(0, 150) + '...', category, JSON.stringify(tags), cover_image || null, status, req.user.id]);
    save(db);
    const post = get(db, 'SELECT * FROM posts WHERE slug = ?', [slug]);
    res.status(201).json(post);
  } catch (e) { res.status(500).json({ error: 'Could not create post' }); }
});

router.put('/:id', authenticate, (req, res) => {
  const db = req.app.locals.db;
  const post = get(db, 'SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.author_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { title, content, excerpt, category, tags, cover_image, status } = req.body;
  run(db, `UPDATE posts SET title=?, content=?, excerpt=?, category=?, tags=?, status=?, updated_at=datetime('now') WHERE id=?`,
    [title || post.title, content || post.content, excerpt || post.excerpt, category || post.category, tags ? JSON.stringify(tags) : post.tags, status || post.status, post.id]);
  save(db);
  res.json(get(db, 'SELECT * FROM posts WHERE id = ?', [post.id]));
});

router.delete('/:id', authenticate, (req, res) => {
  const db = req.app.locals.db;
  const post = get(db, 'SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.author_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  run(db, 'DELETE FROM comments WHERE post_id = ?', [post.id]);
  run(db, 'DELETE FROM likes WHERE post_id = ?', [post.id]);
  run(db, 'DELETE FROM posts WHERE id = ?', [post.id]);
  save(db);
  res.json({ message: 'Post deleted' });
});

router.post('/:id/like', authenticate, (req, res) => {
  const db = req.app.locals.db;
  const post = get(db, 'SELECT id FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const existing = get(db, 'SELECT id FROM likes WHERE post_id = ? AND user_id = ?', [post.id, req.user.id]);
  if (existing) {
    run(db, 'DELETE FROM likes WHERE post_id = ? AND user_id = ?', [post.id, req.user.id]);
    save(db);
    res.json({ liked: false });
  } else {
    run(db, 'INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [post.id, req.user.id]);
    save(db);
    res.json({ liked: true });
  }
});

module.exports = router;
