import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    // Scores password strength for the visual meter below the password field.
    const passwordStrength = (pw) => {
        if (!pw) return { score: 0, label: '', color: '#e8e6e1' };
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        if (score <= 1) return { score, label: 'Weak', color: '#e53e3e' };
        if (score <= 3) return { score, label: 'Fair', color: '#d69e2e' };
        return { score, label: 'Strong', color: '#38a169' };
    };

    const strength = passwordStrength(password);

    // Validates local form rules before creating the account through AuthContext.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!agreed) {
            setError('Please agree to the Terms & Privacy Policy to continue.');
            return;
        }
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .reg-root {
                    min-height: 100vh;
                    display: flex;
                    font-family: 'DM Sans', sans-serif;
                    background: #f5f3ef;
                }

                /* ── LEFT PANEL ── */
                .reg-left {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    position: relative;
                    overflow: hidden;
                    min-height: 100vh;
                }

                .reg-left::before {
                    content: '';
                    position: absolute;
                    width: 420px; height: 420px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.03);
                    top: -100px; left: -100px;
                }

                .reg-left::after {
                    content: '';
                    position: absolute;
                    width: 300px; height: 300px;
                    border-radius: 50%;
                    background: rgba(99,179,237,0.07);
                    bottom: -60px; right: -60px;
                }

                .left-inner {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                    padding: 3rem;
                    color: white;
                }

                .left-image-placeholder {
                    width: 340px; height: 280px;
                    border: 2px dashed rgba(255,255,255,0.18);
                    border-radius: 20px;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    gap: 12px;
                    color: rgba(255,255,255,0.45);
                    font-size: 14px; font-weight: 300; letter-spacing: 0.02em;
                    margin: 0 auto 2.5rem;
                    background: rgba(255,255,255,0.03);
                }

                .left-tagline {
                    font-family: 'Playfair Display', serif;
                    font-size: 28px; line-height: 1.35;
                    color: #fff; margin-bottom: 12px; letter-spacing: -0.01em;
                }

                .left-sub {
                    font-size: 14px; color: rgba(255,255,255,0.5);
                    font-weight: 300; letter-spacing: 0.02em;
                }

                /* step pills */
                .steps-row {
                    display: flex;
                    gap: 0;
                    justify-content: center;
                    margin-top: 2rem;
                    align-items: center;
                }

                .step-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .step-circle {
                    width: 28px; height: 28px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 12px; font-weight: 500;
                }

                .step-circle.done {
                    background: #63b3ed;
                    color: #1a1a2e;
                }

                .step-circle.active {
                    background: #fff;
                    color: #1a1a2e;
                }

                .step-circle.future {
                    background: rgba(255,255,255,0.15);
                    color: rgba(255,255,255,0.5);
                }

                .step-label {
                    font-size: 12px;
                    color: rgba(255,255,255,0.5);
                    letter-spacing: 0.04em;
                }

                .step-connector {
                    width: 28px; height: 1px;
                    background: rgba(255,255,255,0.2);
                    margin: 0 4px;
                }

                /* ── RIGHT PANEL ── */
                .reg-right {
                    width: 480px; flex-shrink: 0;
                    display: flex; flex-direction: column; justify-content: center;
                    padding: 3rem 3.5rem;
                    background: #fff;
                    min-height: 100vh;
                    overflow-y: auto;
                }

                .brand-row {
                    display: flex; align-items: center; gap: 10px;
                    margin-bottom: 2.5rem;
                }

                .brand-icon {
                    width: 36px; height: 36px;
                    background: #1a1a2e;
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                }

                .brand-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 20px; color: #1a1a2e; letter-spacing: -0.02em;
                }

                .welcome-heading {
                    font-family: 'Playfair Display', serif;
                    font-size: 30px; color: #1a1a2e;
                    letter-spacing: -0.02em; margin-bottom: 6px; line-height: 1.2;
                }

                .welcome-sub {
                    font-size: 14px; color: #888; font-weight: 300;
                    margin-bottom: 2rem; line-height: 1.6;
                }

                .error-box {
                    background: #fff5f5;
                    border: 1px solid #fed7d7;
                    color: #c53030;
                    padding: 10px 14px;
                    border-radius: 10px;
                    font-size: 13.5px;
                    margin-bottom: 1.2rem;
                }

                .field-group { margin-bottom: 1.1rem; }

                .field-label {
                    display: block;
                    font-size: 12px; font-weight: 500;
                    color: #888; letter-spacing: 0.08em;
                    text-transform: uppercase; margin-bottom: 7px;
                }

                .field-wrapper { position: relative; }

                .field-icon {
                    position: absolute; left: 14px; top: 50%;
                    transform: translateY(-50%);
                    color: #bbb; pointer-events: none; display: flex;
                }

                .field-input {
                    width: 100%;
                    padding: 12px 14px 12px 42px;
                    border: 1.5px solid #e8e6e1;
                    border-radius: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14.5px; color: #1a1a2e;
                    background: #fafaf8; outline: none;
                    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
                }

                .field-input:focus {
                    border-color: #0f3460;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(15,52,96,0.08);
                }

                .field-input::placeholder { color: #c8c4bb; font-weight: 300; }

                .toggle-pw {
                    position: absolute; right: 14px; top: 50%;
                    transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    color: #bbb; padding: 0; display: flex;
                    transition: color 0.15s;
                }
                .toggle-pw:hover { color: #888; }

                /* password strength */
                .strength-row {
                    display: flex; align-items: center; gap: 8px;
                    margin-top: 8px;
                }

                .strength-bars {
                    display: flex; gap: 4px; flex: 1;
                }

                .strength-bar {
                    flex: 1; height: 3px; border-radius: 2px;
                    background: #e8e6e1;
                    transition: background 0.3s;
                }

                .strength-text {
                    font-size: 12px; font-weight: 500;
                    min-width: 40px; text-align: right;
                }

                /* terms checkbox */
                .terms-row {
                    display: flex; align-items: flex-start; gap: 10px;
                    margin: 1.2rem 0 1.5rem; cursor: pointer;
                }

                .custom-checkbox {
                    width: 18px; height: 18px; flex-shrink: 0;
                    border: 1.5px solid #d0cdc6; border-radius: 5px;
                    display: flex; align-items: center; justify-content: center;
                    background: #fafaf8; transition: all 0.15s; margin-top: 1px;
                }

                .custom-checkbox.checked {
                    background: #0f3460; border-color: #0f3460;
                }

                .terms-text {
                    font-size: 13px; color: #777; line-height: 1.5;
                }

                .terms-text a {
                    color: #0f3460; text-decoration: none; font-weight: 500;
                }
                .terms-text a:hover { text-decoration: underline; }

                /* submit */
                .btn-submit {
                    width: 100%; padding: 13px;
                    background: #1a1a2e; color: #fff;
                    border: none; border-radius: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 15px; font-weight: 500;
                    cursor: pointer; letter-spacing: 0.01em;
                    transition: background 0.2s, transform 0.1s;
                    margin-bottom: 1rem;
                }
                .btn-submit:hover { background: #0f3460; }
                .btn-submit:active { transform: scale(0.99); }

                /* divider */
                .divider {
                    display: flex; align-items: center; gap: 12px;
                    margin: 1rem 0;
                }
                .divider-line { flex: 1; height: 1px; background: #ede9e3; }
                .divider-text {
                    font-size: 12px; color: #b5b0a7;
                    letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap;
                }

                /* social */
                .social-row { display: flex; gap: 12px; }

                .btn-social {
                    flex: 1; padding: 10px;
                    border: 1.5px solid #e8e6e1; border-radius: 10px;
                    background: #fafaf8; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13.5px; color: #444; font-weight: 400;
                    transition: border-color 0.15s, background 0.15s;
                    text-decoration: none;
                }
                .btn-social:hover { border-color: #c8c4bb; background: #f5f2ec; }

                .login-row {
                    text-align: center; margin-top: 1.8rem;
                    font-size: 13.5px; color: #888;
                }
                .login-row a {
                    color: #0f3460; font-weight: 500; text-decoration: none;
                }
                .login-row a:hover { text-decoration: underline; }

                @media (max-width: 820px) {
                    .reg-left { display: none; }
                    .reg-right { width: 100%; padding: 2.5rem 2rem; }
                }
            `}</style>

            <div className="reg-root">

                {/* ── LEFT ── */}
                <div className="reg-left">
                    <div className="left-inner">
                        <div className="left-image-placeholder">
                            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                                <rect x="3" y="3" width="18" height="18" rx="3"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <path d="M21 15l-5-5L5 21"/>
                            </svg>
                            <span>Add your illustration here</span>
                        </div>
                        <p className="left-tagline">Start your journey<br />to better grades.</p>
                        <p className="left-sub">Join thousands of focused learners</p>

                        <div className="steps-row">
                            <div className="step-pill">
                                <div className="step-circle done">✓</div>
                            </div>
                            <div className="step-connector" />
                            <div className="step-pill">
                                <div className="step-circle active">2</div>
                            </div>
                            <div className="step-connector" />
                            <div className="step-pill">
                                <div className="step-circle future">3</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registration form and account navigation. */}
                <div className="reg-right">

                    <div className="brand-row">
                        <div className="brand-icon">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <span className="brand-name">StudySync</span>
                    </div>

                    <h1 className="welcome-heading">Create your account</h1>
                    <p className="welcome-sub">Fill in the details below to get started<br />— it only takes a minute.</p>

                    {error && <div className="error-box">{error}</div>}

                    <form onSubmit={handleSubmit} noValidate>

                        {/* Full name field. */}
                        <div className="field-group">
                            <label className="field-label" htmlFor="name">Full Name</label>
                            <div className="field-wrapper">
                                <span className="field-icon">
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                </span>
                                <input
                                    id="name"
                                    type="text"
                                    className="field-input"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        {/* Email field. */}
                        <div className="field-group">
                            <label className="field-label" htmlFor="email">Email Address</label>
                            <div className="field-wrapper">
                                <span className="field-icon">
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                                        <path d="M2 7l10 7 10-7"/>
                                    </svg>
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    className="field-input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password field with strength feedback. */}
                        <div className="field-group">
                            <label className="field-label" htmlFor="password">Password</label>
                            <div className="field-wrapper">
                                <span className="field-icon">
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="field-input"
                                    placeholder="Min 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="6"
                                    autoComplete="new-password"
                                />
                                <button type="button" className="toggle-pw"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                    {showPassword ? (
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Visual password strength meter. */}
                            {password && (
                                <div className="strength-row">
                                    <div className="strength-bars">
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className="strength-bar"
                                                style={{ background: i <= strength.score ? strength.color : '#e8e6e1' }} />
                                        ))}
                                    </div>
                                    <span className="strength-text" style={{ color: strength.color }}>
                                        {strength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm password field with match/mismatch border feedback. */}
                        <div className="field-group">
                            <label className="field-label" htmlFor="confirmPassword">Confirm Password</label>
                            <div className="field-wrapper">
                                <span className="field-icon">
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </span>
                                <input
                                    id="confirmPassword"
                                    type={showConfirm ? 'text' : 'password'}
                                    className="field-input"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    style={{
                                        borderColor: confirmPassword && confirmPassword !== password
                                            ? '#e53e3e'
                                            : confirmPassword && confirmPassword === password
                                            ? '#38a169'
                                            : undefined
                                    }}
                                />
                                <button type="button" className="toggle-pw"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                                    {showConfirm ? (
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Terms agreement must be checked before submit. */}
                        <div className="terms-row" onClick={() => setAgreed(!agreed)}>
                            <div className={`custom-checkbox ${agreed ? 'checked' : ''}`}>
                                {agreed && (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                            </div>
                            <p className="terms-text">
                                I agree to the{' '}
                                <a href="/terms" onClick={e => e.stopPropagation()}>Terms of Service</a>
                                {' '}and{' '}
                                <a href="/privacy" onClick={e => e.stopPropagation()}>Privacy Policy</a>
                            </p>
                        </div>

                        <button type="submit" className="btn-submit">
                            Create Account
                        </button>

                    </form>

                    <div className="divider">
                        <div className="divider-line" />
                        <span className="divider-text">or sign up with</span>
                        <div className="divider-line" />
                    </div>

                    <div className="social-row">
                        <button type="button" className="btn-social">
                            <svg width="16" height="16" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google
                        </button>
                        <button type="button" className="btn-social">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                        </button>
                    </div>

                    <div className="login-row">
                        Already have an account?{' '}
                        <Link to="/login">Sign in instead</Link>
                    </div>

                </div>
            </div>
        </>
    );
};

export default RegisterPage;
