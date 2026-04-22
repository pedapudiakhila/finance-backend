import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../api';

export default function Records() {
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', search: '', page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form, setForm] = useState({ amount: '', type: 'INCOME', category: '', date: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('limit', 10);
      const res = await API.get(`/records?${params}`);
      setRecords(res.data.data.data);
      setMeta(res.data.data.meta);
    } catch {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const openCreate = () => {
    setEditRecord(null);
    setForm({ amount: '', type: 'INCOME', category: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditRecord(r);
    setForm({ amount: r.amount, type: r.type, category: r.category, date: r.date?.split('T')[0], notes: r.notes || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount), date: new Date(form.date).toISOString() };
      if (editRecord) {
        await API.patch(`/records/${editRecord._id}`, payload);
        toast.success('Record updated');
      } else {
        await API.post('/records', payload);
        toast.success('Record created');
      }
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await API.delete(`/records/${id}`);
      toast.success('Record deleted');
      fetchRecords();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <div className="page-title">Records</div>
          <div className="page-subtitle">{meta.total || 0} financial entries</div>
        </div>
        {user.role === 'ADMIN' && (
          <motion.button className="btn btn-primary" onClick={openCreate} whileTap={{ scale: 0.97 }}>
            + New Record
          </motion.button>
        )}
      </motion.div>

      <motion.div className="filters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <select className="filter-select" value={filters.type}
          onChange={e => setFilters({ ...filters, type: e.target.value, page: 1 })}>
          <option value="">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        <input className="filter-input" placeholder="Search category or notes..."
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })}
          style={{ minWidth: '220px' }} />
      </motion.div>

      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        {loading ? <div className="spinner" /> : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◈</div>
            <p>No records found</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Notes</th>
                  {user.role === 'ADMIN' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {records.map((r, i) => (
                    <motion.tr key={r._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <td style={{ color: 'var(--text)', fontWeight: 600 }}>{r.category}</td>
                      <td><span className={`badge badge-${r.type.toLowerCase()}`}>{r.type}</span></td>
                      <td style={{ fontWeight: 700, color: r.type === 'INCOME' ? 'var(--income)' : 'var(--expense)' }}>
                        {r.type === 'INCOME' ? '+' : '-'}₹{Number(r.amount).toLocaleString()}
                      </td>
                      <td>{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text3)' }}>
                        {r.notes || '—'}
                      </td>
                      {user.role === 'ADMIN' && (
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>Delete</button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <span className="pagination-info">
            Page {meta.page || 1} of {meta.totalPages || 1} · {meta.total || 0} records
          </span>
          <div className="pagination-btns">
            <button className="btn btn-ghost btn-sm"
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={!meta.hasPrev}>← Prev</button>
            <button className="btn btn-ghost btn-sm"
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={!meta.hasNext}>Next →</button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div className="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title">{editRecord ? 'Edit Record' : 'New Record'}</div>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <div className="form-group">
                    <label className="form-label">Amount (₹)</label>
                    <input className="form-input" type="number" step="0.01" value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="INCOME">Income</option>
                      <option value="EXPENSE">Expense</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="form-input" type="text" value={form.category} placeholder="e.g. Salary, Rent"
                    onChange={e => setForm({ ...form, category: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span></label>
                  <input className="form-input" type="text" value={form.notes} placeholder="Add a note..."
                    onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <motion.button className="btn btn-primary" type="submit" style={{ flex: 1, justifyContent: 'center' }}
                    disabled={saving} whileTap={{ scale: 0.97 }}>
                    {saving ? 'Saving...' : editRecord ? 'Update Record' : 'Create Record'}
                  </motion.button>
                  <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}