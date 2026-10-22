import { useEffect, useState } from 'react';
import { getLibrary } from '../services/libraryService';

export function useLibrary(userId) {
    const [result, setResult] = useState({ entries: [], status: 'loading' });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadLibrary() {
            try {
                const entries = await getLibrary(userId, { signal: controller.signal });
                if (!controller.signal.aborted) setResult({ entries, status: 'success' });
            } catch {
                if (!controller.signal.aborted) setResult({ entries: [], status: 'error' });
            }
        }

        loadLibrary();
        return () => controller.abort();
    }, [userId, attempt]);

    function retry() {
        setResult({ entries: [], status: 'loading' });
        setAttempt((previous) => previous + 1);
    }

    function removeEntry(gameId) {
        setResult((previous) => ({
            ...previous,
            entries: previous.entries.filter((entry) => entry.game_id !== gameId),
        }));
    }

    return { ...result, retry, removeEntry };
}
