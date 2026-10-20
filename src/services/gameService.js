import { supabase } from '../lib/supabaseClient';
import { toGamePayload } from '../utils/gameValidation';
import { isValidGameId } from '../utils/gamePresentation';

export async function createGame(values) {
    const { data, error } = await supabase
        .from('games')
        .insert(toGamePayload(values))
        .select('id, title')
        .single();

    if (error) throw error;
    if (!data) throw new Error('The game could not be saved. Please try again.');

    return data;
}

export async function getGames({ signal } = {}) {
    const { data, error } = await supabase
        .from('games')
        .select('id, title, image_url, genre, platforms, release_date')
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .abortSignal(signal);

    if (error) throw error;
    return data ?? [];
}

export async function getGame(gameId, { signal } = {}) {
    if (!isValidGameId(gameId)) return null;

    const { data, error } = await supabase
        .from('games')
        .select('id, title, description, image_url, genre, platforms, release_date, owner_id, created_at')
        .eq('id', gameId)
        .abortSignal(signal)
        .maybeSingle();

    if (error) throw error;
    return data;
}
