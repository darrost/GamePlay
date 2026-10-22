import { useState } from 'react';
import { Link } from 'react-router-dom';
import GameCard from '../../components/game-card/GameCard';
import LibraryAction from '../../components/library-action/LibraryAction';
import { useAuth } from '../../hooks/useAuth';
import { useLibrary } from '../../hooks/useLibrary';
import '../games/Games.css';
import './Library.css';

function UserLibrary({ userId }) {
    const { entries, status, retry, removeEntry } = useLibrary(userId);
    const [notice, setNotice] = useState('');

    function handleRemoved(entry) {
        removeEntry(entry.game_id);
        setNotice(`${entry.game.title} was removed from your library.`);
    }

    return (
        <section className="games-page library-page" aria-labelledby="library-heading">
            <h1 id="library-heading">My Library</h1>
            <p>Your saved games. Removing a game here keeps it in the shared catalog.</p>
            {notice && <p role="status">{notice}</p>}
            {status === 'loading' && <p className="games-message" role="status">Loading your library…</p>}
            {status === 'error' && (
                <div className="games-message">
                    <p role="alert">We could not load your library. Check your connection and try again.</p>
                    <button type="button" onClick={retry}>Try again</button>
                </div>
            )}
            {status === 'success' && (entries.length === 0 ? (
                <div className="games-message">
                    <h2>Your library is empty</h2>
                    <p>Open a game from the catalog and choose Save to library.</p>
                    <Link to="/games">Browse games</Link>
                </div>
            ) : (
                <>
                    <p className="games-count">{entries.length} saved {entries.length === 1 ? 'game' : 'games'} · Most recently saved first</p>
                    <div className="games-grid">
                        {entries.map((entry) => (
                            <div className="library-entry" key={entry.game_id}>
                                <GameCard game={entry.game} />
                                <LibraryAction gameId={entry.game_id} userId={userId} initialSaved
                                    onRemoved={() => handleRemoved(entry)} />
                            </div>
                        ))}
                    </div>
                </>
            ))}
        </section>
    );
}

export default function Library() {
    const { user } = useAuth();
    return user ? <UserLibrary key={user.id} userId={user.id} /> : null;
}
