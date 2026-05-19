import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

/* ── colour palette (reused from login/register) ── */
// navy: #1a1a2e  |  deep blue: #0f3460
// page bg: #dde3ed  |  card: #fff  |  panel bg: #eef2f9
// text-muted: #9aa3b2  |  border: #e8eaf0

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

    // --- NEW: Delete Room Handler ---
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
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .db-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: #dde3ed;
                    font-family: 'DM Sans', sans-serif;
                }

                .db-main {
                    flex: 1;
                    max-width: 1160px;
                    margin: 0 auto;
                    width: 100%;
                    padding: 2.5rem 2rem 3rem;
                }

                /* ── Error ── */
                .db-error {
                    background: #fff5f5; border: 1px solid #fed7d7;
                    color: #c53030; padding: 12px 16px;
                    border-radius: 12px; font-size: 13.5px;
                    margin-bottom: 1.8rem;
                }

                /* ── Welcome banner ── */
                .db-welcome {
                    background: #1a1a2e;
                    border-radius: 20px;
                    padding: 2rem 2.5rem;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    overflow: hidden;
                    position: relative;
                }

                .db-welcome::before {
                    content: '';
                    position: absolute;
                    width: 280px; height: 280px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.04);
                    right: -60px; top: -80px;
                }

                .db-welcome::after {
                    content: '';
                    position: absolute;
                    width: 180px; height: 180px;
                    border-radius: 50%;
                    background: rgba(99,179,237,0.06);
                    right: 120px; bottom: -60px;
                }

                .db-welcome-text { position: relative; z-index: 1; }

                .db-welcome-eyebrow {
                    font-size: 12px; font-weight: 400;
                    color: rgba(255,255,255,0.45);
                    letter-spacing: 0.1em; text-transform: uppercase;
                    margin-bottom: 8px;
                }

                .db-welcome-heading {
                    font-family: 'Playfair Display', serif;
                    font-size: 26px; color: #fff;
                    letter-spacing: -0.01em; margin-bottom: 6px;
                }

                .db-welcome-sub {
                    font-size: 13.5px; color: rgba(255,255,255,0.45);
                    font-weight: 300;
                }

                .db-welcome-stat {
                    position: relative; z-index: 1;
                    text-align: right;
                }

                .db-stat-number {
                    font-family: 'Playfair Display', serif;
                    font-size: 40px; color: #fff; line-height: 1;
                }

                .db-stat-label {
                    font-size: 12px; color: rgba(255,255,255,0.4);
                    margin-top: 4px; font-weight: 300;
                }

                /* ── Section heading ── */
                .db-section-label {
                    font-size: 11px; font-weight: 500;
                    color: #9aa3b2; letter-spacing: 0.12em;
                    text-transform: uppercase; margin-bottom: 1rem;
                }

                /* ── Action cards (create / join) ── */
                .db-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.2rem;
                    margin-bottom: 2.5rem;
                }

                .db-action-card {
                    background: #fff;
                    border-radius: 18px;
                    padding: 1.6rem 1.8rem;
                    border: 1px solid #e8eaf0;
                }

                .db-action-card-header {
                    display: flex; align-items: center;
                    gap: 12px; margin-bottom: 1.2rem;
                }

                .db-action-icon {
                    width: 38px; height: 38px;
                    border-radius: 11px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }

                .db-action-icon.create { background: #eef2f9; }
                .db-action-icon.join   { background: #f0fdf4; }

                .db-action-title {
                    font-size: 15px; font-weight: 500; color: #1a1a2e;
                }

                .db-action-sub {
                    font-size: 12.5px; color: #9aa3b2; font-weight: 300;
                }

                .db-action-form {
                    display: flex; gap: 10px; align-items: stretch;
                }

                .db-action-input {
                    flex: 1;
                    padding: 11px 14px;
                    border: 1.5px solid #e8eaf0;
                    border-radius: 50px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px; color: #1a1a2e;
                    background: #f9fafc;
                    outline: none;
                    transition: border-color 0.18s, background 0.18s;
                }

                .db-action-input:focus {
                    border-color: #0f3460; background: #fff;
                }

                .db-action-input::placeholder { color: #c5cad5; font-weight: 300; }

                .db-action-btn {
                    padding: 11px 20px;
                    border: none; border-radius: 50px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px; font-weight: 500;
                    cursor: pointer;
                    transition: opacity 0.15s, transform 0.1s;
                    white-space: nowrap;
                }

                .db-action-btn:active { transform: scale(0.98); }
                .db-action-btn:disabled { opacity: 0.65; cursor: not-allowed; }

                .db-action-btn.create {
                    background: #1a1a2e; color: #fff;
                }
                .db-action-btn.create:hover:not(:disabled) { background: #0f3460; }

                .db-action-btn.join {
                    background: #eef2f9; color: #1a1a2e;
                }
                .db-action-btn.join:hover:not(:disabled) { background: #dde3ed; }

                /* ── Rooms grid ── */
                .db-rooms-section { margin-top: 0.5rem; }

                .db-rooms-header {
                    display: flex; align-items: baseline;
                    justify-content: space-between;
                    margin-bottom: 1.2rem;
                }

                .db-rooms-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 20px; color: #1a1a2e;
                    letter-spacing: -0.01em;
                }

                .db-rooms-count {
                    font-size: 13px; color: #9aa3b2; font-weight: 300;
                }

                .db-rooms-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
                    gap: 1.2rem;
                }

                /* Empty state */
                .db-empty {
                    background: #fff;
                    border: 1.5px dashed #dde3ed;
                    border-radius: 18px;
                    padding: 3.5rem 2rem;
                    text-align: center;
                    grid-column: 1 / -1;
                }

                .db-empty-icon {
                    width: 52px; height: 52px;
                    background: #eef2f9; border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 1.2rem;
                }

                .db-empty-title {
                    font-size: 15px; font-weight: 500;
                    color: #1a1a2e; margin-bottom: 6px;
                }

                .db-empty-sub {
                    font-size: 13.5px; color: #9aa3b2; font-weight: 300;
                }

                /* Room card */
                .db-room-card {
                    background: #fff;
                    border-radius: 18px;
                    border: 1px solid #e8eaf0;
                    overflow: hidden;
                    display: flex; flex-direction: column;
                    transition: box-shadow 0.18s, transform 0.18s;
                    cursor: pointer;
                }

                .db-room-card:hover {
                    box-shadow: 0 8px 32px rgba(15,52,96,0.10);
                    transform: translateY(-2px);
                }

                .db-room-card-top {
                    height: 8px;
                }

                .db-room-card-body {
                    padding: 1.4rem 1.5rem;
                    flex: 1; display: flex; flex-direction: column;
                }

                /* --- NEW: Header Row & Delete Button CSS --- */
                .db-room-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.8rem;
                }

                .db-room-name-wrapper {
                    flex: 1;
                    min-width: 0; /* Ensures truncation works inside flex child */
                    margin-right: 8px;
                }

                .db-room-name {
                    font-size: 15.5px; font-weight: 500;
                    color: #1a1a2e;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }

                .db-room-delete-btn {
                    background: none; border: none; cursor: pointer;
                    color: #9aa3b2; padding: 4px; border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    transition: color 0.15s, background 0.15s;
                }

                .db-room-delete-btn:hover {
                    color: #c53030; background: #fff5f5;
                }

                .db-room-meta {
                    display: flex; flex-direction: column; gap: 5px;
                    margin-bottom: 1.2rem;
                }

                .db-room-meta-row {
                    display: flex; align-items: center;
                    gap: 7px; font-size: 12.5px; color: #9aa3b2; font-weight: 300;
                }

                .db-room-code {
                    font-family: 'DM Mono', 'Fira Mono', monospace;
                    font-size: 12px; font-weight: 400;
                    background: #f5f7fb; color: #3c4257;
                    padding: 2px 8px; border-radius: 6px;
                    letter-spacing: 0.06em;
                }

                .db-room-enter {
                    margin-top: auto;
                    width: 100%; padding: 10px;
                    border-radius: 50px;
                    border: 1.5px solid #e8eaf0;
                    background: #fff;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13.5px; font-weight: 500;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    transition: background 0.15s, border-color 0.15s;
                }

                .db-room-enter:hover {
                    background: #eef2f9; border-color: #c5cad5;
                }

                /* Loading skeleton */
                .db-skeleton {
                    background: #fff; border-radius: 18px;
                    border: 1px solid #e8eaf0;
                    overflow: hidden;
                }

                .db-skeleton-bar {
                    height: 8px; background: #eef2f9;
                }

                .db-skeleton-body { padding: 1.4rem 1.5rem; }

                .db-skeleton-line {
                    height: 14px; border-radius: 7px;
                    background: #eef2f9; margin-bottom: 10px;
                    animation: shimmer 1.4s infinite;
                }

                @keyframes shimmer {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                @media (max-width: 700px) {
                    .db-actions { grid-template-columns: 1fr; }
                    .db-welcome { flex-direction: column; gap: 1.2rem; }
                    .db-welcome-stat { text-align: left; }
                    .db-main { padding: 1.5rem 1rem 2rem; }
                }
            `}</style>

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
                                                
                                                {/* --- NEW: Header Row containing Name and Delete Button --- */}
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
                                                    style={{ color: color.accent }}
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
        </>
    );
};

export default DashboardPage;