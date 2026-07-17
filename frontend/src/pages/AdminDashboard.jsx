import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Users, BookOpen, RefreshCw, Trash2, ShieldAlert, Award, TrendingUp, BarChart2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const analytics = await api.admin.getAnalytics();
      setStats(analytics);
      
      const list = await api.admin.getUsers();
      setUsersList(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm("Are you sure you want to permanently delete this user account?")) {
      try {
        await api.admin.removeUser(userId);
        alert("User account removed successfully.");
        loadAdminData();
      } catch (err) {
        alert("Failed to delete user: " + err.message);
      }
    }
  };

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <h3>Loading Administrator Dashboard...</h3>
      </div>
    );
  }

  // Calculate percentages for bars
  const maxSkillCount = Math.max(...Object.values(stats.popularSkills), 1);
  const maxCategoryCount = Math.max(...Object.values(stats.categoryDistribution), 1);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Admin Hub</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monitor platform activity, analytics, and manage accounts</p>
        </div>
        <button onClick={loadAdminData} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Analytics Counter Grid */}
      <div className="grid-4">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.totalUsers}</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Registered</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
            <Users size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.activeUsers}</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Swappers</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.totalSkills}</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System Skills</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.pendingReports}</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reported Accounts</span>
          </div>
        </div>
      </div>

      {/* Analytics Graphs & Distribution */}
      <div className="grid-2">
        
        {/* Popular Skills Bar Graph */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} style={{ color: 'var(--warning)' }} /> Top Skill Interests
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(stats.popularSkills).map(([skill, count]) => {
              const pct = (count / maxSkillCount) * 100;
              return (
                <div key={skill}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{skill}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} additions</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--primary)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={18} style={{ color: 'var(--primary)' }} /> Category Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(stats.categoryDistribution).map(([category, count]) => {
              const pct = (count / maxCategoryCount) * 100;
              return (
                <div key={category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{category}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} swaps</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--success)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* User Management List */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Registered Users Management</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Member Info</th>
                <th style={{ padding: '0.75rem 1rem' }}>Email Address</th>
                <th style={{ padding: '0.75rem 1rem' }}>Location</th>
                <th style={{ padding: '0.75rem 1rem' }}>Swaps Completed</th>
                <th style={{ padding: '0.75rem 1rem' }}>Security Role</th>
                <th style={{ padding: '0.75rem 1rem', textRight: 'true' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={u.avatarUrl} alt={u.fullName} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <span style={{ fontWeight: 600 }}>{u.fullName}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{u.location || 'N/A'}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.completedExchanges || 0} swaps</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : 'badge-info'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Remove Account"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
