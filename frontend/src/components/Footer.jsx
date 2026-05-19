import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

                .ss-footer {
                    background: #fff;
                    border-top: 1px solid #e8eaf0;
                    font-family: 'DM Sans', sans-serif;
                    margin-top: auto;
                }

                .ss-footer-inner {
                    max-width: 1160px; margin: 0 auto;
                    padding: 2rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .ss-footer-brand {
                    display: flex; align-items: center; gap: 9px;
                    text-decoration: none;
                }

                .ss-footer-icon {
                    width: 28px; height: 28px;
                    background: #1a1a2e; border-radius: 7px;
                    display: flex; align-items: center; justify-content: center;
                }

                .ss-footer-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 14px; color: #1a1a2e;
                    letter-spacing: 0.1em; text-transform: uppercase;
                }

                .ss-footer-links {
                    display: flex; align-items: center;
                    gap: 1.8rem; list-style: none; margin: 0; padding: 0;
                }

                .ss-footer-links a {
                    font-size: 13px; color: #9aa3b2;
                    text-decoration: none; font-weight: 300;
                    transition: color 0.15s;
                }

                .ss-footer-links a:hover { color: #1a1a2e; }

                .ss-footer-copy {
                    font-size: 12.5px; color: #b0b8c8;
                    font-weight: 300;
                }

                @media (max-width: 600px) {
                    .ss-footer-inner { flex-direction: column; align-items: flex-start; gap: 1.2rem; }
                    .ss-footer-links { gap: 1.2rem; flex-wrap: wrap; }
                }
            `}</style>

            <footer className="ss-footer">
                <div className="ss-footer-inner">

                    <Link to="/dashboard" className="ss-footer-brand">
                        <div className="ss-footer-icon">
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <span className="ss-footer-name">StudySync</span>
                    </Link>

                    <ul className="ss-footer-links">
                        <li><a href="#rooms">My Rooms</a></li>
                        <li><Link to="/profile">Profile</Link></li>
                        <li><Link to="/settings">Settings</Link></li>
                        <li><a href="mailto:support@studysync.io">Support</a></li>
                    </ul>

                    <span className="ss-footer-copy">
                        © {year} StudySync. All rights reserved.
                    </span>

                </div>
            </footer>
        </>
    );
};

export default Footer;