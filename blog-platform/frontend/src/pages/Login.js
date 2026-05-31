import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration">
        <div className="auth-quote">
          <span className="quote-mark">"</span>
          <p>Every great story begins with a single, courageous word.</p>
          <cite>— Inkwell</cite>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-box fade-in">
          <div className="auth-logo">✒ Inkwell</div>
          <h1>Welcome back</h1>
          <p className="auth-sub">Sign in to continue your journey</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon"/>
                <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required/>
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon"/>
                <input name="password" type={showPass ? 'text' : 'password'} placeholder="Your password" value={form.password} onChange={handleChange} required/>
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
              {loading ? <span className="spinner" style={{width:18,height:18}}/> : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <div className="auth-hint admin-hint">
            <strong>Demo Admin:</strong> admin@blog.com / admin123
          </div>

          <p className="auth-switch">Don't have an account? <Link to="/register">Create one →</Link></p>
        </div>
      </div>
    </div>
  );
}
