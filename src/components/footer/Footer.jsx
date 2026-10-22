import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div><Link to="/" className="footer-brand">Game<span>Play</span></Link><p>Discover games. Share your perspective.</p></div>
                <div className="footer-right"><Link to="/games">Explore the catalog ↗</Link><p>&copy; {new Date().getFullYear()} GamePlay</p></div>
            </div>
        </footer>
    );
}
