import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import API, { getAssetUrl } from '../../services/api';
import './Profile.css';

const ProfilePage = () => {
    const { user, logout , setUser } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    
    const initialAvatar = user?.avatar 
    ? getAssetUrl(user.avatar)
    : null;
    
    // Form States
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // Avatar States
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(initialAvatar);
    const fileInputRef = useRef(null);

    // Status States
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const getInitials = (name) => {
        return (name || 'User').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    // --- Avatar Selection Handler ---
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file)); // Show preview instantly
        } else {
            setMessage({ text: 'Please select a valid image file.', type: 'error' });
        }
    };

    // --- 1. GENERAL INFO HANDLER ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const { data } = await API.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // --- THE FIX: UPDATE GLOBAL STATE INSTANTLY ---
            setUser(data.user); 
            
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Failed to update profile.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // --- 2. SECURITY / PASSWORD HANDLER ---
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            await API.put('/auth/profile', { currentPassword, newPassword });
            
            setMessage({ text: 'Password changed successfully!', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Failed to change password.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <Header />

            <main className="profile-main">
                <div className="profile-container">
                    
                    {/* Top Banner / User Summary */}
                    <div className="profile-banner">
                        
                        {/* --- NEW AVATAR UPLOAD UI --- */}
                        <div className="profile-avatar-wrapper" onClick={() => fileInputRef.current.click()}>
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar Preview" className="profile-avatar-img" />
                            ) : (
                                <div className="profile-avatar-large">
                                    {getInitials(name)}
                                </div>
                            )}
                            
                            <div className="avatar-overlay">
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            {/* Hidden file input */}
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                onChange={handleAvatarChange} 
                                className="hidden" 
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="profile-banner-info">
                            <h1 className="profile-name">{name || 'Student'}</h1>
                            <p className="profile-email">{email || 'student@studysync.io'}</p>
                            <span className="profile-badge">Pro Member</span>
                        </div>
                    </div>

                    <div className="profile-layout">
                        {/* Sidebar Navigation */}
                        <aside className="profile-sidebar">
                            <button 
                                className={`profile-tab ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('general'); setMessage({ text: '', type: '' }); }}
                            >
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                General Info
                            </button>
                            <button 
                                className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('security'); setMessage({ text: '', type: '' }); }}
                            >
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Security
                            </button>
                            
                            <div className="profile-sidebar-divider"></div>
                            
                            <button className="profile-tab danger" onClick={logout}>
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign Out
                            </button>
                        </aside>

                        {/* Main Content Area */}
                        <div className="profile-content">
                            {message.text && (
                                <div className={`profile-alert ${message.type}`}>
                                    {message.text}
                                </div>
                            )}

                            {activeTab === 'general' && (
                                <div className="profile-section">
                                    <h2 className="profile-section-title">Personal Information</h2>
                                    <p className="profile-section-sub">Update your photo and personal details here.</p>
                                    
                                    <form onSubmit={handleUpdateProfile} className="profile-form">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input 
                                                type="text" 
                                                value={name} 
                                                onChange={(e) => setName(e.target.value)}
                                                className="profile-input"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input 
                                                type="email" 
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="profile-input"
                                                required
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="profile-btn-primary" disabled={loading}>
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="profile-section">
                                    <h2 className="profile-section-title">Password & Security</h2>
                                    <p className="profile-section-sub">Ensure your account is using a long, random password to stay secure.</p>
                                    
                                    <form onSubmit={handleUpdatePassword} className="profile-form">
                                        <div className="form-group">
                                            <label>Current Password</label>
                                            <input 
                                                type="password" 
                                                value={currentPassword} 
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="profile-input"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>New Password</label>
                                            <input 
                                                type="password" 
                                                value={newPassword} 
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="profile-input"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="profile-btn-primary" disabled={loading}>
                                                {loading ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProfilePage;
