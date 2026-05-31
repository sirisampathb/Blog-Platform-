import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Edit2, Save, FileText, MessageCircle, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '' });
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setForm({ username: user.username, bio: user.bio || '' });
    api.get('/posts?limit=50').then(res => {
      const mine = (res.data.posts || []).filter(p => p.author_name === user.username);
      setMyPosts(mine);
    }).finally(() => setLoading(false));
  }, [user, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', form);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally { setSaving(false); }
  };

  if (!user) return null;

  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="profile-page">
      <div className="profile-inner">
        <div className="profile-card card">
          <div className="profile-avatar-large">{user.username[0].toUpperCase()}</div>

          {editing ? (
            <div className="profile-edit-form">
              <div className="form-group">
                <label>Username</label>
                <input value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} placeholder="Your username"/>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} placeholder="Tell readers about yourself..." rows={3}/>
              </div>
              <div className="edit-actions">
                <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner" style={{width:16,height:16}}/> : <><Save size={15}/> Save</>}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="profile-name">{user.username}</h1>
              {user.bio && <p className="profile-bio">{user.bio}</p>}
              <div className="profile-meta-list">
                <div className="profile-meta-item"><Mail size={15}/> {user.email}</div>
                <div className="profile-meta-item"><Calendar size={15}/> Joined {joinDate}</div>
                <div className="profile-meta-item">
                  <span className={`badge ${user.role === 'admin' ? 'badge-gold' : 'badge-gray'}`}>{user.role}</span>
                </div>
              </div>
              <div className="profile-actions">
                <button className="btn-secondary" onClick={() => setEditing(true)}><Edit2 size={15}/> Edit Profile</button>
                {user.role === 'admin' && <Link to="/admin"><button className="btn-primary">Admin Panel</button></Link>}
              </div>
            </>
          )}
        </div>

        <div className="profile-stats">
          <div className="pstat-card"><FileText size={20}/><div className="pstat-val">{myPosts.length}</div><div className="pstat-label">Posts</div></div>
          <div className="pstat-card"><MessageCircle size={20}/><div className="pstat-val">{myPosts.reduce((a, p) => a + (p.comment_count || 0), 0)}</div><div className="pstat-label">Comments received</div></div>
          <div className="pstat-card"><User size={20}/><div className="pstat-val">{myPosts.reduce((a, p) => a + (p.views || 0), 0)}</div><div className="pstat-label">Total views</div></div>
        </div>

        <div className="my-posts-section">
          <div className="section-top">
            <h2>My Articles</h2>
            <Link to="/create"><button className="btn-primary">+ Write New</button></Link>
          </div>
          {loading ? (
            <div className="loading-list">{[1,2,3].map(i => <div key={i} className="post-skeleton" style={{height:80}}/>)}</div>
          ) : myPosts.length === 0 ? (
            <div className="empty-posts">
              <FileText size={40} strokeWidth={1}/>
              <p>You haven't written any posts yet.</p>
              <Link to="/create"><button className="btn-primary">Write your first post →</button></Link>
            </div>
          ) : (
            <div className="my-posts-list">
              {myPosts.map(post => (
                <div key={post.id} className="my-post-item card fade-in">
                  <div className="my-post-info">
                    <span className={`badge ${post.status === 'published' ? 'badge-green' : 'badge-gray'}`}>{post.status}</span>
                    <h3><Link to={`/posts/${post.slug}`}>{post.title}</Link></h3>
                    <div className="my-post-meta">
                      <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>· {post.views || 0} views</span>
                      <span>· {post.comment_count || 0} comments</span>
                    </div>
                  </div>
                  <div className="my-post-actions">
                    <Link to={`/edit/${post.id}`}><button className="btn-ghost"><Edit2 size={14}/> Edit</button></Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
