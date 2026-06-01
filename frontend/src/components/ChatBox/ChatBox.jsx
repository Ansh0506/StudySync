import { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ChatBox.css';

// Shows room chat history and sends/receives live messages over Socket.IO.
const ChatBox = ({ room, socket, isOverlay = false }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);

    // Load persisted chat messages when entering a room.
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

    // Subscribe to realtime messages and typing indicators from the room socket.
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

    // Keep the latest message or typing indicator visible.
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUsers]);

    // Sends the current input as a room message and clears typing state.
    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;
        socket.emit('send-message', { roomId: room._id, text: newMessage });
        setNewMessage('');
        socket.emit('stop-typing', { roomId: room._id });
    };

    // Emits typing state immediately, then clears it after a short pause.
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

    // Adds display metadata so consecutive messages from the same sender group together.
    const grouped = messages.reduce((acc, msg, i) => {
        const prev = messages[i - 1];
        const isMe = msg.senderName === user?.name;
        const sameSender = prev && prev.senderName === msg.senderName;
        acc.push({ ...msg, isMe, isFirst: !sameSender });
        return acc;
    }, []);

    return (
        <div className="chat-root">

            {/* Chat title and message count. */}
            <div className="chat-header">
                <div className="chat-header-left">
                    <div className="chat-header-icon">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                    </div>
                    <div>
                        <p className="chat-header-title">Room Chat</p>
                        <p className="chat-live-dot">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                            Live session
                        </p>
                    </div>
                </div>
                {!isOverlay && (
                    <span className="chat-msg-count">
                        {messages.length} msg{messages.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Message list, empty state, and typing indicator. */}
            <div className="chat-messages">
                {grouped.length === 0 ? (
                    <div className="chat-empty">
                        <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
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

            {/* Message composer. */}
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
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#050508" strokeWidth="2.2">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </form>
            </div>

        </div>
    );
};

export default ChatBox;
