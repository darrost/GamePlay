import { useRef, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import './Header.css';

const navClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

export default function Header() {
    const { user, isLoading } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const logoutInProgress = useRef(false);
    const menuButton = useRef(null);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    async function handleLogout() {
        if (logoutInProgress.current) return;
        logoutInProgress.current = true;
        setIsLoggingOut(true);
        setLogoutError('');

        try {
            const { error } = await supabase.auth.signOut({ scope: 'local' });
            if (error) throw error;
            setIsMenuOpen(false);
            navigate('/', { replace: true });
        } catch {
            setLogoutError('We could not log you out. Please try again.');
        } finally {
            logoutInProgress.current = false;
            setIsLoggingOut(false);
        }
    }

    function handleEscape(event) {
        if (event.key === 'Escape' && isMenuOpen) {
            setIsMenuOpen(false);
            menuButton.current?.focus();
        }
    }

    return (
        <header className="site-header" onKeyDown={handleEscape}>
            <a className="skip-link" href="#main-content">Skip to content</a>
            <div className="header-inner">
                <Link to="/" className="logo" onClick={() => setIsMenuOpen(false)} aria-label="GamePlay home">
                    <svg viewBox="0 0 32 28" fill="none" aria-hidden="true">
                        <path d="M10 5h12c3 0 5 3 6 7l2 9c.6 4-3 6-5.5 3.5L20 20h-8l-4.5 4.5C5 27 1.4 25 2 21l2-9c1-4 3-7 6-7Z" stroke="currentColor" strokeWidth="2" />
                        <path d="M10 10v8m-4-4h8" stroke="currentColor" strokeWidth="2" />
                        <circle cx="22" cy="11" r="1.5" fill="currentColor" /><circle cx="25" cy="15" r="1.5" fill="currentColor" />
                    </svg>
                    <span>Game<span className="logo-accent">Play</span></span>
                </Link>
                <button ref={menuButton} type="button" className="nav-toggle" aria-expanded={isMenuOpen}
                    aria-controls="main-navigation" onClick={() => setIsMenuOpen((open) => !open)}>
                    {isMenuOpen ? 'Close' : 'Menu'} <span aria-hidden="true">{isMenuOpen ? '×' : '☰'}</span>
                </button>
                <nav id="main-navigation" className={`main-navigation${isMenuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
                    <ul className="nav-list">
                        <li><NavLink to="/" end className={navClass} onClick={() => setIsMenuOpen(false)}>Home</NavLink></li>
                        <li><NavLink to="/games" className={({ isActive }) => navClass({ isActive: isActive && pathname !== '/games/create' })} onClick={() => setIsMenuOpen(false)}>Games</NavLink></li>
                        {!isLoading && (user ? (
                            <>
                                <li><NavLink to="/library" className={navClass} onClick={() => setIsMenuOpen(false)}>My Library</NavLink></li>
                                <li><NavLink to="/games/create" className={navClass} onClick={() => setIsMenuOpen(false)}>Add Game</NavLink></li>
                                <li className="nav-user" title={`Signed in as ${user.email}`}><span className="nav-user-dot" aria-hidden="true" /><span><span className="visually-hidden">Signed in as </span>{user.email}</span></li>
                                <li><button type="button" className="nav-link nav-logout" onClick={handleLogout}
                                    disabled={isLoggingOut}>{isLoggingOut ? 'Logging out…' : 'Log out'}</button></li>
                            </>
                        ) : (
                            <>
                                <li><NavLink to="/login" className={navClass} onClick={() => setIsMenuOpen(false)}>Login</NavLink></li>
                                <li><NavLink to="/register" className="nav-link nav-cta" onClick={() => setIsMenuOpen(false)}>Register <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10" /></svg></NavLink></li>
                            </>
                        ))}
                    </ul>
                </nav>
            </div>
            {logoutError && <p className="header-error" role="alert">{logoutError}</p>}
        </header>
    );
}
