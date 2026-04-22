import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      toast.success(`Welcome back, ${res.data.data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-logo">
          <motion.div
            className="auth-logo-icon"
            animate={{ boxShadow: ['0 12px 40px rgba(99,102,241,0.35)', '0 12px 60px rgba(99,102,241,0.55)', '0 12px 40px rgba(99,102,241,0.35)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >💰</motion.div>
          <div className="auth-title">FinanceOS</div>
          <div className="auth-subtitle">Financial Dashboard System</div>
        </div>

        <div className="auth-heading">Welcome back</div>
        <div className="auth-desc">Sign in to your account to continue</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" value={form.email}
              placeholder="you@example.com"
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password}
              placeholder="••••••••"
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <motion.button
            className="btn btn-primary"
            type="submit"
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text3)' }}>
          No account? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
        </p>

        <div className="demo-box">
          <strong>Quick login:</strong><br />
          <span style={{ cursor: 'pointer', color: '#818cf8' }} onClick={() => fillDemo('admin@finance.com', 'admin123')}>
            Admin →
          </span> admin@finance.com / admin123<br />
          <span style={{ cursor: 'pointer', color: '#22d3ee' }} onClick={() => fillDemo('analyst@finance.com', 'analyst123')}>
            Analyst →
          </span> analyst@finance.com / analyst123<br />
          <span style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => fillDemo('viewer@finance.com', 'viewer123')}>
            Viewer →
          </span> viewer@finance.com / viewer123
        </div>
      </motion.div>
    </div>
  );
}