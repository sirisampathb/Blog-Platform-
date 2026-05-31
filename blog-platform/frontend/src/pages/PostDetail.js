import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Heart, Eye, MessageCircle, Trash2, Edit, Send, ArrowLeft, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import './PostDetail.css';

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const loadPost = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get(`/posts/${slug}`),
      api.get(`/posts/${slug}/comments`),
    ]).then(([postRes, commRes]) => {
      setPost(postRes.data);
      setLiked(!!postRes.data.user_liked);
      setLikeCount(postRes.data.like_count || 0);
      setComments(commRes.data);
    }).catch(() => navigate('/posts')).finally(() => setLoading(false));
  }, [slug, navigate]);

  useEffect(() => { loadPost(); }, [loadPost]);

  const handleLike = async () => {
    if (!user) { toast.error('Sign in to like posts'); return; }
    try {
      const res = await api.post(`/posts/${post.id}/like`);
      setLiked(res.data.liked);
      setLikeCount(c => res.data.liked ? c + 1 : c - 1);
    } catch {}
  };

  const handleComment = async e => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!user) { toast.error('Sign in to comment'); return; }
    try {
      const res = await api.post(`/posts/${post.id}/comments`, { content: comment });
      setComments(c => [...c, res.data]);
      setComment('');
      toast.success('Comment added!');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const deleteComment = async (id) => {
    try {
      await api.delete(`/posts/${post.id}/comments/${id}`);
      setComments(c => c.filter(x => x.id !== id));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const deletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      toast.success('Post deleted');
      navigate('/posts');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="post-detail-loading"><div className="spinner" style={{width:40,height:40}}/></div>;
  if (!post) return null;

  const readTime = Math.max(1, Math.ceil((post.content || '').split(' ').length / 200));
  const date = new Date(post.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const canEdit = user && (user.id === post.author_id || user.role === 'admin');

  return (
    <div className="post-detail">
      <div className="post-detail-inner">
        <div className="post-nav">
          <Link to="/posts" className="back-link"><ArrowLeft size={16}/> All Articles</Link>
          {canEdit && (
            <div className="post-actions">
              <Link to={`/edit/${post.id}`}><button className="btn-secondary"><Edit size={15}/> Edit</button></Link>
              <button className="btn-danger" onClick={deletePost}><Trash2 size={15}/> Delete</button>
            </div>
          )}
        </div>

        <article className="post-article">
          <header className="post-header">
            <div className="post-header-meta">
              <span className="badge badge-accent">{post.category}</span>
              <span className="post-date-detail">{date}</span>
              <span className="post-readtime-detail"><Clock size={13}/> {readTime} min read</span>
            </div>
            <h1 className="post-title">{post.title}</h1>
            <div className="post-author-row">
              <div className="author-avatar-lg">{(post.author_name || 'A')[0].toUpperCase()}</div>
              <div>
                <div className="author-name-detail">{post.author_name}</div>
                {post.author_bio && <div className="author-bio-detail">{post.author_bio}</div>}
              </div>
            </div>
          </header>

          <div className="post-stats-bar">
            <button className={`stat-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
              <Heart size={16} fill={liked ? 'currentColor' : 'none'}/> {likeCount}
            </button>
            <span className="stat-item"><Eye size={16}/> {post.views || 0}</span>
            <span className="stat-item"><MessageCircle size={16}/> {comments.length}</span>
          </div>

          <hr className="divider"/>
          <div className="post-body">{post.content}</div>

          {post.tags && (() => {
            try {
              const tags = JSON.parse(post.tags);
              return tags.length > 0 ? (
                <div className="post-tags">
                  {tags.map(tag => <span key={tag} className="badge badge-gray">#{tag}</span>)}
                </div>
              ) : null;
            } catch { return null; }
          })()}
        </article>

        <section className="comments-section">
          <h3 className="comments-title"><MessageCircle size={20}/> {comments.length} Comment{comments.length !== 1 ? 's' : ''}</h3>

          {user ? (
            <form onSubmit={handleComment} className="comment-form">
              <div className="comment-form-header">
                <div className="author-avatar-sm" style={{background:'var(--accent)'}}>{user.username[0].toUpperCase()}</div>
                <span className="comment-as">Commenting as <strong>{user.username}</strong></span>
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts..." rows={3} required/>
              <div className="comment-form-footer">
                <button type="submit" className="btn-primary comment-submit"><Send size={15}/> Post Comment</button>
              </div>
            </form>
          ) : (
            <div className="comment-login-prompt">
              <Link to="/login"><button className="btn-primary">Sign in to comment</button></Link>
            </div>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments"><MessageCircle size={32} strokeWidth={1}/><p>Be the first to comment!</p></div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="comment-item fade-in">
                  <div className="comment-avatar">{(c.author_name || 'A')[0].toUpperCase()}</div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <strong>{c.author_name}</strong>
                      <span className="comment-date">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <p className="comment-text">{c.content}</p>
                  </div>
                  {user && (user.id === c.author_id || user.role === 'admin') && (
                    <button className="btn-ghost comment-delete" onClick={() => deleteComment(c.id)}><Trash2 size={14}/></button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
