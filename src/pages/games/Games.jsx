import { Link, useLocation } from 'react-router-dom';
import GameCard from '../../components/game-card/GameCard';
import { useGames } from '../../hooks/useGames';
import { useAuth } from '../../hooks/useAuth';
import './Games.css';

export default function Games() {
    const { games, status, retry } = useGames();
    const { user } = useAuth();
    const { state } = useLocation();

    return (
        <section className="games-page" aria-labelledby="games-heading">
            <div className="games-heading-row">
                <div>
                    <h1 id="games-heading">Games</h1>
                    <p>Discover games shared by the GamePlay community.</p>
                </div>
                {user && <Link className="games-add" to="/games/create">Add a game</Link>}
            </div>

            {state?.deletedGameTitle && <p className="games-message" role="status">{state.deletedGameTitle} was deleted.</p>}
            {status === 'loading' && <p className="games-message" role="status">Loading games…</p>}
            {status === 'error' && (
                <div className="games-message">
                    <p role="alert">We could not load the games. Check your connection and try again.</p>
                    <button type="button" onClick={retry}>Try again</button>
                </div>
            )}
            {status === 'success' && (games.length === 0 ? (
                <div className="games-message">
                    <h2>No games yet</h2>
                    <p>Be the first to share a game with the community.</p>
                    <Link to={user ? '/games/create' : '/register'}>{user ? 'Add the first game' : 'Create an account to add games'}</Link>
                </div>
            ) : (
                <>
                    <p className="games-count">{games.length} {games.length === 1 ? 'game' : 'games'} · Newest additions first</p>
                    <div className="games-grid">
                        {games.map((game) => <GameCard key={game.id} game={game} />)}
                    </div>
                </>
            ))}
        </section>
    );
}
