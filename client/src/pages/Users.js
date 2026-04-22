import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (id, role) => {
    try {
      await API.patch(`/users/${id}/role`, { role });
      toast.success('Role updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await API.patch(`/users/${id}/status`);
      toast.success('Status updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  const roleColors = { ADMIN: '#818cf8', ANALYST: '#22d3ee', VIEWER: '#94a3b8' };

  return (
    <div>
      <motion.div className="page-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <div className="page-title">Users</div>
          <div className="page-subtitle">{users.length} team members</div>
        </div>
      </motion.div>

      {loading ? <div className="spinner" /> : (
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr key={u._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36,
                          background: `linear-gradient(135deg, ${roleColors[u.role]}33, ${roleColors[u.role]}66)`,
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: roleColors[u.role],
                          border: `1px solid ${roleColors[u.role]}44`,
                          flexShrink: 0,
                        }}>
                          {initials(u.name)}
                        </div>
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <select value={u.role}
                          onChange={e => changeRole(u._id, e.target.value)}
                          className="filter-select"
                          style={{ padding: '5px 10px', fontSize: 12 }}>
                          <option value="VIEWER">VIEWER</option>
                          <option value="ANALYST">ANALYST</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <motion.button
                          className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-ghost'}`}
                          onClick={() => toggleStatus(u._id)}
                          whileTap={{ scale: 0.95 }}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}