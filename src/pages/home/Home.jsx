import { Link } from 'react-router-dom';
import GameCard from '../../components/game-card/GameCard';
import { useGames } from '../../hooks/useGames';
import { useAuth } from '../../hooks/useAuth';
import './Home.css';

export default function Home() {
    const { games, status, retry } = useGames();
    const { user } = useAuth();

    return (
        <div className="home-page">
            <section className="home-hero" aria-labelledby="home-heading">
                <div className="home-hero-copy">
                    <span className="eyebrow">For the love of games</span>
                    <h1 id="home-heading">Discover your<br /><span>next adventure.</span></h1>
                    <p>Explore games, read community reviews, and keep your favorites in one place.</p>
                    <div className="home-hero-actions">
                        <Link className="button-primary" to="/games">Browse games <span aria-hidden="true">↗</span></Link>
                        <Link className="button-secondary" to={user ? '/library' : '/register'}>{user ? 'My library' : 'Join the community'}</Link>
                    </div>
                </div>
                <span className="home-hero-caption" aria-hidden="true">Explore. Review. Collect.</span>
            </section>

            <section className="home-catalog" aria-labelledby="home-catalog-heading">
                <div className="home-section-heading">
                    <div><span className="eyebrow">Find your next favorite</span><h2 id="home-catalog-heading">Fresh from the catalog<span aria-hidden="true"> //</span></h2></div>
                    <Link to="/games">View all games <span aria-hidden="true">→</span></Link>
                </div>
                {status === 'loading' && <p className="games-message" role="status">Loading the latest games…</p>}
                {status === 'error' && <div className="games-message"><p role="alert">We could not load the latest games. Please try again.</p><button type="button" onClick={retry}>Try again</button></div>}
                {status === 'success' && (games.length > 0 ? (
                    <div className="home-games-grid">{games.slice(0, 3).map((game) => <GameCard key={game.id} game={game} />)}</div>
                ) : <div className="games-message"><p>The catalog is ready for its first adventure.</p><Link to={user ? '/games/create' : '/register'}>Share the first game →</Link></div>)}
            </section>

            <section className="home-features" aria-label="What you can do on GamePlay">
                <div><span className="home-feature-number" aria-hidden="true">01 /</span><h2>Discover something new.</h2><p>Browse a catalog built by people who love games.</p></div>
                <div><span className="home-feature-number" aria-hidden="true">02 /</span><h2>Have your say.</h2><p>Leave a rating and share your experience with the community.</p></div>
                <div><span className="home-feature-number" aria-hidden="true">03 /</span><h2>Make it your library.</h2><p>Save the games that catch your eye in your own private collection.</p></div>
            </section>
        </div>
    );
}
