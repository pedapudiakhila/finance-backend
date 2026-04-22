import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/register', form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-logo">
          <div className="auth-logo-icon">💰</div>
          <div className="auth-title">FinanceOS</div>
          <div className="auth-subtitle">Financial Dashboard System</div>
        </div>

        <div className="auth-heading">Create account</div>
        <div className="auth-desc">Start managing your finances today</div>

        <form onSubmit={handleSubmit}>
          {[
            { key: 'name', label: 'Full name', type: 'text', placeholder: 'John Doe' },
            { key: 'email', label: 'Email address', type: 'email', placeholder: 'john@example.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
          ].map(({ key, label, type, placeholder }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <input className="form-input" type={type} value={form[key]}
                placeholder={placeholder}
                onChange={e => setForm({ ...form, [key]: e.target.value })} required />
            </div>
          ))}
          <motion.button
            className="btn btn-primary"
            type="submit"
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Creating...' : 'Create Account →'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text3)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}