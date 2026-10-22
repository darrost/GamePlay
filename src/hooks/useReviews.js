import { useEffect, useState } from 'react';
import { getOwnReview, getReviewPage, getReviewStats } from '../services/reviewService';

const loadingResult = { reviews: [], count: 0, stats: null, ownReview: null, status: 'loading' };

export function useReviews(gameId, userId) {
    const [result, setResult] = useState(loadingResult);
    const [page, setPage] = useState(0);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        const options = { signal: controller.signal };

        async function loadReviews() {
            try {
                const [list, stats, ownReview] = await Promise.all([
                    getReviewPage(gameId, page, options),
                    getReviewStats(gameId, options),
                    userId ? getOwnReview(gameId, userId, options) : Promise.resolve(null),
                ]);
                if (!controller.signal.aborted) setResult({ ...list, stats, ownReview, status: 'success' });
            } catch {
                if (!controller.signal.aborted) setResult({ ...loadingResult, status: 'error' });
            }
        }

        loadReviews();
        return () => controller.abort();
    }, [gameId, userId, page, attempt]);

    function reload() {
        setResult(loadingResult);
        setPage(0);
        setAttempt((previous) => previous + 1);
    }

    function changePage(nextPage) {
        setResult(loadingResult);
        setPage(nextPage);
    }

    return { ...result, page, changePage, reload };
}
