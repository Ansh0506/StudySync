import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

                .ss-header {
                    position: sticky; top: 0; z-index: 100;
                    background: #fff;
                    border-bottom: 1px solid #e8eaf0;
                    font-family: 'DM Sans', sans-serif;
                }

                .ss-header-inner {
                    max-width: 1160px; margin: 0 auto;
                    padding: 0 2rem; height: 64px;
                    display: flex; align-items: center;
                    justify-content: space-between;
                }

                .ss-brand {
                    display: flex; align-items: center;
                    gap: 10px; text-decoration: none;
                }

                .ss-brand-icon {
                    width: 34px; height: 34px;
                    background: #1a1a2e; border-radius: 9px;
                    display: flex; align-items: center; justify-content: center;
                }

                .ss-brand-text {
                    font-family: 'Playfair Display', serif;
                    font-size: 17px; color: #1a1a2e;
                    letter-spacing: 0.1em; text-transform: uppercase;
                }

                .ss-nav {
                    display: flex; align-items: center; gap: 2rem;
                }

                .ss-nav-link {
                    font-size: 13.5px; color: #9aa3b2;
                    text-decoration: none; font-weight: 400;
                    transition: color 0.15s; padding-bottom: 2px;
                    border-bottom: 1.5px solid transparent;
                }

                .ss-nav-link:hover { color: #1a1a2e; }
                .ss-nav-link.active { color: #1a1a2e; border-bottom-color: #1a1a2e; }

                .ss-right {
                    display: flex; align-items: center; gap: 1.2rem;
                }

                .ss-greeting {
                    font-size: 13px; color: #9aa3b2; font-weight: 300;
                }
                .ss-greeting strong { color: #1a1a2e; font-weight: 500; }

                .ss-avatar-btn {
                    display: flex; align-items: center; gap: 7px;
                    background: none; border: none; cursor: pointer; padding: 0;
                }

                .ss-avatar {
                    width: 36px; height: 36px; border-radius: 50%;
                    background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
                    color: #fff; display: flex; align-items: center; justify-content: center;
                    font-size: 12.5px; font-weight: 500;
                    font-family: 'DM Sans', sans-serif; letter-spacing: 0.04em;
                }

                .ss-chevron {
                    color: #b0b8c8; display: flex;
                    transition: transform 0.2s;
                }
                .ss-chevron.open { transform: rotate(180deg); }

                .ss-dropdown {
                    position: absolute; top: calc(100% + 10px); right: 0;
                    width: 215px; background: #fff;
                    border: 1px solid #e8eaf0; border-radius: 16px;
                    box-shadow: 0 12px 40px rgba(15,52,96,0.12);
                    overflow: hidden;
                    animation: dropIn 0.14s ease;
                }

                @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .ss-dd-header {
                    padding: 14px 16px;
                    border-bottom: 1px solid #f0f2f6;
                }

                .ss-dd-name {
                    font-size: 14px; font-weight: 500; color: #1a1a2e; margin-bottom: 2px;
                }

                .ss-dd-email {
                    font-size: 12px; color: #9aa3b2; font-weight: 300;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }

                .ss-dd-item {
                    display: flex; align-items: center; gap: 10px;
                    padding: 10px 16px; font-size: 13.5px; color: #3c4257;
                    cursor: pointer; border: none; background: none; width: 100%;
                    text-align: left; font-family: 'DM Sans', sans-serif;
                    text-decoration: none; transition: background 0.12s;
                }

                .ss-dd-item:hover { background: #f5f7fb; color: #1a1a2e; }

                .ss-dd-item.danger { color: #c53030; }
                .ss-dd-item.danger:hover { background: #fff5f5; }

                .ss-dd-divider { height: 1px; background: #f0f2f6; margin: 3px 0; }

                @media (max-width: 640px) {
                    .ss-nav { display: none; }
                    .ss-greeting { display: none; }
                    .ss-header-inner { padding: 0 1rem; }
                }
            `}</style>

            <header className="ss-header">
                <div className="ss-header-inner">

                    <Link to="/dashboard" className="ss-brand">
                        <div className="ss-brand-icon">
                            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <span className="ss-brand-text">StudySync</span>
                    </Link>

                    <nav className="ss-nav">
                        <Link to="/dashboard" className="ss-nav-link active">Dashboard</Link>
                        <a href="#rooms" className="ss-nav-link">My Rooms</a>
                    </nav>

                    <div className="ss-right">
                        <span className="ss-greeting">
                            Hello, <strong>{user?.name?.split(' ')[0] || 'there'}</strong>
                        </span>

                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                className="ss-avatar-btn"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                aria-label="Profile menu"
                                aria-expanded={dropdownOpen}
                            >
                                <div className="ss-avatar">{initials}</div>
                                <span className={`ss-chevron ${dropdownOpen ? 'open' : ''}`}>
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 9l6 6 6-6"/>
                                    </svg>
                                </span>
                            </button>

                            {dropdownOpen && (
                                <div className="ss-dropdown">
                                    <div className="ss-dd-header">
                                        <p className="ss-dd-name">{user?.name}</p>
                                        <p className="ss-dd-email">{user?.email}</p>
                                    </div>

                                    <Link to="/profile" className="ss-dd-item" onClick={() => setDropdownOpen(false)}>
                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                        My Profile
                                    </Link>

                                    <Link to="/settings" className="ss-dd-item" onClick={() => setDropdownOpen(false)}>
                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <circle cx="12" cy="12" r="3"/>
                                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                                        </svg>
                                        Settings
                                    </Link>

                                    <div className="ss-dd-divider" />

                                    <button className="ss-dd-item danger" onClick={handleLogout}>
                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                                        </svg>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;