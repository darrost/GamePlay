import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import { useAuth } from '../../hooks/useAuth';
import './Layout.css';
export default function Layout() {
    const { isLoading, error } = useAuth();

    return (
        <div className="app-shell">
            <Header />
            <main id="main-content" tabIndex={-1}>
                {isLoading ? (
                    <p role="status">Checking your session…</p>
                ) : (
                    <>
                        {error && <p role="alert">{error}</p>}
                        <Outlet />
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
