import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="ss-footer">
            <div className="ss-footer-inner">

                <Link to="/dashboard" className="ss-footer-brand">
                    <div className="ss-footer-icon">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <span className="ss-footer-name">StudySync</span>
                </Link>

                <span className="ss-footer-tagline">Study together. Grow together.</span>

                <span className="ss-footer-copy">© {year} StudySync. All rights reserved.</span>

            </div>
        </footer>
    );
};

export default Footer;
