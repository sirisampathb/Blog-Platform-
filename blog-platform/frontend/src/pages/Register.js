import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const data = await register(form.username, form.email, form.password);
      toast.success(`Welcome to Inkwell, ${data.user.username}!`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration">
        <div className="auth-quote">
          <span className="quote-mark">"</span>
          <p>A writer only begins a book. A reader finishes it.</p>
          <cite>— Samuel Johnson</cite>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-box fade-in">
          <div className="auth-logo">✒ Inkwell</div>
          <h1>Create account</h1>
          <p className="auth-sub">Join our community of writers and readers</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <div className="input-icon-wrap">
                <User size={16} className="input-icon"/>
                <input name="username" placeholder="yourname" value={form.username} onChange={handleChange} required/>
              </div>
            </div>
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
                <input name="password" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={handleChange} required/>
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
              {loading ? <span className="spinner" style={{width:18,height:18}}/> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in →</Link></p>
        </div>
      </div>
    </div>
  );
}
