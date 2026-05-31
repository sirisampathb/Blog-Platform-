import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, MessageCircle, Eye, Trash2, Shield, BarChart3, Crown, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import './Admin.css';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/'); return; }
  }, [user, navigate]);

  const loadTab = useCallback(() => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    const loads = {
      dashboard: () => api.get('/admin/stats').then(r => setStats(r.data)),
      users: () => api.get('/admin/users').then(r => setUsers(r.data)),
      posts: () => api.get('/admin/posts').then(r => setPosts(r.data)),
      comments: () => api.get('/admin/comments').then(r => setComments(r.data)),
    };
    loads[tab]?.().finally(() => setLoading(false));
  }, [tab, user]);

  useEffect(() => { loadTab(); }, [loadTab]);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await api.delete(`/admin/users/${id}`); setUsers(u => u.filter(x => x.id !== id)); toast.success('User deleted'); }
    catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const toggleRole = async (id, role) => {
    const newRole = role === 'admin' ? 'user' : 'admin';
    try { await api.put(`/admin/users/${id}`, { role: newRole }); setUsers(u => u.map(x => x.id === id ? {...x, role: newRole} : x)); toast.success('Role updated'); }
    catch { toast.error('Failed'); }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try { await api.delete(`/posts/${id}`); setPosts(p => p.filter(x => x.id !== id)); toast.success('Post deleted'); }
    catch { toast.error('Failed'); }
  };

  const deleteComment = async (postId, commentId) => {
    try { await api.delete(`/posts/${postId}/comments/${commentId}`); setComments(c => c.filter(x => x.id !== commentId)); toast.success('Comment deleted'); }
    catch { toast.error('Failed'); }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header"><Shield size={18}/> Admin Panel</div>
        {[
          { key: 'dashboard', icon: BarChart3, label: 'Dashboard' },
          { key: 'users', icon: Users, label: 'Users' },
          { key: 'posts', icon: FileText, label: 'Posts' },
          { key: 'comments', icon: MessageCircle, label: 'Comments' },
        ].map(({ key, icon: Icon, label }) => (
          <button key={key} className={`sidebar-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <Icon size={16}/> {label}
          </button>
        ))}
        <hr/>
        <Link to="/" className="sidebar-btn"><Eye size={16}/> View Site</Link>
        <Link to="/create" className="sidebar-btn"><Edit size={16}/> New Post</Link>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="admin-loading"><div className="spinner" style={{width:36,height:36}}/></div>
        ) : (
          <>
            {tab === 'dashboard' && stats && (
              <div className="fade-in">
                <h2 className="admin-title">Dashboard</h2>
                <div className="stats-grid">
                  <div className="stat-card"><div className="stat-icon users"><Users size={24}/></div><div><div className="stat-val">{stats.totalUsers}</div><div className="stat-label">Total Users</div></div></div>
                  <div className="stat-card"><div className="stat-icon posts"><FileText size={24}/></div><div><div className="stat-val">{stats.totalPosts}</div><div className="stat-label">Total Posts</div></div></div>
                  <div className="stat-card"><div className="stat-icon comments"><MessageCircle size={24}/></div><div><div className="stat-val">{stats.totalComments}</div><div className="stat-label">Comments</div></div></div>
                  <div className="stat-card"><div className="stat-icon views"><Eye size={24}/></div><div><div className="stat-val">{stats.totalViews}</div><div className="stat-label">Total Views</div></div></div>
                </div>
                <div className="admin-two-col">
                  <div>
                    <h3 className="section-title">Recent Posts</h3>
                    {stats.recentPosts.map(p => (
                      <div key={p.id} className="admin-list-item">
                        <div><div className="ali-title">{p.title}</div><div className="ali-meta">by {p.author_name} · {new Date(p.created_at).toLocaleDateString()}</div></div>
                        <span className={`badge ${p.status === 'published' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="section-title">Recent Users</h3>
                    {stats.recentUsers.map(u => (
                      <div key={u.id} className="admin-list-item">
                        <div><div className="ali-title">{u.username}</div><div className="ali-meta">{u.email}</div></div>
                        <span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-gray'}`}>{u.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div className="fade-in">
                <h2 className="admin-title">Users <span className="count-badge">{users.length}</span></h2>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Posts</th><th>Comments</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td><div className="user-cell"><div className="user-avatar-sm">{u.username[0].toUpperCase()}</div>{u.username}</div></td>
                          <td className="muted">{u.email}</td>
                          <td><span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-gray'}`}>{u.role}</span></td>
                          <td className="muted">{u.post_count}</td>
                          <td className="muted">{u.comment_count}</td>
                          <td className="muted">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="action-btns">
                              <button className="btn-ghost" title="Toggle role" onClick={() => toggleRole(u.id, u.role)}><Crown size={14}/></button>
                              {u.id !== user.id && <button className="btn-ghost" style={{color:'#c0392b'}} onClick={() => deleteUser(u.id)}><Trash2 size={14}/></button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'posts' && (
              <div className="fade-in">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
                  <h2 className="admin-title" style={{margin:0}}>Posts <span className="count-badge">{posts.length}</span></h2>
                  <Link to="/create"><button className="btn-primary">+ New Post</button></Link>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Status</th><th>Views</th><th>Comments</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {posts.map(p => (
                        <tr key={p.id}>
                          <td><Link to={`/posts/${p.slug}`} style={{color:'var(--ink)',fontWeight:600}}>{p.title}</Link></td>
                          <td className="muted">{p.author_name}</td>
                          <td><span className="badge badge-accent">{p.category}</span></td>
                          <td><span className={`badge ${p.status === 'published' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span></td>
                          <td className="muted">{p.views}</td>
                          <td className="muted">{p.comment_count}</td>
                          <td className="muted">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="action-btns">
                              <Link to={`/edit/${p.id}`}><button className="btn-ghost"><Edit size={14}/></button></Link>
                              <button className="btn-ghost" style={{color:'#c0392b'}} onClick={() => deletePost(p.id)}><Trash2 size={14}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'comments' && (
              <div className="fade-in">
                <h2 className="admin-title">Comments <span className="count-badge">{comments.length}</span></h2>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>Author</th><th>Comment</th><th>Post</th><th>Date</th><th>Action</th></tr></thead>
                    <tbody>
                      {comments.map(c => (
                        <tr key={c.id}>
                          <td><strong>{c.author_name}</strong></td>
                          <td className="muted comment-preview">{c.content.substring(0, 80)}{c.content.length > 80 ? '...' : ''}</td>
                          <td><Link to={`/posts/${c.post_slug}`} style={{color:'var(--accent)',fontSize:13}}>{c.post_title?.substring(0,40)}...</Link></td>
                          <td className="muted">{new Date(c.created_at).toLocaleDateString()}</td>
                          <td><button className="btn-ghost" style={{color:'#c0392b'}} onClick={() => deleteComment(c.post_id, c.id)}><Trash2 size={14}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
