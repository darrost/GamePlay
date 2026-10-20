import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import GameForm from '../../components/game-form/GameForm';
import { useAuth } from '../../hooks/useAuth';
import { useGame } from '../../hooks/useGame';
import { updateGame } from '../../services/gameService';

function EditGameForm({ game, userId }) {
    const [savedGame, setSavedGame] = useState(null);

    async function handleSave(values) {
        const updated = await updateGame(game.id, values, userId);
        setSavedGame(updated);
    }

    if (savedGame) {
        return (
            <div className="create-game-success" role="status">
                <h2>Game updated</h2>
                <p>{savedGame.title} was saved successfully.</p>
                <Link to={`/games/${savedGame.id}`}>Open game page</Link>
            </div>
        );
    }

    return <GameForm initialValues={{
        title: game.title, description: game.description, image_url: game.image_url,
        genre: game.genre, platforms: game.platforms, release_date: game.release_date ?? '',
    }} onSave={handleSave} submitLabel="Save changes" cancelTo={`/games/${game.id}`} />;
}

export default function EditGame() {
    const { gameId } = useParams();
    const { user } = useAuth();
    const { game, status, retry } = useGame(gameId);

    return (
        <section className="create-game-page" aria-labelledby="edit-game-heading">
            <h1 id="edit-game-heading">Edit game</h1>
            {status === 'loading' && <p role="status">Loading game…</p>}
            {status === 'error' && (
                <div>
                    <p role="alert">We could not load the game. Check your connection and try again.</p>
                    <button type="button" onClick={retry}>Try again</button>
                </div>
            )}
            {status === 'success' && (!game ? (
                <div><h2>Game not found</h2><p>This game does not exist or is no longer available.</p><Link to="/games">Back to Games</Link></div>
            ) : user?.id !== game.owner_id ? (
                <div><h2>You cannot edit this game</h2><p>Only the account that added this game can edit it.</p><Link to={`/games/${game.id}`}>Back to game</Link></div>
            ) : (
                <>
                    <p>Update the details of your game. Changes will appear in the shared catalog.</p>
                    <EditGameForm key={`${game.id}:${user.id}`} game={game} userId={user.id} />
                </>
            ))}
        </section>
    );
}
