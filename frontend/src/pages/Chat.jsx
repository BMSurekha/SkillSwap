import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Send, Smile, Paperclip, Video, Phone, Check, CheckCheck } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const partnerIdFromUrl = searchParams.get('partnerId');

  const [contacts, setContacts] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [history, setHistory] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [fileAttached, setFileAttached] = useState(null);
  
  const chatBottomRef = useRef(null);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (contacts.length > 0) {
      if (partnerIdFromUrl) {
        const found = contacts.find(c => c.id === parseInt(partnerIdFromUrl));
        if (found) {
          setActivePartner(found);
        } else {
          // fetch partner details if not in standard contacts
          api.profile.getById(partnerIdFromUrl).then(data => {
            setActivePartner(data);
          }).catch(console.error);
        }
      } else if (!activePartner) {
        setActivePartner(contacts[0]);
      }
    }
  }, [contacts, partnerIdFromUrl]);

  useEffect(() => {
    if (activePartner) {
      loadHistory();
      const interval = setInterval(loadHistory, 3000); // Poll message history every 3s
      return () => clearInterval(interval);
    }
  }, [activePartner]);

  // Scroll to bottom on history update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const loadContacts = async () => {
    try {
      const list = await api.chat.getContacts();
      setContacts(list);
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async () => {
    if (!activePartner) return;
    try {
      const data = await api.chat.getHistory(activePartner.id);
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() && !fileAttached) return;

    try {
      await api.chat.sendMessage(activePartner.id, {
        content: messageText,
        fileUrl: fileAttached ? `https://skillswap.com/files/${fileAttached}` : null
      });
      setMessageText('');
      setFileAttached(null);
      loadHistory();
    } catch (err) {
      alert("Error sending message: " + err.message);
    }
  };

  const insertEmoji = () => {
    setMessageText(prev => prev + " 😊");
  };

  const simulateAttachFile = () => {
    const filename = prompt("Enter a filename to simulate attaching (e.g. project_code.zip, spanish_grammar.pdf):");
    if (filename) {
      setFileAttached(filename);
    }
  };

  const shareMeetingLink = () => {
    const meetLink = `https://meet.google.com/swap-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    setMessageText(prev => prev + ` Join my meeting room: ${meetLink}`);
  };

  return (
    <div className="page-container" style={{ padding: 0, height: 'calc(100vh - 70px)', display: 'grid', gridTemplateColumns: '300px 1fr' }}>
      
      {/* Left Pane: Contacts List */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Conversations</h3>
        </div>
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {contacts.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              No chat partners. Accept an exchange request to start chatting!
            </div>
          ) : (
            contacts.map(c => (
              <button
                key={c.id}
                onClick={() => setActivePartner(c)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem 1.25rem',
                  border: 'none',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: activePartner?.id === c.id ? 'var(--primary-light)' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <img
                  src={c.avatarUrl}
                  alt={c.fullName}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}
                />
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.fullName}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click to view messages</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: History Window */}
      {activePartner ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-primary)' }}>
          {/* Header */}
          <div style={{ height: '70px', padding: '0 1.5rem', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src={activePartner.avatarUrl}
                alt={activePartner.fullName}
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
              />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{activePartner.fullName}</h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Active Member</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-secondary)' }}>
              <button onClick={shareMeetingLink} title="Share Meet Link" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)' }}>
                <Video size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flexGrow: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem 0', fontSize: '0.85rem' }}>
                No messages yet. Send a greeting to start your swap coordination!
              </div>
            ) : (
              history.map(m => {
                const isMine = m.senderId === user.id;
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                      maxWidth: '65%'
                    }}
                  >
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '16px',
                        borderBottomRightRadius: isMine ? '2px' : '16px',
                        borderBottomLeftRadius: isMine ? '16px' : '2px',
                        backgroundColor: isMine ? 'var(--primary)' : 'var(--bg-secondary)',
                        color: isMine ? 'white' : 'var(--text-primary)',
                        boxShadow: 'var(--shadow-sm)',
                        fontSize: '0.9rem'
                      }}
                    >
                      {m.content && <p>{m.content}</p>}
                      
                      {m.fileUrl && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          backgroundColor: isMine ? 'rgba(255, 255, 255, 0.15)' : 'var(--bg-tertiary)',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <Paperclip size={14} />
                          <a href="#" onClick={(e) => { e.preventDefault(); alert("File downloaded: " + m.fileUrl.split('/').pop()); }} style={{ color: isMine ? 'white' : 'var(--primary)', fontWeight: 600 }}>
                            {m.fileUrl.split('/').pop()}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && (
                        <span style={{ color: m.isRead ? 'var(--success)' : 'var(--text-tertiary)' }}>
                          {m.isRead ? <CheckCheck size={12} /> : <Check size={12} />}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Footer Input Area */}
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
            
            {fileAttached && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '99px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                <Paperclip size={12} />
                <span>Attachment: {fileAttached}</span>
                <button onClick={() => setFileAttached(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex' }}>
                  <X size={14} />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button type="button" onClick={simulateAttachFile} title="Attach File" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
                <Paperclip size={20} />
              </button>
              <button type="button" onClick={insertEmoji} title="Add Emoji" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
                <Smile size={20} />
              </button>

              <input
                type="text"
                required={!fileAttached}
                className="form-input"
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                style={{ flexGrow: 1 }}
              />

              <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem', borderRadius: '12px' }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
          <h3>Select a conversation to start swapping details</h3>
        </div>
      )}

    </div>
  );
}
