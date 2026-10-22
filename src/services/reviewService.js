import { supabase } from '../lib/supabaseClient';
import { isValidGameId } from '../utils/gamePresentation';
import { toReviewPayload } from '../utils/reviewValidation';

export const REVIEW_PAGE_SIZE = 5;
const reviewColumns = 'id, game_id, user_id, rating, body, created_at';

function requireId(value) {
    if (!isValidGameId(value)) throw new Error('The review request could not be completed.');
}

export async function getReviewPage(gameId, page, { signal } = {}) {
    requireId(gameId);
    if (!Number.isInteger(page) || page < 0) throw new Error('Invalid reviews page.');
    const first = page * REVIEW_PAGE_SIZE;
    const { data, error, count } = await supabase.from('reviews')
        .select(reviewColumns, { count: 'exact' })
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .range(first, first + REVIEW_PAGE_SIZE - 1)
        .abortSignal(signal);
    if (error) throw error;
    return { reviews: data ?? [], count: count ?? 0 };
}

export async function getReviewStats(gameId, { signal } = {}) {
    requireId(gameId);
    const { data, error } = await supabase.from('game_review_stats')
        .select('review_count, average_rating').eq('game_id', gameId)
        .abortSignal(signal).maybeSingle();
    if (error) throw error;
    return data ?? { review_count: 0, average_rating: null };
}

export async function getOwnReview(gameId, userId, { signal } = {}) {
    requireId(gameId);
    requireId(userId);
    const { data, error } = await supabase.from('reviews').select(reviewColumns)
        .eq('game_id', gameId).eq('user_id', userId)
        .abortSignal(signal).maybeSingle();
    if (error) throw error;
    return data;
}

export async function createReview(gameId, values) {
    requireId(gameId);
    const { data, error } = await supabase.from('reviews')
        .insert({ game_id: gameId, ...toReviewPayload(values) }).select('id').single();
    if (error) throw error;
    if (!data) throw new Error('The review was not saved. Please try again.');
    return data;
}

export async function updateReview(reviewId, userId, values) {
    requireId(reviewId);
    requireId(userId);
    const { data, error } = await supabase.from('reviews').update(toReviewPayload(values))
        .eq('id', reviewId).eq('user_id', userId).select('id').maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('The review was not updated. Reload reviews and check that it still belongs to your account.');
    return data;
}

export async function deleteReview(reviewId, userId) {
    requireId(reviewId);
    requireId(userId);
    const { data, error } = await supabase.from('reviews').delete()
        .eq('id', reviewId).eq('user_id', userId).select('id').maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('The review was not deleted. Reload reviews and try again.');
}
