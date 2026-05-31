import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PenLine, LogOut, Menu, X, Shield, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">✒</span>
          <span className="brand-text">Inkwell</span>
        </Link>

        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/posts">Articles</Link>
          {user && <Link to="/create">Write</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="admin-link"><Shield size={14}/> Admin</Link>}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
              <button className="user-btn">
                <div className="user-avatar">{user.username?.[0]?.toUpperCase()}</div>
                <span className="user-name">{user.username}</span>
              </button>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <Link to="/profile"><User size={15}/> Profile</Link>
                  <Link to="/create"><PenLine size={15}/> New Post</Link>
                  {user.role === 'admin' && <Link to="/admin"><Shield size={15}/> Admin Panel</Link>}
                  <hr/>
                  <button onClick={handleLogout}><LogOut size={15}/> Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login"><button className="btn-secondary">Sign In</button></Link>
              <Link to="/register"><button className="btn-primary">Get Started</button></Link>
            </div>
          )}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/posts" onClick={() => setMenuOpen(false)}>Articles</Link>
          {user && <Link to="/create" onClick={() => setMenuOpen(false)}>Write</Link>}
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
