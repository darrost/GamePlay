import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import './Layout.css';

// Layout route: header and footer stay mounted while <Outlet /> swaps the page.
export default function Layout() {
    return (
        <div className="app-shell">
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
