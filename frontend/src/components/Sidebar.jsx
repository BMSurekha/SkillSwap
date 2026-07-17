import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  User, 
  Search, 
  MessageSquare, 
  Calendar, 
  FileText, 
  LogOut, 
  Activity,
  Layers
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Search Exchange', path: '/search', icon: Search },
    { name: 'Requests', path: '/requests', icon: FileText },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'Chat Room', path: '/chat', icon: MessageSquare }
  ];

  // Admin specific items
  if (user.role === 'ADMIN') {
    menuItems.push({ name: 'Admin Hub', path: '/admin', icon: Activity });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar" style={{ padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.25rem'
        }}>
          S
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}><span style={{ color: 'var(--primary)' }}>Skill</span>Swap</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexGrow: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                color: isActive(item.path) ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: isActive(item.path) ? 'var(--primary-light)' : 'transparent',
                fontWeight: isActive(item.path) ? '600' : '500',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            color: 'var(--danger)',
            backgroundColor: 'transparent',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
