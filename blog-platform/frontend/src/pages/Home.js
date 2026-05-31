import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import PostCard from '../components/PostCard';
import { ArrowRight, Feather, Users, BookOpen } from 'lucide-react';
import './Home.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/posts?limit=6').then(res => setPosts(res.data.posts || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge"><Feather size={14}/> The Modern Writer's Platform</div>
          <h1 className="hero-title">Stories Worth<br/><em>Reading.</em></h1>
          <p className="hero-subtitle">A space for thoughtful writers and curious readers. Share ideas, explore perspectives, and join a community that values words.</p>
          <div className="hero-ctas">
            <Link to="/posts"><button className="btn-primary">Explore Articles <ArrowRight size={16}/></button></Link>
            <Link to="/register"><button className="btn-secondary">Start Writing</button></Link>
          </div>
          <div className="hero-stats">
            <div><strong>250+</strong><span>Articles</span></div>
            <div><strong>1.2k</strong><span>Readers</span></div>
            <div><strong>50+</strong><span>Writers</span></div>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="deco-ring deco-ring-1"></div>
          <div className="deco-ring deco-ring-2"></div>
          <div className="deco-quote">"The pen is mightier than the sword."</div>
        </div>
      </section>

      {/* Features strip */}
      <section className="features-strip">
        <div className="feature-item"><BookOpen size={20}/><span>Rich articles on every topic</span></div>
        <div className="feature-divider">·</div>
        <div className="feature-item"><Users size={20}/><span>Active commenting community</span></div>
        <div className="feature-divider">·</div>
        <div className="feature-item"><Feather size={20}/><span>Publish your own stories</span></div>
      </section>

      {/* Latest Posts */}
      <section className="latest-posts">
        <div className="section-header">
          <h2>Latest Articles</h2>
          <Link to="/posts">View all <ArrowRight size={15}/></Link>
        </div>
        {loading ? (
          <div className="loading-grid">{[1,2,3].map(i => <div key={i} className="post-skeleton"/>)}</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <Feather size={48} strokeWidth={1}/>
            <h3>No articles yet</h3>
            <p>Be the first to share your story.</p>
            <Link to="/create"><button className="btn-primary">Write Now</button></Link>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map(post => <PostCard key={post.id} post={post}/>)}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-inner">
          <h2>Ready to share your voice?</h2>
          <p>Join hundreds of writers on Inkwell. Your stories matter.</p>
          <Link to="/register"><button className="btn-primary">Create Account →</button></Link>
        </div>
      </section>
    </div>
  );
}
