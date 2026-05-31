# ✒ Inkwell — Blog Platform

A full-stack blogging platform with user authentication, post management, comments, and an admin dashboard.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher

### 1. Install Dependencies

Open **two terminals** in this folder:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
node server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm start
```

Or use the startup script:
- **Windows:** Double-click `start.bat`
- **Mac/Linux:** `bash start.sh`

### 2. Open in Browser
- **App:** http://localhost:3000
- **API:** http://localhost:5000

---

## 🔑 Default Credentials

| Role  | Email             | Password  |
|-------|-------------------|-----------|
| Admin | admin@blog.com    | admin123  |

---

## 📁 Project Structure

```
blog-platform/
├── backend/
│   ├── routes/
│   │   ├── auth.js        # Register, login, profile
│   │   ├── posts.js       # CRUD posts, likes
│   │   ├── comments.js    # CRUD comments
│   │   └── admin.js       # Admin-only endpoints
│   ├── middleware/
│   │   └── auth.js        # JWT authentication
│   ├── db.js              # SQLite database setup
│   ├── server.js          # Express entry point
│   └── blog.db            # SQLite database file (auto-created)
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Home.js        # Landing page
│       │   ├── Login.js       # Sign in
│       │   ├── Register.js    # Create account
│       │   ├── Posts.js       # Browse articles
│       │   ├── PostDetail.js  # Read + comment
│       │   ├── CreatePost.js  # Write / edit post
│       │   ├── Admin.js       # Admin dashboard
│       │   └── Profile.js     # User profile
│       ├── components/
│       │   ├── Navbar.js
│       │   └── PostCard.js
│       ├── context/
│       │   └── AuthContext.js # Global auth state
│       └── api.js             # Axios API client
│
├── start.bat   # Windows startup script
├── start.sh    # Mac/Linux startup script
└── README.md
```

---

## ✨ Features

### 👤 Authentication
- User registration with email + password
- JWT-based login (7-day tokens)
- Protected routes for creating/editing posts

### 📝 Blog Posts
- Create, edit, delete posts
- Rich text content with categories and tags
- Draft / Published status
- Like posts, track views
- Search and filter by category

### 💬 Comments
- Comment on any post
- Delete your own comments
- Admins can delete any comment

### 🛡️ Admin Dashboard
- Overview stats (users, posts, comments, views)
- Manage all users (promote/demote, delete)
- Manage all posts (edit, delete)
- Manage all comments (delete)

---

## 🔌 API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |

### Posts
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/posts | List posts |
| GET | /api/posts/:slug | Get post |
| POST | /api/posts | Create post |
| PUT | /api/posts/:id | Update post |
| DELETE | /api/posts/:id | Delete post |
| POST | /api/posts/:id/like | Toggle like |

### Comments
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/posts/:id/comments | List comments |
| POST | /api/posts/:id/comments | Add comment |
| DELETE | /api/posts/:id/comments/:cid | Delete comment |

### Admin (admin only)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/stats | Dashboard stats |
| GET | /api/admin/users | All users |
| PUT | /api/admin/users/:id | Update user role |
| DELETE | /api/admin/users/:id | Delete user |
| GET | /api/admin/posts | All posts |
| GET | /api/admin/comments | All comments |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Styling | Custom CSS with CSS variables |
| Backend | Node.js, Express |
| Database | SQLite (via sql.js — pure JS, no native builds) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| HTTP | Axios |
| Notifications | react-hot-toast |
| Icons | lucide-react |
