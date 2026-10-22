import { supabase } from '../lib/supabaseClient';

export async function attachGameRatings(games, { signal } = {}) {
    if (games.length === 0) return [];
    const { data, error } = await supabase
        .from('game_review_stats')
        .select('game_id, review_count, average_rating')
        .in('game_id', games.map((game) => game.id))
        .abortSignal(signal);

    if (error) throw error;
    const ratings = new Map((data ?? []).map((rating) => [rating.game_id, rating]));
    return games.map((game) => ({
        ...game,
        review_count: Number(ratings.get(game.id)?.review_count ?? 0),
        average_rating: Number(ratings.get(game.id)?.average_rating ?? 0),
    }));
}
