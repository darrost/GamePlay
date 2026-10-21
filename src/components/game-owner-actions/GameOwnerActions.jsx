import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteGame } from '../../services/gameService';
import './GameOwnerActions.css';

export default function GameOwnerActions({ game, userId }) {
    const navigate = useNavigate();
    const dialogRef = useRef(null);
    const cancelRef = useRef(null);
    const deleteButtonRef = useRef(null);
    const requestInProgress = useRef(false);
    const mounted = useRef(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    useEffect(() => {
        if (!isConfirming) return;
        const dialog = dialogRef.current;
        const trigger = deleteButtonRef.current;
        dialog.showModal();
        cancelRef.current?.focus();
        return () => {
            dialog.close();
            trigger?.focus();
        };
    }, [isConfirming]);

    function cancelDelete(event) {
        event?.preventDefault();
        if (requestInProgress.current) return;
        setIsConfirming(false);
        setError('');
    }

    async function confirmDelete() {
        if (requestInProgress.current) return;
        requestInProgress.current = true;
        setIsDeleting(true);
        setError('');

        try {
            await deleteGame(game.id, userId);
            if (mounted.current) navigate('/games', { replace: true, state: { deletedGameTitle: game.title } });
        } catch {
            if (mounted.current) {
                setError('The game could not be deleted. Check your connection and make sure you still own this game, then try again.');
            }
        } finally {
            requestInProgress.current = false;
            if (mounted.current) setIsDeleting(false);
        }
    }

    return (
        <div className="game-owner-actions">
            <Link className="game-details-edit" to={`/games/${game.id}/edit`}>Edit game</Link>
            <button className="game-delete-button" type="button" ref={deleteButtonRef} onClick={() => setIsConfirming(true)}>Delete game</button>
            {isConfirming && (
                <dialog className="game-delete-dialog" ref={dialogRef} onCancel={cancelDelete}
                    aria-labelledby="delete-game-heading" aria-describedby="delete-game-description" aria-busy={isDeleting}>
                    <h2 id="delete-game-heading">Delete game?</h2>
                    <p id="delete-game-description">Permanently delete <strong>{game.title}</strong> from the shared catalog? This cannot be undone.</p>
                    {error && <p className="game-delete-error" role="alert">{error}</p>}
                    <div className="game-owner-actions">
                        <button className="game-delete-cancel" type="button" ref={cancelRef} disabled={isDeleting} onClick={cancelDelete}>Cancel</button>
                        <button className="game-delete-button" type="button" disabled={isDeleting} onClick={confirmDelete}>
                            {isDeleting ? 'Deleting game…' : 'Yes, delete game'}
                        </button>
                    </div>
                    {isDeleting && <p role="status">Deleting your game. Please wait.</p>}
                </dialog>
            )}
        </div>
    );
}
