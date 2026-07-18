import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Search as SearchIcon, MapPin, Star, Filter, MessageSquare, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Search() {
  const [skillName, setSkillName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadRequests();
    handleSearch();
  }, []);

  const loadCategories = async () => {
    try {
      const list = await api.lists.categories();
      setCategories(list);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRequests = async () => {
    try {
      const list = await api.requests.get();
      setRequests(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const data = await api.matchmaking.search(skillName, selectedCategory, location);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await api.requests.create(userId);
      alert("Exchange proposal request sent successfully!");
      loadRequests();
    } catch (err) {
      alert("Error sending request: " + err.message);
    }
  };

  const getConnectionStatus = (targetUserId) => {
    const user = JSON.parse(localStorage.getItem('skillswap_user'));
    if (!user) return 'NONE';
    const req = requests.find(q => 
      (Number(q.senderId) === Number(user.id) && Number(q.receiverId) === Number(targetUserId)) ||
      (Number(q.senderId) === Number(targetUserId) && Number(q.receiverId) === Number(user.id))
    );
    if (!req) return 'NONE';
    return req.status; // 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Search Exchanges</h1>

      {/* Filter and Search Bar Card */}
      <div className="card">
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Skill</label>
            <div style={{ position: 'relative' }}>
              <SearchIcon size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="e.g. React, Spanish, Photography..."
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select className="form-input" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Location</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Madrid, London..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <Filter size={16} /> Search
          </button>
        </form>
      </div>

      {/* Results grid */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          {loading ? 'Searching...' : `Search Results (${results.length})`}
        </h3>

        {results.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No users match your criteria. Try widening your search filters.
          </div>
        ) : (
          <div className="grid-3">
            {results.map(r => (
              <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <img
                    src={r.avatarUrl}
                    alt={r.fullName}
                    style={{ width: '50px', height: '50px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{r.fullName}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                      <MapPin size={12} /> {r.location || 'Remote'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem', fontWeight: 600 }}>
                      <Star size={12} fill="var(--warning)" /> {r.averageRating ? r.averageRating.toFixed(1) : '5.0'} ({r.completedExchanges} swaps)
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem', flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  {r.bio || "No biography provided."}
                </p>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Teaches:</span>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {r.skillsOffered.length === 0 ? <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>None</span> : 
                        r.skillsOffered.map(s => <span key={s.skillId} className="badge badge-info" style={{ fontSize: '0.65rem' }}>{s.name}</span>)
                      }
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Wants:</span>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {r.skillsWanted.length === 0 ? <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>None</span> : 
                        r.skillsWanted.map(s => <span key={s.skillId} className="badge badge-success" style={{ fontSize: '0.65rem' }}>{s.name}</span>)
                      }
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <Link to={`/chat?partnerId=${r.id}`} className="btn btn-secondary" style={{ flexGrow: 1, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                    <MessageSquare size={14} /> Message
                  </Link>
                  {(() => {
                    const status = getConnectionStatus(r.id);
                    if (status === 'PENDING') {
                      return (
                        <button className="btn btn-secondary" style={{ flexGrow: 1, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }} disabled>
                          Requested
                        </button>
                      );
                    }
                    if (status === 'ACCEPTED') {
                      return (
                        <button className="btn btn-success" style={{ flexGrow: 1, padding: '0.5rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }} disabled>
                          ✓ Connected
                        </button>
                      );
                    }
                    return (
                      <button onClick={() => handleConnect(r.id)} className="btn btn-primary" style={{ flexGrow: 1, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                        <Plus size={14} /> Connect
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
