const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Init DB then start routes
initDb().then(db => {
  app.locals.db = db;

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/posts', require('./routes/posts'));
  app.use('/api/posts/:postId/comments', require('./routes/comments'));
  app.use('/api/admin', require('./routes/admin'));
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.listen(PORT, () => {
    console.log(`\n🚀 Blog API running at http://localhost:${PORT}`);
    console.log(`📋 Admin credentials: admin@blog.com / admin123\n`);
  });
}).catch(console.error);
