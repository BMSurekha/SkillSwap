/**
 * SkillSwap Frontend API Client
 * Supports dual-mode execution:
 * 1. REST API Client connecting to Java Spring Boot REST endpoints.
 * 2. High-fidelity LocalStorage Mock Database fallback when backend is offline.
 */

const API_BASE_URL = '/api';
let USE_MOCK_FALLBACK = true; // Set to true to force mock data, or false to use Spring Boot backend

// Check if backend is available on startup, if yes, toggle mock off
fetch('/api/users/skills/list')
  .then(res => {
    if (res.status === 200) {
      console.log("Connected to Spring Boot REST backend successfully. Disabling mock fallback.");
      USE_MOCK_FALLBACK = false;
    }
  })
  .catch(() => {
    console.log("Backend offline or unreachable. Running in high-fidelity mock database mode.");
    USE_MOCK_FALLBACK = true;
  });

// Setup Initial Mock Database in LocalStorage
const INITIAL_MOCK_DATA = {
  categories: [
    { id: 1, name: 'Programming', icon: 'Code' },
    { id: 2, name: 'Languages', icon: 'Languages' },
    { id: 3, name: 'Music', icon: 'Music' },
    { id: 4, name: 'Design', icon: 'Palette' },
    { id: 5, name: 'Cooking', icon: 'Utensils' },
    { id: 6, name: 'Photography', icon: 'Camera' },
    { id: 7, name: 'Marketing', icon: 'Megaphone' },
    { id: 8, name: 'Fitness', icon: 'Dumbbell' }
  ],
  skills: [
    { id: 1, name: 'Java Spring Boot', categoryId: 1, categoryName: 'Programming' },
    { id: 2, name: 'React.js', categoryId: 1, categoryName: 'Programming' },
    { id: 3, name: 'Python & Data Science', categoryId: 1, categoryName: 'Programming' },
    { id: 19, name: 'Java Core Programming', categoryId: 1, categoryName: 'Programming' },
    { id: 20, name: 'Python Programming', categoryId: 1, categoryName: 'Programming' },
    { id: 21, name: 'C Programming', categoryId: 1, categoryName: 'Programming' },
    { id: 22, name: 'C++ Development', categoryId: 1, categoryName: 'Programming' },
    { id: 4, name: 'Spanish Conversation', categoryId: 2, categoryName: 'Languages' },
    { id: 5, name: 'Conversational English', categoryId: 2, categoryName: 'Languages' },
    { id: 6, name: 'Japanese for Beginners', categoryId: 2, categoryName: 'Languages' },
    { id: 23, name: 'French Language Basics', categoryId: 2, categoryName: 'Languages' },
    { id: 24, name: 'German Conversation', categoryId: 2, categoryName: 'Languages' },
    { id: 25, name: 'Mandarin Chinese', categoryId: 2, categoryName: 'Languages' },
    { id: 26, name: 'Hindi Language & Culture', categoryId: 2, categoryName: 'Languages' },
    { id: 7, name: 'Acoustic Guitar', categoryId: 3, categoryName: 'Music' },
    { id: 8, name: 'Piano & Music Theory', categoryId: 3, categoryName: 'Music' },
    { id: 9, name: 'UI/UX Design in Figma', categoryId: 4, categoryName: 'Design' },
    { id: 10, name: 'Graphic Design', categoryId: 4, categoryName: 'Design' },
    { id: 11, name: 'Italian Cooking', categoryId: 5, categoryName: 'Cooking' },
    { id: 12, name: 'Baking Bread & Pastries', categoryId: 5, categoryName: 'Cooking' },
    { id: 13, name: 'DSLR Photography Basics', categoryId: 6, categoryName: 'Photography' },
    { id: 14, name: 'Photo Editing in Lightroom', categoryId: 6, categoryName: 'Photography' },
    { id: 15, name: 'Social Media Marketing', categoryId: 7, categoryName: 'Marketing' },
    { id: 16, name: 'SEO Optimization', categoryId: 7, categoryName: 'Marketing' },
    { id: 17, name: 'Yoga & Meditation', categoryId: 8, categoryName: 'Fitness' },
    { id: 18, name: 'Strength Training', categoryId: 8, categoryName: 'Fitness' }
  ],
  users: [
    {
      id: 1,
      email: 'admin@skillswap.com',
      password: 'password',
      fullName: 'System Administrator',
      bio: 'Platform administrator for monitoring users, categories, reports, and activities.',
      location: 'New York, USA',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
      role: 'ADMIN',
      averageRating: 5.0,
      completedExchanges: 0,
      skillsOffered: [],
      skillsWanted: []
    }
  ],
  requests: [],
  sessions: [],
  reviews: [],
  messages: [],
  notifications: []
};

