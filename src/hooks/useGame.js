import { useEffect, useState } from 'react';
import { getGame } from '../services/gameService';

export function useGame(gameId) {
    const [result, setResult] = useState({ id: gameId, game: null, status: 'loading' });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadGame() {
            try {
                const game = await getGame(gameId, { signal: controller.signal });
                if (!controller.signal.aborted) setResult({ id: gameId, game, status: 'success' });
            } catch {
                if (!controller.signal.aborted) setResult({ id: gameId, game: null, status: 'error' });
            }
        }

        loadGame();
        return () => controller.abort();
    }, [gameId, attempt]);

    function retry() {
        setResult({ id: gameId, game: null, status: 'loading' });
        setAttempt((previous) => previous + 1);
    }

    const currentResult = result.id === gameId ? result : { game: null, status: 'loading' };
    return { game: currentResult.game, status: currentResult.status, retry };
}
