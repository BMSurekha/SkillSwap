import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Calendar, Clock, MapPin, Video, Check, Trash2, Star } from 'lucide-react';

export default function Schedule() {
  const [searchParams] = useSearchParams();
  const requestIdFromUrl = searchParams.get('requestId');
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [selectedRequest, setSelectedRequest] = useState(requestIdFromUrl || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [mode, setMode] = useState('ONLINE');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSessionId, setReviewSessionId] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    loadSessionsData();
  }, []);

  const loadSessionsData = async () => {
    setLoading(true);
    try {
      const list = await api.sessions.get();
      setSessions(list);

      const reqs = await api.requests.get();
      const accepted = reqs.filter(r => r.status === 'ACCEPTED');
      setAcceptedRequests(accepted);
      
      if (!selectedRequest && accepted.length > 0 && !requestIdFromUrl) {
        setSelectedRequest(accepted[0].id.toString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!selectedRequest) {
      alert("No accepted request selected. You must connect first!");
      return;
    }
    try {
      await api.sessions.schedule(selectedRequest, {
        title,
        description,
        dateTime,
        durationMinutes: parseInt(duration),
        meetingMode: mode,
        meetingLink,
        location
      });
      alert("Session scheduled successfully!");
      setTitle('');
      setDescription('');
      setDateTime('');
      setMeetingLink('');
      setLocation('');
      loadSessionsData();
    } catch (err) {
      alert("Failed to schedule: " + err.message);
    }
  };

  const handleComplete = async (sessionId) => {
    try {
      await api.sessions.complete(sessionId);
      setReviewSessionId(sessionId);
      setShowReviewModal(true);
      loadSessionsData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async (sessionId) => {
    if (confirm("Are you sure you want to cancel this scheduled session?")) {
      try {
        await api.sessions.cancel(sessionId);
        loadSessionsData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.sessions.submitReview(reviewSessionId, { rating, reviewText });
      alert("Review submitted successfully!");
      setShowReviewModal(false);
      setReviewText('');
      setRating(5);
    } catch (err) {
      alert("Failed to submit review: " + err.message);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Schedule Sessions</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Scheduled Sessions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Scheduled Calendar</h3>

          {loading ? (
            <div>Loading Sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
              No sessions scheduled. Schedule one on the right.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sessions.map(s => (
                <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{s.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{s.description}</p>
                    </div>
                    <span className={`badge ${s.status === 'SCHEDULED' ? 'badge-warning' : s.status === 'COMPLETED' ? 'badge-success' : 'badge-danger'}`}>
                      {s.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '0.75rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={16} />
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Date</strong>
                        {new Date(s.dateTime).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Clock size={16} />
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Time</strong>
                        {new Date(s.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({s.durationMinutes}m)
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {s.meetingMode === 'ONLINE' ? <Video size={16} /> : <MapPin size={16} />}
                      <div>
                        <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Meeting Mode</strong>
                        {s.meetingMode}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={s.partnerAvatar} alt={s.partnerName} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Swap partner: <strong>{s.partnerName}</strong></span>
                    </div>

                    {s.status === 'SCHEDULED' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {s.meetingMode === 'ONLINE' && s.meetingLink && (
                          <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                            Join Room
                          </a>
                        )}
                        <button onClick={() => handleComplete(s.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                          <Check size={14} /> Complete
                        </button>
                        <button onClick={() => handleCancel(s.id)} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderRadius: '8px', color: 'var(--danger)' }}>
                          <Trash2 size={14} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule session form */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Schedule Slot</h3>
            
            {acceptedRequests.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                You have no active matches to schedule sessions. Use the <strong style={{ color: 'var(--primary)' }}>Search Exchange</strong> tab to connect with peers first!
              </p>
            ) : (
              <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Swap Partner</label>
                  <select className="form-input" value={selectedRequest} onChange={(e) => setSelectedRequest(e.target.value)} required>
                    {acceptedRequests.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.senderId === api.profile.id ? r.receiverName : r.senderName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Session Topic (Title)</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Intro to Git, Sourdough basics"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description / Agenda</label>
                  <textarea
                    className="form-input"
                    placeholder="What will you learn and teach?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ minHeight: '60px', resize: 'vertical' }}
                  />
                </div>

                <div className="grid-2" style={{ gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      className="form-input"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Duration</label>
                    <select className="form-input" value={duration} onChange={(e) => setDuration(e.target.value)}>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Mode</label>
                  <select className="form-input" value={mode} onChange={(e) => setMode(e.target.value)}>
                    <option value="ONLINE">Online Meeting</option>
                    <option value="OFFLINE">Offline (In-person)</option>
                  </select>
                </div>

                {mode === 'ONLINE' ? (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Meeting URL (Google Meet / Zoom)</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://meet.google.com/..."
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Physical Address</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. College Library, Room 402"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  Schedule Slot
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Review / Rating Modal overlay */}
      {showReviewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px', backgroundColor: 'var(--bg-secondary)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Rate Exchange Session</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              How was your exchange experience with your swap partner? Please leave a rating and review!
            </p>

            <form onSubmit={handleReviewSubmit}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: star <= rating ? 'var(--warning)' : 'var(--text-tertiary)' }}
                  >
                    <Star size={32} fill={star <= rating ? 'var(--warning)' : 'none'} />
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Write Feedback / Review</label>
                <textarea
                  className="form-input"
                  required
                  rows="4"
                  placeholder="Share details about what you learned and taught. Be helpful and professional..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justify: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowReviewModal(false)} className="btn btn-secondary">
                  Skip Review
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
