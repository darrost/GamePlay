import { useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import './Header.css';

const navClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

export default function Header() {
    const { user, isLoading } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState('');
    const logoutInProgress = useRef(false);
    const navigate = useNavigate();

    async function handleLogout() {
        if (logoutInProgress.current) return;
        logoutInProgress.current = true;
        setIsLoggingOut(true);
        setLogoutError('');

        try {
            const { error } = await supabase.auth.signOut({ scope: 'local' });
            if (error) throw error;
            navigate('/', { replace: true });
        } catch {
            setLogoutError('We could not log you out. Please try again.');
        } finally {
            logoutInProgress.current = false;
            setIsLoggingOut(false);
        }
    }

    return (
        <header className="site-header">
            <div className="header-inner">
                <Link to="/" className="logo">GamePlay</Link>

                <nav aria-label="Main navigation">
                    <ul className="nav-list">
                        <li><NavLink to="/" end className={navClass}>Home</NavLink></li>
                        <li><NavLink to="/games" className={navClass}>Games</NavLink></li>
                        {!isLoading && (user ? (
                            <>
                                <li><NavLink to="/library" className={navClass}>My Library</NavLink></li>
                                <li><NavLink to="/games/create" className={navClass}>Add Game</NavLink></li>
                                <li className="nav-user">Signed in as {user.email}</li>
                                <li><button type="button" className="nav-link nav-logout" onClick={handleLogout}
                                    disabled={isLoggingOut}>{isLoggingOut ? 'Logging out…' : 'Log out'}</button></li>
                            </>
                        ) : (
                            <>
                                <li><NavLink to="/login" className={navClass}>Login</NavLink></li>
                                <li><NavLink to="/register" className="nav-link nav-cta">Register</NavLink></li>
                            </>
                        ))}
                    </ul>
                </nav>
            </div>
            {logoutError && <p className="header-error" role="alert">{logoutError}</p>}
        </header>
    );
}
