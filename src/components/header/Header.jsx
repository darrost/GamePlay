import { NavLink, Link } from 'react-router-dom';
import './Header.css';

// NavLink adds an "active" class to the link that matches the current URL.
const navClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

export default function Header() {
    return (
        <header className="site-header">
            <div className="header-inner">
                <Link to="/" className="logo">GamePlay</Link>

                <nav aria-label="Main navigation">
                    <ul className="nav-list">
                        <li><NavLink to="/" end className={navClass}>Home</NavLink></li>
                        <li><NavLink to="/games" className={navClass}>Games</NavLink></li>
                        <li><NavLink to="/login" className={navClass}>Login</NavLink></li>
                        <li><NavLink to="/register" className="nav-link nav-cta">Register</NavLink></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
