import { Link } from 'react-router-dom';
import GameCover from '../game-cover/GameCover';
import { getPlatformLabel } from '../../utils/gamePresentation';
import './GameCard.css';

export default function GameCard({ game }) {
    return (
        <article className="game-card">
            <Link className="game-card-link" to={`/games/${game.id}`} aria-label={`View ${game.title}`}>
                <GameCover src={game.image_url} title={game.title} />
                <div className="game-card-body">
                    <h2>{game.title}</h2>
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
