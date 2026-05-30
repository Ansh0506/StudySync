import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
    const { user } = useAuth();

    const toggleTheme = () => {
        const isLight = document.documentElement.classList.toggle('light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };

    const getInitials = (name) =>
        (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <header className="ss-header">
            <div className="ss-header-inner">

                {/* Logo */}
                <Link to="/dashboard" className="ss-header-brand">
                    <div className="ss-header-logo-icon">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <span className="ss-header-logo-text">StudySync</span>
                </Link>

                <div className="ss-header-nav" />

                {/* Actions */}
                <div className="ss-header-actions">

                    <button className="ss-header-theme-btn" onClick={toggleTheme} title="Toggle Theme">
                        <svg className="sun-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
                        </svg>
                        <svg className="moon-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                        </svg>
                    </button>

                    <div className="ss-header-user-wrap">
                        <Link to="/profile" className="ss-header-user-btn">
                            <span className="ss-header-user-name">
                                Hello, <strong>{user?.name?.split(' ')[0] || 'Student'}</strong>
                            </span>
                            <div className="ss-header-avatar">
                                {user?.avatar ? (
                                    <img
                                        src={`http://localhost:5000/${user.avatar.replace(/\\/g, '/')}`}
                                        alt="Avatar"
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    getInitials(user?.name)
                                )}
                            </div>
                        </Link>
                    </div>

                </div>
            </div>
        </header>
    );
};

export default Header;