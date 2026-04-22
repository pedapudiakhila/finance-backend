import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="navbar">
      <h1>💰 Finance Dashboard</h1>
      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/records">Records</Link>
        {user.role === 'ADMIN' && <Link to="/users">Users</Link>}
        <span style={{opacity: 0.7, fontSize: '13px'}}>
          {user.name} ({user.role})
        </span>
        <button className="btn btn-sm" onClick={logout}
          style={{background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)'}}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;