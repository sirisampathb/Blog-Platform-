const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'blog.db');
let db;

// Synchronous wrapper helpers
function run(db, sql, params = []) {
  db.run(sql, params);
}

function get(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function all(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = [];
  stmt.bind(params);
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function save(db) {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDb() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      avatar TEXT DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      cover_image TEXT DEFAULT NULL,
      category TEXT DEFAULT 'General',
      tags TEXT DEFAULT '[]',
      status TEXT DEFAULT 'published',
      author_id INTEGER NOT NULL,
      views INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      post_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      parent_id INTEGER DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (post_id) REFERENCES posts(id),
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Seed admin
  const adminExists = get(db, 'SELECT id FROM users WHERE email = ?', ['admin@blog.com']);
  if (!adminExists) {
    const hashed = bcrypt.hashSync('admin123', 10);
    db.run('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@blog.com', hashed, 'admin']);
    const admin = get(db, 'SELECT id FROM users WHERE email = ?', ['admin@blog.com']);

    const posts = [
      ['Welcome to Our Blog Platform', 'welcome-to-our-blog-platform-' + Date.now(), 'This is our brand new blogging platform. Explore features like creating posts, commenting, and managing your profile.', 'Welcome to our brand new blogging platform!', 'Announcement', '["welcome","announcement"]'],
      ['Getting Started with Full-Stack Development', 'getting-started-fullstack-' + (Date.now()+1), 'Full-stack development involves working with both frontend and backend of a web application. Master Node.js, React, databases, and REST APIs.', 'Learn the essentials of full-stack development.', 'Technology', '["fullstack","nodejs","react"]'],
      ['The Art of Writing Great Blog Posts', 'art-of-writing-great-posts-' + (Date.now()+2), 'Writing great blog posts requires compelling storytelling, clear structure, and valuable insights. Here are the key principles that separate good posts from great ones.', 'Master the craft of compelling blog writing.', 'Writing', '["writing","content","blogging"]'],
    ];
    posts.forEach(([title, slug, content, excerpt, category, tags]) => {
      db.run('INSERT INTO posts (title, slug, content, excerpt, category, tags, author_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, slug, content, excerpt, category, tags, admin.id]);
    });
    save(db);
  }

  return db;
}

module.exports = { initDb, run, get, all, save };
