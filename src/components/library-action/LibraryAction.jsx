import { useEffect, useRef, useState } from 'react';
import { isGameSaved, removeFromLibrary, saveToLibrary } from '../../services/libraryService';
import './LibraryAction.css';

export default function LibraryAction({ gameId, userId, initialSaved, onRemoved }) {
    const [result, setResult] = useState({ saved: initialSaved ?? false, status: initialSaved === undefined ? 'loading' : 'success' });
    const [attempt, setAttempt] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const active = useRef(false);
    const requestInProgress = useRef(false);

    useEffect(() => {
        active.current = true;
        const controller = new AbortController();

        async function checkLibrary() {
            try {
                const saved = await isGameSaved(gameId, userId, { signal: controller.signal });
                if (!controller.signal.aborted) setResult({ saved, status: 'success' });
            } catch {
                if (!controller.signal.aborted) setResult({ saved: false, status: 'error' });
            }
        }

        if (initialSaved === undefined) checkLibrary();
        return () => {
            active.current = false;
            controller.abort();
        };
    }, [gameId, userId, initialSaved, attempt]);

    function retry() {
        setResult({ saved: false, status: 'loading' });
        setAttempt((previous) => previous + 1);
    }

    async function toggleSaved() {
        if (requestInProgress.current || result.status !== 'success') return;
        requestInProgress.current = true;
        setIsSaving(true);
        setError('');
        setMessage('');
        const wasSaved = result.saved;

        try {
            if (wasSaved) await removeFromLibrary(gameId, userId);
            else await saveToLibrary(gameId, userId);

            if (!active.current) return;
            setResult({ saved: !wasSaved, status: 'success' });
            setMessage(wasSaved ? 'Removed from your library.' : 'Saved to your library.');
            if (wasSaved) onRemoved?.();
        } catch {
            if (active.current) setError('We could not update your library. Check your connection and session, then try again.');
        } finally {
            requestInProgress.current = false;
            if (active.current) setIsSaving(false);
        }
    }

    return (
        <div className="library-action">
            {result.status === 'loading' && <p role="status">Checking your library…</p>}
            {result.status === 'error' && (
                <>
                    <p className="library-action-error" role="alert">We could not check your library.</p>
                    <button type="button" onClick={retry}>Retry library check</button>
                </>
            )}
            {result.status === 'success' && (
                <button type="button" onClick={toggleSaved} disabled={isSaving}>
                    {isSaving ? 'Updating library…' : result.saved ? 'Remove from library' : 'Save to library'}
                </button>
            )}
            {isSaving && <p role="status">Updating your saved games. Please wait.</p>}
            {error && <p className="library-action-error" role="alert">{error}</p>}
            {message && <p role="status">{message}</p>}
        </div>
    );
}
