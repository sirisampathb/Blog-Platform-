import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Save, Eye } from 'lucide-react';
import './CreatePost.css';

const CATEGORIES = ['Technology', 'Writing', 'Lifestyle', 'Travel', 'Food', 'Announcement', 'General'];

export default function CreatePost() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ title: '', content: '', excerpt: '', category: 'General', tags: '', status: 'published' });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (isEdit) {
      api.get('/admin/posts').then(r => {
        const post = r.data.find(p => p.id === parseInt(id));
        if (post) {
          let tags = '';
          try { tags = JSON.parse(post.tags || '[]').join(', '); } catch {}
          setForm({ title: post.title, content: post.content, excerpt: post.excerpt || '', category: post.category || 'General', tags, status: post.status || 'published' });
        }
      }).catch(() => {});
    }
  }, [id, isEdit, user, navigate]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    try {
      if (isEdit) {
        await api.put(`/posts/${id}`, { ...form, tags });
        toast.success('Post updated!');
        navigate(-1);
      } else {
        const res = await api.post('/posts', { ...form, tags });
        toast.success('Post published!');
        navigate(`/posts/${res.data.slug}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <div className="create-post-page">
      <div className="create-post-inner">
        <div className="create-post-header">
          <h1>{isEdit ? 'Edit Post' : 'Write New Post'}</h1>
          <div className="create-post-actions">
            <button type="button" className="btn-secondary" onClick={() => setPreview(!preview)}>
              <Eye size={15}/> {preview ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>

        {preview ? (
          <div className="post-preview">
            <div className="badge badge-accent">{form.category}</div>
            <h2>{form.title || 'Untitled Post'}</h2>
            <p className="preview-content">{form.content}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="create-post-form">
            <div className="form-row">
              <div className="form-group" style={{flex: 2}}>
                <label>Post Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Enter a compelling title..." required/>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Content *</label>
              <textarea name="content" value={form.content} onChange={handleChange} placeholder="Write your story..." rows={16} required style={{resize:'vertical'}}/>
            </div>

            <div className="form-row">
              <div className="form-group" style={{flex:1}}>
                <label>Excerpt <small>(optional short summary)</small></label>
                <textarea name="excerpt" value={form.excerpt} onChange={handleChange} placeholder="Brief summary shown in listings..." rows={3}/>
              </div>
              <div className="form-group" style={{flex:1}}>
                <div className="form-group">
                  <label>Tags <small>(comma separated)</small></label>
                  <input name="tags" value={form.tags} onChange={handleChange} placeholder="technology, writing, ideas"/>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="create-post-footer">
              <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="spinner" style={{width:16,height:16}}/> : <><Save size={15}/> {isEdit ? 'Save Changes' : 'Publish Post'}</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
