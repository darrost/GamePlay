import { Link, useParams } from 'react-router-dom';
import GameOwnerActions from '../../components/game-owner-actions/GameOwnerActions';
import LibraryAction from '../../components/library-action/LibraryAction';
import GameReviews from '../../components/game-reviews/GameReviews';
import GameCover from '../../components/game-cover/GameCover';
import { useAuth } from '../../hooks/useAuth';
import { useGame } from '../../hooks/useGame';
import { formatReleaseDate, getPlatformLabel } from '../../utils/gamePresentation';
import './GameDetails.css';

export default function GameDetails() {
    const { gameId } = useParams();
    const { user } = useAuth();
    const { game, status, retry } = useGame(gameId);

    return (
        <section className="game-details-page" aria-labelledby="game-details-heading">
            <Link className="game-details-back" to="/games">← Back to Games</Link>

            {status === 'loading' && (
                <>
                    <h1 id="game-details-heading">Game details</h1>
                    <p role="status">Loading game…</p>
                </>
            )}
            {status === 'error' && (
                <div className="game-details-message">
                    <h1 id="game-details-heading">Could not load game</h1>
                    <p role="alert">Check your connection and try again.</p>
                    <button type="button" onClick={retry}>Try again</button>
                </div>
            )}
            {status === 'success' && (!game ? (
                <div className="game-details-message">
                    <h1 id="game-details-heading">Game not found</h1>
                    <p>This game does not exist or is no longer available.</p>
                </div>
            ) : (
                <>
                    <h1 id="game-details-heading">{game.title}</h1>
                    <div className="game-details-actions">
                    {user?.id === game.owner_id && (
                        <GameOwnerActions key={`owner:${game.id}:${user.id}`} game={game} userId={user.id} />
                    )}
                    {user ? (
                        <LibraryAction key={`library:${game.id}:${user.id}`} gameId={game.id} userId={user.id} />
                    ) : <p><Link to="/login">Log in</Link> to save this game to your library.</p>}
                    </div>
                    <div className="game-details-overview">
                        <div className="game-details-image"><GameCover src={game.image_url} title={game.title} eager /></div>
                        <dl className="game-details-facts">
                            <div><dt>Genre</dt><dd>{game.genre}</dd></div>
                            <div><dt>Platforms</dt><dd>{game.platforms.map(getPlatformLabel).join(', ')}</dd></div>
                            <div><dt>Release date</dt><dd>{formatReleaseDate(game.release_date)}</dd></div>
                        </dl>
                    </div>
                    <section className="game-details-description" aria-labelledby="game-description-heading">
                        <h2 id="game-description-heading">About this game</h2>
                        <p>{game.description}</p>
                    </section>
                    <GameReviews key={`reviews:${game.id}:${user?.id ?? 'guest'}`} gameId={game.id} gameTitle={game.title} userId={user?.id} />
                </>
            ))}
        </section>
    );
}
