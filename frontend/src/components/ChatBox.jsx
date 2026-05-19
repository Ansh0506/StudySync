import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatBox = ({ room, socket }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);

    // Fetch history
    useEffect(() => {
        if (!room) return;
        const fetchMessages = async () => {
            try {
                const { data } = await API.get(`/chat/${room._id}`);
                setMessages(data);
            } catch (err) {
                console.error('Failed to fetch messages', err);
            }
        };
        fetchMessages();
    }, [room]);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('receive-message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('user-typing', ({ userName }) => {
            setTypingUsers((prev) =>
                prev.includes(userName) ? prev : [...prev, userName]
            );
        });

        socket.on('user-stopped-typing', ({ userName }) => {
            setTypingUsers((prev) => prev.filter((n) => n !== userName));
        });

        return () => {
            socket.off('receive-message');
            socket.off('user-typing');
            socket.off('user-stopped-typing');
        };
    }, [socket]);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;
        socket.emit('send-message', { roomId: room._id, text: newMessage });
        setNewMessage('');
        socket.emit('stop-typing', { roomId: room._id });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (!socket) return;
        socket.emit('typing', { roomId: room._id });
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socket.emit('stop-typing', { roomId: room._id });
        }, 2000);
    };

    const getInitials = (name) =>
        (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    // Group consecutive messages from the same sender
    const grouped = messages.reduce((acc, msg, i) => {
        const prev = messages[i - 1];
        const isMe = msg.senderName === user?.name;
        const sameSender = prev && prev.senderName === msg.senderName;
        acc.push({ ...msg, isMe, isFirst: !sameSender });
        return acc;
    }, []);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

                .chat-root {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    min-height: 0;
                    overflow: hidden;
                }

                /* Header */
                .chat-header {
                    padding: 1rem 1.2rem;
                    border-bottom: 1px solid #e8eaf0;
                    display: flex; align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                }

                .chat-header-left { display: flex; align-items: center; gap: 10px; }

                .chat-header-icon {
                    width: 32px; height: 32px; border-radius: 9px;
                    background: #eef2f9;
                    display: flex; align-items: center; justify-content: center;
                }

                .chat-header-title {
                    font-size: 14px; font-weight: 500; color: #1a1a2e;
                }

                .chat-live-dot {
                    display: flex; align-items: center; gap: 5px;
                    font-size: 11.5px; color: #22c55e; font-weight: 400;
                }

                /* Messages */
                .chat-messages {
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto;
                    padding: 1rem 1rem;
                    display: flex; flex-direction: column; gap: 2px;
                    background: #f9fafc;
                }

                .chat-messages::-webkit-scrollbar { width: 4px; }
                .chat-messages::-webkit-scrollbar-track { background: transparent; }
                .chat-messages::-webkit-scrollbar-thumb { background: #dde3ed; border-radius: 2px; }

                /* Empty */
                .chat-empty {
                    flex: 1; display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    gap: 8px; color: #b0b8c8; font-size: 13px;
                    font-weight: 300; padding: 2rem;
                    text-align: center;
                }

                /* Message row */
                .msg-row {
                    display: flex;
                    flex-direction: column;
                }

                .msg-row.me { align-items: flex-end; }
                .msg-row.them { align-items: flex-start; }

                .msg-sender-label {
                    font-size: 11px; color: #9aa3b2;
                    margin-bottom: 3px; margin-top: 10px;
                    font-weight: 400;
                }

                .msg-row.me .msg-sender-label { text-align: right; }

                .msg-bubble-row {
                    display: flex; align-items: flex-end; gap: 6px;
                }

                .msg-row.me .msg-bubble-row { flex-direction: row-reverse; }

                .msg-micro-avatar {
                    width: 22px; height: 22px; border-radius: 50%;
                    background: linear-gradient(135deg, #1a1a2e, #0f3460);
                    color: #fff; font-size: 9px; font-weight: 500;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0; margin-bottom: 1px;
                }

                .msg-bubble {
                    max-width: 78%;
                    padding: 9px 13px;
                    font-size: 13.5px; line-height: 1.5;
                    word-break: break-word;
                }

                .msg-row.them .msg-bubble {
                    background: #fff;
                    border: 1px solid #e8eaf0;
                    color: #1a1a2e;
                    border-radius: 16px 16px 16px 4px;
                    box-shadow: 0 1px 4px rgba(15,52,96,0.06);
                }

                .msg-row.me .msg-bubble {
                    background: #1a1a2e;
                    color: #fff;
                    border-radius: 16px 16px 4px 16px;
                }

                /* Typing indicator */
                .typing-row {
                    display: flex; align-items: center; gap: 8px;
                    padding: 6px 4px;
                }

                .typing-dots {
                    display: flex; gap: 3px; align-items: center;
                    background: #fff; border: 1px solid #e8eaf0;
                    border-radius: 50px; padding: 7px 11px;
                    box-shadow: 0 1px 4px rgba(15,52,96,0.06);
                }

                .typing-dot {
                    width: 5px; height: 5px; border-radius: 50%;
                    background: #b0b8c8;
                    animation: typeBounce 1.2s infinite ease-in-out;
                }

                .typing-dot:nth-child(2) { animation-delay: 0.15s; }
                .typing-dot:nth-child(3) { animation-delay: 0.3s; }

                @keyframes typeBounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
                    40% { transform: translateY(-4px); opacity: 1; }
                }

                .typing-text {
                    font-size: 11.5px; color: #9aa3b2; font-weight: 300;
                }

                /* Input area */
                .chat-input-area {
                    padding: 0.9rem 1rem;
                    border-top: 1px solid #e8eaf0;
                    background: #fff; flex-shrink: 0;
                }

                .chat-form {
                    display: flex; gap: 8px; align-items: center;
                }

                .chat-input {
                    flex: 1; padding: 10px 16px;
                    border: 1.5px solid #e8eaf0;
                    border-radius: 50px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13.5px; color: #1a1a2e;
                    background: #f9fafc; outline: none;
                    transition: border-color 0.18s, background 0.18s;
                }

                .chat-input:focus {
                    border-color: #0f3460; background: #fff;
                }

                .chat-input::placeholder { color: #c5cad5; font-weight: 300; }

                .chat-send-btn {
                    width: 38px; height: 38px; border-radius: 50%;
                    background: #1a1a2e; border: none;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: background 0.15s, transform 0.1s;
                    flex-shrink: 0;
                }

                .chat-send-btn:hover:not(:disabled) { background: #0f3460; }
                .chat-send-btn:active:not(:disabled) { transform: scale(0.93); }
                .chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
            `}</style>

            <div className="chat-root">

                {/* Header */}
                <div className="chat-header">
                    <div className="chat-header-left">
                        <div className="chat-header-icon">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#0f3460" strokeWidth="1.8">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="chat-header-title">Room Chat</p>
                            <p className="chat-live-dot">
                                <span style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: '#22c55e', display: 'inline-block'
                                }} />
                                Live session
                            </p>
                        </div>
                    </div>
                    <span style={{ fontSize: 12, color: '#b0b8c8', fontWeight: 300 }}>
                        {messages.length} msg{messages.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {grouped.length === 0 ? (
                        <div className="chat-empty">
                            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#dde3ed" strokeWidth="1.5">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                            </svg>
                            <p>No messages yet.<br />Be the first to say hi!</p>
                        </div>
                    ) : (
                        grouped.map((msg, i) => (
                            <div key={i} className={`msg-row ${msg.isMe ? 'me' : 'them'}`}>
                                {msg.isFirst && (
                                    <p className="msg-sender-label">
                                        {msg.isMe ? 'You' : msg.senderName}
                                    </p>
                                )}
                                <div className="msg-bubble-row">
                                    {!msg.isMe && msg.isFirst && (
                                        <div className="msg-micro-avatar">
                                            {getInitials(msg.senderName)}
                                        </div>
                                    )}
                                    {!msg.isMe && !msg.isFirst && (
                                        <div style={{ width: 22 }} />
                                    )}
                                    <div className="msg-bubble">{msg.text}</div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                        <div className="typing-row">
                            <div className="typing-dots">
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                            </div>
                            <span className="typing-text">
                                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
                            </span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input-area">
                    <form onSubmit={handleSend} className="chat-form" noValidate>
                        <input
                            type="text"
                            className="chat-input"
                            value={newMessage}
                            onChange={handleTyping}
                            placeholder="Type a message…"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            className="chat-send-btn"
                            disabled={!newMessage.trim()}
                            aria-label="Send"
                        >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                        </button>
                    </form>
                </div>

            </div>
        </>
    );
};

export default ChatBox;