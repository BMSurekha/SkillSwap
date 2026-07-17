import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { 
  Users, 
  Star, 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, refreshProfile } = useAuth();
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await refreshProfile();
      const matchData = await api.matchmaking.getMatches();
      const reqData = await api.requests.get();
      const sessData = await api.sessions.getUpcoming();
      
      setMatches(matchData.slice(0, 3)); // show top 3 matches
      setRequests(reqData.filter(r => r.receiverId === user.id && r.status === 'PENDING'));
      setSessions(sessData.slice(0, 3));
    } catch (e) {
      console.error("Error loading dashboard details:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      await api.requests.updateStatus(requestId, status);
      loadDashboardData();
    } catch (e) {
      alert("Error updating request: " + e.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <h3>Loading Dashboard...</h3>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div className="card-glass" style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
        color: 'white',
        border: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', color: 'white', marginBottom: '0.5rem' }}>Hello, {user.fullName}!</h1>
          <p style={{ opacity: 0.9, fontSize: '1rem', maxWidth: '600px' }}>
            Ready to exchange skills? Explore your recommended smart matches below or manage your upcoming sessions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/search" className="btn" style={{ backgroundColor: 'white', color: 'var(--primary)' }}>
            Find Partners <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* Quick Statistics Grid */}
      <div className="grid-4">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user.completedExchanges || 0}</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Completed Exchanges</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Star size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user.averageRating ? user.averageRating.toFixed(1) : '5.0'}</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Average Rating</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user.skillsOffered ? user.skillsOffered.length : 0}</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Skills Offered</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{sessions.length}</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Upcoming Sessions</span>
          </div>
        </div>
      </div>

      {/* Main Section Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Recommended Matches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Smart Matches</h3>
            <Link to="/search" style={{ fontSize: '0.875rem', fontWeight: 600 }}>View All</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {matches.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <AlertCircle size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '0.75rem' }} />
                <h4>No Matches Found Yet</h4>
                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Add more skills to your profile to generate intelligent match recommendations!</p>
                <Link to="/profile" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Configure Profile</Link>
              </div>
            ) : (
              matches.map(m => (
                <div key={m.user.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <img src={m.user.avatarUrl} alt={m.user.fullName} style={{ width: '60px', height: '60px', borderRadius: '14px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }} />
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{m.user.fullName}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.user.location || 'Remote'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', color: 'var(--warning)', fontSize: '0.85rem', fontWeight: 600 }}>
                          <Star size={14} fill="var(--warning)" /> {m.user.averageRating ? m.user.averageRating.toFixed(1) : '5.0'} ({m.user.completedExchanges} exchanges)
                        </div>
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}>
                      {m.compatibilityPercentage}% Match
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      <strong>Mutual Interests:</strong> {m.mutualSkills.join(', ')}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {m.user.skillsOffered.map(s => (
                        <span key={s.skillId} className="badge badge-info">Teaches: {s.name}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <Link to={`/chat?partnerId=${m.user.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                      <MessageSquare size={16} /> Chat
                    </Link>
                    <button 
                      onClick={async () => {
                        try {
                          await api.requests.create(m.user.id);
                          alert("Exchange request sent!");
                          loadDashboardData();
                        } catch (err) {
                          alert(err.message);
                        }
                      }} 
                      className="btn btn-primary" 
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Requests & Upcoming Sessions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Incoming Requests */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Pending Requests ({requests.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                  No pending exchange requests.
                </div>
              ) : (
                requests.map(r => (
                  <div key={r.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={r.senderAvatar} alt={r.senderName} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                      <div>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{r.senderName}</h5>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Wants to swap skills</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleRequestAction(r.id, 'ACCEPTED')} className="btn btn-primary" style={{ flexGrow: 1, padding: '0.4rem 0.5rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                        Accept
                      </button>
                      <button onClick={() => handleRequestAction(r.id, 'REJECTED')} className="btn btn-secondary" style={{ flexGrow: 1, padding: '0.4rem 0.5rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Upcoming Sessions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sessions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                  No scheduled sessions.
                </div>
              ) : (
                sessions.map(s => (
                  <div key={s.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{s.title}</h5>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} /> <span>{new Date(s.dateTime).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <Clock size={14} /> <span>{new Date(s.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({s.durationMinutes} mins)</span>
                    </div>
                    <span className="badge badge-info" style={{ alignSelf: 'flex-start', fontSize: '0.7rem' }}>
                      {s.meetingMode}
                    </span>
                    {s.meetingMode === 'ONLINE' && s.meetingLink && (
                      <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.4rem', fontSize: '0.8rem', borderRadius: '8px', marginTop: '0.25rem' }}>
                        Join Meeting
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
