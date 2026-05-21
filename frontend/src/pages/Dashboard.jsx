import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

// Import the separated CSS file
import './Dashboard.css';

/* ── colour palette (reused from login/register) ── */
const ROOM_COLORS = [
    { bg: '#eef2f9', accent: '#0f3460', label: 'Navy' },
    { bg: '#f5f0ff', accent: '#6c4fe0', label: 'Violet' },
    { bg: '#fff5f0', accent: '#c2410c', label: 'Ember' },
    { bg: '#f0fdf4', accent: '#15803d', label: 'Forest' },
    { bg: '#fdf6ec', accent: '#b45309', label: 'Amber' },
    { bg: '#fdf2f8', accent: '#9d174d', label: 'Rose' },
];

const getColor = (id) => ROOM_COLORS[(id?.charCodeAt(0) ?? 0) % ROOM_COLORS.length];

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [joinRoomCode, setJoinRoomCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(false);

    useEffect(() => { fetchRooms(); }, []);

    const fetchRooms = async () => {
        try {
            const { data } = await API.get('/rooms/user');
            setRooms(data);
        } catch (err) {
            setError('Failed to load your study rooms.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        setError('');
        setCreating(true);
        try {
            const { data } = await API.post('/rooms/create', { name: newRoomName });
            setNewRoomName('');
            setRooms([data.room, ...rooms]);
            navigate(`/room/${data.room._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create room.');
        } finally {
            setCreating(false);
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        setError('');
        setJoining(true);
        try {
            const { data } = await API.post('/rooms/join', { roomCode: joinRoomCode });
            setJoinRoomCode('');
            navigate(`/room/${data.room._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid room code.');
        } finally {
            setJoining(false);
        }
    };

    // --- Delete Room Handler ---
    const handleDeleteRoom = async (roomId, e) => {
        e.stopPropagation(); // Prevents the card from navigating to the room
        if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
            return;
        }

        try {
            await API.delete(`/rooms/${roomId}`);
            setRooms(rooms.filter((room) => room._id !== roomId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete room. You may not be the owner.');
        }
    };

    return (
        <div className="db-page">
            <Header />

            <main className="db-main">

                {error && <div className="db-error">{error}</div>}

                {/* Welcome banner */}
                <div className="db-welcome" style={{ marginBottom: '2rem' }}>
                    <div className="db-welcome-text">
                        <p className="db-welcome-eyebrow">Your workspace</p>
                        <h1 className="db-welcome-heading">
                            Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
                        </h1>
                        <p className="db-welcome-sub">Pick up where you left off or start something new.</p>
                    </div>
                    <div className="db-welcome-stat">
                        <p className="db-stat-number">{rooms.length}</p>
                        <p className="db-stat-label">Active {rooms.length === 1 ? 'room' : 'rooms'}</p>
                    </div>
                </div>

                {/* Create & Join */}
                <p className="db-section-label">Quick actions</p>
                <div className="db-actions">

                    {/* Create */}
                    <div className="db-action-card">
                        <div className="db-action-card-header">
                            <div className="db-action-icon create">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#0f3460" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
                            </div>
                            <div>
                                <p className="db-action-title">Create a Room</p>
                                <p className="db-action-sub">Start a new study session</p>
                            </div>
                        </div>
                        <form onSubmit={handleCreateRoom} className="db-action-form" noValidate>
                            <input
                                type="text"
                                className="db-action-input"
                                placeholder="E.g., Physics Midterm Prep"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                required
                            />
                            <button type="submit" className="db-action-btn create" disabled={creating}>
                                {creating ? '...' : 'Create'}
                            </button>
                        </form>
                    </div>

                    {/* Join */}
                    <div className="db-action-card">
                        <div className="db-action-card-header">
                            <div className="db-action-icon join">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#15803d" strokeWidth="2">
                                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                                </svg>
                            </div>
                            <div>
                                <p className="db-action-title">Join a Room</p>
                                <p className="db-action-sub">Enter a shared room code</p>
                            </div>
                        </div>
                        <form onSubmit={handleJoinRoom} className="db-action-form" noValidate>
                            <input
                                type="text"
                                className="db-action-input"
                                placeholder="Room code — e.g., A1B2C"
                                value={joinRoomCode}
                                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                                required
                            />
                            <button type="submit" className="db-action-btn join" disabled={joining}>
                                {joining ? '...' : 'Join'}
                            </button>
                        </form>
                    </div>

                </div>

                {/* Rooms section */}
                <div className="db-rooms-section" id="rooms">
                    <div className="db-rooms-header">
                        <h2 className="db-rooms-title">Your Study Rooms</h2>
                        {rooms.length > 0 && (
                            <span className="db-rooms-count">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</span>
                        )}
                    </div>

                    <div className="db-rooms-grid">
                        {loading ? (
                            // Skeleton loaders
                            [1,2,3].map(i => (
                                <div key={i} className="db-skeleton">
                                    <div className="db-skeleton-bar" />
                                    <div className="db-skeleton-body">
                                        <div className="db-skeleton-line" style={{ width: '65%' }} />
                                        <div className="db-skeleton-line" style={{ width: '45%' }} />
                                        <div className="db-skeleton-line" style={{ width: '55%', marginTop: '1rem' }} />
                                    </div>
                                </div>
                            ))
                        ) : rooms.length === 0 ? (
                            <div className="db-empty">
                                <div className="db-empty-icon">
                                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#9aa3b2" strokeWidth="1.5">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                    </svg>
                                </div>
                                <p className="db-empty-title">No rooms yet</p>
                                <p className="db-empty-sub">Create or join a room above to get started.</p>
                            </div>
                        ) : (
                            rooms.map((room) => {
                                const color = getColor(room._id);
                                return (
                                    <div
                                        key={room._id}
                                        className="db-room-card"
                                        onClick={() => navigate(`/room/${room._id}`)}
                                    >
                                        <div className="db-room-card-top" style={{ background: color.accent }} />
                                        <div className="db-room-card-body">
                                            
                                            {/* Header Row containing Name and Delete Button */}
                                            <div className="db-room-header-row">
                                                <div className="db-room-name-wrapper">
                                                    <p className="db-room-name" title={room.name}>{room.name}</p>
                                                </div>
                                                <button 
                                                    className="db-room-delete-btn" 
                                                    onClick={(e) => handleDeleteRoom(room._id, e)}
                                                    title="Delete Room"
                                                >
                                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="db-room-meta">
                                                <div className="db-room-meta-row">
                                                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                                                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                                                    </svg>
                                                    <span>Code:</span>
                                                    <span className="db-room-code">{room.roomCode}</span>
                                                </div>
                                                <div className="db-room-meta-row">
                                                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                                        <circle cx="9" cy="7" r="4"/>
                                                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                                                    </svg>
                                                    <span>{room.members.length} member{room.members.length !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                            <button
                                                className="db-room-enter"
                                                onClick={(e) => { e.stopPropagation(); navigate(`/room/${room._id}`); }}
                                                /* REMOVED: style={{ color: color.accent }} */
                                            >
                                                Enter Room
                                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default DashboardPage;