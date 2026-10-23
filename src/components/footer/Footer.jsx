import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div><Link to="/" className="footer-brand">Game<span>Play</span></Link><p>Discover games. Share your perspective.</p></div>
                <div className="footer-right"><Link to="/games">Explore the catalog <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10" /></svg></Link><p>&copy; {new Date().getFullYear()} GamePlay</p></div>
            </div>
        </footer>
    );
}
