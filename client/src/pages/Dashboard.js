import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import API from '../api';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
        <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 600 }}>₹{Number(p.value).toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard')
      .then(res => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;
  if (!data) return <div className="alert alert-error">Failed to load dashboard</div>;

  const monthlyChartData = data.monthlyTrend?.reduce((acc, item) => {
    const key = `${item.year}-${String(item.month).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = { month: key, income: 0, expense: 0 };
    if (item.type === 'INCOME') acc[key].income = item.total;
    else acc[key].expense = item.total;
    return acc;
  }, {});

  const chartData = monthlyChartData ? Object.values(monthlyChartData) : [];

  const categoryData = data.categoryBreakdown?.slice(0, 6).map(c => ({
    name: c.category,
    value: c.total,
    type: c.type,
  })) || [];

  const balance = data.summary?.netBalance || 0;

  return (
    <div>
      <motion.div className="page-header" {...fadeUp(0)}>
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Your financial overview at a glance</div>
        </div>
      </motion.div>

      <div className="stats-grid">
        {[
          {
            label: 'Total Income', icon: '↑', cls: 'income-card',
            value: data.summary?.totalIncome || 0, valCls: 'income', sub: 'All time earnings'
          },
          {
            label: 'Total Expenses', icon: '↓', cls: 'expense-card',
            value: data.summary?.totalExpense || 0, valCls: 'expense', sub: 'All time spending'
          },
          {
            label: 'Net Balance', icon: '◈', cls: 'balance-card',
            value: Math.abs(balance), valCls: balance >= 0 ? 'balance-pos' : 'balance-neg',
            sub: balance >= 0 ? 'Positive balance' : 'Negative balance',
            prefix: balance < 0 ? '-' : ''
          },
        ].map((s, i) => (
          <motion.div key={s.label} className={`stat-card ${s.cls}`} {...fadeUp(i * 0.1)}>
            <div className="stat-label">
              <span className="stat-icon" style={{
                background: s.valCls === 'income' ? 'rgba(16,185,129,0.15)' :
                  s.valCls === 'expense' ? 'rgba(244,63,94,0.15)' : 'rgba(99,102,241,0.15)'
              }}>{s.icon}</span>
              {s.label}
            </div>
            <div className={`stat-value count-up ${s.valCls}`}>
              {s.prefix}₹<CountUp end={s.value} duration={1.5} separator="," decimals={0} />
            </div>
            <div className="stat-sub">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <motion.div className="card" style={{ marginBottom: 20 }} {...fadeUp(0.3)}>
        <div className="section-header">
          <div className="section-title">Monthly Trends</div>
        </div>
        <div className="chart-container" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#gIncome)" />
              <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fill="url(#gExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center' }}>
          {[['#10b981', 'Income'], ['#f43f5e', 'Expenses']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text3)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'block' }} />
              {label}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="two-col">
        <motion.div className="card" {...fadeUp(0.4)}>
          <div className="section-header">
            <div className="section-title">Recent Activity</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentActivity?.slice(0, 6).map(r => (
                  <tr key={r._id}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{r.category}</td>
                    <td><span className={`badge badge-${r.type.toLowerCase()}`}>{r.type}</span></td>
                    <td style={{ fontWeight: 600 }}>₹{Number(r.amount).toLocaleString()}</td>
                    <td>{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div className="card" {...fadeUp(0.5)}>
          <div className="section-header">
            <div className="section-title">Category Breakdown</div>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.type === 'INCOME' ? '#10b981' : '#f43f5e'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}