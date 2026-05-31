import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Eye, Clock } from 'lucide-react';
import './PostCard.css';

export default function PostCard({ post }) {
  const date = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const readTime = Math.max(1, Math.ceil((post.content || '').split(' ').length / 200));

  return (
    <article className="post-card fade-in">
      <div className="post-card-body">
        <div className="post-card-meta">
          <span className="badge badge-accent">{post.category || 'General'}</span>
          <span className="post-date">{date}</span>
          <span className="post-readtime"><Clock size={12}/> {readTime} min read</span>
        </div>
        <h2 className="post-card-title">
          <Link to={`/posts/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="post-card-excerpt">{post.excerpt || post.content?.substring(0, 140) + '...'}</p>
        <div className="post-card-footer">
          <div className="post-author">
            <div className="author-avatar-sm">{(post.author_name || 'A')[0].toUpperCase()}</div>
            <span>{post.author_name || 'Anonymous'}</span>
          </div>
          <div className="post-stats">
            <span><Eye size={14}/> {post.views || 0}</span>
            <span><Heart size={14}/> {post.like_count || 0}</span>
            <span><MessageCircle size={14}/> {post.comment_count || 0}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
