import { Link } from 'react-router-dom';
import GameCover from '../game-cover/GameCover';
import { getPlatformLabel } from '../../utils/gamePresentation';
import './GameCard.css';

export default function GameCard({ game }) {
    const count = game.review_count ?? 0;
    const average = Number(game.average_rating ?? 0);
    const ratingLabel = count > 0
        ? `${average.toFixed(1)} out of 5 stars, ${count} ${count === 1 ? 'review' : 'reviews'}`
        : 'No ratings yet';

    return (
        <article className="game-card">
            <Link className="game-card-link" to={`/games/${game.id}`} aria-label={`View ${game.title}. ${ratingLabel}`}>
                <GameCover src={game.image_url} title={game.title} />
                <div className="game-card-body">
                    <h2>{game.title}</h2>
                    <div className="game-card-rating" aria-label={ratingLabel}>
                        <span className="game-card-stars" aria-hidden="true">
                            <span>★★★★★</span>
                            <span className="game-card-stars-filled" style={{ width: `${Math.max(0, Math.min(5, average)) * 20}%` }}>★★★★★</span>
                        </span>
                        <span>{count > 0 ? `${average.toFixed(1)} / 5 (${count})` : 'No ratings yet'}</span>
                    </div>
                    <p className="game-card-genre">{game.genre}</p>
                    <ul className="game-card-platforms" aria-label="Platforms">
                        {game.platforms.map((platform) => <li key={platform}>{getPlatformLabel(platform)}</li>)}
                    </ul>
                    <span className="game-card-details">View details →</span>
                </div>
            </Link>
        </article>
    );
}
