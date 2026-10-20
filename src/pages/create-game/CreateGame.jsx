import { useState } from 'react';
import { Link } from 'react-router-dom';
import GameForm from '../../components/game-form/GameForm';
import { createGame } from '../../services/gameService';

export default function CreateGame() {
    const [createdGame, setCreatedGame] = useState(null);

    async function handleSave(values) {
        const game = await createGame(values);
        setCreatedGame(game);
    }

    return (
        <section className="create-game-page" aria-labelledby="create-game-heading">
            <h1 id="create-game-heading">Add a game</h1>
            <p>Add a game to the shared catalog. You will be able to manage the entries you create.</p>
            {createdGame ? (
                <div className="create-game-success" role="status">
                    <h2>Game added</h2>
                    <p>{createdGame.title} was saved successfully.</p>
                    <div className="create-game-actions">
                        <Link to={`/games/${createdGame.id}`}>Open game page</Link>
                        <button type="button" onClick={() => setCreatedGame(null)}>Add another game</button>
                    </div>
                </div>
            ) : <GameForm onSave={handleSave} />}
        </section>
    );
}
