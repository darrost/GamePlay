import './Footer.css';

export default function Footer() {
    return (
        <footer className="site-footer">
            <p>&copy; {new Date().getFullYear()} GamePlay. Discover games, share reviews.</p>
        </footer>
    );
}