const getMockDB = () => {
  if (!localStorage.getItem('skillswap_db_v3')) {
    localStorage.setItem('skillswap_db_v3', JSON.stringify(INITIAL_MOCK_DATA));
  }
  return JSON.parse(localStorage.getItem('skillswap_db_v3'));
};

const saveMockDB = (db) => {
  localStorage.setItem('skillswap_db_v3', JSON.stringify(db));
};

// HTTP Request helper
const request = async (url, options = {}) => {
  const token = localStorage.getItem('skillswap_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json().catch(() => ({}));
};

export const api = {
  // 1. Authentication
  auth: {
    login: async (email, password) => {
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const user = db.users.find(u => u.email === email);
        const expectedPassword = user?.password || 'password';
        if (user && password === expectedPassword) {
          const mockToken = `mock-jwt-token-for-${user.id}`;
          localStorage.setItem('skillswap_token', mockToken);
          localStorage.setItem('skillswap_user', JSON.stringify(user));
          return {
            token: mockToken,
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            avatarUrl: user.avatarUrl
          };
        }
        throw new Error("Invalid email or password");
      } else {
        const data = await request(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        localStorage.setItem('skillswap_token', data.token);
        localStorage.setItem('skillswap_user', JSON.stringify(data));
        return data;
      }
    },

    register: async (email, password, fullName, bio, location, avatarUrl) => {
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        if (db.users.find(u => u.email === email)) {
          throw new Error("Email already registered!");
        }
        const newUser = {
          id: db.users.length + 1,
          email,
          password, // Save the actual password typed during registration
          fullName,
          bio,
          location,
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName.replace(' ', '')}`,
          role: 'USER',
          averageRating: 5.0,
          completedExchanges: 0,
          skillsOffered: [],
          skillsWanted: []
        };
        db.users.push(newUser);
        saveMockDB(db);
        return { message: "Registered successfully!", userId: newUser.id };
      } else {
        return request(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          body: JSON.stringify({ email, password, fullName, bio, location, avatarUrl })
        });
      }
    },

    logout: () => {
      localStorage.removeItem('skillswap_token');
      localStorage.removeItem('skillswap_user');
    },

    forgotPassword: async (email) => {
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        if (db.users.find(u => u.email === email)) {
          return { message: `Password reset link sent to ${email}` };
        }
        throw new Error("Email not found");
      } else {
        return request(`${API_BASE_URL}/auth/forgot-password`, {
          method: 'POST',
          body: JSON.stringify({ email })
        });
      }
    },

    resetPassword: async (email, newPassword) => {
      if (USE_MOCK_FALLBACK) {
        return { message: "Password reset successfully!" };
      } else {
        return request(`${API_BASE_URL}/auth/reset-password`, {
          method: 'POST',
          body: JSON.stringify({ email, newPassword })
        });
      }
    }
  },

  // 2. Profile Management
  profile: {
    get: async () => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (!user) throw new Error("Not logged in");

      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const found = db.users.find(u => u.id === user.id);
        if (!found) throw new Error("User not found");
        return found;
      } else {
        return request(`${API_BASE_URL}/users/profile`);
      }
    },

    getById: async (id) => {
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const found = db.users.find(u => u.id === parseInt(id));
        if (!found) throw new Error("User not found");
        return found;
      } else {
        return request(`${API_BASE_URL}/users/${id}`);
      }
    },

    update: async (profileData) => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const idx = db.users.findIndex(u => u.id === user.id);
        if (idx === -1) throw new Error("User not found");
        db.users[idx] = { ...db.users[idx], ...profileData };
        saveMockDB(db);
        localStorage.setItem('skillswap_user', JSON.stringify(db.users[idx]));
        return db.users[idx];
      } else {
        return request(`${API_BASE_URL}/users/profile`, {
          method: 'PUT',
          body: JSON.stringify(profileData)
        });
      }
    },

    addSkill: async (skillId, experienceLevel, type) => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const foundUser = db.users.find(u => u.id === user.id);
        const foundSkill = db.skills.find(s => s.id === parseInt(skillId));
        if (!foundUser || !foundSkill) throw new Error("User or Skill not found");

        const targetArray = type === 'TEACH' ? foundUser.skillsOffered : foundUser.skillsWanted;
        const existsIdx = targetArray.findIndex(s => s.skillId === parseInt(skillId));

        const userSkillItem = {
          skillId: foundSkill.id,
          name: foundSkill.name,
          categoryId: foundSkill.categoryId,
          categoryName: foundSkill.categoryName,
          experienceLevel
        };

        if (existsIdx > -1) {
          targetArray[existsIdx] = userSkillItem;
        } else {
          targetArray.push(userSkillItem);
        }

        saveMockDB(db);
        return { message: "Skill added successfully!" };
      } else {
        return request(`${API_BASE_URL}/users/skills?skillId=${skillId}&experienceLevel=${experienceLevel}&type=${type}`, {
          method: 'POST'
        });
      }
    },

    removeSkill: async (skillId, type) => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const foundUser = db.users.find(u => u.id === user.id);
        if (!foundUser) throw new Error("User not found");

        if (type === 'TEACH') {
          foundUser.skillsOffered = foundUser.skillsOffered.filter(s => s.skillId !== parseInt(skillId));
        } else {
          foundUser.skillsWanted = foundUser.skillsWanted.filter(s => s.skillId !== parseInt(skillId));
        }

        saveMockDB(db);
        return { message: "Skill removed successfully!" };
      } else {
        return request(`${API_BASE_URL}/users/skills?skillId=${skillId}&type=${type}`, {
          method: 'DELETE'
        });
      }
    }
  },

  // 3. Skills and Categories Lists
  lists: {
    skills: async () => {
      if (USE_MOCK_FALLBACK) {
        return getMockDB().skills;
      } else {
        return request(`${API_BASE_URL}/users/skills/list`);
      }
    },
    categories: async () => {
      if (USE_MOCK_FALLBACK) {
        return getMockDB().categories;
      } else {
        return request(`${API_BASE_URL}/users/categories/list`);
      }
    }
  },

  // 4. Matches and Search
  matchmaking: {
    getMatches: async () => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (!user) return [];

      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const currentUser = db.users.find(u => u.id === user.id);
        if (!currentUser) return [];

        const results = [];
        for (const u of db.users) {
          if (u.id === currentUser.id || u.role === 'ADMIN') continue;

          // Simple Compatibility Logic
          let score = 0;
          const mutualSkills = [];
          const mutualCategories = [];

          // Offers vs Wants
          currentUser.skillsOffered.forEach(o => {
            u.skillsWanted.forEach(w => {
              if (o.skillId === w.skillId) {
                score += 25;
                mutualSkills.push(`${o.name} (You teach them)`);
              }
            });
          });

          u.skillsOffered.forEach(o => {
            currentUser.skillsWanted.forEach(w => {
              if (o.skillId === w.skillId) {
                score += 25;
                mutualSkills.push(`${o.name} (They teach you)`);
              }
            });
          });

          // Share Category
          const catsCurrent = new Set([...currentUser.skillsOffered.map(s => s.categoryId), ...currentUser.skillsWanted.map(s => s.categoryId)]);
          const catsTarget = new Set([...u.skillsOffered.map(s => s.categoryId), ...u.skillsWanted.map(s => s.categoryId)]);
          catsCurrent.forEach(cid => {
            if (catsTarget.has(cid)) {
              score += 10;
              const cat = db.categories.find(c => c.id === cid);
              if (cat) mutualCategories.push(cat.name);
            }
          });

          // Rating Contribution
          score += Math.round((u.averageRating / 5.0) * 15);
          // Experience Contribution
          score += Math.min(u.completedExchanges * 2, 20);

          if (score > 10) {
            results.push({
              user: u,
              compatibilityPercentage: Math.min(score, 100),
              mutualSkills,
              mutualCategories
            });
          }
        }
        return results.sort((a, b) => b.compatibilityPercentage - a.compatibilityPercentage);
      } else {
        return request(`${API_BASE_URL}/users/matches`);
      }
    },

    search: async (skillName = '', categoryId = '', location = '') => {
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const user = JSON.parse(localStorage.getItem('skillswap_user'));
        return db.users.filter(u => {
          if (u.id === user?.id || u.role === 'ADMIN') return false;

          let match = true;
          if (skillName) {
            const hasSkill = [...u.skillsOffered, ...u.skillsWanted].some(s => s.name.toLowerCase().includes(skillName.toLowerCase()));
            if (!hasSkill) match = false;
          }
          if (match && categoryId) {
            const hasCategory = [...u.skillsOffered, ...u.skillsWanted].some(s => s.categoryId === parseInt(categoryId));
            if (!hasCategory) match = false;
          }
          if (match && location) {
            const hasLoc = u.location && u.location.toLowerCase().includes(location.toLowerCase());
            if (!hasLoc) match = false;
          }
          return match;
        });
      } else {
        return request(`${API_BASE_URL}/users/search?skill=${skillName}&categoryId=${categoryId}&location=${location}`);
      }
    }
  },

  // 5. Exchange Requests
  requests: {
    get: async () => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        return db.requests.filter(r => r.senderId === user.id || r.receiverId === user.id);
      } else {
        return request(`${API_BASE_URL}/requests`);
      }
    },

    create: async (receiverId) => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const receiver = db.users.find(u => u.id === parseInt(receiverId));
        if (!receiver) throw new Error("Receiver not found");

        const newRequest = {
          id: db.requests.length + 1,
          senderId: user.id,
          senderName: user.fullName,
          senderAvatar: user.avatarUrl,
          receiverId: receiver.id,
          receiverName: receiver.fullName,
          receiverAvatar: receiver.avatarUrl,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        };

        db.requests.push(newRequest);

        // Add Notification
        db.notifications.push({
          id: db.notifications.length + 1,
          userId: receiver.id,
          content: `${user.fullName} sent you an exchange request.`,
          type: 'REQUEST',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        saveMockDB(db);
        return newRequest;
      } else {
        return request(`${API_BASE_URL}/requests?receiverId=${receiverId}`, {
          method: 'POST'
        });
      }
    },

    updateStatus: async (requestId, status) => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const idx = db.requests.findIndex(r => r.id === parseInt(requestId));
        if (idx === -1) throw new Error("Request not found");

        const req = db.requests[idx];
        req.status = status.toUpperCase();
        req.updatedAt = new Date().toISOString();

        // Notify Sender
        if (status === 'ACCEPTED') {
          db.notifications.push({
            id: db.notifications.length + 1,
            userId: req.senderId,
            content: `${req.receiverName} accepted your exchange request! You can now chat and schedule a session.`,
            type: 'MATCH',
            isRead: false,
            createdAt: new Date().toISOString()
          });
        } else if (status === 'REJECTED') {
          db.notifications.push({
            id: db.notifications.length + 1,
            userId: req.senderId,
            content: `${req.receiverName} declined your exchange request.`,
            type: 'REQUEST',
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }

        saveMockDB(db);
        return req;
      } else {
        return request(`${API_BASE_URL}/requests/${requestId}/status?status=${status}`, {
          method: 'PATCH'
        });
      }
    }
  },

  // 6. Scheduling Sessions
  sessions: {
    get: async () => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        return db.sessions.filter(s => {
          const req = db.requests.find(r => r.id === s.requestId);
          return req && (req.senderId === user.id || req.receiverId === user.id);
        }).map(s => {
          const req = db.requests.find(r => r.id === s.requestId);
          const partnerId = req.senderId === user.id ? req.receiverId : req.senderId;
          const partner = db.users.find(u => u.id === partnerId);
          return {
            ...s,
            partnerId,
            partnerName: partner.fullName,
            partnerAvatar: partner.avatarUrl
          };
        });
      } else {
        return request(`${API_BASE_URL}/sessions`);
      }
    },

    getUpcoming: async () => {
      const all = await api.sessions.get();
      return all.filter(s => s.status === 'SCHEDULED');
    },

    schedule: async (requestId, sessionData) => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const req = db.requests.find(r => r.id === parseInt(requestId));
        if (!req) throw new Error("Exchange request not found");

        const partnerId = req.senderId === user.id ? req.receiverId : req.senderId;
        const partner = db.users.find(u => u.id === partnerId);

        const newSession = {
          id: db.sessions.length + 1,
          requestId: parseInt(requestId),
          title: sessionData.title,
          description: sessionData.description,
          dateTime: sessionData.dateTime,
          durationMinutes: parseInt(sessionData.durationMinutes || 60),
          meetingMode: sessionData.meetingMode,
          meetingLink: sessionData.meetingLink || '',
          location: sessionData.location || '',
          status: 'SCHEDULED',
          createdAt: new Date().toISOString()
        };

        db.sessions.push(newSession);

        // Add Notification
        db.notifications.push({
          id: db.notifications.length + 1,
          userId: partnerId,
          content: `${user.fullName} scheduled a new session: ${sessionData.title}`,
          type: 'SESSION',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        saveMockDB(db);
        return {
          ...newSession,
          partnerId,
          partnerName: partner.fullName,
          partnerAvatar: partner.avatarUrl
        };
      } else {
        return request(`${API_BASE_URL}/sessions?requestId=${requestId}`, {
          method: 'POST',
          body: JSON.stringify(sessionData)
        });
      }
    },

    complete: async (sessionId) => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const idx = db.sessions.findIndex(s => s.id === parseInt(sessionId));
        if (idx === -1) throw new Error("Session not found");

        const session = db.sessions[idx];
        session.status = 'COMPLETED';

        // Update Request Status
        const req = db.requests.find(r => r.id === session.requestId);
        if (req && req.status !== 'COMPLETED') {
          req.status = 'COMPLETED';
          
          // Increment completed exchanges
          const sender = db.users.find(u => u.id === req.senderId);
          const receiver = db.users.find(u => u.id === req.receiverId);
          if (sender) sender.completedExchanges += 1;
          if (receiver) receiver.completedExchanges += 1;
        }

        // Add notifications
        db.notifications.push({
          id: db.notifications.length + 1,
          userId: req.senderId,
          content: `Session completed! Please rate your experience with ${req.receiverName}`,
          type: 'REVIEW',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        db.notifications.push({
          id: db.notifications.length + 1,
          userId: req.receiverId,
          content: `Session completed! Please rate your experience with ${req.senderName}`,
          type: 'REVIEW',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        saveMockDB(db);
        return session;
      } else {
        return request(`${API_BASE_URL}/sessions/${sessionId}/complete`, {
          method: 'POST'
        });
      }
    },

    cancel: async (sessionId) => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const idx = db.sessions.findIndex(s => s.id === parseInt(sessionId));
        if (idx === -1) throw new Error("Session not found");

        const session = db.sessions[idx];
        session.status = 'CANCELLED';

        const req = db.requests.find(r => r.id === session.requestId);
        const partnerId = req.senderId === user.id ? req.receiverId : req.senderId;

        // Add Notification
        db.notifications.push({
          id: db.notifications.length + 1,
          userId: partnerId,
          content: `${user.fullName} cancelled the session: ${session.title}`,
          type: 'SESSION',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        saveMockDB(db);
        return session;
      } else {
        return request(`${API_BASE_URL}/sessions/${sessionId}/cancel`, {
          method: 'POST'
        });
      }
    },

    submitReview: async (sessionId, reviewData) => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const session = db.sessions.find(s => s.id === parseInt(sessionId));
        const req = db.requests.find(r => r.id === session.requestId);
        const revieweeId = req.senderId === user.id ? req.receiverId : req.senderId;
        const reviewee = db.users.find(u => u.id === revieweeId);

        const newReview = {
          id: db.reviews.length + 1,
          sessionId: parseInt(sessionId),
          reviewerId: user.id,
          reviewerName: user.fullName,
          reviewerAvatar: user.avatarUrl,
          revieweeId,
          rating: parseInt(reviewData.rating),
          reviewText: reviewData.reviewText,
          createdAt: new Date().toISOString()
        };

        db.reviews.push(newReview);

        // Recalculate average rating
        const allReviews = db.reviews.filter(r => r.revieweeId === revieweeId);
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        reviewee.averageRating = Math.round((totalRating / allReviews.length) * 10) / 10;

        // Notify reviewee
        db.notifications.push({
          id: db.notifications.length + 1,
          userId: revieweeId,
          content: `${user.fullName} rated you ${reviewData.rating} stars.`,
          type: 'REVIEW',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        saveMockDB(db);
        return newReview;
      } else {
        return request(`${API_BASE_URL}/sessions/${sessionId}/reviews`, {
          method: 'POST',
          body: JSON.stringify(reviewData)
        });
      }
    },

    getReviews: async (userId) => {
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        return db.reviews.filter(r => r.revieweeId === parseInt(userId));
      } else {
        return request(`${API_BASE_URL}/sessions/${userId}/reviews`);
      }
    }
  },

  // 7. Chat System
  chat: {
    getHistory: async (partnerId) => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const history = db.messages.filter(m => 
          (m.senderId === user.id && m.receiverId === parseInt(partnerId)) ||
          (m.senderId === parseInt(partnerId) && m.receiverId === user.id)
        );
        // Mark as read
        history.forEach(m => {
          if (m.receiverId === user.id) m.isRead = true;
        });
        saveMockDB(db);
        return history;
      } else {
        return request(`${API_BASE_URL}/chat/history/${partnerId}`);
      }
    },

    sendMessage: async (partnerId, messageData) => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const newMessage = {
          id: db.messages.length + 1,
          senderId: user.id,
          senderName: user.fullName,
          receiverId: parseInt(partnerId),
          content: messageData.content,
          fileUrl: messageData.fileUrl || null,
          isRead: false,
          createdAt: new Date().toISOString()
        };

        db.messages.push(newMessage);

        // Add Notification
        db.notifications.push({
          id: db.notifications.length + 1,
          userId: parseInt(partnerId),
          content: `New message from ${user.fullName}: ${messageData.content.substring(0, 20)}...`,
          type: 'MESSAGE',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        saveMockDB(db);
        return newMessage;
      } else {
        return request(`${API_BASE_URL}/chat/send/${partnerId}`, {
          method: 'POST',
          body: JSON.stringify(messageData)
        });
      }
    },

    getContacts: async () => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (!user) return [];

      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        // Contacts are users with accepted requests
        const reqs = db.requests.filter(r => 
          (r.senderId === user.id || r.receiverId === user.id) && r.status === 'ACCEPTED'
        );
        const contactIds = reqs.map(r => r.senderId === user.id ? r.receiverId : r.senderId);
        return db.users.filter(u => contactIds.includes(u.id));
      } else {
        return request(`${API_BASE_URL}/chat/contacts`);
      }
    }
  },

  // 8. Notifications
  notifications: {
    get: async () => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (!user) return [];

      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        return db.notifications.filter(n => n.userId === user.id).reverse();
      } else {
        return request(`${API_BASE_URL}/notifications`);
      }
    },

    getUnread: async () => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (!user) return [];

      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        return db.notifications.filter(n => n.userId === user.id && !n.isRead).reverse();
      } else {
        return request(`${API_BASE_URL}/notifications/unread`);
      }
    },

    markAsRead: async (id) => {
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const idx = db.notifications.findIndex(n => n.id === parseInt(id));
        if (idx > -1) {
          db.notifications[idx].isRead = true;
          saveMockDB(db);
        }
        return { message: "Notification read" };
      } else {
        return request(`${API_BASE_URL}/notifications/${id}/read`, {
          method: 'PATCH'
        });
      }
    },

    markAllAsRead: async () => {
      const user = JSON.parse(localStorage.getItem('skillswap_user'));
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        db.notifications.forEach(n => {
          if (n.userId === user.id) n.isRead = true;
        });
        saveMockDB(db);
        return { message: "All notifications read" };
      } else {
        return request(`${API_BASE_URL}/notifications/read-all`, {
          method: 'POST'
        });
      }
    }
  },

  // 9. Admin Dashboard
  admin: {
    getAnalytics: async () => {
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        const totalUsers = db.users.length;
        const activeUsers = db.users.filter(u => u.role === 'USER' && (u.completedExchanges > 0 || u.skillsOffered.length > 0)).length;
        const totalSkills = db.skills.length;
        const totalExchanges = db.requests.filter(r => r.status === 'COMPLETED' || r.status === 'ACCEPTED').length;

        // Skill popularity
        const popularSkills = {};
        db.users.forEach(u => {
          [...u.skillsOffered, ...u.skillsWanted].forEach(s => {
            popularSkills[s.name] = (popularSkills[s.name] || 0) + 1;
          });
        });

        // Category distribution
        const categoryDistribution = {};
        db.users.forEach(u => {
          [...u.skillsOffered, ...u.skillsWanted].forEach(s => {
            categoryDistribution[s.categoryName] = (categoryDistribution[s.categoryName] || 0) + 1;
          });
        });

        return {
          totalUsers,
          activeUsers,
          totalSkills,
          totalExchanges,
          pendingReports: 1, // simulated
          popularSkills,
          categoryDistribution,
          userRegistrationTrend: { 'Apr': 1, 'May': 2, 'Jun': 2, 'Jul': db.users.length }
        };
      } else {
        return request(`${API_BASE_URL}/admin/analytics`);
      }
    },

    getUsers: async () => {
      if (USE_MOCK_FALLBACK) {
        return getMockDB().users;
      } else {
        return request(`${API_BASE_URL}/admin/users`);
      }
    },

    removeUser: async (id) => {
      if (USE_MOCK_FALLBACK) {
        const db = getMockDB();
        db.users = db.users.filter(u => u.id !== parseInt(id));
        saveMockDB(db);
        return { message: "User deleted" };
      } else {
        return request(`${API_BASE_URL}/admin/users/${id}`, {
          method: 'DELETE'
        });
      }
    }
  }
};
