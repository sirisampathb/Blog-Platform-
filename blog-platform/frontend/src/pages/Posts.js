import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import PostCard from '../components/PostCard';
import { Search, Filter } from 'lucide-react';
import './Posts.css';

const CATEGORIES = ['All', 'Technology', 'Writing', 'Lifestyle', 'Travel', 'Food', 'Announcement', 'General'];

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (search) params.set('search', search);
      if (category && category !== 'All') params.set('category', category);
      const res = await api.get(`/posts?${params}`);
      setPosts(res.data.posts || []);
      setTotalPages(res.data.pages || 1);
    } finally { setLoading(false); }
  }, [page, category, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleCategoryChange = (cat) => {
    setCategory(cat === 'All' ? '' : cat);
    setPage(1);
  };

  const handleSearch = e => { e.preventDefault(); setPage(1); fetchPosts(); };

  return (
    <div className="posts-page">
      <div className="posts-hero">
        <h1>All Articles</h1>
        <p>Discover stories, ideas, and expertise</p>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrap">
            <Search size={18}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..."/>
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      <div className="posts-content">
        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`cat-btn ${(category === cat || (cat === 'All' && !category)) ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div className="posts-grid">{[1,2,3,4,5,6].map(i => <div key={i} className="post-skeleton"/>)}</div>
        ) : posts.length === 0 ? (
          <div className="empty-state"><Filter size={48} strokeWidth={1}/><h3>No articles found</h3><p>Try a different search or category.</p></div>
        ) : (
          <>
            <div className="posts-grid">{posts.map(post => <PostCard key={post.id} post={post}/>)}</div>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button className="btn-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
