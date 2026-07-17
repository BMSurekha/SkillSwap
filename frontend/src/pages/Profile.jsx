import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Plus, Trash2, Save, MapPin, Award, BookOpen, Star } from 'lucide-react';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  
  // Profile text fields
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  
  // Lists for adding skills
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  
  // Selected fields for new skill
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [expLevel, setExpLevel] = useState('BEGINNER');
  const [skillType, setSkillType] = useState('TEACH'); // TEACH or LEARN

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
    }
    loadConfigLists();
  }, [user]);

  const loadConfigLists = async () => {
    try {
      const cats = await api.lists.categories();
      const sks = await api.lists.skills();
      setCategories(cats);
      setSkills(sks);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter skills based on selected category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = skills.filter(s => s.categoryId === parseInt(selectedCategory));
      setFilteredSkills(filtered);
      setSelectedSkill(filtered[0]?.id || '');
    } else {
      setFilteredSkills([]);
      setSelectedSkill('');
    }
  }, [selectedCategory, skills]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await api.profile.update({ fullName, bio, location });
      await refreshProfile();
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkill) return;
    try {
      await api.profile.addSkill(selectedSkill, expLevel, skillType);
      await refreshProfile();
      setMessage('Skill added successfully!');
      // reset
      setSelectedCategory('');
      setSelectedSkill('');
    } catch (err) {
      setError(err.message || 'Failed to add skill.');
    }
  };

  const handleRemoveSkill = async (skillId, type) => {
    try {
      await api.profile.removeSkill(skillId, type);
      await refreshProfile();
      setMessage('Skill removed successfully.');
    } catch (err) {
      setError(err.message || 'Failed to remove skill.');
    }
  };

  if (!user) return null;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Profile</h1>

      {message && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'var(--success-light)', color: 'var(--success)', fontSize: '0.875rem', fontWeight: 500 }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Profile Card & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', marginBottom: '1rem' }}
            />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user.fullName}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</span>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <div>
                <h5 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user.completedExchanges || 0}</h5>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Swaps</span>
              </div>
              <div>
                <h5 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center', color: 'var(--warning)' }}>
                  <Star size={16} fill="var(--warning)" /> {user.averageRating ? user.averageRating.toFixed(1) : '5.0'}
                </h5>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rating</span>
              </div>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>How SkillSwap Works</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              1. Add skills you can teach and skills you want to learn.<br/>
              2. Our recommendation engine finds partners with matching interests.<br/>
              3. Send connection proposals and schedule meeting slots.<br/>
              4. Complete sessions, rate each other, and grow together!
            </p>
          </div>
        </div>

        {/* Edit details and Skill lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Edit Profile Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Edit Details</h3>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bio (Description)</label>
                <textarea
                  className="form-input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Tell others what you do and what you are looking for..."
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                <Save size={16} /> {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Add Skills Offered & Wanted Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>Add Skill to Profile</h3>
            <form onSubmit={handleAddSkill} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Skill Type</label>
                  <select className="form-input" value={skillType} onChange={(e) => setSkillType(e.target.value)}>
                    <option value="TEACH">I can Teach</option>
                    <option value="LEARN">I want to Learn</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Skill Name</label>
                  <select className="form-input" value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} required disabled={!selectedCategory}>
                    <option value="">Select Skill</option>
                    {filteredSkills.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Level</label>
                  <select className="form-input" value={expLevel} onChange={(e) => setExpLevel(e.target.value)}>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={!selectedSkill}>
                <Plus size={16} /> Add Skill
              </button>
            </form>
          </div>

          {/* Current Skills list (Offered and Wanted) */}
          <div className="grid-2">
            
            {/* Skills Offered Card */}
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Award size={18} /> Skills Offered (Teaching)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(!user.skillsOffered || user.skillsOffered.length === 0) ? (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No teaching skills listed.</p>
                ) : (
                  user.skillsOffered.map(s => (
                    <div key={s.skillId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                      <div>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.name}</h5>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Level: {s.experienceLevel}</span>
                      </div>
                      <button onClick={() => handleRemoveSkill(s.skillId, 'TEACH')} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Skills Wanted Card */}
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                <BookOpen size={18} /> Skills Wanted (Learning)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(!user.skillsWanted || user.skillsWanted.length === 0) ? (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No learning interests listed.</p>
                ) : (
                  user.skillsWanted.map(s => (
                    <div key={s.skillId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                      <div>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.name}</h5>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Level: {s.experienceLevel}</span>
                      </div>
                      <button onClick={() => handleRemoveSkill(s.skillId, 'LEARN')} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
