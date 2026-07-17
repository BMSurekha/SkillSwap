import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Mail, Check, X, Ban, ExternalLink, Calendar, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('received'); // received, sent
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const list = await api.requests.get();
      setRequests(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      await api.requests.updateStatus(requestId, status);
      loadRequests();
    } catch (e) {
      alert("Error updating request: " + e.message);
    }
  };

  const receivedRequests = requests.filter(r => r.receiverId === user.id);
  const sentRequests = requests.filter(r => r.senderId === user.id);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'ACCEPTED': return 'badge-info';
      case 'REJECTED': return 'badge-danger';
      case 'CANCELLED': return 'badge-danger';
      case 'COMPLETED': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Exchange Proposals</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', pb: '1rem' }}>
        <button
          onClick={() => setActiveTab('received')}
          style={{
            background: 'none',
            border: 'none',
            padding: '1rem 0.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            color: activeTab === 'received' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'received' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Received Proposals ({receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          style={{
            background: 'none',
            border: 'none',
            padding: '1rem 0.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            color: activeTab === 'sent' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'sent' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Sent Proposals ({sentRequests.length})
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <h4>Loading Requests...</h4>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activeTab === 'received' ? (
            receivedRequests.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                No exchange requests received yet.
              </div>
            ) : (
              receivedRequests.map(r => (
                <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={r.senderAvatar} alt={r.senderName} style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{r.senderName}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Proposed on {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span className={`badge ${getStatusBadgeClass(r.status)}`}>{r.status}</span>
                    
                    {r.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleUpdateStatus(r.id, 'ACCEPTED')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                          <Check size={14} /> Accept
                        </button>
                        <button onClick={() => handleUpdateStatus(r.id, 'REJECTED')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px', color: 'var(--danger)' }}>
                          <X size={14} /> Decline
                        </button>
                      </div>
                    )}

                    {r.status === 'ACCEPTED' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/chat?partnerId=${r.senderId}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                          <MessageSquare size={14} /> Chat
                        </Link>
                        <Link to={`/schedule?requestId=${r.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                          <Calendar size={14} /> Schedule
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            sentRequests.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                No exchange requests sent yet.
              </div>
            ) : (
              sentRequests.map(r => (
                <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={r.receiverAvatar} alt={r.receiverName} style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{r.receiverName}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Proposed on {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span className={`badge ${getStatusBadgeClass(r.status)}`}>{r.status}</span>
                    
                    {r.status === 'PENDING' && (
                      <button onClick={() => handleUpdateStatus(r.id, 'CANCELLED')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px', color: 'var(--danger)' }}>
                        <Ban size={14} /> Cancel
                      </button>
                    )}

                    {r.status === 'ACCEPTED' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/chat?partnerId=${r.receiverId}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                          <MessageSquare size={14} /> Chat
                        </Link>
                        <Link to={`/schedule?requestId=${r.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                          <Calendar size={14} /> Schedule
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}

    </div>
  );
}
