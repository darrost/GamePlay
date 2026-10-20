import { useEffect, useState } from 'react';
import { getGames } from '../services/gameService';

export function useGames() {
    const [result, setResult] = useState({ games: [], status: 'loading' });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadGames() {
            try {
                const games = await getGames({ signal: controller.signal });
                if (!controller.signal.aborted) setResult({ games, status: 'success' });
            } catch {
                if (!controller.signal.aborted) setResult({ games: [], status: 'error' });
            }
        }

        loadGames();
        return () => controller.abort();
    }, [attempt]);

    function retry() {
        setResult({ games: [], status: 'loading' });
        setAttempt((previous) => previous + 1);
    }

    return { ...result, retry };
}
